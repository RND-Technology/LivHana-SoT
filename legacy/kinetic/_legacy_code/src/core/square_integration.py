"""
LivHana-SoT: Square POS Integration
Real-time business data integration with Square
"""

import os
import json
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import httpx
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class SquareConfig:
    """Square API configuration"""
    access_token: str
    environment: str  # 'sandbox' or 'production'
    location_id: str

@dataclass
class SquareTransaction:
    """Square transaction data"""
    id: str
    amount: float
    created_at: datetime
    status: str
    payment_type: str
    customer_id: Optional[str] = None
    order_id: Optional[str] = None

@dataclass
class SquareOrder:
    """Square order data"""
    id: str
    total_amount: float
    created_at: datetime
    status: str
    customer_id: Optional[str] = None
    line_items: List[Dict[str, Any]] = None

class SquareIntegration:
    """Real-time Square POS integration for business metrics"""

    def __init__(self):
        self.config = SquareConfig(
            access_token=os.getenv("SQUARE_ACCESS_TOKEN", "sandbox_token"),
            environment=os.getenv("SQUARE_ENVIRONMENT", "sandbox"),
            location_id=os.getenv("SQUARE_LOCATION_ID", "sandbox_location")
        )

        # Square API base URLs
        self.base_url = "https://connect.squareupsandbox.com/v2" if self.config.environment == "sandbox" else "https://connect.squareup.com/v2"

        # HTTP client
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={
                "Authorization": f"Bearer {self.config.access_token}",
                "Content-Type": "application/json",
                "Square-Version": "2023-12-20"
            },
            timeout=30.0
        )

    async def get_payments(self, start_date: datetime = None, end_date: datetime = None) -> List[SquareTransaction]:
        """Get payments from Square"""
        if not start_date:
            start_date = datetime.now() - timedelta(days=30)
        if not end_date:
            end_date = datetime.now()

        try:
            response = await self.client.get(
                "/payments",
                params={
                    "begin_time": start_date.isoformat(),
                    "end_time": end_date.isoformat(),
                    "location_id": self.config.location_id
                }
            )

            if response.status_code == 200:
                data = response.json()
                return [
                    SquareTransaction(
                        id=payment["id"],
                        amount=payment["amount_money"]["amount"] / 100.0,  # Convert cents to dollars
                        created_at=datetime.fromisoformat(payment["created_at"].replace('Z', '+00:00')),
                        status=payment["status"],
                        payment_type=payment.get("source_type", "unknown"),
                        customer_id=payment.get("customer_id"),
                        order_id=payment.get("order_id")
                    )
                    for payment in data.get("payments", [])
                ]
            else:
                logger.error(f"❌ Square API error: {response.status_code} - {response.text}")
                return []

        except Exception as e:
            logger.error(f"❌ Failed to get Square payments: {e}")
            return []

    async def get_orders(self, start_date: datetime = None, end_date: datetime = None) -> List[SquareOrder]:
        """Get orders from Square"""
        if not start_date:
            start_date = datetime.now() - timedelta(days=30)
        if not end_date:
            end_date = datetime.now()

        try:
            response = await self.client.get(
                "/orders",
                params={
                    "location_id": self.config.location_id,
                    "query": json.dumps({
                        "filter": {
                            "date_time_filter": {
                                "created_at": {
                                    "start_at": start_date.isoformat(),
                                    "end_at": end_date.isoformat()
                                }
                            }
                        }
                    })
                }
            )

            if response.status_code == 200:
                data = response.json()
                return [
                    SquareOrder(
                        id=order["id"],
                        total_amount=order["total_money"]["amount"] / 100.0,
                        created_at=datetime.fromisoformat(order["created_at"].replace('Z', '+00:00')),
                        status=order["state"],
                        customer_id=order.get("customer_id"),
                        line_items=order.get("line_items", [])
                    )
                    for order in data.get("orders", [])
                ]
            else:
                logger.error(f"❌ Square API error: {response.status_code} - {response.text}")
                return []

        except Exception as e:
            logger.error(f"❌ Failed to get Square orders: {e}")
            return []

    async def get_inventory(self) -> Dict[str, Any]:
        """Get inventory data from Square"""
        try:
            response = await self.client.get(
                "/inventory/counts",
                params={"location_id": self.config.location_id}
            )

            if response.status_code == 200:
                data = response.json()
                return {
                    "counts": data.get("counts", []),
                    "total_items": len(data.get("counts", [])),
                    "low_stock_items": [item for item in data.get("counts", []) if item.get("quantity", 0) < 10]
                }
            else:
                logger.error(f"❌ Square API error: {response.status_code} - {response.text}")
                return {}

        except Exception as e:
            logger.error(f"❌ Failed to get Square inventory: {e}")
            return {}

    async def get_customers(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get customer data from Square"""
        try:
            response = await self.client.get(
                "/customers",
                params={
                    "location_id": self.config.location_id,
                    "limit": limit
                }
            )

            if response.status_code == 200:
                data = response.json()
                return [
                    {
                        "id": customer["id"],
                        "given_name": customer.get("given_name", ""),
                        "family_name": customer.get("family_name", ""),
                        "email": customer.get("email_address", ""),
                        "phone": customer.get("phone_number", ""),
                        "created_at": customer.get("created_at"),
                        "total_spent": customer.get("total_money_spent", 0) / 100.0
                    }
                    for customer in data.get("customers", [])
                ]
            else:
                logger.error(f"❌ Square API error: {response.status_code} - {response.text}")
                return []

        except Exception as e:
            logger.error(f"❌ Failed to get Square customers: {e}")
            return []

    async def get_business_metrics(self, days: int = 30) -> Dict[str, Any]:
        """Get comprehensive business metrics from Square"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)

            # Get payments and orders concurrently
            payments_task = self.get_payments(start_date, end_date)
            orders_task = self.get_orders(start_date, end_date)
            customers_task = self.get_customers()
            inventory_task = self.get_inventory()

            payments, orders, customers, inventory = await asyncio.gather(
                payments_task, orders_task, customers_task, inventory_task
            )

            # Calculate metrics
            total_revenue = sum(payment.amount for payment in payments if payment.status == "COMPLETED")
            total_orders = len([order for order in orders if order.status == "COMPLETED"])
            average_order_value = total_revenue / max(total_orders, 1)

            # Customer metrics
            total_customers = len(customers)
            new_customers = len([c for c in customers if c.get("created_at") and
                               datetime.fromisoformat(c["created_at"].replace('Z', '+00:00')) >= start_date])

            # Inventory metrics
            low_stock_count = len(inventory.get("low_stock_items", []))

            return {
                "period": f"Last {days} days",
                "total_revenue": total_revenue,
                "total_orders": total_orders,
                "average_order_value": average_order_value,
                "total_customers": total_customers,
                "new_customers": new_customers,
                "low_stock_items": low_stock_count,
                "payment_methods": {
                    "cash": len([p for p in payments if p.payment_type == "CASH"]),
                    "card": len([p for p in payments if p.payment_type == "CARD"]),
                    "digital": len([p for p in payments if p.payment_type in ["WALLET", "BUY_NOW_PAY_LATER"]])
                },
                "status": "connected",
                "last_updated": datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"❌ Failed to get business metrics: {e}")
            return {
                "status": "error",
                "error": str(e),
                "last_updated": datetime.now().isoformat()
            }

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

# Global Square integration instance
square_integration = SquareIntegration()
