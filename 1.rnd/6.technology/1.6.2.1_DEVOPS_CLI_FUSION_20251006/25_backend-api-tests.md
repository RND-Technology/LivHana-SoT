### **Backend API Tests**

- [ ] `POST /api/v1/customer/check-verification` returns correct status for known customer
- [ ] `POST /api/v1/order/flag-verification` creates database record + triggers email
- [ ] `POST /api/v1/order/complete-verification` updates flag status + allows order to ship
- [ ] Square webhook handler processes `order.created` event correctly
- [ ] Email sending function delivers to real inbox (not spam folder)
