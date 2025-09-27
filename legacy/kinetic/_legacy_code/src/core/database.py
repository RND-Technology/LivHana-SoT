"""
LivHana-SoT: Database Integration
Real-time database connections for empire operations
"""

import os
import json
import asyncio
import logging
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, timedelta
from dataclasses import dataclass
import sqlite3
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import pandas as pd

# Try to import psycopg2, fall back to SQLite if not available
try:
    import psycopg2
    POSTGRES_AVAILABLE = True
except ImportError:
    POSTGRES_AVAILABLE = False

logger = logging.getLogger(__name__)

Base = declarative_base()

# Database Models
class AgentInteraction(Base):
    __tablename__ = "agent_interactions"

    id = Column(Integer, primary_key=True)
    agent_name = Column(String(100), nullable=False)
    user_message = Column(Text, nullable=False)
    agent_response = Column(Text)
    timestamp = Column(DateTime, default=datetime.now)
    confidence_score = Column(Float)
    verification_passed = Column(Boolean, default=False)
    processing_time = Column(Float)  # seconds
    error_message = Column(Text)

class SystemMetrics(Base):
    __tablename__ = "system_metrics"

    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.now)
    active_agents = Column(Integer)
    total_requests = Column(Integer)
    error_rate = Column(Float)
    average_response_time = Column(Float)
    system_health_score = Column(Float)
    llm_status = Column(String(50))
    compliance_violations = Column(Integer)

class CannabisData(Base):
    __tablename__ = "cannabis_data"

    id = Column(Integer, primary_key=True)
    strain_name = Column(String(200))
    strain_type = Column(String(50))  # Indica, Sativa, Hybrid
    thc_content = Column(Float)
    cbd_content = Column(Float)
    terpenes = Column(Text)  # JSON string
    effects = Column(Text)   # JSON string
    medical_uses = Column(Text)  # JSON string
    growing_info = Column(Text)
    compliance_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now)

class BusinessMetrics(Base):
    __tablename__ = "business_metrics"

    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.now)
    revenue = Column(Float)
    orders_count = Column(Integer)
    customer_count = Column(Integer)
    average_order_value = Column(Float)
    compliance_score = Column(Float)
    regulatory_status = Column(String(100))
    market_position = Column(String(100))

class LivHanaDatabase:
    """Comprehensive database manager for LivHana empire"""

    def __init__(self):
        # Use PostgreSQL if available, otherwise fall back to SQLite
        if POSTGRES_AVAILABLE and os.getenv("DATABASE_URL"):
            self.db_url = os.getenv("DATABASE_URL")
            logger.info("✅ Using PostgreSQL database")
        else:
            self.db_url = "sqlite:///livhana_empire.db"
            logger.info("✅ Using SQLite database (PostgreSQL not available)")

        self.engine = create_engine(self.db_url, echo=False)
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

        # Initialize with sample data
        self._initialize_sample_data()

    def _initialize_sample_data(self):
        """Initialize database with comprehensive sample data"""
        session = self.SessionLocal()

        try:
            # Check if data already exists
            if session.query(CannabisData).count() == 0:
                # Add comprehensive cannabis strain data
                strains = [
                    {
                        "strain_name": "Blue Dream",
                        "strain_type": "Hybrid",
                        "thc_content": 18.0,
                        "cbd_content": 0.1,
                        "terpenes": json.dumps(["Myrcene", "Pinene", "Caryophyllene"]),
                        "effects": json.dumps(["Relaxed", "Happy", "Euphoric", "Creative"]),
                        "medical_uses": json.dumps(["Stress", "Depression", "Pain", "Nausea"]),
                        "growing_info": "Easy to grow, high yield, 8-10 week flowering",
                        "compliance_notes": "21+ only, no medical claims, natural cannabinoids only"
                    },
                    {
                        "strain_name": "OG Kush",
                        "strain_type": "Indica",
                        "thc_content": 19.0,
                        "cbd_content": 0.2,
                        "terpenes": json.dumps(["Myrcene", "Limonene", "Beta-Caryophyllene"]),
                        "effects": json.dumps(["Relaxed", "Sleepy", "Happy", "Euphoric"]),
                        "medical_uses": json.dumps(["Insomnia", "Stress", "Pain", "Appetite Loss"]),
                        "growing_info": "Moderate difficulty, 8-9 week flowering",
                        "compliance_notes": "21+ only, no medical claims, natural cannabinoids only"
                    },
                    {
                        "strain_name": "Sour Diesel",
                        "strain_type": "Sativa",
                        "thc_content": 20.0,
                        "cbd_content": 0.1,
                        "terpenes": json.dumps(["Caryophyllene", "Limonene", "Myrcene"]),
                        "effects": json.dumps(["Energetic", "Happy", "Uplifted", "Focused"]),
                        "medical_uses": json.dumps(["Depression", "Stress", "Fatigue", "Pain"]),
                        "growing_info": "Moderate difficulty, 9-10 week flowering",
                        "compliance_notes": "21+ only, no medical claims, natural cannabinoids only"
                    }
                ]

                for strain_data in strains:
                    strain = CannabisData(**strain_data)
                    session.add(strain)

            # Add business metrics
            if session.query(BusinessMetrics).count() == 0:
                for i in range(30):  # Last 30 days
                    business_metric = BusinessMetrics(
                        timestamp=datetime.now() - timedelta(days=i),
                        revenue=1000 + (i * 50),  # Growing revenue
                        orders_count=10 + i,
                        customer_count=5 + (i // 2),
                        average_order_value=85 + (i * 2),
                        compliance_score=95.0 + (i * 0.1),
                        regulatory_status="Compliant",
                        market_position="Growing"
                    )
                    session.add(business_metric)

            session.commit()
            logger.info("✅ Database initialized with comprehensive sample data")

        except Exception as e:
            logger.error(f"❌ Failed to initialize database: {e}")
            session.rollback()
        finally:
            session.close()

    def get_db(self) -> Session:
        """Get database session"""
        return self.SessionLocal()

    async def log_agent_interaction(self,
                                  agent_name: str,
                                  user_message: str,
                                  agent_response: str,
                                  confidence_score: float = 0.0,
                                  verification_passed: bool = False,
                                  processing_time: float = 0.0,
                                  error_message: str = None) -> int:
        """Log agent interaction to database"""
        session = self.get_db()

        try:
            interaction = AgentInteraction(
                agent_name=agent_name,
                user_message=user_message,
                agent_response=agent_response,
                confidence_score=confidence_score,
                verification_passed=verification_passed,
                processing_time=processing_time,
                error_message=error_message
            )

            session.add(interaction)
            session.commit()
            session.refresh(interaction)

            return interaction.id

        except Exception as e:
            logger.error(f"❌ Failed to log interaction: {e}")
            session.rollback()
            return 0
        finally:
            session.close()

    async def get_cannabis_strains(self, strain_type: str = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Get cannabis strain data"""
        session = self.get_db()

        try:
            query = session.query(CannabisData)

            if strain_type:
                query = query.filter(CannabisData.strain_type == strain_type)

            strains = query.limit(limit).all()

            return [
                {
                    "id": strain.id,
                    "strain_name": strain.strain_name,
                    "strain_type": strain.strain_type,
                    "thc_content": strain.thc_content,
                    "cbd_content": strain.cbd_content,
                    "terpenes": json.loads(strain.terpenes) if strain.terpenes else [],
                    "effects": json.loads(strain.effects) if strain.effects else [],
                    "medical_uses": json.loads(strain.medical_uses) if strain.medical_uses else [],
                    "growing_info": strain.growing_info,
                    "compliance_notes": strain.compliance_notes,
                    "created_at": strain.created_at.isoformat(),
                    "updated_at": strain.updated_at.isoformat()
                }
                for strain in strains
            ]

        except Exception as e:
            logger.error(f"❌ Failed to get cannabis strains: {e}")
            return []
        finally:
            session.close()

    async def get_business_metrics(self, days: int = 30) -> List[Dict[str, Any]]:
        """Get business metrics for the last N days"""
        session = self.get_db()

        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            metrics = session.query(BusinessMetrics).filter(
                BusinessMetrics.timestamp >= cutoff_date
            ).all()

            return [
                {
                    "id": metric.id,
                    "timestamp": metric.timestamp.isoformat(),
                    "revenue": metric.revenue,
                    "orders_count": metric.orders_count,
                    "customer_count": metric.customer_count,
                    "average_order_value": metric.average_order_value,
                    "compliance_score": metric.compliance_score,
                    "regulatory_status": metric.regulatory_status,
                    "market_position": metric.market_position
                }
                for metric in metrics
            ]

        except Exception as e:
            logger.error(f"❌ Failed to get business metrics: {e}")
            return []
        finally:
            session.close()

    async def update_system_metrics(self,
                                  active_agents: int,
                                  total_requests: int,
                                  error_rate: float,
                                  average_response_time: float,
                                  system_health_score: float,
                                  llm_status: str,
                                  compliance_violations: int) -> bool:
        """Update system metrics"""
        session = self.get_db()

        try:
            metric = SystemMetrics(
                active_agents=active_agents,
                total_requests=total_requests,
                error_rate=error_rate,
                average_response_time=average_response_time,
                system_health_score=system_health_score,
                llm_status=llm_status,
                compliance_violations=compliance_violations
            )

            session.add(metric)
            session.commit()

            return True

        except Exception as e:
            logger.error(f"❌ Failed to update system metrics: {e}")
            session.rollback()
            return False
        finally:
            session.close()

# Global database instance
database = LivHanaDatabase()
