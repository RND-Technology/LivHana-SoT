### Automated SKU Creation
```python
# backend/sku-generation-service/main.py
from fastapi import FastAPI, HTTPException
from typing import Dict, List, Optional
import re
import hashlib
from datetime import datetime
import json

app = FastAPI(title="SKU Generation Service", version="1.0.0")

class SKUGenerationService:
    def __init__(self):
        self.sku_database = {}
        self.sku_patterns = {
            'cannabis': 'CAN',
            'hemp': 'HEM',
            'cbd': 'CBD',
            'thc': 'THC',
            'flower': 'FLR',
            'edible': 'EDB',
            'concentrate': 'CON',
            'topical': 'TOP',
            'tincture': 'TIN'
        }
    
    def generate_sku(self, product_data: Dict) -> str:
        """Generate SKU for product"""
        try:
            # Extract product information
            product_name = product_data.get('name', '').lower()
            supplier = product_data.get('supplier', '').lower()
            batch = product_data.get('batch', '')
            product_type = product_data.get('type', '')
            
            # Generate base SKU components
            base_components = []
            
            # Add product type prefix
            type_prefix = self.get_type_prefix(product_name, product_type)
            base_components.append(type_prefix)
            
            # Add supplier code
            supplier_code = self.get_supplier_code(supplier)
            base_components.append(supplier_code)
            
            # Add batch identifier
            batch_code = self.get_batch_code(batch)
            base_components.append(batch_code)
            
            # Add sequence number
            sequence = self.get_sequence_number(product_data)
            base_components.append(sequence)
            
            # Combine components
            sku = '-'.join(base_components)
            
            # Ensure uniqueness
            sku = self.ensure_unique_sku(sku, product_data)
            
            # Store SKU
            self.sku_database[sku] = {
                'product_data': product_data,
                'created_at': datetime.now().isoformat(),
                'status': 'pending_approval'
            }
            
            return sku
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"SKU generation failed: {e}")
    
    def get_type_prefix(self, product_name: str, product_type: str) -> str:
        """Get product type prefix"""
        # Check for specific product types
        for keyword, prefix in self.sku_patterns.items():
            if keyword in product_name or keyword in product_type.lower():
                return prefix
        
        # Default to generic
        return 'GEN'
    
    def get_supplier_code(self, supplier: str) -> str:
        """Get supplier code"""
        if not supplier:
            return 'UNK'
        
        # Extract first 3 characters of supplier name
        supplier_clean = re.sub(r'[^a-zA-Z0-9]', '', supplier)
        if len(supplier_clean) >= 3:
            return supplier_clean[:3].upper()
        else:
            return supplier_clean.upper().ljust(3, 'X')
    
    def get_batch_code(self, batch: str) -> str:
        """Get batch code"""
        if not batch:
            return '000'
        
        # Extract alphanumeric characters
        batch_clean = re.sub(r'[^a-zA-Z0-9]', '', batch)
        if len(batch_clean) >= 3:
            return batch_clean[:3].upper()
        else:
            return batch_clean.upper().ljust(3, '0')
    
    def get_sequence_number(self, product_data: Dict) -> str:
        """Get sequence number"""
        # Generate sequence based on product hash
        product_hash = hashlib.md5(
            json.dumps(product_data, sort_keys=True).encode()
        ).hexdigest()
        
        # Use last 3 characters of hash
        return product_hash[-3:].upper()
    
    def ensure_unique_sku(self, sku: str, product_data: Dict) -> str:
        """Ensure SKU is unique"""
        if sku not in self.sku_database:
            return sku
        
        # Add suffix to make unique
        counter = 1
        while f"{sku}-{counter:02d}" in self.sku_database:
            counter += 1
        
        return f"{sku}-{counter:02d}"
    
    def validate_sku(self, sku: str) -> Dict:
        """Validate SKU format"""
        try:
            # Check format: XXX-XXX-XXX-XXX
            pattern = r'^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{3}$'
            if not re.match(pattern, sku):
                return {
                    'valid': False,
                    'error': 'Invalid SKU format'
                }
            
            # Check if SKU exists
            if sku in self.sku_database:
                return {
                    'valid': True,
                    'exists': True,
                    'status': self.sku_database[sku]['status']
                }
            else:
                return {
                    'valid': True,
                    'exists': False
                }
                
        except Exception as e:
            return {
                'valid': False,
                'error': str(e)
            }

# API Endpoints
@app.post("/api/sku/generate")
async def generate_sku(product_data: Dict):
    """Generate SKU for product"""
    service = SKUGenerationService()
    sku = service.generate_sku(product_data)
    
    return {
        "status": "success",
        "sku": sku,
        "product_data": product_data
    }

@app.post("/api/sku/validate")
async def validate_sku(sku: str):
    """Validate SKU"""
    service = SKUGenerationService()
    validation_result = service.validate_sku(sku)
    
    return {
        "status": "success",
        "validation": validation_result
    }

@app.get("/api/sku/database")
async def get_sku_database():
    """Get SKU database status"""
    service = SKUGenerationService()
    return {
        "status": "success",
        "total_skus": len(service.sku_database),
        "skus": list(service.sku_database.keys())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5004)
```

---
