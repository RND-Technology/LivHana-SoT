# VIP Deep Dive: Jesse Niesen (CEO)

**Document ID**: VIP-001
**Date**: 2025-10-30
**Status**: Active

---

## 1. VIP Profile

-   **Name**: Jesse Niesen
-   **Role**: CEO / Visionary
-   **VIP Tier**: 1
-   **Priority**: HIGHEST

Jesse is the final decision-maker, capital allocator, and strategic visionary for Reggie & Dro and the Liv Hana ecosystem. His primary focus is on high-level strategy, capital efficiency, and driving the organization towards maximum autonomous operation.

**Key Pain Points**:
-   Information overload from low-level details.
-   Requirement for a high-level, strategic "command view."
-   Extreme sensitivity to system latency, especially in voice interactions (20s is unacceptable).
-   Desire to push AI agents to their 24/7 autonomous potential.

---

## 2. Role & Responsibilities

-   **Capital Allocation**: Fundraising and managing financial runway.
-   **Strategic Partnerships**: Managing key relationships (e.g., KCA Labs, bulk buyers).
-   **Product Vision**: Defining the direction for both cannabis products and the Liv Hana technology.
-   **Final Approval**: The ultimate authority on all major business and technical decisions.
-   **Automation Strategy**: Championing the 10-80-10 model, where he provides initial intent (10%), Liv Hana executes autonomously (80%), and he reviews the final outcome (10%).

---

## 3. Custom VIP Cockpit: "CEO Strategic Command"

-   **URL**: `http://localhost:9000/vip/jesse`
-   **Authentication**: Requires `DASHBOARD_API_KEY`.

### 3.1. Dashboard Vision

The CEO Strategic Command dashboard is designed to provide a "no-noise" strategic overview. It filters out tactical details and surfaces only the critical metrics and statuses required for high-level decision-making. The UI is clean, with color-coded panels to indicate status at a glance (Gold for finance, Green for opportunities/health, Red for threats).

### 3.2. Feature Requirements

-   **Financial Overview (Gold Panel)**:
    -   Real-time display of Revenue (Today/Week/Month).
    -   Current monthly Burn Rate.
    -   Calculated Runway in months.
-   **Strategic Opportunities (Green Panel)**:
    -   Summary of Andrew's 20 Shop Network status (e.g., "5 active, 15 pending").
    -   Projected monthly revenue from the network.
    -   Status of the KCA Labs partnership.
    -   Value of the current bulk buyer pipeline.
-   **Threat Assessment (Red Panel)**:
    -   High-level summary of key infrastructure or security threats (e.g., "Atlas Threat").
    -   Notes on competitive pressures.
-   **System Health (Green Panel)**:
    -   Binary status of core infrastructure ("Operational").
    -   Agent status (e.g., "5/5 Agents Active").
    -   Security status ("Hardened").
    -   **Voice Latency Metric**: Real-time display of P95 voice response time.
    -   Production Readiness Score (e.g., "95/100").
-   **VIP Team Status (Green Panel)**:
    -   Single-line status updates for each direct report's key deliverable.
-   **Voice Integration**:
    -   A persistent, floating voice button for instant access to Liv Hana.
    -   Must support commands like "Liv, status," "Liv, what's blocking Andrew?," and "Liv, revenue summary."

### 3.3. Access & Views

-   **Access Level**: Full administrative access to his own dashboard. Read-only access to the high-level summaries of other VIP dashboards.
-   **Views**: The primary view is the strategic command center. He can not drill down into granular logs or technical details, as this is by design to reduce noise.

---

## 4. PDR/ADR (Planning & Decisions)

-   **PDRs (Product Design Requirements)**:
    -   **PDR-001: Voice-First Interface**: The primary interaction model must be voice. All dashboard features should be accessible via voice commands.
    -   **PDR-002: Sub-3-Second Latency**: Voice interactions must have a P95 latency of less than 3 seconds.
    -   **PDR-003: Strategic Abstraction**: The dashboard must abstract away all non-essential operational data.
-   **ADRs (Architecture Decision Records)**:
    -   **ADR-001: 10-80-10 Execution Model**: The system architecture must support this pattern, allowing for human approval at the beginning and end of major tasks.
    -   **ADR-002: Centralized Threat Intelligence**: All security and operational threats must be aggregated and summarized into a single, high-level "Threat Assessment" view.

---

## 5. QA & Red Team Strategy

-   **QA Focus**:
    -   **Latency Testing**: Rigorous testing of voice command latency under various network conditions and system loads.
    -   **Data Accuracy**: Ensuring the financial and operational metrics displayed are 100% accurate and real-time.
    -   **Voice Command Robustness**: Testing the Natural Language Understanding (NLU) to ensure high accuracy for a wide range of strategic queries.
-   **Red Team Scenarios**:
    -   **Scenario 1: Data Poisoning**: Attempt to manipulate the underlying data sources to display incorrect financial or status information on the CEO dashboard, potentially leading to poor strategic decisions.
    -   **Scenario 2: Voice Command Hijacking**: Attempt to issue unauthorized high-level commands through the voice interface.
    -   **Scenario 3: Denial of Service (DoS) on Strategic Feeds**: Target the data pipelines that feed the CEO dashboard to render it useless during a critical event.
