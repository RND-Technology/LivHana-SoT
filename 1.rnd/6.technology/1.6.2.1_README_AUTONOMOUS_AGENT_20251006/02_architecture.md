## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin API Request                         │
│              POST /api/autonomous/execute                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               ClaudeAutonomousAgent                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  1. Task Analysis (Extended Thinking)                 │  │
│  │     - Understand requirements                         │  │
│  │     - Identify risks                                  │  │
│  │     - Define success criteria                         │  │
│  └───────────────────┬───────────────────────────────────┘  │
│                      ▼                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  2. Execution Planning                                │  │
│  │     - Break down into steps                           │  │
│  │     - Define rollback strategy                        │  │
│  │     - Create testing plan                             │  │
│  └───────────────────┬───────────────────────────────────┘  │
│                      ▼                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  3. Autonomous Execution                              │  │
│  │     - Read/write files                                │  │
│  │     - Execute bash commands                           │  │
│  │     - Run tests                                       │  │
│  │     - Query databases                                 │  │
│  │     - Search codebase                                 │  │
│  └───────────────────┬───────────────────────────────────┘  │
│                      ▼                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  4. Verification                                      │  │
│  │     - Verify each step                                │  │
│  │     - Run comprehensive tests                         │  │
│  │     - Check success criteria                          │  │
│  └───────────────────┬───────────────────────────────────┘  │
│                      ▼                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  5. Learning & Improvement                            │  │
│  │     - Extract patterns                                │  │
│  │     - Store learnings in BigQuery                     │  │
│  │     - Improve future executions                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Human-in-the-Loop Approval                      │
│          (Optional, configurable per task)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Deployment                                │
│            (or Rollback if rejected)                         │
└─────────────────────────────────────────────────────────────┘
```
