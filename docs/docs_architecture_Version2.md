# Liv Hana System Architecture

This document outlines the high-level architecture of the Liv Hana framework.

## 1. System Diagram

```
[User] -> [Orchestrator Agent] -> [Task Queue]
                                     |
                                     v
[Specialist Agent 1] <-> [State Manager] <-> [Specialist Agent 2]
       |                                           |
       v                                           v
[Codebase / Filesystem] <------------------- [Tools / APIs]
```

## 2. Component Descriptions

- **Orchestrator Agent**: Manages the overall mission flow. It breaks down the user's request into a directed acyclic graph (DAG) of tasks.
- **State Manager**: A centralized service responsible for maintaining the state of the entire system, including code, environment, and agent memory.
- ...

<!-- Last verified: 2025-10-02 -->
