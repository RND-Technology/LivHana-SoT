### React Performance Issues

**File**: `/frontend/vibe-cockpit/src/components/*.jsx`

**Detected**: 104 occurrences of useState/useEffect across 10 components

**Concern**: Potential re-render cascades in UltimateCockpit

**File**: `/frontend/vibe-cockpit/src/components/UltimateCockpit.jsx`

```jsx
// Lines 71-79: Multiple state variables
const [activeLayer, setActiveLayer] = useState('overview');
const [reasoningMode, setReasoningMode] = useState('text');
const [sidebarOpen, setSidebarOpen] = useState(true);
const [liveData, setLiveData] = useState({});
const [loading, setLoading] = useState(false);
const [expandedLayers, setExpandedLayers] = useState({});
const [filterMenu, setFilterMenu] = useState(null);
const [customizeMode, setCustomizeMode] = useState(false);
```

**Recommendation**: useReducer for related state

```jsx
const initialState = {
  activeLayer: 'overview',
  reasoningMode: 'text',
  sidebarOpen: true,
  liveData: {},
  loading: false,
  expandedLayers: {},
  filterMenu: null,
  customizeMode: false
};

const [state, dispatch] = useReducer(cockpitReducer, initialState);
```

**Performance Gain**: Reduced re-renders, better debugging
