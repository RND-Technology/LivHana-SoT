#!/usr/bin/env node

/**
 * CHECKOUT PICKUP DATE & TIME FIX - AUTOMATED
 *
 * Tier 1 Solution: Fix pickup date/time selection on checkout screen
 * 
 * ISSUE IDENTIFIED:
 * - Calendar overlay shows but dates are not properly selectable
 * - Time dropdown is incomplete or not functioning
 * - Pickup method selection needs validation
 *
 * USAGE:
 * 1. Inject this script into the checkout page
 * 2. Run: node checkout-pickup-date-fix.js
 *
 * WHAT IT DOES:
 * - Fixes calendar date selection functionality
 * - Completes time dropdown with proper options
 * - Validates pickup method selection
 * - Ensures proper form submission
 */

// Checkout Pickup Date & Time Fix
const checkoutPickupFix = {
    
    // Initialize the fix
    init() {
        console.log('🚀 CHECKOUT PICKUP FIX: Initializing...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.applyFixes());
        } else {
            this.applyFixes();
        }
    },
    
    // Apply all fixes
    applyFixes() {
        this.fixCalendarSelection();
        this.fixTimeDropdown();
        this.fixPickupMethodValidation();
        this.fixFormSubmission();
        this.addVisualFeedback();
        
        console.log('✅ CHECKOUT PICKUP FIX: All fixes applied successfully');
    },
    
    // Fix calendar date selection
    fixCalendarSelection() {
        console.log('📅 Fixing calendar date selection...');
        
        // Find calendar elements
        const calendarInput = document.querySelector('input[type="date"], input[name*="date"], input[id*="date"]');
        const calendarOverlay = document.querySelector('.calendar-overlay, .date-picker, [class*="calendar"]');
        
        if (calendarInput) {
            // Ensure input is properly configured
            calendarInput.setAttribute('min', new Date().toISOString().split('T')[0]);
            calendarInput.setAttribute('max', this.getMaxDate());
            
            // Add change event listener
            calendarInput.addEventListener('change', (e) => {
                this.handleDateSelection(e.target.value);
            });
            
            console.log('✅ Calendar input fixed');
        }
        
        if (calendarOverlay) {
            // Fix calendar overlay functionality
            this.fixCalendarOverlay(calendarOverlay);
            console.log('✅ Calendar overlay fixed');
        }
        
        // Create custom calendar if none exists
        if (!calendarInput && !calendarOverlay) {
            this.createCustomCalendar();
        }
    },
    
    // Fix calendar overlay
    fixCalendarOverlay(overlay) {
        const dateCells = overlay.querySelectorAll('[data-date], .date-cell, td[onclick]');
        
        dateCells.forEach(cell => {
            // Remove existing click handlers
            cell.onclick = null;
            
            // Add new click handler
            cell.addEventListener('click', (e) => {
                e.preventDefault();
                const date = cell.getAttribute('data-date') || cell.textContent.trim();
                this.selectDate(date);
            });
            
            // Add visual feedback
            cell.style.cursor = 'pointer';
            cell.addEventListener('mouseenter', () => {
                cell.style.backgroundColor = '#e3f2fd';
            });
            cell.addEventListener('mouseleave', () => {
                cell.style.backgroundColor = '';
            });
        });
    },
    
    // Create custom calendar
    createCustomCalendar() {
        console.log('📅 Creating custom calendar...');
        
        const pickupSection = document.querySelector('[class*="pickup"], [id*="pickup"]');
        if (!pickupSection) return;
        
        const calendarHTML = `
            <div class="custom-calendar" style="
                position: relative;
                margin: 10px 0;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                background: white;
            ">
                <label style="display: block; margin-bottom: 10px; font-weight: bold;">
                    Choose Pickup Date:
                </label>
                <input type="date" id="pickup-date" 
                       min="${new Date().toISOString().split('T')[0]}"
                       max="${this.getMaxDate()}"
                       style="
                           width: 100%;
                           padding: 10px;
                           border: 1px solid #ccc;
                           border-radius: 4px;
                           font-size: 16px;
                       ">
                <div class="time-selection" style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 10px; font-weight: bold;">
                        Choose Pickup Time:
                    </label>
                    <select id="pickup-time" style="
                        width: 100%;
                        padding: 10px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        font-size: 16px;
                    ">
                        ${this.generateTimeOptions()}
                    </select>
                </div>
            </div>
        `;
        
        pickupSection.insertAdjacentHTML('beforeend', calendarHTML);
        
        // Add event listeners
        document.getElementById('pickup-date').addEventListener('change', (e) => {
            this.handleDateSelection(e.target.value);
        });
        
        document.getElementById('pickup-time').addEventListener('change', (e) => {
            this.handleTimeSelection(e.target.value);
        });
    },
    
    // Fix time dropdown
    fixTimeDropdown() {
        console.log('⏰ Fixing time dropdown...');
        
        const timeSelect = document.querySelector('select[name*="time"], select[id*="time"], .time-dropdown select');
        
        if (timeSelect) {
            // Clear existing options
            timeSelect.innerHTML = '';
            
            // Add new time options
            const timeOptions = this.generateTimeOptions();
            timeSelect.innerHTML = timeOptions;
            
            // Add change event listener
            timeSelect.addEventListener('change', (e) => {
                this.handleTimeSelection(e.target.value);
            });
            
            console.log('✅ Time dropdown fixed');
        }
    },
    
    // Generate time options
    generateTimeOptions() {
        const times = [];
        const startHour = 9; // 9 AM
        const endHour = 21;  // 9 PM
        
        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const displayTime = this.formatTime(hour, minute);
                times.push(`<option value="${timeString}">${displayTime}</option>`);
            }
        }
        
        return `<option value="">Choose a time...</option>${times.join('')}`;
    },
    
    // Format time for display
    formatTime(hour, minute) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    },
    
    // Fix pickup method validation
    fixPickupMethodValidation() {
        console.log('🏪 Fixing pickup method validation...');
        
        const pickupMethods = document.querySelectorAll('input[name*="pickup"], input[type="radio"][value*="pickup"]');
        
        pickupMethods.forEach(method => {
            method.addEventListener('change', (e) => {
                this.validatePickupMethod(e.target.value);
            });
        });
        
        // Check if pickup is selected
        const pickupSelected = document.querySelector('input[name*="pickup"]:checked');
        if (pickupSelected) {
            this.validatePickupMethod(pickupSelected.value);
        }
    },
    
    // Fix form submission
    fixFormSubmission() {
        console.log('📝 Fixing form submission...');
        
        const form = document.querySelector('form[action*="checkout"], form[class*="checkout"]');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            if (!this.validatePickupSelection()) {
                e.preventDefault();
                this.showError('Please select a pickup date and time before continuing.');
                return false;
            }
        });
    },
    
    // Add visual feedback
    addVisualFeedback() {
        console.log('🎨 Adding visual feedback...');
        
        const style = document.createElement('style');
        style.textContent = `
            .pickup-date-selected {
                background-color: #4CAF50 !important;
                color: white !important;
            }
            
            .pickup-time-selected {
                background-color: #2196F3 !important;
                color: white !important;
            }
            
            .pickup-error {
                color: #f44336;
                font-size: 14px;
                margin-top: 5px;
            }
            
            .pickup-success {
                color: #4CAF50;
                font-size: 14px;
                margin-top: 5px;
            }
        `;
        document.head.appendChild(style);
    },
    
    // Handle date selection
    handleDateSelection(date) {
        console.log('📅 Date selected:', date);
        
        // Update visual feedback
        const dateInput = document.querySelector('input[type="date"]');
        if (dateInput) {
            dateInput.classList.add('pickup-date-selected');
        }
        
        // Enable time selection
        const timeSelect = document.querySelector('select[id*="time"], select[name*="time"]');
        if (timeSelect) {
            timeSelect.disabled = false;
        }
        
        // Store selection
        this.selectedDate = date;
        this.validatePickupSelection();
    },
    
    // Handle time selection
    handleTimeSelection(time) {
        console.log('⏰ Time selected:', time);
        
        // Update visual feedback
        const timeSelect = document.querySelector('select[id*="time"], select[name*="time"]');
        if (timeSelect) {
            timeSelect.classList.add('pickup-time-selected');
        }
        
        // Store selection
        this.selectedTime = time;
        this.validatePickupSelection();
    },
    
    // Validate pickup method
    validatePickupMethod(method) {
        console.log('🏪 Pickup method:', method);
        
        if (method.includes('pickup') || method.includes('store')) {
            // Show date/time selection
            const dateTimeSection = document.querySelector('.custom-calendar, [class*="date"], [class*="time"]');
            if (dateTimeSection) {
                dateTimeSection.style.display = 'block';
            }
        }
    },
    
    // Validate pickup selection
    validatePickupSelection() {
        const hasDate = this.selectedDate || document.querySelector('input[type="date"]:valid');
        const hasTime = this.selectedTime || document.querySelector('select[id*="time"] option:checked');
        
        if (hasDate && hasTime) {
            this.showSuccess('Pickup date and time selected successfully!');
            return true;
        } else {
            this.showError('Please select both pickup date and time.');
            return false;
        }
    },
    
    // Show error message
    showError(message) {
        this.removeMessages();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'pickup-error';
        errorDiv.textContent = message;
        
        const pickupSection = document.querySelector('[class*="pickup"], [id*="pickup"]');
        if (pickupSection) {
            pickupSection.appendChild(errorDiv);
        }
    },
    
    // Show success message
    showSuccess(message) {
        this.removeMessages();
        const successDiv = document.createElement('div');
        successDiv.className = 'pickup-success';
        successDiv.textContent = message;
        
        const pickupSection = document.querySelector('[class*="pickup"], [id*="pickup"]');
        if (pickupSection) {
            pickupSection.appendChild(successDiv);
        }
    },
    
    // Remove existing messages
    removeMessages() {
        const existingMessages = document.querySelectorAll('.pickup-error, .pickup-success');
        existingMessages.forEach(msg => msg.remove());
    },
    
    // Get maximum selectable date (30 days from now)
    getMaxDate() {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        return maxDate.toISOString().split('T')[0];
    },
    
    // Select date programmatically
    selectDate(date) {
        const dateInput = document.querySelector('input[type="date"]');
        if (dateInput) {
            dateInput.value = date;
            this.handleDateSelection(date);
        }
    }
};

// Initialize the fix
checkoutPickupFix.init();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = checkoutPickupFix;
}

console.log('🚀 CHECKOUT PICKUP FIX: Script loaded successfully');
