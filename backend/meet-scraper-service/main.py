#!/usr/bin/env python3
"""
Google Meet Folder Scraper → AlloyDB Ingestion
Mission: Scrape Google Drive "Meet" folder, parse transcripts, ingest to AlloyDB
Autonomous execution using existing credentials and patterns
"""

import os
import json
import re
import io
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path

from google.oauth2 import service_account
import google.auth
from google.auth.exceptions import DefaultCredentialsError
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import sqlalchemy
from sqlalchemy import create_engine, text, MetaData, Table, Column, String, Text, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid

# Configuration from environment
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "reggieanddrodispensary")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
GOOGLE_APPLICATION_CREDENTIALS_JSON = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")  # optional JSON string
DATABASE_URL = os.getenv("DATABASE_URL")
MEET_FOLDER_NAME = os.getenv("MEET_FOLDER_NAME", "Meet")

# OAuth scopes required for reading Drive files
DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

# Use existing AlloyDB connection pattern
def get_alloydb_connection():
    """Connect to AlloyDB using existing patterns from HighNoon deployment"""
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable required")
    
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    return engine

def _load_drive_credentials():
    """Load Google credentials from multiple sources: file path, JSON env, or ADC."""
    # 1) File path provided
    if GOOGLE_APPLICATION_CREDENTIALS and os.path.exists(GOOGLE_APPLICATION_CREDENTIALS):
        return service_account.Credentials.from_service_account_file(
            GOOGLE_APPLICATION_CREDENTIALS,
            scopes=DRIVE_SCOPES,
        )

    # 2) JSON content provided in GOOGLE_APPLICATION_CREDENTIALS (sometimes set via secret env)
    if GOOGLE_APPLICATION_CREDENTIALS:
        cred_val = GOOGLE_APPLICATION_CREDENTIALS.strip()
        if cred_val.startswith('{') and cred_val.endswith('}'):
            try:
                info = json.loads(cred_val)
                return service_account.Credentials.from_service_account_info(info, scopes=DRIVE_SCOPES)
            except Exception:
                pass

    # 3) Separate JSON variable
    if GOOGLE_APPLICATION_CREDENTIALS_JSON:
        try:
            info = json.loads(GOOGLE_APPLICATION_CREDENTIALS_JSON)
            return service_account.Credentials.from_service_account_info(info, scopes=DRIVE_SCOPES)
        except Exception:
            pass

    # 4) Application Default Credentials (Cloud Run/Compute Engine)
    try:
        credentials, _ = google.auth.default(scopes=DRIVE_SCOPES)
        return credentials
    except DefaultCredentialsError as e:
        raise ValueError("No valid Google credentials found. Provide GOOGLE_APPLICATION_CREDENTIALS (file path), GOOGLE_APPLICATION_CREDENTIALS_JSON, or enable ADC.") from e


# Use existing Google Drive API pattern with hardened credential loading
def get_drive_service():
    """Get Google Drive API service using robust credential loading."""
    credentials = _load_drive_credentials()
    return build('drive', 'v3', credentials=credentials)

# Parse meeting transcript using existing patterns
def parse_meeting_transcript(content: str, filename: str) -> Dict:
    """
    Parse meeting transcript content
    Based on existing patterns from October meeting files
    """
    # Extract basic metadata
    meeting_data = {
        "id": str(uuid.uuid4()),
        "filename": filename,
        "content": content,
        # Store as datetime object for proper TIMESTAMP insertion
        "parsed_at": datetime.utcnow(),
        "title": extract_title(content),
        "date": extract_date(content),
        "attendees": extract_attendees(content),
        "transcript": content
    }
    
    return meeting_data

def extract_title(content: str) -> Optional[str]:
    """Extract meeting title from transcript"""
    # Look for title patterns: "Meeting:", "Title:", etc.
    patterns = [
        r'Meeting:\s*(.+?)(?:\n|$)',
        r'Title:\s*(.+?)(?:\n|$)',
        r'Subject:\s*(.+?)(?:\n|$)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    
    return None

def extract_date(content: str) -> Optional[str]:
    """Extract meeting date from transcript"""
    # Look for date patterns
    patterns = [
        r'Date:\s*(\d{4}-\d{2}-\d{2})',
        r'(\d{4}-\d{2}-\d{2})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, content)
        if match:
            return match.group(1)
    
    return None

def extract_attendees(content: str) -> List[str]:
    """Extract attendees from transcript"""
    # Look for attendees list
    attendees_pattern = r'Attendees?:([^\n]+)'
    match = re.search(attendees_pattern, content, re.IGNORECASE)
    
    if match:
        attendees_str = match.group(1)
        return [a.strip() for a in attendees_str.split(',')]
    
    return []

# Main processing pipeline
def _list_all_files_recursive(drive_service, folder_id: str) -> List[Dict]:
    """Recursively list all non-trashed files within a Drive folder tree."""
    files: List[Dict] = []
    page_token: Optional[str] = None
    query = f"'{folder_id}' in parents and trashed=false"

    while True:
        results = drive_service.files().list(
            q=query,
            fields="nextPageToken, files(id, name, mimeType, modifiedTime)",
            pageToken=page_token
        ).execute()

        current_files = results.get('files', [])
        for f in current_files:
            if f.get('mimeType') == 'application/vnd.google-apps.folder':
                # Recurse into subfolder
                files.extend(_list_all_files_recursive(drive_service, f['id']))
            else:
                files.append(f)

        page_token = results.get('nextPageToken')
        if not page_token:
            break

    return files


def process_meet_folder():
    """
    Main processing pipeline:
    1. Connect to Google Drive
    2. List all files in "Meet" folder (recursively)
    3. Download/read transcript content
    4. Parse using existing logic
    5. Structure data for AlloyDB
    6. Insert with conflict handling
    """
    print("🚀 Starting Google Meet folder scraper...")
    
    # Step 1: Connect to Google Drive
    print("📁 Connecting to Google Drive...")
    drive_service = get_drive_service()
    
    # Step 2: Find "Meet" folder
    print(f"🔍 Searching for folder: {MEET_FOLDER_NAME}")
    query = f"name='{MEET_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder'"
    results = drive_service.files().list(q=query, fields="files(id, name)").execute()
    
    if not results.get('files'):
        print(f"❌ Folder '{MEET_FOLDER_NAME}' not found")
        return
    
    folder_id = results['files'][0]['id']
    print(f"✅ Found folder: {results['files'][0]['name']} (ID: {folder_id})")
    
    # Step 3: List all files recursively
    print("📋 Listing all files in folder (recursive)...")
    all_files = _list_all_files_recursive(drive_service, folder_id)
    
    print(f"✅ Found {len(all_files)} files")
    
    # Step 4: Download and parse files
    print("📥 Downloading and parsing files...")
    parsed_files = []
    
    for file in all_files:
        file_id = file['id']
        file_name = file['name']
        mime_type = file.get('mimeType', '')

        # Supported: plain text, csv, Google Docs (export to text)
        if mime_type not in ['text/plain', 'text/csv', 'application/vnd.google-apps.document']:
            print(f"⏭️  Skipping unsupported file type: {file_name} ({mime_type})")
            continue

        try:
            # Download file content
            if mime_type in ['text/plain', 'text/csv']:
                request = drive_service.files().get_media(fileId=file_id)
                buffer = io.BytesIO()
                downloader = MediaIoBaseDownload(buffer, request)
                done = False
                while not done:
                    status, done = downloader.next_chunk()
                content_str = buffer.getvalue().decode('utf-8', errors='ignore')
            else:
                # Google Doc → export as plain text
                request = drive_service.files().export_media(fileId=file_id, mimeType='text/plain')
                buffer = io.BytesIO()
                downloader = MediaIoBaseDownload(buffer, request)
                done = False
                while not done:
                    status, done = downloader.next_chunk()
                content_str = buffer.getvalue().decode('utf-8', errors='ignore')

            # Parse transcript
            parsed_data = parse_meeting_transcript(content_str, file_name)
            parsed_files.append(parsed_data)

            print(f"✅ Parsed: {file_name}")

        except Exception as e:
            print(f"❌ Error processing {file_name}: {e}")
            continue
    
    # Step 5: Connect to AlloyDB
    print("🗄️  Connecting to AlloyDB...")
    engine = get_alloydb_connection()
    
    # Step 6: Create/update source_doc table if needed
    metadata = MetaData()
    source_doc_table = Table(
        'source_doc',
        metadata,
        Column('id', String, primary_key=True),
        Column('filename', String),
        Column('content', Text),
        Column('parsed_at', DateTime),
        Column('title', String),
        Column('date', String),
        Column('attendees', Text),  # JSON array as text
        Column('transcript', Text),
        Column('created_at', DateTime, default=datetime.utcnow),
        Column('updated_at', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    )
    
    # Create table if not exists
    metadata.create_all(engine)
    
    # Step 7: Insert data with conflict handling
    print("💾 Inserting data into AlloyDB...")
    inserted_count = 0
    
    with engine.connect() as conn:
        for parsed_data in parsed_files:
            try:
                # Use ON CONFLICT for idempotent inserts
                insert_stmt = text("""
                    INSERT INTO source_doc (id, filename, content, parsed_at, title, date, attendees, transcript, created_at, updated_at)
                    VALUES (:id, :filename, :content, :parsed_at, :title, :date, :attendees, :transcript, NOW(), NOW())
                    ON CONFLICT (id) DO UPDATE SET
                        filename = EXCLUDED.filename,
                        content = EXCLUDED.content,
                        parsed_at = EXCLUDED.parsed_at,
                        title = EXCLUDED.title,
                        date = EXCLUDED.date,
                        attendees = EXCLUDED.attendees,
                        transcript = EXCLUDED.transcript,
                        updated_at = NOW()
                """)
                
                conn.execute(insert_stmt, {
                    'id': parsed_data['id'],
                    'filename': parsed_data['filename'],
                    'content': parsed_data['content'],
                    'parsed_at': parsed_data['parsed_at'],
                    'title': parsed_data['title'],
                    'date': parsed_data['date'],
                    'attendees': json.dumps(parsed_data['attendees']),
                    'transcript': parsed_data['transcript']
                })
                
                inserted_count += 1
                
            except Exception as e:
                print(f"❌ Error inserting {parsed_data['filename']}: {e}")
                continue
        
        conn.commit()
    
    print(f"✅ Successfully processed {inserted_count} files")
    print("🎉 Google Meet scraper complete!")

if __name__ == "__main__":
    process_meet_folder()

