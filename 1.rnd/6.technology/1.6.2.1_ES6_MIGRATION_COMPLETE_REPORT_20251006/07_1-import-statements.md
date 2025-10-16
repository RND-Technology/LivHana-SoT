### 1. Import Statements

**Before:**

```javascript
const express = require('express');
const { createLogger } = require('../../common/logging');
```

**After:**

```javascript
import express from 'express';
import { createLogger } from '../../common/logging/index.js';
```
