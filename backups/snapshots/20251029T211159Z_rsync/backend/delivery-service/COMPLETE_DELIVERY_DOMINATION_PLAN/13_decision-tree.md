### Decision Tree

```javascript
function selectBestProvider(order, location, timeRequirement) {
  // Step 1: Filter by availability
  const available = providers.filter(p => p.isAvailableAt(location));

  // Step 2: Filter by time requirement
  const onTime = available.filter(p => p.estimatedTime <= timeRequirement);

  // Step 3: Calculate score for each provider
  const scored = onTime.map(provider => ({
    provider,
    score: calculateScore({
      cost: provider.cost,                    // 40% weight
      reliability: provider.successRate,      // 30% weight
      speed: provider.averageDeliveryTime,    // 20% weight
      customerRating: provider.avgRating      // 10% weight
    })
  }));

  // Step 4: Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  // Step 5: Try providers in order until one accepts
  for (const {provider} of scored) {
    const quote = await provider.getQuote(order);
    if (quote.accepted) {
      return {
        provider: provider.name,
        cost: quote.cost,
        eta: quote.eta,
        trackingUrl: quote.trackingUrl
      };
    }
  }

  // Step 6: All failed - return error with fallback options
  return {
    error: 'No providers available',
    fallback: 'customer_pickup',
    alternateOptions: scored.map(s => s.provider.name)
  };
}
```
