
// NASH BEATING CART ENHANCEMENT - REGGIE & DRO
// Superior cart experience vs NASH's basic Square Online

class NashBeatingCart {
    constructor() {
        this.cart = [];
        this.cartKey = 'rd-superior-cart';
        this.init();
    }

    init() {
        console.log('🛒 NASH Beating Cart initialized');
        this.loadCart();
        this.setupDynamicUpdates();
        this.setupCartPersistence();
        this.setupCartAnalytics();
        this.setupAbandonedCartRecovery();
        this.updateCartDisplay();
    }

    // Dynamic Cart Updates
    setupDynamicUpdates() {
        this.updateCartDisplay = () => {
            const cartContainer = document.querySelector('.cart-container');
            if (!cartContainer) return;

            const cartHTML = `
                <div class="rd-superior-cart" style="
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                ">
                    <h3 style="color: #333; margin-bottom: 20px;">YOUR STASH [${this.cart.length} items]</h3>
                    
                    <div class="cart-items" style="margin-bottom: 20px;">
                        ${this.cart.map(item => `
                            <div class="cart-item" data-item-id="${item.id}" style="
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                padding: 15px 0;
                                border-bottom: 1px solid #eee;
                            ">
                                <div class="item-info" style="flex: 1;">
                                    <h4 style="margin: 0 0 5px 0; color: #333;">${item.name}</h4>
                                    <p style="margin: 0; color: #666; font-size: 14px;">${item.description || ''}</p>
                                </div>
                                <div class="item-quantity" style="margin: 0 20px;">
                                    <button class="qty-btn minus" data-item-id="${item.id}" style="
                                        background: #6c757d;
                                        color: white;
                                        border: none;
                                        width: 30px;
                                        height: 30px;
                                        border-radius: 4px;
                                        cursor: pointer;
                                    ">-</button>
                                    <span class="qty-display" style="
                                        display: inline-block;
                                        width: 40px;
                                        text-align: center;
                                        font-weight: bold;
                                    ">${item.quantity}</span>
                                    <button class="qty-btn plus" data-item-id="${item.id}" style="
                                        background: #28a745;
                                        color: white;
                                        border: none;
                                        width: 30px;
                                        height: 30px;
                                        border-radius: 4px;
                                        cursor: pointer;
                                    ">+</button>
                                </div>
                                <div class="item-price" style="
                                    font-weight: bold;
                                    color: #333;
                                    min-width: 80px;
                                    text-align: right;
                                ">
                                    $${(item.price * item.quantity).toFixed(2)}
                                </div>
                                <button class="remove-item" data-item-id="${item.id}" style="
                                    background: #dc3545;
                                    color: white;
                                    border: none;
                                    width: 30px;
                                    height: 30px;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    margin-left: 10px;
                                ">×</button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="cart-summary" style="
                        background: #f8f9fa;
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        padding: 20px;
                    ">
                        <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Subtotal:</span>
                            <span>$${this.calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Shipping:</span>
                            <span id="shipping-cost">$${this.calculateShipping().toFixed(2)}</span>
                        </div>
                        <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Tax:</span>
                            <span>$${this.calculateTax().toFixed(2)}</span>
                        </div>
                        <div class="summary-row" style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; padding-top: 10px; border-top: 1px solid #dee2e6;">
                            <span>Total:</span>
                            <span>$${this.calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="cart-actions" style="margin-top: 20px; text-align: center;">
                        <button id="proceed-checkout" style="
                            background: #007bff;
                            color: white;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                            width: 100%;
                        ">SECURE CHECKOUT →</button>
                    </div>
                </div>
            `;

            cartContainer.innerHTML = cartHTML;
            this.setupCartEventListeners();
        };

        // Event listeners for cart updates
        document.addEventListener('cartUpdated', () => {
            this.updateCartDisplay();
            this.saveCart();
            this.trackCartEvent('cart_updated');
        });
    }

    // Cart Persistence System
    setupCartPersistence() {
        this.loadCart = () => {
            try {
                const savedCart = localStorage.getItem(this.cartKey);
                if (savedCart) {
                    this.cart = JSON.parse(savedCart);
                } else {
                    // Load from server if available
                    this.loadCartFromServer();
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                this.cart = [];
            }
        };

        this.saveCart = () => {
            try {
                localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
                this.saveCartToServer();
            } catch (error) {
                console.error('Error saving cart:', error);
            }
        };

        this.loadCartFromServer = async () => {
            try {
                const response = await fetch('/api/cart/load', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.getAuthToken()}`
                    }
                });
                
                if (response.ok) {
                    const serverCart = await response.json();
                    this.cart = serverCart.items || [];
                }
            } catch (error) {
                console.error('Error loading cart from server:', error);
            }
        };

        this.saveCartToServer = async () => {
            try {
                await fetch('/api/cart/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.getAuthToken()}`
                    },
                    body: JSON.stringify({ items: this.cart })
                });
            } catch (error) {
                console.error('Error saving cart to server:', error);
            }
        };
    }

    // Cart Analytics
    setupCartAnalytics() {
        this.trackCartEvent = (eventName, data = {}) => {
            // Google Analytics Enhanced Ecommerce
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, {
                    event_category: 'cart',
                    event_label: data.label || '',
                    value: data.value || 0,
                    items: this.cart.map(item => ({
                        item_id: item.id,
                        item_name: item.name,
                        category: item.category || 'THCA',
                        quantity: item.quantity,
                        price: item.price
                    }))
                });
            }

            // Custom analytics
            this.sendAnalyticsEvent(eventName, data);
        };

        this.sendAnalyticsEvent = async (eventName, data) => {
            try {
                await fetch('/api/analytics/cart-event', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        event: eventName,
                        cart: this.cart,
                        timestamp: new Date().toISOString(),
                        data: data
                    })
                });
            } catch (error) {
                console.error('Error sending analytics event:', error);
            }
        };
    }

    // Abandoned Cart Recovery
    setupAbandonedCartRecovery() {
        this.setupAbandonedCartTimer = () => {
            // Start timer when cart is not empty
            if (this.cart.length > 0) {
                setTimeout(() => {
                    this.checkAbandonedCart();
                }, 300000); // 5 minutes
            }
        };

        this.checkAbandonedCart = () => {
            // Check if cart is still abandoned
            if (this.cart.length > 0) {
                this.triggerAbandonedCartRecovery();
            }
        };

        this.triggerAbandonedCartRecovery = async () => {
            try {
                await fetch('/api/cart/abandoned-recovery', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        cart: this.cart,
                        timestamp: new Date().toISOString()
                    })
                });
            } catch (error) {
                console.error('Error triggering abandoned cart recovery:', error);
            }
        };

        // Start abandoned cart timer
        this.setupAbandonedCartTimer();
    }

    // Cart Event Listeners
    setupCartEventListeners() {
        // Quantity buttons
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.dataset.itemId);
                const isPlus = e.target.classList.contains('plus');
                
                if (isPlus) {
                    this.increaseQuantity(itemId);
                } else {
                    this.decreaseQuantity(itemId);
                }
            });
        });

        // Remove item buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.dataset.itemId);
                this.removeItem(itemId);
            });
        });

        // Proceed to checkout
        document.getElementById('proceed-checkout')?.addEventListener('click', () => {
            this.proceedToCheckout();
        });
    }

    // Cart Management Methods
    addItem(item) {
        const existingItem = this.cart.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...item, quantity: 1 });
        }
        
        this.updateCartDisplay();
        this.dispatchCartUpdated();
        this.trackCartEvent('add_to_cart', { item_id: item.id, item_name: item.name });
    }

    removeItem(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.updateCartDisplay();
        this.dispatchCartUpdated();
        this.trackCartEvent('remove_from_cart', { item_id: itemId });
    }

    increaseQuantity(itemId) {
        const item = this.cart.find(cartItem => cartItem.id === itemId);
        if (item) {
            item.quantity += 1;
            this.updateCartDisplay();
            this.dispatchCartUpdated();
            this.trackCartEvent('increase_quantity', { item_id: itemId });
        }
    }

    decreaseQuantity(itemId) {
        const item = this.cart.find(cartItem => cartItem.id === itemId);
        if (item) {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                this.removeItem(itemId);
                return;
            }
            this.updateCartDisplay();
            this.dispatchCartUpdated();
            this.trackCartEvent('decrease_quantity', { item_id: itemId });
        }
    }

    calculateSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    calculateShipping() {
        const subtotal = this.calculateSubtotal();
        return subtotal >= 75 ? 0 : 15;
    }

    calculateTax() {
        const subtotal = this.calculateSubtotal();
        return subtotal * 0.0825; // 8.25% Texas tax
    }

    calculateTotal() {
        return this.calculateSubtotal() + this.calculateShipping() + this.calculateTax();
    }

    proceedToCheckout() {
        if (this.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        this.trackCartEvent('begin_checkout', { 
            value: this.calculateTotal(),
            item_count: this.cart.length 
        });

        // Redirect to checkout
        window.location.href = '/checkout';
    }

    dispatchCartUpdated() {
        document.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { cart: this.cart, total: this.calculateTotal() } 
        }));
    }

    getAuthToken() {
        // Get authentication token from localStorage or cookies
        return localStorage.getItem('auth_token') || '';
    }
}

// Initialize NASH Beating Cart
document.addEventListener('DOMContentLoaded', () => {
    new NashBeatingCart();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NashBeatingCart;
}
