### Label Creation System

```python
# backend/label-generation-service/main.py
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
import qrcode
from PIL import Image, ImageDraw, ImageFont
import io
import base64
from typing import Dict, List
import json
from datetime import datetime

app = FastAPI(title="Label Generation Service", version="1.0.0")

class LabelGenerationService:
    def __init__(self):
        self.label_templates = {
            'standard': {
                'width': 300,
                'height': 200,
                'margin': 20,
                'font_size': 12,
                'title_font_size': 16
            },
            'compact': {
                'width': 200,
                'height': 150,
                'margin': 15,
                'font_size': 10,
                'title_font_size': 14
            },
            'premium': {
                'width': 400,
                'height': 300,
                'margin': 25,
                'font_size': 14,
                'title_font_size': 18
            }
        }
    
    def generate_label(self, product_data: Dict, template: str = 'standard') -> bytes:
        """Generate product label with QR code"""
        try:
            template_config = self.label_templates[template]
            
            # Create label image
            label = Image.new('RGB', (template_config['width'], template_config['height']), 'white')
            draw = ImageDraw.Draw(label)
            
            # Load fonts
            try:
                title_font = ImageFont.truetype("arial.ttf", template_config['title_font_size'])
                font = ImageFont.truetype("arial.ttf", template_config['font_size'])
            except:
                title_font = ImageFont.load_default()
                font = ImageFont.load_default()
            
            # Draw label content
            y_position = template_config['margin']
            
            # Company header
            draw.text((template_config['margin'], y_position), 
                     "REGGIE & DRO", fill='black', font=title_font)
            y_position += template_config['title_font_size'] + 10
            
            # Product name
            draw.text((template_config['margin'], y_position), 
                     f"Product: {product_data.get('name', 'N/A')}", fill='black', font=font)
            y_position += template_config['font_size'] + 5
            
            # SKU
            draw.text((template_config['margin'], y_position), 
                     f"SKU: {product_data.get('sku', 'N/A')}", fill='black', font=font)
            y_position += template_config['font_size'] + 5
            
            # Batch/Lot
            draw.text((template_config['margin'], y_position), 
                     f"Batch: {product_data.get('batch', 'N/A')}", fill='black', font=font)
            y_position += template_config['font_size'] + 5
            
            # Price
            draw.text((template_config['margin'], y_position), 
                     f"Price: ${product_data.get('price', '0.00')}", fill='black', font=font)
            y_position += template_config['font_size'] + 5
            
            # COA status
            coa_status = "✅ COA Verified" if product_data.get('coa_verified') else "⚠️ COA Pending"
            draw.text((template_config['margin'], y_position), 
                     f"COA: {coa_status}", fill='green' if product_data.get('coa_verified') else 'orange', font=font)
            y_position += template_config['font_size'] + 5
            
            # Generate QR code
            qr_data = self.generate_qr_data(product_data)
            qr_code = qrcode.QRCode(version=1, box_size=4, border=2)
            qr_code.add_data(qr_data)
            qr_code.make(fit=True)
            
            # Create QR code image
            qr_image = qr_code.make_image(fill_color="black", back_color="white")
            
            # Resize QR code to fit label
            qr_size = min(80, template_config['width'] - template_config['margin'] * 2)
            qr_image = qr_image.resize((qr_size, qr_size))
            
            # Position QR code
            qr_x = template_config['width'] - template_config['margin'] - qr_size
            qr_y = template_config['height'] - template_config['margin'] - qr_size
            
            # Paste QR code onto label
            label.paste(qr_image, (qr_x, qr_y))
            
            # Add border
            draw.rectangle([0, 0, template_config['width']-1, template_config['height']-1], 
                          outline='black', width=2)
            
            # Convert to bytes
            img_buffer = io.BytesIO()
            label.save(img_buffer, format='PNG')
            img_buffer.seek(0)
            
            return img_buffer.getvalue()
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Label generation failed: {e}")
    
    def generate_qr_data(self, product_data: Dict) -> str:
        """Generate QR code data for Lightspeed POS"""
        qr_data = {
            'sku': product_data.get('sku', ''),
            'name': product_data.get('name', ''),
            'price': product_data.get('price', '0.00'),
            'batch': product_data.get('batch', ''),
            'coa_id': product_data.get('coa_id', ''),
            'timestamp': datetime.now().isoformat(),
            'source': 'reggieanddro'
        }
        return json.dumps(qr_data)
    
    def generate_batch_labels(self, products: List[Dict], template: str = 'standard') -> List[bytes]:
        """Generate labels for multiple products"""
        labels = []
        for product in products:
            label = self.generate_label(product, template)
            labels.append(label)
        return labels

# API Endpoints
@app.post("/api/label/generate")
async def generate_label(product_data: Dict):
    """Generate single product label"""
    service = LabelGenerationService()
    label_bytes = service.generate_label(product_data)
    
    return {
        "status": "success",
        "label_data": base64.b64encode(label_bytes).decode(),
        "product_sku": product_data.get('sku', 'N/A')
    }

@app.post("/api/label/generate-batch")
async def generate_batch_labels(products: List[Dict]):
    """Generate labels for multiple products"""
    service = LabelGenerationService()
    labels = service.generate_batch_labels(products)
    
    labels_data = []
    for i, label_bytes in enumerate(labels):
        labels_data.append({
            "product_index": i,
            "label_data": base64.b64encode(label_bytes).decode(),
            "product_sku": products[i].get('sku', 'N/A')
        })
    
    return {
        "status": "success",
        "labels_count": len(labels),
        "labels": labels_data
    }

@app.get("/api/label/templates")
async def get_label_templates():
    """Get available label templates"""
    service = LabelGenerationService()
    return {
        "templates": list(service.label_templates.keys()),
        "template_configs": service.label_templates
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)
```

---
