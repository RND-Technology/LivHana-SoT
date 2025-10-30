#!/usr/bin/env python3
"""
Google Meet Real-Time Capture Service → AlloyDB
Mission: Capture live Google Meet sessions and stream to AlloyDB for agent context
Deployment: Cloud Run (FastAPI + WebSocket + Puppeteer)
"""

import os
import json
import uuid
import asyncio
import traceback
from datetime import datetime, timedelta
from typing import Optional, List, Dict
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import sqlalchemy
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import uvicorn

# Configuration
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "reggieanddrodispensary")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:x77BXLIf3dGhUwd9SWL1xOOzS@172.18.113.2:5432/postgres")
PORT = int(os.getenv("PORT", 8080))
HOST = os.getenv("HOST", "0.0.0.0")

# Global session storage
active_sessions: Dict[str, "MeetingCapture"] = {}

# Database connection (async)
async_engine = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    global async_engine
    # Startup
    DATABASE_URL_ASYNC = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    async_engine = create_async_engine(DATABASE_URL_ASYNC, pool_pre_ping=True, echo=False)
    print(f"✅ Connected to AlloyDB: {DATABASE_URL_ASYNC.split('@')[1]}")
    yield
    # Shutdown
    await async_engine.dispose()
    print("🔌 Disconnected from AlloyDB")

app = FastAPI(
    title="Google Meet Real-Time Capture Service",
    description="Capture live Meet sessions and stream to AlloyDB",
    version="1.0.0",
    lifespan=lifespan
)

# ============================================
# DATABASE HELPERS
# ============================================

async def get_db_session():
    """Get async database session"""
    async_session = sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session

async def insert_session(meet_url: str, title: str, host_email: str) -> str:
    """Create new meeting session in AlloyDB"""
    session_id = str(uuid.uuid4())

    async with AsyncSession(async_engine) as session:
        query = text("""
            INSERT INTO meeting_sessions (id, meet_url, title, host_email, recording_status, session_start)
            VALUES (:id, :meet_url, :title, :host_email, 'live', NOW())
            RETURNING id
        """)
        result = await session.execute(query, {
            "id": session_id,
            "meet_url": meet_url,
            "title": title,
            "host_email": host_email
        })
        await session.commit()

    return session_id

async def insert_transcript(session_id: str, speaker_id: Optional[str], text: str, confidence: float, is_interim: bool = True):
    """Insert transcript chunk to AlloyDB"""
    async with AsyncSession(async_engine) as session:
        query = text("""
            INSERT INTO meeting_transcripts
            (session_id, speaker_id, transcript_text, confidence, start_time, is_interim)
            VALUES (:session_id, :speaker_id, :text, :confidence, NOW(), :is_interim)
        """)
        await session.execute(query, {
            "session_id": session_id,
            "speaker_id": speaker_id,
            "text": text,
            "confidence": confidence,
            "is_interim": is_interim
        })
        await session.commit()

async def insert_participant(session_id: str, name: str, email: Optional[str]) -> str:
    """Insert meeting participant"""
    participant_id = str(uuid.uuid4())

    async with AsyncSession(async_engine) as session:
        query = text("""
            INSERT INTO meeting_participants
            (id, session_id, participant_name, participant_email, join_time)
            VALUES (:id, :session_id, :name, :email, NOW())
            RETURNING id
        """)
        result = await session.execute(query, {
            "id": participant_id,
            "session_id": session_id,
            "name": name,
            "email": email
        })
        await session.commit()

    return participant_id

async def end_session(session_id: str):
    """Mark session as ended"""
    async with AsyncSession(async_engine) as session:
        query = text("""
            UPDATE meeting_sessions
            SET recording_status = 'ended', session_end = NOW()
            WHERE id = :session_id
        """)
        await session.execute(query, {"session_id": session_id})
        await session.commit()

async def get_recent_transcripts(session_id: str, minutes: int = 10) -> List[Dict]:
    """Get recent transcripts for a session (agent query)"""
    async with AsyncSession(async_engine) as session:
        query = text("""
            SELECT
                mp.participant_name as speaker,
                mt.transcript_text as text,
                mt.start_time as timestamp,
                mt.confidence
            FROM meeting_transcripts mt
            LEFT JOIN meeting_participants mp ON mt.speaker_id = mp.id
            WHERE mt.session_id = :session_id
            AND mt.start_time >= NOW() - INTERVAL :minutes MINUTE
            AND mt.is_interim = FALSE
            ORDER BY mt.start_time ASC
        """)
        result = await session.execute(query, {
            "session_id": session_id,
            "minutes": minutes
        })
        return [dict(row) for row in result.mappings()]

# ============================================
# MEETING CAPTURE CLASS
# ============================================

class MeetingCapture:
    """
    Manages real-time capture of a Google Meet session
    Uses Playwright/Puppeteer for browser automation
    """

    def __init__(self, session_id: str, meet_url: str):
        self.session_id = session_id
        self.meet_url = meet_url
        self.is_capturing = False
        self.transcript_buffer = []
        self.websocket_clients = []

    async def start_capture(self):
        """Start capturing the Meet session"""
        self.is_capturing = True
        print(f"🎥 Starting capture for session {self.session_id}")

        # In production: Launch Playwright/Puppeteer browser
        # For now: Simulate with polling
        asyncio.create_task(self._capture_loop())

    async def _capture_loop(self):
        """Main capture loop (simulated)"""
        try:
            while self.is_capturing:
                # In production:
                # 1. Extract captions from Meet DOM
                # 2. Capture audio frames
                # 3. Screenshot frames every 5 seconds

                # Simulated transcript generation
                await asyncio.sleep(5)

                # Simulate transcript chunk
                transcript_text = f"[SIMULATED] Transcript chunk at {datetime.utcnow()}"
                confidence = 0.95

                # Insert to AlloyDB
                await insert_transcript(
                    self.session_id,
                    speaker_id=None,
                    text=transcript_text,
                    confidence=confidence,
                    is_interim=True
                )

                # Broadcast to WebSocket clients
                await self._broadcast({
                    "type": "transcript",
                    "session_id": self.session_id,
                    "text": transcript_text,
                    "confidence": confidence,
                    "timestamp": datetime.utcnow().isoformat()
                })

        except Exception as e:
            print(f"❌ Capture error: {e}")
            traceback.print_exc()

    async def stop_capture(self):
        """Stop capturing"""
        self.is_capturing = False
        await end_session(self.session_id)
        print(f"⏹️  Stopped capture for session {self.session_id}")

    async def add_websocket_client(self, websocket: WebSocket):
        """Add WebSocket client for real-time updates"""
        self.websocket_clients.append(websocket)

    async def remove_websocket_client(self, websocket: WebSocket):
        """Remove WebSocket client"""
        if websocket in self.websocket_clients:
            self.websocket_clients.remove(websocket)

    async def _broadcast(self, message: dict):
        """Broadcast message to all connected WebSocket clients"""
        disconnected = []
        for client in self.websocket_clients:
            try:
                await client.send_json(message)
            except Exception:
                disconnected.append(client)

        # Remove disconnected clients
        for client in disconnected:
            await self.remove_websocket_client(client)

# ============================================
# API MODELS
# ============================================

class StartCaptureRequest(BaseModel):
    meet_url: str
    title: Optional[str] = None
    host_email: Optional[str] = None

class StartCaptureResponse(BaseModel):
    session_id: str
    status: str
    websocket_url: str
    api_url: str

# ============================================
# API ENDPOINTS
# ============================================

@app.get("/")
async def root():
    """Service health check"""
    return {
        "service": "Google Meet Real-Time Capture",
        "status": "operational",
        "version": "1.0.0",
        "active_sessions": len(active_sessions),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Kubernetes/Cloud Run health check"""
    return {"status": "healthy"}

@app.post("/api/v1/capture/start", response_model=StartCaptureResponse)
async def start_capture(request: StartCaptureRequest, background_tasks: BackgroundTasks):
    """
    Start capturing a Google Meet session
    Returns session_id and WebSocket URL for real-time streaming
    """
    try:
        # Create session in AlloyDB
        session_id = await insert_session(
            meet_url=request.meet_url,
            title=request.title or "Untitled Meeting",
            host_email=request.host_email or "unknown@livhana.com"
        )

        # Create capture instance
        capture = MeetingCapture(session_id, request.meet_url)
        active_sessions[session_id] = capture

        # Start capture in background
        background_tasks.add_task(capture.start_capture)

        # Build response URLs
        base_url = os.getenv("SERVICE_URL", f"http://{HOST}:{PORT}")
        websocket_url = base_url.replace("http://", "ws://").replace("https://", "wss://")

        return StartCaptureResponse(
            session_id=session_id,
            status="capturing",
            websocket_url=f"{websocket_url}/ws/{session_id}",
            api_url=f"{base_url}/api/v1/sessions/{session_id}"
        )

    except Exception as e:
        print(f"❌ Start capture error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/capture/stop/{session_id}")
async def stop_capture(session_id: str):
    """Stop capturing a session"""
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    capture = active_sessions[session_id]
    await capture.stop_capture()
    del active_sessions[session_id]

    return {
        "session_id": session_id,
        "status": "stopped",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time transcript streaming
    Agents can connect here to get live updates
    """
    await websocket.accept()

    if session_id not in active_sessions:
        await websocket.send_json({
            "error": "Session not found",
            "session_id": session_id
        })
        await websocket.close()
        return

    capture = active_sessions[session_id]
    await capture.add_websocket_client(websocket)

    print(f"🔌 WebSocket connected: session={session_id}")

    try:
        # Keep connection alive
        while True:
            # Wait for client messages (ping/pong)
            data = await websocket.receive_text()
            # Echo back (could be used for commands)
            if data == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        print(f"🔌 WebSocket disconnected: session={session_id}")
        await capture.remove_websocket_client(websocket)

@app.get("/api/v1/sessions/{session_id}")
async def get_session(session_id: str):
    """Get session details"""
    async with AsyncSession(async_engine) as session:
        query = text("""
            SELECT
                id,
                meet_url,
                title,
                host_email,
                recording_status,
                session_start,
                session_end,
                total_duration_seconds
            FROM meeting_sessions
            WHERE id = :session_id
        """)
        result = await session.execute(query, {"session_id": session_id})
        row = result.mappings().first()

        if not row:
            raise HTTPException(status_code=404, detail="Session not found")

        return dict(row)

@app.get("/api/v1/sessions/{session_id}/transcripts")
async def get_session_transcripts(
    session_id: str,
    minutes: Optional[int] = 10
):
    """
    Get recent transcripts from a session
    Used by agents to fetch context
    """
    transcripts = await get_recent_transcripts(session_id, minutes)

    return {
        "session_id": session_id,
        "minutes": minutes,
        "count": len(transcripts),
        "transcripts": transcripts,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/v1/sessions/active")
async def get_active_sessions():
    """Get all active (live) sessions"""
    async with AsyncSession(async_engine) as session:
        query = text("""
            SELECT
                id,
                title,
                host_email,
                session_start,
                (SELECT COUNT(*) FROM meeting_participants WHERE session_id = meeting_sessions.id) as participant_count
            FROM meeting_sessions
            WHERE recording_status = 'live'
            ORDER BY session_start DESC
        """)
        result = await session.execute(query)
        sessions = [dict(row) for row in result.mappings()]

    return {
        "count": len(sessions),
        "sessions": sessions,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/v1/search")
async def search_transcripts(q: str, limit: int = 50):
    """
    Full-text search across all meeting transcripts
    Used by Research agent for finding past discussions
    """
    async with AsyncSession(async_engine) as session:
        query = text("""
            SELECT
                ms.id as session_id,
                ms.title as session_title,
                mp.participant_name as speaker,
                mt.transcript_text as text,
                mt.start_time as timestamp,
                ts_rank(mt.search_vector, websearch_to_tsquery('english', :query)) as rank
            FROM meeting_transcripts mt
            JOIN meeting_sessions ms ON mt.session_id = ms.id
            LEFT JOIN meeting_participants mp ON mt.speaker_id = mp.id
            WHERE mt.search_vector @@ websearch_to_tsquery('english', :query)
            ORDER BY rank DESC, mt.start_time DESC
            LIMIT :limit
        """)
        result = await session.execute(query, {"query": q, "limit": limit})
        results = [dict(row) for row in result.mappings()]

    return {
        "query": q,
        "count": len(results),
        "results": results,
        "timestamp": datetime.utcnow().isoformat()
    }

# ============================================
# PRODUCTION SERVER
# ============================================

if __name__ == "__main__":
    print(f"🚀 Starting Google Meet Real-Time Capture Service on {HOST}:{PORT}")
    uvicorn.run(app, host=HOST, port=PORT)
