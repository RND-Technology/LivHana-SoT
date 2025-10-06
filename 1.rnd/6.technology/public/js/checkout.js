
// Checkout Pickup Fix - Server-side Integration
class CheckoutManager {
    constructor() {
        this.cart = [];
        this.pickupData = null;
        this.init();
    }
    
    init() {
        console.log('🚀 Checkout Manager initialized');
        this.loadCart();
        this.setupEventListeners();
        this.updateCartDisplay();
    }
    
    loadCart() {
        // Load cart from localStorage or server
        const savedCart = localStorage.getItem('checkout-cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        } else {
            // Default test items
            this.cart = [
                { id: 1, name: 'Sour Guava THCA', price: 45.00, quantity: 4 },
                { id: 2, name: 'Gorilla Glue #4', price: 50.00, quantity: 1 }
            ];
        }
    }
    
    setupEventListeners() {
        // Cart update events
        document.addEventListener('cartUpdated', () => {
            this.updateCartDisplay();
        });
        
        // Pickup validation events
        document.addEventListener('pickupValidated', (event) => {
            this.pickupData = event.detail;
            this.updateCheckoutButton();
        });
    }
    
    updateCartDisplay() {
        const cartItemsDiv = document.getElementById('cart-items');
        const cartTotalSpan = document.getElementById('cart-total');
        
        if (cartItemsDiv) {
            cartItemsDiv.innerHTML = this.cart.map(item => 
                `<div class="cart-item">
                    <span>${item.name} x${item.quantity}</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>`
            ).join('');
        }
        
        if (cartTotalSpan) {
            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotalSpan.textContent = total.toFixed(2);
        }
    }
    
    updateCheckoutButton() {
        const submitBtn = document.getElementById('checkout-submit');
        if (submitBtn) {
            submitBtn.disabled = !this.pickupData || this.cart.length === 0;
        }
    }
    
    processCheckout() {
        if (!this.pickupData) {
            throw new Error('Pickup data required');
        }
        
        const orderData = {
            cart: this.cart,
            pickup: this.pickupData,
            timestamp: new Date().toISOString(),
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };
        
        console.log('🛒 Processing order:', orderData);
        return orderData;
    }
}

// Initialize checkout manager
document.addEventListener('DOMContentLoaded', () => {
    window.checkoutManager = new CheckoutManager();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CheckoutManager;
}
