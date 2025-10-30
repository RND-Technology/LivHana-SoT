
// NASH BEATING DELIVERY OPTIMIZATION - REGGIE & DRO
// Superior delivery experience vs NASH's basic Square Online

class NashBeatingDelivery {
    constructor() {
        this.deliveryMethods = ['pickup', 'delivery'];
        this.selectedMethod = 'pickup';
        this.pickupSlots = [];
        this.deliveryAreas = [];
        this.init();
    }

    init() {
        console.log('🚚 NASH Beating Delivery initialized');
        this.setupDeliveryMethodSelector();
        this.setupPickupScheduler();
        this.setupDeliveryAreaValidation();
        this.setupRealTimeTracking();
        this.loadDeliveryData();
    }

    // Delivery Method Selection
    setupDeliveryMethodSelector() {
        const deliverySelectorHTML = `
            <div class="rd-delivery-method" style="
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            ">
                <h3 style="color: #333; margin-bottom: 15px;">Delivery Method</h3>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px;">
                        <input type="radio" name="delivery-method" value="pickup" checked style="margin-right: 8px;">
                        In-Store Pickup at R&D Stone Oak SATX#1
                        <span style="color: #28a745; font-weight: bold;">(FREE)</span>
                    </label>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px;">
                        <input type="radio" name="delivery-method" value="delivery" style="margin-right: 8px;">
                        Delivery
                        <span style="color: #007bff; font-weight: bold;">($15.00)</span>
                    </label>
                </div>
                
                <div id="delivery-method-details" style="margin-top: 15px;"></div>
            </div>
        `;
        
        document.querySelector('.checkout-form').insertAdjacentHTML('afterbegin', deliverySelectorHTML);
        
        // Event listeners for delivery method changes
        document.querySelectorAll('input[name="delivery-method"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectedMethod = e.target.value;
                this.updateDeliveryDetails();
            });
        });
    }

    // Pickup Date/Time Scheduler
    setupPickupScheduler() {
        this.updatePickupDetails = () => {
            const pickupDetailsHTML = `
                <div class="rd-pickup-scheduler" style="
                    background: #e8f5e8;
                    border: 1px solid #28a745;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 15px 0;
                ">
                    <h4 style="color: #28a745; margin-bottom: 15px;">📅 Pickup Scheduling</h4>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label for="pickup-date" style="display: block; margin-bottom: 5px; font-weight: bold;">Pickup Date</label>
                            <input type="date" id="pickup-date" name="pickup-date" required 
                                   style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px;"
                                   min="${this.getMinDate()}" max="${this.getMaxDate()}">
                        </div>
                        <div>
                            <label for="pickup-time" style="display: block; margin-bottom: 5px; font-weight: bold;">Pickup Time</label>
                            <select id="pickup-time" name="pickup-time" required 
                                    style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px;">
                                <option value="">Choose a time...</option>
                                ${this.generateTimeSlots()}
                            </select>
                        </div>
                    </div>
                    
                    <div id="pickup-status" style="margin-top: 15px;"></div>
                </div>
            `;
            
            const detailsDiv = document.getElementById('delivery-method-details');
            if (detailsDiv) {
                detailsDiv.innerHTML = pickupDetailsHTML;
            }
            
            // Event listeners for pickup scheduling
            document.getElementById('pickup-date')?.addEventListener('change', () => {
                this.updateTimeSlots();
            });
            
            document.getElementById('pickup-time')?.addEventListener('change', () => {
                this.validatePickupSlot();
            });
        };
    }

    // Delivery Area Validation
    setupDeliveryAreaValidation() {
        this.updateDeliveryDetails = () => {
            if (this.selectedMethod === 'delivery') {
                const deliveryDetailsHTML = `
                    <div class="rd-delivery-validation" style="
                        background: #fff3cd;
                        border: 1px solid #ffc107;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 15px 0;
                    ">
                        <h4 style="color: #856404; margin-bottom: 15px;">🚚 Delivery Area Check</h4>
                        
                        <div style="margin-bottom: 15px;">
                            <label for="delivery-address" style="display: block; margin-bottom: 5px; font-weight: bold;">Delivery Address</label>
                            <input type="text" id="delivery-address" name="delivery-address" 
                                   placeholder="Enter your delivery address..."
                                   style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px;">
                        </div>
                        
                        <button id="check-delivery-area" style="
                            background: #ffc107;
                            color: #856404;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-weight: bold;
                        ">Check Delivery Area</button>
                        
                        <div id="delivery-status" style="margin-top: 15px;"></div>
                    </div>
                `;
                
                const detailsDiv = document.getElementById('delivery-method-details');
                if (detailsDiv) {
                    detailsDiv.innerHTML = deliveryDetailsHTML;
                }
                
                // Event listener for delivery area check
                document.getElementById('check-delivery-area')?.addEventListener('click', () => {
                    this.checkDeliveryArea();
                });
            } else {
                this.updatePickupDetails();
            }
        };
    }

    // Real-time Tracking System
    setupRealTimeTracking() {
        this.trackingHTML = `
            <div class="rd-tracking-system" style="
                background: #d1ecf1;
                border: 1px solid #bee5eb;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                display: none;
            ">
                <h4 style="color: #0c5460; margin-bottom: 15px;">📱 Real-time Order Tracking</h4>
                
                <div class="tracking-steps" style="margin-bottom: 20px;">
                    <div class="tracking-step active" data-step="confirmed">
                        <div class="step-icon">✅</div>
                        <div class="step-label">Order Confirmed</div>
                        <div class="step-time">Just now</div>
                    </div>
                    <div class="tracking-step" data-step="preparing">
                        <div class="step-icon">👨‍🍳</div>
                        <div class="step-label">Preparing Order</div>
                        <div class="step-time">--</div>
                    </div>
                    <div class="tracking-step" data-step="ready">
                        <div class="step-icon">📦</div>
                        <div class="step-label">Ready for Pickup</div>
                        <div class="step-time">--</div>
                    </div>
                    <div class="tracking-step" data-step="completed">
                        <div class="step-icon">🎉</div>
                        <div class="step-label">Order Completed</div>
                        <div class="step-time">--</div>
                    </div>
                </div>
                
                <div class="tracking-actions" style="text-align: center;">
                    <button id="get-sms-updates" style="
                        background: #17a2b8;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                        margin-right: 10px;
                    ">Get SMS Updates</button>
                    <button id="view-tracking-link" style="
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                    ">View Tracking Link</button>
                </div>
            </div>
        `;
        
        document.querySelector('.checkout-container').insertAdjacentHTML('beforeend', this.trackingHTML);
    }

    // Helper Methods
    getMinDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }

    getMaxDate() {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek.toISOString().split('T')[0];
    }

    generateTimeSlots() {
        const slots = [];
        const startHour = 10;
        const endHour = 18;
        
        for (let hour = startHour; hour < endHour; hour++) {
            slots.push(`<option value="${hour}:00">${hour}:00 AM</option>`);
            slots.push(`<option value="${hour}:30">${hour}:30 AM</option>`);
        }
        
        return slots.join('');
    }

    updateTimeSlots() {
        const dateInput = document.getElementById('pickup-date');
        const timeSelect = document.getElementById('pickup-time');
        
        if (dateInput && timeSelect) {
            const selectedDate = new Date(dateInput.value);
            const dayOfWeek = selectedDate.getDay();
            
            // Different time slots for different days
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                // Weekend hours
                timeSelect.innerHTML = '<option value="">Weekend hours: 12:00 PM - 6:00 PM</option>';
            } else {
                // Weekday hours
                timeSelect.innerHTML = '<option value="">Choose a time...</option>' + this.generateTimeSlots();
            }
        }
    }

    validatePickupSlot() {
        const dateInput = document.getElementById('pickup-date');
        const timeSelect = document.getElementById('pickup-time');
        const statusDiv = document.getElementById('pickup-status');
        
        if (dateInput && timeSelect && statusDiv) {
            const selectedDate = dateInput.value;
            const selectedTime = timeSelect.value;
            
            if (selectedDate && selectedTime) {
                statusDiv.innerHTML = `
                    <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; padding: 10px; color: #155724;">
                        ✅ Pickup scheduled for ${selectedDate} at ${selectedTime}
                    </div>
                `;
            }
        }
    }

    checkDeliveryArea() {
        const addressInput = document.getElementById('delivery-address');
        const statusDiv = document.getElementById('delivery-status');
        
        if (addressInput && statusDiv) {
            const address = addressInput.value;
            
            // Simulate delivery area check
            setTimeout(() => {
                if (address.toLowerCase().includes('san antonio') || address.toLowerCase().includes('satx')) {
                    statusDiv.innerHTML = `
                        <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; padding: 10px; color: #155724;">
                            ✅ Delivery available to this address. Estimated delivery: 2-4 hours
                        </div>
                    `;
                } else {
                    statusDiv.innerHTML = `
                        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; padding: 10px; color: #721c24;">
                            ❌ Delivery not available to this address. Please choose pickup instead.
                        </div>
                    `;
                }
            }, 1000);
        }
    }

    loadDeliveryData() {
        // Load delivery areas and pickup slots from server
        this.deliveryAreas = [
            'San Antonio, TX',
            'Stone Oak, TX',
            'Alamo Heights, TX',
            'Terrell Hills, TX'
        ];
        
        this.pickupSlots = [
            { date: '2025-10-08', time: '10:00', available: true },
            { date: '2025-10-08', time: '10:30', available: true },
            { date: '2025-10-08', time: '11:00', available: false },
            // ... more slots
        ];
    }
}

// Initialize NASH Beating Delivery
document.addEventListener('DOMContentLoaded', () => {
    new NashBeatingDelivery();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NashBeatingDelivery;
}
