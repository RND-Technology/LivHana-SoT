### Email Processing Service

```python
# backend/invoice-capture-service/main.py
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import imaplib
import email
import re
import json
from datetime import datetime
from typing import Dict, List, Optional
import asyncio
import aiofiles
from pathlib import Path

app = FastAPI(title="Invoice Capture Service", version="1.0.0")

# Email configuration
EMAIL_HOST = "imap.gmail.com"
EMAIL_PORT = 993
EMAIL_USER = "high@reggieanddro.com"
EMAIL_PASSWORD = "your-app-password"  # From Replit Secrets

class InvoiceCaptureService:
    def __init__(self):
        self.email_connection = None
        self.processed_emails = set()
    
    async def connect_email(self):
        """Connect to email server"""
        try:
            self.email_connection = imaplib.IMAP4_SSL(EMAIL_HOST, EMAIL_PORT)
            self.email_connection.login(EMAIL_USER, EMAIL_PASSWORD)
            self.email_connection.select("INBOX")
            return True
        except Exception as e:
            print(f"Email connection failed: {e}")
            return False
    
    async def scan_for_invoices(self) -> List[Dict]:
        """Scan email for new invoices"""
        if not self.email_connection:
            await self.connect_email()
        
        invoices = []
        try:
            # Search for emails with invoice keywords
            search_criteria = [
                'SUBJECT "invoice"',
                'SUBJECT "receipt"',
                'SUBJECT "purchase order"',
                'SUBJECT "delivery"',
                'FROM "supplier"',
                'FROM "vendor"'
            ]
            
            for criteria in search_criteria:
                status, messages = self.email_connection.search(None, criteria)
                if status == 'OK':
                    for msg_id in messages[0].split():
                        if msg_id.decode() not in self.processed_emails:
                            invoice_data = await self.process_email(msg_id.decode())
                            if invoice_data:
                                invoices.append(invoice_data)
                                self.processed_emails.add(msg_id.decode())
            
            return invoices
        except Exception as e:
            print(f"Email scan failed: {e}")
            return []
    
    async def process_email(self, msg_id: str) -> Optional[Dict]:
        """Process individual email for invoice data"""
        try:
            status, msg_data = self.email_connection.fetch(msg_id, '(RFC822)')
            if status != 'OK':
                return None
            
            email_message = email.message_from_bytes(msg_data[0][1])
            
            # Extract email metadata
            subject = email_message.get('Subject', '')
            sender = email_message.get('From', '')
            date = email_message.get('Date', '')
            
            # Extract email body
            body = self.extract_email_body(email_message)
            
            # Extract attachments
            attachments = self.extract_attachments(email_message)
            
            # Parse invoice data
            invoice_data = await self.parse_invoice_data(subject, body, attachments)
            
            if invoice_data:
                return {
                    'msg_id': msg_id,
                    'subject': subject,
                    'sender': sender,
                    'date': date,
                    'body': body,
                    'attachments': attachments,
                    'invoice_data': invoice_data,
                    'processed_at': datetime.now().isoformat()
                }
            
            return None
        except Exception as e:
            print(f"Email processing failed: {e}")
            return None
    
    def extract_email_body(self, email_message) -> str:
        """Extract email body text"""
        body = ""
        if email_message.is_multipart():
            for part in email_message.walk():
                if part.get_content_type() == "text/plain":
                    body += part.get_payload(decode=True).decode('utf-8', errors='ignore')
        else:
            body = email_message.get_payload(decode=True).decode('utf-8', errors='ignore')
        return body
    
    def extract_attachments(self, email_message) -> List[Dict]:
        """Extract email attachments"""
        attachments = []
        if email_message.is_multipart():
            for part in email_message.walk():
                if part.get_content_disposition() == 'attachment':
                    filename = part.get_filename()
                    if filename:
                        content = part.get_payload(decode=True)
                        attachments.append({
                            'filename': filename,
                            'content_type': part.get_content_type(),
                            'size': len(content),
                            'content': content
                        })
        return attachments
    
    async def parse_invoice_data(self, subject: str, body: str, attachments: List[Dict]) -> Optional[Dict]:
        """Parse invoice data from email content"""
        try:
            # Extract product information using regex patterns
            product_patterns = {
                'product_name': r'(?:product|item|name)[:\s]+([^\n\r]+)',
                'quantity': r'(?:qty|quantity)[:\s]+(\d+)',
                'price': r'(?:price|cost)[:\s]+\$?([\d,]+\.?\d*)',
                'sku': r'(?:sku|item\s*#)[:\s]+([A-Za-z0-9\-]+)',
                'batch': r'(?:batch|lot)[:\s]+([A-Za-z0-9\-]+)',
                'supplier': r'(?:supplier|vendor)[:\s]+([^\n\r]+)',
                'invoice_number': r'(?:invoice|receipt)[\s]*#?[:\s]+([A-Za-z0-9\-]+)'
            }
            
            invoice_data = {
                'products': [],
                'supplier': '',
                'invoice_number': '',
                'total_amount': 0,
                'date': datetime.now().isoformat()
            }
            
            # Extract supplier and invoice number
            for key, pattern in product_patterns.items():
                if key in ['supplier', 'invoice_number']:
                    match = re.search(pattern, body, re.IGNORECASE)
                    if match:
                        invoice_data[key] = match.group(1).strip()
            
            # Extract product information
            product_sections = re.split(r'(?:product|item)', body, flags=re.IGNORECASE)
            for section in product_sections[1:]:  # Skip first empty section
                product = {}
                for key, pattern in product_patterns.items():
                    if key not in ['supplier', 'invoice_number']:
                        match = re.search(pattern, section, re.IGNORECASE)
                        if match:
                            product[key] = match.group(1).strip()
                
                if product:
                    invoice_data['products'].append(product)
            
            # Process attachments for additional data
            for attachment in attachments:
                if attachment['filename'].lower().endswith(('.pdf', '.txt', '.doc', '.docx')):
                    # Extract text from attachment (simplified)
                    attachment_data = await self.extract_attachment_data(attachment)
                    if attachment_data:
                        invoice_data['attachments_data'] = attachment_data
            
            return invoice_data if invoice_data['products'] else None
            
        except Exception as e:
            print(f"Invoice parsing failed: {e}")
            return None
    
    async def extract_attachment_data(self, attachment: Dict) -> Optional[Dict]:
        """Extract data from attachment files"""
        try:
            # Simplified attachment processing
            # In production, use libraries like PyPDF2, python-docx, etc.
            filename = attachment['filename']
            content = attachment['content']
            
            if filename.lower().endswith('.txt'):
                text_content = content.decode('utf-8', errors='ignore')
                return {'type': 'text', 'content': text_content}
            elif filename.lower().endswith('.pdf'):
                # PDF processing would go here
                return {'type': 'pdf', 'filename': filename}
            
            return None
        except Exception as e:
            print(f"Attachment processing failed: {e}")
            return None

# API Endpoints
@app.post("/api/invoice/scan")
async def scan_invoices(background_tasks: BackgroundTasks):
    """Scan for new invoices"""
    service = InvoiceCaptureService()
    invoices = await service.scan_for_invoices()
    
    # Process invoices in background
    for invoice in invoices:
        background_tasks.add_task(process_invoice, invoice)
    
    return {
        "status": "success",
        "invoices_found": len(invoices),
        "invoices": invoices
    }

@app.get("/api/invoice/status/{invoice_id}")
async def get_invoice_status(invoice_id: str):
    """Get invoice processing status"""
    # Implementation for status checking
    pass

async def process_invoice(invoice_data: Dict):
    """Process invoice data"""
    try:
        # Send to COA integration service
        coa_service_url = "http://coa-integration-service:5002/api/coa/lookup"
        # Process COA lookup
        
        # Send to SKU generation service
        sku_service_url = "http://sku-generation-service:5003/api/sku/generate"
        # Process SKU generation
        
        # Send to approval workflow
        approval_service_url = "http://approval-workflow-service:5004/api/approval/create"
        # Process approval workflow
        
        print(f"Invoice processed: {invoice_data['invoice_number']}")
    except Exception as e:
        print(f"Invoice processing failed: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
```

---
