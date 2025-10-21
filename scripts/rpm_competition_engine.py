#!/usr/bin/env python3
"""
RPM Competition Engine
Systematically measures, scores, and tracks predictions vs actuals across all competitors (human + AI)
with ROI/$/Day as king metric and passive cash flow ruling business decisions within guardrails.
"""

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple


class RPMCompetitionEngine:
    """
    Core engine for RPM DNA competition framework.
    Tracks predictions, actuals, scores competitors, generates leaderboards.
    """
    
    def __init__(self, config_path: str):
        """Load configuration"""
        with open(config_path) as f:
            self.config = json.load(f)
        
        self.predictions_db = self._load_db('predictions_db')
        self.actuals_db = self._load_db('actuals_db')
        self.scores_db = self._load_db('scores_db')
        self.decisions_db = self._load_db('business_decisions_log')
    
    def _load_db(self, db_key: str) -> Dict:
        """Load or create database file"""
        db_path = Path(self.config['output_locations'][db_key])
        db_path.parent.mkdir(parents=True, exist_ok=True)
        
        if db_path.exists():
            with open(db_path) as f:
                return json.load(f)
        return {"version": "1.0", "records": []}
    
    def _save_db(self, db_key: str, data: Dict):
        """Save database file"""
        db_path = Path(self.config['output_locations'][db_key])
        with open(db_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def record_prediction(
        self,
        competitor_id: str,
        rpm_card_id: str,
        project_name: str,
        projected_timeframe_hours: float,
        projected_cost_usd: float,
        projected_roi_usd: float,
        projected_passive_cashflow_monthly: float = 0.0,
        confidence_level: float = 0.8,
        assumptions: List[str] = None,
        guardrails_passed: bool = True
    ) -> str:
        """
        Record a prediction from any competitor (human or AI).
        Returns prediction_id.
        """
        prediction_id = str(uuid.uuid4())
        projected_roi_per_day = projected_roi_usd / (projected_timeframe_hours / 24)
        
        prediction = {
            "prediction_id": prediction_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": competitor_id,
            "rpm_card_id": rpm_card_id,
            "project_name": project_name,
            "projected_timeframe_hours": projected_timeframe_hours,
            "projected_cost_usd": projected_cost_usd,
            "projected_roi_usd": projected_roi_usd,
            "projected_roi_per_day": projected_roi_per_day,
            "projected_passive_cashflow_monthly": projected_passive_cashflow_monthly,
            "confidence_level": confidence_level,
            "assumptions": assumptions or [],
            "guardrails_passed": guardrails_passed
        }
        
        self.predictions_db["records"].append(prediction)
        self._save_db('predictions_db', self.predictions_db)
        
        return prediction_id
    
    def record_actual(
        self,
        prediction_id: str,
        recorded_by: str,
        actual_timeframe_hours: float,
        actual_cost_usd: float,
        actual_roi_usd: float,
        actual_passive_cashflow_monthly: float = 0.0,
        variance_notes: str = "",
        learnings: List[str] = None
    ) -> Tuple[str, Dict]:
        """
        Record actual results for a prediction.
        Returns (actual_id, score).
        """
        actual_id = str(uuid.uuid4())
        actual_roi_per_day = actual_roi_usd / (actual_timeframe_hours / 24)
        
        actual = {
            "actual_id": actual_id,
            "prediction_id": prediction_id,
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "recorded_by": recorded_by,
            "actual_timeframe_hours": actual_timeframe_hours,
            "actual_cost_usd": actual_cost_usd,
            "actual_roi_usd": actual_roi_usd,
            "actual_roi_per_day": actual_roi_per_day,
            "actual_passive_cashflow_monthly": actual_passive_cashflow_monthly,
            "variance_notes": variance_notes,
            "learnings": learnings or []
        }
        
        self.actuals_db["records"].append(actual)
        self._save_db('actuals_db', self.actuals_db)
        
        # Calculate score
        score = self._calculate_score(prediction_id, actual)
        
        return actual_id, score
    
    def _calculate_score(self, prediction_id: str, actual: Dict) -> Dict:
        """
        Calculate all scores for a prediction vs actual.
        Returns score object.
        """
        # Find prediction
        prediction = next(
            (p for p in self.predictions_db["records"] if p["prediction_id"] == prediction_id),
            None
        )
        if not prediction:
            raise ValueError(f"Prediction {prediction_id} not found")
        
        # Calculate dimension accuracies
        timeframe_accuracy = self._calculate_accuracy(
            prediction["projected_timeframe_hours"],
            actual["actual_timeframe_hours"]
        )
        
        cost_accuracy = self._calculate_accuracy(
            prediction["projected_cost_usd"],
            actual["actual_cost_usd"]
        )
        
        roi_accuracy = self._calculate_accuracy(
            prediction["projected_roi_usd"],
            actual["actual_roi_usd"]
        )
        
        # Calculate composite score (weighted)
        weights = self.config['prediction_dimensions']
        composite_score = (
            timeframe_accuracy * weights['timeframe']['weight'] +
            cost_accuracy * weights['cost']['weight'] +
            roi_accuracy * weights['roi']['weight']
        )
        
        # Determine grade tier
        grade_tier = self._get_grade_tier(composite_score)
        
        # Run business decision engine
        business_decision = self._run_decision_engine(
            actual["actual_roi_per_day"],
            actual["actual_passive_cashflow_monthly"],
            composite_score,
            prediction["guardrails_passed"]
        )
        
        score = {
            "score_id": str(uuid.uuid4()),
            "prediction_id": prediction_id,
            "actual_id": actual["actual_id"],
            "competitor_id": prediction["created_by"],
            "scored_at": datetime.now(timezone.utc).isoformat(),
            "timeframe_accuracy": timeframe_accuracy,
            "cost_accuracy": cost_accuracy,
            "roi_accuracy": roi_accuracy,
            "composite_score": composite_score,
            "grade_tier": grade_tier,
            "roi_per_day": actual["actual_roi_per_day"],
            "passive_cashflow": actual["actual_passive_cashflow_monthly"],
            "business_decision": business_decision
        }
        
        self.scores_db["records"].append(score)
        self._save_db('scores_db', self.scores_db)
        
        return score
    
    def _calculate_accuracy(self, projected: float, actual: float) -> float:
        """
        Calculate accuracy for a single dimension.
        Formula: 1 - (abs(projected - actual) / projected)
        Clamped to [0, 1]
        """
        if projected == 0:
            return 1.0 if actual == 0 else 0.0
        
        accuracy = 1 - (abs(projected - actual) / projected)
        return max(0.0, min(1.0, accuracy))
    
    def _get_grade_tier(self, composite_score: float) -> str:
        """Determine grade tier based on composite score"""
        bands = self.config['composite_score']['grade_bands']
        
        for tier in ['S_TIER', 'A_TIER', 'B_TIER', 'C_TIER', 'D_TIER']:
            if composite_score >= bands[tier]['min']:
                return tier
        
        return 'F_TIER'
    
    def _run_decision_engine(
        self,
        roi_per_day: float,
        passive_cashflow: float,
        prediction_accuracy: float,
        guardrails_passed: bool
    ) -> str:
        """
        Run business decision matrix.
        Returns: GO, GO_WITH_CAUTION, or NO_GO
        """
        matrix = self.config['business_decision_engine']['decision_matrix']
        
        # Check GO conditions
        if (passive_cashflow >= 0 and
            roi_per_day >= 100 and
            guardrails_passed and
            prediction_accuracy >= 0.70):
            return "GO"
        
        # Check GO_WITH_CAUTION conditions
        if (passive_cashflow >= -10000 and
            roi_per_day >= 50 and
            guardrails_passed and
            prediction_accuracy >= 0.60):
            return "GO_WITH_CAUTION"
        
        # Otherwise NO_GO
        return "NO_GO"
    
    def generate_leaderboard(
        self,
        cadence: str = 'daily',
        category: str = 'all'
    ) -> Dict:
        """
        Generate leaderboard for specified cadence and category.
        Returns leaderboard dict.
        """
        # Filter scores by time window
        now = datetime.now(timezone.utc)
        if cadence == 'daily':
            cutoff = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif cadence == 'weekly':
            # Last 7 days
            from datetime import timedelta
            cutoff = now - timedelta(days=7)
        else:
            cutoff = datetime.min.replace(tzinfo=timezone.utc)
        
        relevant_scores = [
            s for s in self.scores_db["records"]
            if datetime.fromisoformat(s["scored_at"]) >= cutoff
        ]
        
        # Filter by category
        if category != 'all':
            competitor_ids = [
                c['id'] for c in self.config['competitors'].get(category, [])
            ]
            relevant_scores = [
                s for s in relevant_scores if s["competitor_id"] in competitor_ids
            ]
        
        # Aggregate by competitor
        competitor_stats = {}
        for score in relevant_scores:
            comp_id = score["competitor_id"]
            if comp_id not in competitor_stats:
                competitor_stats[comp_id] = {
                    "competitor_id": comp_id,
                    "prediction_count": 0,
                    "total_composite_score": 0.0,
                    "total_roi_per_day": 0.0,
                    "total_passive_cashflow": 0.0,
                    "grade_distribution": {}
                }
            
            stats = competitor_stats[comp_id]
            stats["prediction_count"] += 1
            stats["total_composite_score"] += score["composite_score"]
            stats["total_roi_per_day"] += score["roi_per_day"]
            stats["total_passive_cashflow"] += score["passive_cashflow"]
            
            grade = score["grade_tier"]
            stats["grade_distribution"][grade] = stats["grade_distribution"].get(grade, 0) + 1
        
        # Calculate averages and rank
        leaderboard = []
        for comp_id, stats in competitor_stats.items():
            count = stats["prediction_count"]
            leaderboard.append({
                "competitor_id": comp_id,
                "competitor_name": self._get_competitor_name(comp_id),
                "prediction_count": count,
                "avg_composite_score": stats["total_composite_score"] / count,
                "avg_roi_per_day": stats["total_roi_per_day"] / count,
                "total_passive_cashflow": stats["total_passive_cashflow"],
                "grade_distribution": stats["grade_distribution"]
            })
        
        # Sort by ROI/$/Day (KING METRIC)
        leaderboard.sort(key=lambda x: x["avg_roi_per_day"], reverse=True)
        
        # Add ranks
        for i, entry in enumerate(leaderboard):
            entry["rank"] = i + 1
        
        leaderboard_doc = {
            "cadence": cadence,
            "category": category,
            "generated_at": now.isoformat(),
            "period_start": cutoff.isoformat(),
            "period_end": now.isoformat(),
            "competitors_ranked": len(leaderboard),
            "leaderboard": leaderboard
        }
        
        # Save
        if cadence == 'daily':
            self._save_leaderboard('leaderboard_daily', leaderboard_doc)
        elif cadence == 'weekly':
            self._save_leaderboard('leaderboard_weekly', leaderboard_doc)
        
        return leaderboard_doc
    
    def _get_competitor_name(self, comp_id: str) -> str:
        """Get competitor name from config"""
        all_competitors = (
            self.config['competitors']['humans'] +
            self.config['competitors']['ai_models']
        )
        for comp in all_competitors:
            if comp['id'] == comp_id:
                return comp['name']
        return comp_id
    
    def _save_leaderboard(self, key: str, data: Dict):
        """Save leaderboard to file"""
        path = Path(self.config['output_locations'][key])
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)


def main():
    """CLI for RPM Competition Engine"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: rpm_competition_engine.py <command> [args]")
        print("Commands: record_prediction, record_actual, generate_leaderboard")
        sys.exit(1)
    
    config_path = Path(__file__).parent.parent / "config/rpm_competition_framework.json"
    engine = RPMCompetitionEngine(str(config_path))
    
    command = sys.argv[1]
    
    if command == "generate_leaderboard":
        cadence = sys.argv[2] if len(sys.argv) > 2 else 'daily'
        category = sys.argv[3] if len(sys.argv) > 3 else 'all'
        
        leaderboard = engine.generate_leaderboard(cadence, category)
        print(json.dumps(leaderboard, indent=2))
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == '__main__':
    main()

