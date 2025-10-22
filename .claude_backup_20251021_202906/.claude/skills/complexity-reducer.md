# Complexity Reducer Skill (Simplification Cascade)

## Description
Identify and reduce unnecessary complexity in code, architecture, and workflows by finding repeated patterns and consolidating abstractions.

## When to Invoke
- Code review requests
- Before major refactors
- When performance issues arise
- User mentions "simplify", "optimize", "too complex"
- During architecture reviews

## Process

### Phase 1: Complexity Analysis

1. **Identify Repeated Patterns**
   - Multiple similar functions
   - Duplicated logic
   - Parallel implementations
   - Special cases that could be unified

2. **Analyze Abstraction Gradients**
   - Abstract concepts → concrete implementations
   - Find gradient breaks
   - Identify missing abstractions
   - Spot over-abstractions

3. **Map Dependencies**
   - Service interconnections
   - Shared resources
   - Ownership patterns
   - Caching layers

### Phase 2: Simplification Opportunities

**Example: Three-Flag Deployment**

Current State:
```
❌ Three separate deploy scripts
❌ Three separate service directories
❌ Duplicated error handling
❌ Repeated revenue logging code
```

Simplified:
```
✅ One master deploy script with flag selection
✅ Shared deployment utilities
✅ Centralized error handling
✅ Single revenue tracking library
```

### Phase 3: Consolidation Plan

1. **Extract Common Patterns**
   ```python
   # Before: Duplicated in 3 services
   def log_revenue_custom_gpt():
       subprocess.run(["python3", "scripts/...", "custom_gpt", ...])

   def log_revenue_slack_bot():
       subprocess.run(["python3", "scripts/...", "slack_bot", ...])

   # After: Shared utility
   def log_revenue(flag_name: str, event_type: str, amount: float):
       subprocess.run(["python3", "scripts/...", flag_name, event_type, str(amount)])
   ```

2. **Create Abstractions**
   ```python
   # Unified deployment interface
   class FlagDeployer:
       def __init__(self, flag_config):
           self.name = flag_config.name
           self.target_revenue = flag_config.target_revenue

       def deploy(self):
           self.pre_flight_checks()
           self.execute_deployment()
           self.validate()
           self.log_revenue()
   ```

3. **Reduce Special Cases**
   - Identify edge cases
   - See if they can use general pattern
   - Document true special cases

### Phase 4: Implementation

1. **Prioritize Changes**
   - High-impact, low-risk first
   - Measured refactoring
   - Test each simplification

2. **Measure Impact**
   - Lines of code reduced
   - Performance improvement
   - Maintainability score

3. **Document Patterns**
   - Why consolidation was made
   - New abstractions introduced
   - Migration guide

## Three-Flag Deployment Example

### Complexity Identified:
```
📊 Code Duplication:
- 3 deploy scripts with similar logic
- 3 revenue logging implementations
- 3 health check patterns
- 3 error handling blocks

📊 Architecture Issues:
- No shared service utilities
- Repeated GCP auth checks
- Duplicated logging setup
```

### Simplification Applied:
```
✅ Created: shared/deployment_utils.py
✅ Created: shared/revenue_tracker.py
✅ Created: shared/service_base.py
✅ Reduced deploy scripts from 150 lines each to 30 lines
✅ Centralized error handling in one place
```

### Results:
```
📉 Code Reduction: 360 lines → 120 lines (67% reduction)
⚡ Deploy Time: 15 min → 5 min (faster builds)
🎯 Maintainability: Much easier to update all three flags
💪 Reliability: Single source of truth for common logic
```

## Output Format
```
🔍 Complexity Analysis Complete

📊 Repeated Patterns Found: [COUNT]
📊 Consolidation Opportunities: [COUNT]
📊 Abstraction Gaps: [COUNT]

💡 Top Simplifications:
1. [Simplification 1] - Impact: [HIGH/MED/LOW]
2. [Simplification 2] - Impact: [HIGH/MED/LOW]
3. [Simplification 3] - Impact: [HIGH/MED/LOW]

✅ Recommended Actions:
- [Action 1]
- [Action 2]
- [Action 3]

📈 Expected Impact:
- Code reduction: X%
- Performance: +X%
- Maintainability: +X%
```

## Integration
- Invoke before major features
- Run during code reviews
- Schedule quarterly architecture reviews
- Apply to new services before deployment
