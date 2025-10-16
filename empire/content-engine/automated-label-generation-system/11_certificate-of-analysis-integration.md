### Certificate of Analysis Integration
```python
# backend/coa-integration-service/main.py
from fastapi import FastAPI, HTTPException
from typing import Dict, List, Optional
import requests
import json
from datetime import datetime
import asyncio
import aiohttp

app = FastAPI(title="COA Integration Service", version="1.0.0")

class COAIntegrationService:
    def __init__(self):
        self.coa_database = {}
        self.external_coa_sources = [
            "https://api.coa-database.com",
            "https://hemp-testing.org/api",
            "https://cannabis-compliance.org/api"
        ]
    
    async def lookup_coa(self, product_data: Dict) -> Optional[Dict]:
        """Lookup COA for product"""
        try:
            # Extract COA identifiers
            batch_number = product_data.get('batch', '')
            supplier = product_data.get('supplier', '')
            product_name = product_data.get('name', '')
            
            # Search local database first
            local_coa = await self.search_local_coa(batch_number, supplier, product_name)
            if local_coa:
                return local_coa
            
            # Search external sources
            external_coa = await self.search_external_coa(batch_number, supplier, product_name)
            if external_coa:
                # Store in local database
                await self.store_coa(external_coa)
                return external_coa
            
            return None
            
        except Exception as e:
            print(f"COA lookup failed: {e}")
            return None
    
    async def search_local_coa(self, batch_number: str, supplier: str, product_name: str) -> Optional[Dict]:
        """Search local COA database"""
        try:
            # Search by batch number
            if batch_number in self.coa_database:
                return self.coa_database[batch_number]
            
            # Search by supplier and product
            for coa_id, coa_data in self.coa_database.items():
                if (coa_data.get('supplier', '').lower() == supplier.lower() and
                    coa_data.get('product_name', '').lower() == product_name.lower()):
                    return coa_data
            
            return None
        except Exception as e:
            print(f"Local COA search failed: {e}")
            return None
    
    async def search_external_coa(self, batch_number: str, supplier: str, product_name: str) -> Optional[Dict]:
        """Search external COA sources"""
        try:
            async with aiohttp.ClientSession() as session:
                for source_url in self.external_coa_sources:
                    try:
                        # Search by batch number
                        if batch_number:
                            search_params = {
                                'batch': batch_number,
                                'supplier': supplier,
                                'product': product_name
                            }
                            
                            async with session.get(f"{source_url}/search", params=search_params) as response:
                                if response.status == 200:
                                    coa_data = await response.json()
                                    if coa_data and coa_data.get('found'):
                                        return coa_data
                    except Exception as e:
                        print(f"External COA search failed for {source_url}: {e}")
                        continue
            
            return None
        except Exception as e:
            print(f"External COA search failed: {e}")
            return None
    
    async def store_coa(self, coa_data: Dict):
        """Store COA in local database"""
        try:
            coa_id = coa_data.get('id', f"coa_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
            self.coa_database[coa_id] = coa_data
            return coa_id
        except Exception as e:
            print(f"COA storage failed: {e}")
            return None
    
    async def validate_coa(self, coa_data: Dict) -> Dict:
        """Validate COA compliance"""
        try:
            validation_result = {
                'valid': True,
                'issues': [],
                'compliance_score': 100
            }
            
            # Check required fields
            required_fields = ['batch_number', 'test_date', 'thc_content', 'cbd_content']
            for field in required_fields:
                if not coa_data.get(field):
                    validation_result['issues'].append(f"Missing required field: {field}")
                    validation_result['valid'] = False
            
            # Check THC content compliance
            thc_content = coa_data.get('thc_content', 0)
            if thc_content > 0.3:
                validation_result['issues'].append(f"THC content exceeds legal limit: {thc_content}%")
                validation_result['valid'] = False
                validation_result['compliance_score'] -= 50
            
            # Check test date validity
            test_date = coa_data.get('test_date')
            if test_date:
                test_datetime = datetime.fromisoformat(test_date)
                days_old = (datetime.now() - test_datetime).days
                if days_old > 365:
                    validation_result['issues'].append(f"COA is {days_old} days old")
                    validation_result['compliance_score'] -= 20
            
            # Check lab accreditation
            lab_name = coa_data.get('lab_name', '')
            if not lab_name or 'accredited' not in lab_name.lower():
                validation_result['issues'].append("Lab not properly accredited")
                validation_result['compliance_score'] -= 30
            
            return validation_result
            
        except Exception as e:
            print(f"COA validation failed: {e}")
            return {
                'valid': False,
                'issues': [f"Validation error: {str(e)}"],
                'compliance_score': 0
            }

# API Endpoints
@app.post("/api/coa/lookup")
async def lookup_coa(product_data: Dict):
    """Lookup COA for product"""
    service = COAIntegrationService()
    coa_data = await service.lookup_coa(product_data)
    
    if coa_data:
        validation_result = await service.validate_coa(coa_data)
        return {
            "status": "success",
            "coa_found": True,
            "coa_data": coa_data,
            "validation": validation_result
        }
    else:
        return {
            "status": "success",
            "coa_found": False,
            "message": "No COA found for this product"
        }

@app.post("/api/coa/validate")
async def validate_coa(coa_data: Dict):
    """Validate COA compliance"""
    service = COAIntegrationService()
    validation_result = await service.validate_coa(coa_data)
    
    return {
        "status": "success",
        "validation": validation_result
    }

@app.get("/api/coa/database")
async def get_coa_database():
    """Get COA database status"""
    service = COAIntegrationService()
    return {
        "status": "success",
        "total_coas": len(service.coa_database),
        "coa_ids": list(service.coa_database.keys())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5003)
```

---
