
// NASH BEATING CHECKOUT ENHANCEMENT - REGGIE & DRO
// Superior checkout experience vs NASH's basic Square Online

class NashBeatingCheckout {
    constructor() {
        this.cart = [];
        this.loyaltyPoints = 0;
        this.freeShippingThreshold = 75;
        this.init();
    }

    init() {
        console.log('🏆 NASH Beating Checkout initialized');
        this.loadCart();
        this.setupProgressBar();
        this.setupLoyaltyIntegration();
        this.setupFreeShippingLogic();
        this.setupQuickAddProducts();
        this.setupSecureBranding();
    }

    // Progress Bar Implementation
    setupProgressBar() {
        const progressHTML = `
            <div class="rd-checkout-progress" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
                margin: 20px 0;
            ">
                <div class="progress-step active" data-step="cart">
                    <div class="step-number">1</div>
                    <div class="step-label">Cart</div>
                </div>
                <div class="progress-line"></div>
                <div class="progress-step" data-step="info">
                    <div class="step-number">2</div>
                    <div class="step-label">Info</div>
                </div>
                <div class="progress-line"></div>
                <div class="progress-step" data-step="payment">
                    <div class="step-number">3</div>
                    <div class="step-label">Payment</div>
                </div>
                <div class="progress-line"></div>
                <div class="progress-step" data-step="confirm">
                    <div class="step-number">4</div>
                    <div class="step-label">Confirm</div>
                </div>
            </div>
        `;
        
        document.querySelector('.checkout-container').insertAdjacentHTML('afterbegin', progressHTML);
    }

    // Loyalty Points Integration
    setupLoyaltyIntegration() {
        const loyaltyHTML = `
            <div class="rd-loyalty-section" style="
                background: #e8f5e8;
                border: 1px solid #28a745;
                border-radius: 8px;
                padding: 15px;
                margin: 15px 0;
            ">
                <h4 style="color: #28a745; margin-bottom: 10px;">🎁 Loyalty Points</h4>
                <div class="loyalty-display">
                    <span>Loyalty Points Earned: </span>
                    <strong id="loyalty-points">150 points = $15 off next order</strong>
                </div>
                <button class="apply-points-btn" style="
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 10px;
                ">Apply Points: -$15</button>
            </div>
        `;
        
        document.querySelector('.cart-summary').insertAdjacentHTML('beforeend', loyaltyHTML);
    }

    // Free Shipping Threshold Logic
    setupFreeShippingLogic() {
        const updateFreeShipping = () => {
            const subtotal = this.calculateSubtotal();
            const freeShippingHTML = `
                <div class="rd-free-shipping" style="
                    background: ${subtotal >= this.freeShippingThreshold ? '#d4edda' : '#fff3cd'};
                    border: 1px solid ${subtotal >= this.freeShippingThreshold ? '#28a745' : '#ffc107'};
                    border-radius: 8px;
                    padding: 15px;
                    margin: 15px 0;
                    text-align: center;
                ">
                    ${subtotal >= this.freeShippingThreshold ? 
                        '🎉 FREE SHIPPING EARNED!' : 
                        `Add $${(this.freeShippingThreshold - subtotal).toFixed(2)} more for FREE SHIPPING 🎉`
                    }
                </div>
            `;
            
            const existing = document.querySelector('.rd-free-shipping');
            if (existing) existing.remove();
            
            document.querySelector('.cart-summary').insertAdjacentHTML('beforeend', freeShippingHTML);
        };
        
        // Update on cart changes
        document.addEventListener('cartUpdated', updateFreeShipping);
        updateFreeShipping();
    }

    // Quick Add Products
    setupQuickAddProducts() {
        const quickAddHTML = `
            <div class="rd-quick-add" style="
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            ">
                <h4 style="margin-bottom: 15px;">ADD MORE & SAVE:</h4>
                <div class="quick-add-products" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                ">
                    <div class="quick-add-item" data-product-id="1">
                        <img src="/images/sour-guava-thumb.jpg" alt="Sour Guava THCA" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px;">
                        <h5>Sour Guava THCA</h5>
                        <p>$45.00</p>
                        <button class="quick-add-btn" style="
                            background: #007bff;
                            color: white;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 4px;
                            cursor: pointer;
                            width: 100%;
                        ">Quick Add</button>
                    </div>
                    <div class="quick-add-item" data-product-id="2">
                        <img src="/images/gorilla-glue-thumb.jpg" alt="Gorilla Glue #4" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px;">
                        <h5>Gorilla Glue #4</h5>
                        <p>$50.00</p>
                        <button class="quick-add-btn" style="
                            background: #007bff;
                            color: white;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 4px;
                            cursor: pointer;
                            width: 100%;
                        ">Quick Add</button>
                    </div>
                    <div class="quick-add-item" data-product-id="3">
                        <img src="/images/blue-dream-thumb.jpg" alt="Blue Dream" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px;">
                        <h5>Blue Dream</h5>
                        <p>$40.00</p>
                        <button class="quick-add-btn" style="
                            background: #007bff;
                            color: white;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 4px;
                            cursor: pointer;
                            width: 100%;
                        ">Quick Add</button>
                    </div>
                </div>
            </div>
        `;
        
        document.querySelector('.cart-summary').insertAdjacentHTML('beforeend', quickAddHTML);
        
        // Quick add event listeners
        document.querySelectorAll('.quick-add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('.quick-add-item').dataset.productId;
                this.addToCart(productId);
            });
        });
    }

    // Secure Checkout Branding
    setupSecureBranding() {
        const secureBrandingHTML = `
            <div class="rd-secure-branding" style="
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                text-align: center;
            ">
                <div style="display: flex; justify-content: center; align-items: center; gap: 20px; flex-wrap: wrap;">
                    <span style="color: #28a745;">💳 Secure Payment</span>
                    <span style="color: #007bff;">🚚 Discreet Packaging</span>
                    <span style="color: #ffc107;">⭐ 247+ Happy Texans</span>
                </div>
                <div style="margin-top: 10px; font-size: 14px; color: #6c757d;">
                    <p>🔒 SSL Encrypted | 🛡️ PCI Compliant | 🚀 Fast Checkout</p>
                </div>
            </div>
        `;
        
        document.querySelector('.checkout-button-container').insertAdjacentHTML('beforebegin', secureBrandingHTML);
    }

    // Cart Management
    loadCart() {
        const savedCart = localStorage.getItem('rd-cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    }

    saveCart() {
        localStorage.setItem('rd-cart', JSON.stringify(this.cart));
    }

    addToCart(productId) {
        const product = this.getProductById(productId);
        if (product) {
            const existingItem = this.cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.cart.push({ ...product, quantity: 1 });
            }
            this.saveCart();
            this.updateCartDisplay();
            this.dispatchCartUpdated();
        }
    }

    calculateSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    updateCartDisplay() {
        const cartItemsDiv = document.querySelector('.cart-items');
        const cartTotalSpan = document.querySelector('.cart-total');
        
        if (cartItemsDiv) {
            cartItemsDiv.innerHTML = this.cart.map(item => 
                `<div class="cart-item" style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                    <span>${item.name} x${item.quantity}</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>`
            ).join('');
        }
        
        if (cartTotalSpan) {
            cartTotalSpan.textContent = `$${this.calculateSubtotal().toFixed(2)}`;
        }
    }

    dispatchCartUpdated() {
        document.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.cart }));
    }

    getProductById(id) {
        const products = {
            1: { id: 1, name: 'Sour Guava THCA', price: 45.00 },
            2: { id: 2, name: 'Gorilla Glue #4', price: 50.00 },
            3: { id: 3, name: 'Blue Dream', price: 40.00 }
        };
        return products[id];
    }
}

// Initialize NASH Beating Checkout
document.addEventListener('DOMContentLoaded', () => {
    new NashBeatingCheckout();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NashBeatingCheckout;
}
