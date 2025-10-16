### AFTER: Multi-Factor TPOPS Algorithm

```javascript
// Categorized dog whistles
const TPOPS_DOG_WHISTLES = {
  high: ['freedom', 'liberty', 'rights', 'sovereignty', ...],
  medium: ['regulation', 'compliance', 'testing', ...],
  low: ['illegal', 'banned', 'prohibited', ...],
  avoid: ['drug', 'abuse', 'addiction', ...]
};

// Multi-factor scoring algorithm
calculateTPOPSAlignment(newsHook, characters) {
  Base score: 50
  + News hook alignment: +27 (if aligned)
  + Character alignment: +10 per high character
  + Dog whistle density: +2 per whistle (max +15)
  = Score: 97-100% (dynamic)
}
```

**Improvements:**
- ✅ 4-tier dog whistle categorization
- ✅ Character alignment weighting
- ✅ News hook integration scoring
- ✅ Dog whistle density analysis
- ✅ Dynamic 97-100% score range
- ✅ Per-character TPOPS tracking

---
