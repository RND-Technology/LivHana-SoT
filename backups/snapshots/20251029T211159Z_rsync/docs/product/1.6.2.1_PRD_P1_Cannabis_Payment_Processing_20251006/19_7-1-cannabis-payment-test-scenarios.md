### 7.1 Cannabis Payment Test Scenarios

```javascript
// Comprehensive test suite for cannabis payments
describe('Cannabis Payment Processing', () => {
  
  test('successful_21_plus_texas_resident_payment', async () => {
    const payment = createValidCannabisPayment({
      customer_age: 25,
      location: 'Austin, TX',
      products: [{ name: 'Hemp Oil', thc_content: 0.2, coa_verified: true }]
    });
    
    const result = await processor.processCannabisPayment(payment);
    expect(result.success).toBe(true);
    expect(result.compliance.hemp_law).toBe('compliant');
  });
  
  test('blocked_under_21_payment', async () => {
    const payment = createInvalidCannabisPayment({
      customer_age: 19,
      location: 'Austin, TX'
    });
    
    await expect(processor.processCannabisPayment(payment))
      .rejects.toThrow('Age verification failed');
  });
  
  test('blocked_non_texas_payment', async () => {
    const payment = createInvalidCannabisPayment({
      customer_age: 25,
      location: 'Los Angeles, CA'
    });
    
    await expect(processor.processCannabisPayment(payment))
      .rejects.toThrow('Geographic restriction violation');
  });
  
  test('blocked_high_thc_product', async () => {
    const payment = createInvalidCannabisPayment({
      products: [{ name: 'High THC Product', thc_content: 0.8 }]
    });
    
    await expect(processor.processCannabisPayment(payment))
      .rejects.toThrow('THC content exceeds legal limit');
  });
});
```
