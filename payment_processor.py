"""
KAJA/Authorize.net Payment Processor
Cannabis-compliant payment processing for Reggie & Dro
"""

import os
import uuid
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from decimal import Decimal
import httpx

logger = logging.getLogger(__name__)

class KAJAPaymentProcessor:
    """
    KAJA/Authorize.net payment processor for cannabis transactions
    Handles high-risk cannabis payment processing with compliance
    """
    
    def __init__(self):
        # KAJA/Authorize.net configuration
        self.api_login_id = os.getenv("AUTHORIZE_NET_API_LOGIN_ID")
        self.transaction_key = os.getenv("AUTHORIZE_NET_TRANSACTION_KEY")
        self.sandbox_mode = os.getenv("AUTHORIZE_NET_SANDBOX", "true").lower() == "true"
        
        # API endpoints
        if self.sandbox_mode:
            self.api_endpoint = "https://apitest.authorize.net/xml/v1/request.api"
        else:
            self.api_endpoint = "https://api.authorize.net/xml/v1/request.api"
        
        # Cannabis compliance settings
        self.cannabis_merchant_category = "5999"  # Miscellaneous retail
        self.max_transaction_amount = Decimal("999.99")  # Cannabis transaction limits
        
        self._validate_config()
    
    def _validate_config(self):
        """Validate payment processor configuration"""
        required_vars = ["AUTHORIZE_NET_API_LOGIN_ID", "AUTHORIZE_NET_TRANSACTION_KEY"]
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        if missing_vars:
            logger.warning(f"Missing payment processor configuration: {', '.join(missing_vars)}")
            logger.info("Payment processing will be simulated until configured")
    
    async def process_payment(
        self,
        amount: Decimal,
        payment_method: str,
        customer_id: str,
        order_items: List[Dict[str, Any]],
        customer_info: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process cannabis payment transaction
        
        Args:
            amount: Transaction amount
            payment_method: Payment method (card, ach, etc)
            customer_id: Customer identifier
            order_items: List of items being purchased
            customer_info: Optional customer billing information
            
        Returns:
            Payment processing result
        """
        transaction_id = str(uuid.uuid4())
        
        try:
            # Validate transaction amount
            if amount > self.max_transaction_amount:
                return {
                    "success": False,
                    "error": f"Transaction amount ${amount} exceeds cannabis limit of ${self.max_transaction_amount}",
                    "transaction_id": transaction_id,
                    "compliance_issue": "amount_limit_exceeded"
                }
            
            if amount <= 0:
                return {
                    "success": False,
                    "error": "Transaction amount must be greater than zero",
                    "transaction_id": transaction_id
                }
            
            # Check if payment processor is configured
            if not self.api_login_id or not self.transaction_key:
                logger.info(f"Payment processor not configured, simulating transaction for ${amount}")
                return self._simulate_payment(amount, payment_method, customer_id, transaction_id)
            
            # Process real payment
            payment_result = await self._process_authorize_net_payment(
                amount=amount,
                payment_method=payment_method,
                customer_id=customer_id,
                transaction_id=transaction_id,
                order_items=order_items,
                customer_info=customer_info
            )
            
            # Log transaction
            self._log_transaction(
                transaction_id=transaction_id,
                amount=amount,
                customer_id=customer_id,
                result=payment_result
            )
            
            return payment_result
            
        except Exception as e:
            logger.error(f"Payment processing failed: {e}")
            return {
                "success": False,
                "error": "Payment processing failed",
                "transaction_id": transaction_id,
                "details": str(e)
            }
    
    def _simulate_payment(
        self,
        amount: Decimal,
        payment_method: str,
        customer_id: str,
        transaction_id: str
    ) -> Dict[str, Any]:
        """Simulate payment processing for development/testing"""
        # Simulate some payment failures for testing
        if str(amount).endswith("13"):  # Amounts ending in 13 fail
            return {
                "success": False,
                "error": "Simulated payment failure - card declined",
                "transaction_id": transaction_id,
                "simulation": True
            }
        
        return {
            "success": True,
            "transaction_id": transaction_id,
            "amount": float(amount),
            "payment_method": payment_method,
            "customer_id": customer_id,
            "processed_at": datetime.now().isoformat(),
            "simulation": True,
            "message": "Payment simulated successfully (configure AUTHORIZE_NET credentials for real processing)"
        }
    
    async def _process_authorize_net_payment(
        self,
        amount: Decimal,
        payment_method: str,
        customer_id: str,
        transaction_id: str,
        order_items: List[Dict[str, Any]],
        customer_info: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Process actual Authorize.net payment"""
        
        # Build Authorize.net transaction request
        transaction_request = {
            "createTransactionRequest": {
                "merchantAuthentication": {
                    "name": self.api_login_id,
                    "transactionKey": self.transaction_key
                },
                "refId": transaction_id,
                "transactionRequest": {
                    "transactionType": "authCaptureTransaction",
                    "amount": str(amount),
                    "payment": self._build_payment_data(payment_method),
                    "order": {
                        "invoiceNumber": f"RD-{transaction_id[:8]}",
                        "description": f"Cannabis purchase - {len(order_items)} items"
                    },
                    "customer": {
                        "id": customer_id
                    },
                    "merchantDefinedFields": [
                        {
                            "name": "cannabis_transaction",
                            "value": "true"
                        },
                        {
                            "name": "merchant_category", 
                            "value": self.cannabis_merchant_category
                        }
                    ],
                    "userFields": [
                        {
                            "name": "business_name",
                            "value": "Reggie & Dro Cannabis"
                        },
                        {
                            "name": "license_number",
                            "value": "Texas DSHS License #690"
                        }
                    ]
                }
            }
        }
        
        # Add customer billing info if provided
        if customer_info:
            transaction_request["createTransactionRequest"]["transactionRequest"]["billTo"] = {
                "firstName": customer_info.get("first_name", ""),
                "lastName": customer_info.get("last_name", ""),
                "address": customer_info.get("address", ""),
                "city": customer_info.get("city", ""),
                "state": customer_info.get("state", "TX"),
                "zip": customer_info.get("zip", ""),
                "country": customer_info.get("country", "US")
            }
        
        # Send request to Authorize.net
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                self.api_endpoint,
                json=transaction_request,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            )
            
            response.raise_for_status()
            result = response.json()
            
            # Parse Authorize.net response
            transaction_response = result.get("transactionResponse", {})
            
            if transaction_response.get("responseCode") == "1":  # Approved
                return {
                    "success": True,
                    "transaction_id": transaction_id,
                    "auth_code": transaction_response.get("authCode"),
                    "trans_id": transaction_response.get("transId"),
                    "amount": float(amount),
                    "payment_method": payment_method,
                    "customer_id": customer_id,
                    "processed_at": datetime.now().isoformat(),
                    "gateway": "authorize_net",
                    "response_code": transaction_response.get("responseCode"),
                    "message": "Payment processed successfully"
                }
            else:
                # Payment declined or error
                return {
                    "success": False,
                    "transaction_id": transaction_id,
                    "error": transaction_response.get("errors", [{}])[0].get("errorText", "Payment declined"),
                    "response_code": transaction_response.get("responseCode"),
                    "gateway": "authorize_net"
                }
    
    def _build_payment_data(self, payment_method: str) -> Dict[str, Any]:
        """Build payment data structure for Authorize.net"""
        # This is a simplified example - in production, you'd handle
        # encrypted card data from your frontend
        
        if payment_method == "credit_card":
            return {
                "creditCard": {
                    "cardNumber": "4111111111111111",  # Test card number
                    "expirationDate": "2025-12",
                    "cardCode": "123"
                }
            }
        elif payment_method == "bank_account":
            return {
                "bankAccount": {
                    "accountType": "checking",
                    "routingNumber": "121042882",  # Test routing number
                    "accountNumber": "123456789",  # Test account number
                    "nameOnAccount": "Test Customer",
                    "bankName": "Test Bank"
                }
            }
        else:
            raise ValueError(f"Unsupported payment method: {payment_method}")
    
    def _log_transaction(
        self,
        transaction_id: str,
        amount: Decimal,
        customer_id: str,
        result: Dict[str, Any]
    ):
        """Log payment transaction for audit trail"""
        log_data = {
            "transaction_id": transaction_id,
            "amount": float(amount),
            "customer_id": customer_id,
            "success": result.get("success", False),
            "timestamp": datetime.now().isoformat(),
            "gateway": result.get("gateway", "unknown")
        }
        
        if result.get("success"):
            logger.info(f"Payment processed successfully: {log_data}")
        else:
            logger.warning(f"Payment failed: {log_data}")
    
    async def refund_transaction(
        self,
        original_transaction_id: str,
        refund_amount: Optional[Decimal] = None,
        reason: str = "customer_request"
    ) -> Dict[str, Any]:
        """Process refund for cannabis transaction"""
        refund_id = str(uuid.uuid4())
        
        try:
            # For now, simulate refund processing
            # In production, implement actual Authorize.net refund API
            
            logger.info(f"Refund requested for transaction {original_transaction_id}")
            
            return {
                "success": True,
                "refund_id": refund_id,
                "original_transaction_id": original_transaction_id,
                "refund_amount": float(refund_amount) if refund_amount else None,
                "reason": reason,
                "processed_at": datetime.now().isoformat(),
                "simulation": True,
                "message": "Refund simulated successfully"
            }
            
        except Exception as e:
            logger.error(f"Refund processing failed: {e}")
            return {
                "success": False,
                "refund_id": refund_id,
                "error": "Refund processing failed",
                "details": str(e)
            }
    
    def get_payment_methods(self) -> List[Dict[str, Any]]:
        """Get available payment methods for cannabis transactions"""
        return [
            {
                "method": "credit_card",
                "name": "Credit Card",
                "description": "Visa, MasterCard, American Express",
                "cannabis_compliant": True,
                "processing_fee": "2.9% + $0.30"
            },
            {
                "method": "debit_card", 
                "name": "Debit Card",
                "description": "Bank debit card with PIN",
                "cannabis_compliant": True,
                "processing_fee": "$0.50 flat fee"
            },
            {
                "method": "bank_account",
                "name": "Bank Transfer (ACH)",
                "description": "Direct bank account transfer", 
                "cannabis_compliant": True,
                "processing_fee": "$0.25 flat fee"
            }
        ]
    
    def get_processor_status(self) -> Dict[str, Any]:
        """Get payment processor configuration status"""
        return {
            "processor": "KAJA/Authorize.net",
            "configured": bool(self.api_login_id and self.transaction_key),
            "sandbox_mode": self.sandbox_mode,
            "cannabis_compliant": True,
            "max_transaction": float(self.max_transaction_amount),
            "merchant_category": self.cannabis_merchant_category,
            "available_methods": len(self.get_payment_methods())
        }