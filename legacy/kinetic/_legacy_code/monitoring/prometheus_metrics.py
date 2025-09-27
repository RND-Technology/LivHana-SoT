"""
LivHana-SoT: Prometheus Metrics for AI Agent Swarm Monitoring
Self-healing monitoring system with key performance indicators
"""

import time
import logging
from typing import Dict, Any, Optional
from prometheus_client import Counter, Histogram, Gauge, start_http_server
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class LivHanaMetrics:
    """
    Prometheus metrics collection for LivHana AI Agent Swarm
    Tracks performance, truth verification, and system health
    """
    
    def __init__(self, port: int = 8000):
        self.port = port
        
        # Response time metrics
        self.agent_response_time = Histogram(
            'livhana_agent_response_time_seconds',
            'Time taken for agent to generate response',
            ['agent_name', 'task_type'],
            buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0]
        )
        
        # Truth verification metrics
        self.truth_check_failures = Counter(
            'livhana_truth_check_failures_total',
            'Total number of truth check failures',
            ['agent_name', 'failure_type']
        )
        
        self.truth_check_score = Histogram(
            'livhana_truth_check_score',
            'Truth verification score distribution',
            ['agent_name'],
            buckets=[0.0, 0.2, 0.4, 0.6, 0.8, 0.9, 0.95, 1.0]
        )
        
        # LLM confidence metrics
        self.llm_confidence_score = Histogram(
            'livhana_llm_confidence_score',
            'LLM confidence score distribution',
            ['model_name', 'agent_name'],
            buckets=[0.0, 0.2, 0.4, 0.6, 0.8, 0.9, 0.95, 1.0]
        )
        
        # System health metrics
        self.active_agents = Gauge(
            'livhana_active_agents',
            'Number of currently active agents'
        )
        
        self.system_health_score = Gauge(
            'livhana_system_health_score',
            'Overall system health score (0-1)'
        )
        
        # Error tracking
        self.agent_errors = Counter(
            'livhana_agent_errors_total',
            'Total number of agent errors',
            ['agent_name', 'error_type']
        )
        
        # Correction agent metrics
        self.corrections_required = Counter(
            'livhana_corrections_required_total',
            'Total number of responses requiring correction',
            ['agent_name', 'correction_type']
        )
        
        self.correction_success_rate = Gauge(
            'livhana_correction_success_rate',
            'Success rate of correction attempts',
            ['agent_name']
        )
        
        # Cannabis business specific metrics
        self.compliance_violations = Counter(
            'livhana_compliance_violations_total',
            'Total compliance violations detected',
            ['violation_type', 'severity']
        )
        
        self.legislative_accuracy = Gauge(
            'livhana_legislative_accuracy',
            'Accuracy of legislative information provided',
            ['state', 'topic']
        )
        
        # Start metrics server
        self._start_metrics_server()
        
        # Initialize health tracking
        self._last_health_check = datetime.now()
        self._health_history = []
    
    def _start_metrics_server(self):
        """Start Prometheus metrics HTTP server"""
        try:
            start_http_server(self.port)
            logger.info(f"✅ Prometheus metrics server started on port {self.port}")
        except Exception as e:
            logger.error(f"❌ Failed to start metrics server: {e}")
    
    def record_response_time(self, agent_name: str, task_type: str, duration: float):
        """Record agent response time"""
        try:
            self.agent_response_time.labels(
                agent_name=agent_name,
                task_type=task_type
            ).observe(duration)
        except Exception as e:
            logger.error(f"❌ Failed to record response time: {e}")
    
    def record_truth_check_failure(self, agent_name: str, failure_type: str):
        """Record truth check failure"""
        try:
            self.truth_check_failures.labels(
                agent_name=agent_name,
                failure_type=failure_type
            ).inc()
        except Exception as e:
            logger.error(f"❌ Failed to record truth check failure: {e}")
    
    def record_truth_check_score(self, agent_name: str, score: float):
        """Record truth verification score"""
        try:
            self.truth_check_score.labels(
                agent_name=agent_name
            ).observe(score)
        except Exception as e:
            logger.error(f"❌ Failed to record truth check score: {e}")
    
    def record_llm_confidence(self, model_name: str, agent_name: str, confidence: float):
        """Record LLM confidence score"""
        try:
            self.llm_confidence_score.labels(
                model_name=model_name,
                agent_name=agent_name
            ).observe(confidence)
        except Exception as e:
            logger.error(f"❌ Failed to record LLM confidence: {e}")
    
    def update_active_agents(self, count: int):
        """Update number of active agents"""
        try:
            self.active_agents.set(count)
        except Exception as e:
            logger.error(f"❌ Failed to update active agents: {e}")
    
    def record_agent_error(self, agent_name: str, error_type: str):
        """Record agent error"""
        try:
            self.agent_errors.labels(
                agent_name=agent_name,
                error_type=error_type
            ).inc()
        except Exception as e:
            logger.error(f"❌ Failed to record agent error: {e}")
    
    def record_correction_required(self, agent_name: str, correction_type: str):
        """Record that a correction was required"""
        try:
            self.corrections_required.labels(
                agent_name=agent_name,
                correction_type=correction_type
            ).inc()
        except Exception as e:
            logger.error(f"❌ Failed to record correction required: {e}")
    
    def update_correction_success_rate(self, agent_name: str, success_rate: float):
        """Update correction success rate"""
        try:
            self.correction_success_rate.labels(
                agent_name=agent_name
            ).set(success_rate)
        except Exception as e:
            logger.error(f"❌ Failed to update correction success rate: {e}")
    
    def record_compliance_violation(self, violation_type: str, severity: str):
        """Record compliance violation"""
        try:
            self.compliance_violations.labels(
                violation_type=violation_type,
                severity=severity
            ).inc()
        except Exception as e:
            logger.error(f"❌ Failed to record compliance violation: {e}")
    
    def update_legislative_accuracy(self, state: str, topic: str, accuracy: float):
        """Update legislative accuracy score"""
        try:
            self.legislative_accuracy.labels(
                state=state,
                topic=topic
            ).set(accuracy)
        except Exception as e:
            logger.error(f"❌ Failed to update legislative accuracy: {e}")
    
    def calculate_system_health(self) -> float:
        """Calculate overall system health score"""
        try:
            # Get recent metrics (last hour)
            now = datetime.now()
            one_hour_ago = now - timedelta(hours=1)
            
            # Calculate health based on various factors
            health_factors = []
            
            # Factor 1: Truth check success rate
            # This would be calculated from actual metrics in production
            truth_success_rate = 0.95  # Placeholder
            health_factors.append(truth_success_rate)
            
            # Factor 2: Response time performance
            # Check if response times are within acceptable range
            avg_response_time = 2.0  # Placeholder - would be calculated from metrics
            if avg_response_time < 5.0:
                response_health = 1.0
            elif avg_response_time < 10.0:
                response_health = 0.8
            else:
                response_health = 0.5
            health_factors.append(response_health)
            
            # Factor 3: Error rate
            error_rate = 0.02  # Placeholder - would be calculated from metrics
            error_health = max(0.0, 1.0 - error_rate * 10)
            health_factors.append(error_health)
            
            # Factor 4: Compliance violations
            compliance_rate = 0.98  # Placeholder
            health_factors.append(compliance_rate)
            
            # Calculate weighted average
            overall_health = sum(health_factors) / len(health_factors)
            
            # Update gauge
            self.system_health_score.set(overall_health)
            
            # Store in history
            self._health_history.append({
                'timestamp': now,
                'health_score': overall_health,
                'factors': health_factors
            })
            
            # Keep only last 24 hours of history
            cutoff = now - timedelta(hours=24)
            self._health_history = [
                h for h in self._health_history 
                if h['timestamp'] > cutoff
            ]
            
            return overall_health
            
        except Exception as e:
            logger.error(f"❌ Failed to calculate system health: {e}")
            return 0.0
    
    def get_health_summary(self) -> Dict[str, Any]:
        """Get comprehensive health summary"""
        try:
            current_health = self.calculate_system_health()
            
            # Calculate trends
            if len(self._health_history) >= 2:
                recent_health = self._health_history[-1]['health_score']
                previous_health = self._health_history[-2]['health_score']
                trend = recent_health - previous_health
            else:
                trend = 0.0
            
            return {
                'current_health': current_health,
                'trend': trend,
                'status': 'healthy' if current_health > 0.8 else 'degraded' if current_health > 0.5 else 'critical',
                'last_check': self._last_health_check.isoformat(),
                'history_length': len(self._health_history)
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get health summary: {e}")
            return {
                'current_health': 0.0,
                'trend': 0.0,
                'status': 'error',
                'error': str(e)
            }

    async def get_metrics_async(self) -> Dict[str, Any]:
        """Get metrics asynchronously"""
        try:
            return {
                'current_health': self.calculate_system_health(),
                'active_agents': self._active_agents_count,
                'total_responses': self._total_responses,
                'error_rate': self._error_count / max(1, self._total_responses),
                'average_response_time': self._average_response_time,
                'truth_check_success_rate': self._truth_check_success_rate,
                'compliance_violation_count': self._compliance_violation_count,
                'last_updated': self._last_health_check.isoformat()
            }
        except Exception as e:
            logger.error(f"❌ Failed to get metrics async: {e}")
            return {'error': str(e), 'status': 'error'}
    
    def start_health_monitoring(self, interval: int = 60):
        """Start continuous health monitoring"""
        import threading
        
        def health_monitor():
            while True:
                try:
                    self.calculate_system_health()
                    self._last_health_check = datetime.now()
                    time.sleep(interval)
                except Exception as e:
                    logger.error(f"❌ Health monitoring error: {e}")
                    time.sleep(interval)
        
        monitor_thread = threading.Thread(target=health_monitor, daemon=True)
        monitor_thread.start()
        logger.info(f"✅ Health monitoring started with {interval}s interval")

# Global metrics instance
metrics = LivHanaMetrics()
