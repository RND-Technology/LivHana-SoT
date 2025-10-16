### Lightspeed Integration Service
```python
# backend/lightspeed-integration-service/main.py
from fastapi import FastAPI, HTTPException
from typing import Dict, List, Optional
import requests
import json
from datetime import datetime
import asyncio
import aiohttp

app = FastAPI(title="Lightspeed Integration Service", version="1.0.0")

class LightspeedIntegrationService:
    def __init__(self):
        self.api_base_url = "https://api.lightspeedapp.com/API/V1"
        self.account_id = "your-account-id"  # From Replit Secrets
        self.api_key = "your-api-key"  # From Replit Secrets
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def create_item(self, item_data: Dict) -> Dict:
        """Create item in Lightspeed POS"""
        try:
            # Prepare item data for Lightspeed
            lightspeed_item = {
                "description": item_data.get('name', ''),
                "customSku": item_data.get('sku', ''),
                "defaultCost": float(item_data.get('cost', 0)),
                "defaultPrice": float(item_data.get('price', 0)),
                "tax": True,
                "archived": False,
                "itemType": "default",
                "customFields": {
                    "COA_ID": item_data.get('coa_id', ''),
                    "BATCH_NUMBER": item_data.get('batch', ''),
                    "SUPPLIER": item_data.get('supplier', ''),
                    "COA_VERIFIED": item_data.get('coa_verified', False),
                    "APPROVAL_ID": item_data.get('approval_id', '')
                }
            }
            
            # Create item in Lightspeed
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base_url}/Account/{self.account_id}/Item.json",
                    headers=self.headers,
                    json=lightspeed_item
                ) as response:
                    if response.status == 201:
                        created_item = await response.json()
                        return {
                            "status": "success",
                            "lightspeed_item_id": created_item.get('Item', {}).get('itemID'),
                            "item_data": created_item
                        }
                    else:
                        error_data = await response.json()
                        raise HTTPException(
                            status_code=response.status,
                            detail=f"Lightspeed API error: {error_data}"
                        )
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lightspeed integration failed: {e}")
    
    async def update_item(self, item_id: str, item_data: Dict) -> Dict:
        """Update item in Lightspeed POS"""
        try:
            # Prepare update data
            update_data = {
                "description": item_data.get('name', ''),
                "customSku": item_data.get('sku', ''),
                "defaultCost": float(item_data.get('cost', 0)),
                "defaultPrice": float(item_data.get('price', 0)),
                "customFields": {
                    "COA_ID": item_data.get('coa_id', ''),
                    "BATCH_NUMBER": item_data.get('batch', ''),
                    "SUPPLIER": item_data.get('supplier', ''),
                    "COA_VERIFIED": item_data.get('coa_verified', False),
                    "APPROVAL_ID": item_data.get('approval_id', '')
                }
            }
            
            # Update item in Lightspeed
            async with aiohttp.ClientSession() as session:
                async with session.put(
                    f"{self.api_base_url}/Account/{self.account_id}/Item/{item_id}.json",
                    headers=self.headers,
                    json=update_data
                ) as response:
                    if response.status == 200:
                        updated_item = await response.json()
                        return {
                            "status": "success",
                            "lightspeed_item_id": item_id,
                            "item_data": updated_item
                        }
                    else:
                        error_data = await response.json()
                        raise HTTPException(
                            status_code=response.status,
                            detail=f"Lightspeed API error: {error_data}"
                        )
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lightspeed update failed: {e}")
    
    async def get_item(self, item_id: str) -> Dict:
        """Get item from Lightspeed POS"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_base_url}/Account/{self.account_id}/Item/{item_id}.json",
                    headers=self.headers
                ) as response:
                    if response.status == 200:
                        item_data = await response.json()
                        return {
                            "status": "success",
                            "item_data": item_data
                        }
                    else:
                        error_data = await response.json()
                        raise HTTPException(
                            status_code=response.status,
                            detail=f"Lightspeed API error: {error_data}"
                        )
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lightspeed get failed: {e}")
    
    async def search_items(self, search_term: str) -> List[Dict]:
        """Search items in Lightspeed POS"""
        try:
            search_params = {
                "q": search_term,
                "limit": 100
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_base_url}/Account/{self.account_id}/Item.json",
                    headers=self.headers,
                    params=search_params
                ) as response:
                    if response.status == 200:
                        search_results = await response.json()
                        return {
                            "status": "success",
                            "items": search_results.get('Items', [])
                        }
                    else:
                        error_data = await response.json()
                        raise HTTPException(
                            status_code=response.status,
                            detail=f"Lightspeed API error: {error_data}"
                        )
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lightspeed search failed: {e}")

# API Endpoints
@app.post("/api/lightspeed/create-item")
async def create_item(item_data: Dict):
    """Create item in Lightspeed POS"""
    service = LightspeedIntegrationService()
    result = await service.create_item(item_data)
    return result

@app.put("/api/lightspeed/update-item/{item_id}")
async def update_item(item_id: str, item_data: Dict):
    """Update item in Lightspeed POS"""
    service = LightspeedIntegrationService()
    result = await service.update_item(item_id, item_data)
    return result

@app.get("/api/lightspeed/get-item/{item_id}")
async def get_item(item_id: str):
    """Get item from Lightspeed POS"""
    service = LightspeedIntegrationService()
    result = await service.get_item(item_id)
    return result

@app.get("/api/lightspeed/search-items")
async def search_items(search_term: str):
    """Search items in Lightspeed POS"""
    service = LightspeedIntegrationService()
    result = await service.search_items(search_term)
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5006)
```

---
