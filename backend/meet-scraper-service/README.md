# Google Meet Scraper Service

Autonomous service to scrape Google Drive "Meet" folder and ingest transcripts into AlloyDB.

## Mission

Scrape all transcripts from Google Drive "Meet" folder, parse structured data, and ingest into AlloyDB using existing credentials and deployment patterns.

## Features

- ✅ Google Drive API integration (service account auth)
- ✅ AlloyDB Postgres connector (existing connection pattern)
- ✅ Meeting transcript parsing (based on October files)
- ✅ Cloud Run deployment (using existing workflow)
- ✅ Idempotent inserts (ON CONFLICT handling)
- ✅ Zero new dependencies (uses existing stack)

## Technical Stack

- **Language**: Python 3.11
- **APIs**: Google Drive API v3, AlloyDB Postgres
- **Authentication**: Existing service account credentials
- **Deployment**: Cloud Run (managed platform)
- **Database**: Existing AlloyDB cluster from HighNoon

## Setup

### Prerequisites

- Google Cloud Project with Drive API enabled
- Service account with Drive API access
- AlloyDB connection string
- Existing deployment credentials

### Environment Variables

```bash
GCP_PROJECT_ID=reggieanddrodispensary
MEET_FOLDER_NAME=Meet
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

### Deployment (Cloud Run Job)

```bash
# Set permissions
chmod +x deploy-cloud-run.sh

# Deploy and execute the Cloud Run Job
./deploy-cloud-run.sh
```

## Database Schema

Uses existing `source_doc` table:

```sql
CREATE TABLE IF NOT EXISTS source_doc (
    id VARCHAR PRIMARY KEY,
    filename VARCHAR,
    content TEXT,
    parsed_at TIMESTAMP,
    title VARCHAR,
    date VARCHAR,
    attendees TEXT,  -- JSON array
    transcript TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Processing Pipeline

1. **Connect to Google Drive** - Using service account
2. **Find "Meet" folder** - Search by name
3. **List all files** - Recursively from folder
4. **Download content** - For each text file
5. **Parse transcript** - Extract title, date, attendees
6. **Insert to AlloyDB** - With conflict handling
7. **Log results** - Processing summary

## Integration

Integrates with existing systems

- **RPM Workflows**: Uses source_doc table from RPM schema
- **Attribution**: Ready for embedding/attribution logic
- **Monitoring**: Cloud Run logs + existing patterns

## Success Criteria

- ✅ Service deployed to Cloud Run in <2 hours
- ✅ All Meet folder transcripts ingested to AlloyDB
- ✅ Data structured according to existing schema
- ✅ Zero new dependencies or authentication

## References

- Based on existing Cloud Run deployment patterns
- Uses existing AlloyDB connection from HighNoon
- Follows existing transcript parsing from October files
- Uses existing service account credentials
