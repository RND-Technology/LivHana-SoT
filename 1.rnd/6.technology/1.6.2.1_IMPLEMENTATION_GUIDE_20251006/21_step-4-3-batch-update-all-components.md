### Step 4.3: Batch Update All Components

**Files to update:**

- `src/components/ExecutiveDashboard.jsx`
- `src/components/UltimateCockpit.jsx`
- `src/components/Dashboard.jsx`
- `src/components/VoiceMode.jsx`
- `src/components/VideoMode.jsx`
- `src/components/Sidebar.jsx`
- `src/components/Header.jsx`

**Search and replace patterns:**

```javascript
// Pattern 1: Glass cards
sx={{
  background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  borderRadius: 2,
}}
// Replace with: sx={cardStyles.glass}

// Pattern 2: Primary buttons
sx={{
  backgroundColor: '#16A34A',
  '&:hover': { backgroundColor: '#15803D' }
}}
// Replace with: sx={buttonStyles.primary}

// Pattern 3: Flex center
sx={{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}}
// Replace with: sx={layoutStyles.flexCenter}
```

---
