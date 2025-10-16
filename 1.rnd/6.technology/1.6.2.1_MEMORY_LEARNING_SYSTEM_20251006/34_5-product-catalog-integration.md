### 5. Product Catalog Integration

Index your product catalog for semantic search:

```javascript
import { VectorEmbeddingService } from './common/memory/vector-embeddings.js';

const vectorService = await VectorEmbeddingService.create({ logger });

// Index products
const products = await fetchProductCatalog();
await vectorService.batchStoreProductEmbeddings(products);

// Search products
const results = await vectorService.findSimilarProducts(
  "something relaxing for anxiety",
  { limit: 10, minScore: 0.7 }
);
```
