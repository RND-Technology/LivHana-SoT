### Approval System
```python
# backend/approval-workflow-service/main.py
from fastapi import FastAPI, HTTPException
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import json
import asyncio

app = FastAPI(title="Approval Workflow Service", version="1.0.0")

class ApprovalWorkflowService:
    def __init__(self):
        self.pending_approvals = {}
        self.approved_items = {}
        self.rejected_items = {}
        self.approval_timeout = 24  # hours
    
    async def create_approval_request(self, item_data: Dict) -> str:
        """Create approval request"""
        try:
            approval_id = f"approval_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            approval_request = {
                'id': approval_id,
                'item_data': item_data,
                'status': 'pending',
                'created_at': datetime.now().isoformat(),
                'expires_at': (datetime.now() + timedelta(hours=self.approval_timeout)).isoformat(),
                'approver': None,
                'approved_at': None,
                'rejection_reason': None,
                'comments': []
            }
            
            self.pending_approvals[approval_id] = approval_request
            
            # Send notification to approvers
            await self.notify_approvers(approval_request)
            
            return approval_id
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Approval request creation failed: {e}")
    
    async def approve_item(self, approval_id: str, approver: str, comments: str = "") -> bool:
        """Approve item"""
        try:
            if approval_id not in self.pending_approvals:
                raise HTTPException(status_code=404, detail="Approval request not found")
            
            approval_request = self.pending_approvals[approval_id]
            
            # Check if expired
            if datetime.now() > datetime.fromisoformat(approval_request['expires_at']):
                raise HTTPException(status_code=400, detail="Approval request expired")
            
            # Update approval
            approval_request['status'] = 'approved'
            approval_request['approver'] = approver
            approval_request['approved_at'] = datetime.now().isoformat()
            if comments:
                approval_request['comments'].append({
                    'comment': comments,
                    'author': approver,
                    'timestamp': datetime.now().isoformat()
                })
            
            # Move to approved items
            self.approved_items[approval_id] = approval_request
            del self.pending_approvals[approval_id]
            
            # Process approved item
            await self.process_approved_item(approval_request)
            
            return True
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Approval failed: {e}")
    
    async def reject_item(self, approval_id: str, approver: str, reason: str, comments: str = "") -> bool:
        """Reject item"""
        try:
            if approval_id not in self.pending_approvals:
                raise HTTPException(status_code=404, detail="Approval request not found")
            
            approval_request = self.pending_approvals[approval_id]
            
            # Update rejection
            approval_request['status'] = 'rejected'
            approval_request['approver'] = approver
            approval_request['rejection_reason'] = reason
            approval_request['rejected_at'] = datetime.now().isoformat()
            if comments:
                approval_request['comments'].append({
                    'comment': comments,
                    'author': approver,
                    'timestamp': datetime.now().isoformat()
                })
            
            # Move to rejected items
            self.rejected_items[approval_id] = approval_request
            del self.pending_approvals[approval_id]
            
            return True
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Rejection failed: {e}")
    
    async def notify_approvers(self, approval_request: Dict):
        """Notify approvers of new request"""
        try:
            # In production, this would send emails/SMS to approvers
            print(f"Notification sent for approval request: {approval_request['id']}")
            
            # Simulate notification delay
            await asyncio.sleep(0.1)
            
        except Exception as e:
            print(f"Notification failed: {e}")
    
    async def process_approved_item(self, approval_request: Dict):
        """Process approved item"""
        try:
            item_data = approval_request['item_data']
            
            # Send to label generation service
            label_service_url = "http://label-generation-service:5002/api/label/generate"
            # Process label generation
            
            # Send to Lightspeed POS integration
            lightspeed_service_url = "http://lightspeed-integration:5005/api/lightspeed/create-item"
            # Process Lightspeed integration
            
            print(f"Approved item processed: {approval_request['id']}")
            
        except Exception as e:
            print(f"Approved item processing failed: {e}")

# API Endpoints
@app.post("/api/approval/create")
async def create_approval_request(item_data: Dict):
    """Create approval request"""
    service = ApprovalWorkflowService()
    approval_id = await service.create_approval_request(item_data)
    
    return {
        "status": "success",
        "approval_id": approval_id,
        "message": "Approval request created"
    }

@app.post("/api/approval/approve/{approval_id}")
async def approve_item(approval_id: str, approver: str, comments: str = ""):
    """Approve item"""
    service = ApprovalWorkflowService()
    success = await service.approve_item(approval_id, approver, comments)
    
    return {
        "status": "success",
        "approved": success,
        "message": "Item approved"
    }

@app.post("/api/approval/reject/{approval_id}")
async def reject_item(approval_id: str, approver: str, reason: str, comments: str = ""):
    """Reject item"""
    service = ApprovalWorkflowService()
    success = await service.reject_item(approval_id, approver, reason, comments)
    
    return {
        "status": "success",
        "rejected": success,
        "message": "Item rejected"
    }

@app.get("/api/approval/pending")
async def get_pending_approvals():
    """Get pending approvals"""
    service = ApprovalWorkflowService()
    return {
        "status": "success",
        "pending_count": len(service.pending_approvals),
        "approvals": list(service.pending_approvals.values())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5005)
```

---
