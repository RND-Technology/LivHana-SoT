# VIP Deep Dive: Charles Day (Technical Operations)

**Document ID**: VIP-003
**Date**: 2025-10-30
**Status**: Active

---

## 1. VIP Profile

-   **Name**: Charles Day
-   **Role**: Technical Operations / Portal Management
-   **VIP Tier**: 2
-   **Priority**: HIGH

Charles is the technical gatekeeper and first responder for the Liv Hana ecosystem. He is responsible for system health, monitoring, and hands-on troubleshooting. He requires a dashboard that provides deep technical visibility and control.

**Key Pain Points**:
-   High voice latency, which hinders rapid troubleshooting.
-   Lack of a dedicated technical dashboard; business metrics are irrelevant to his role.
-   Needs to see agent health, security alerts, and system resource usage.
-   Manual coordination between multiple tools and terminals.

---

## 2. Role & Responsibilities

-   **System Monitoring**: Manages KCA Labs portal connections and monitors the health of the entire Liv Hana infrastructure.
-   **Troubleshooting**: The first line of defense when systems break or perform poorly.
-   **Agent Coordination**: Manages the lifecycle of the 5 core agents (planning, research, artifact, execmon, qa).
-   **Security**: Monitors for and responds to security alerts.

---

## 3. Custom VIP Cockpit: "Technical Operations Command Center"

-   **URL**: `http://localhost:9000/vip/charles`
-   **Authentication**: Requires `DASHBOARD_API_KEY`.

### 3.1. Dashboard Vision

This is "God mode for the machine." It's a purely technical dashboard with no business metrics. It provides real-time visibility into the health of every service and agent, surfaces security alerts, and offers emergency controls to restart components or shut down the system gracefully.

### 3.2. Feature Requirements

-   **System Health Panel**:
    -   A grid of status indicators for all 9 microservices (Redis, Gateway, Voice, etc.).
    -   Status indicators for all 5 core agents.
    -   Real-time graphs for system-wide CPU, Memory, and Disk usage.
-   **Portal Status Panel**:
    -   Health of the connection to the KCA Labs portal.
    -   Number of pending transactions and last sync timestamp.
-   **Security Alerts Panel**:
    -   A feed of security-related events, including Red Team findings (12 vulnerabilities).
    -   Logs of failed login attempts and other suspicious activity.
-   **Automation Performance Panel**:
    -   Metrics on task completion rates, error rates, and average API response times.
    -   A real-time view of the BullMQ queue depth.
-   **Technical Debt Panel**:
    -   Displays the current code quality score and test coverage percentage.
    -   Lists refactoring priorities and deprecated scripts that need archiving.
-   **Emergency Controls (Red Buttons)**:
    -   `STOP.sh`: A button to trigger a graceful shutdown of the entire system.
    -   `Restart Agent`: A dropdown to restart any of the 5 core agents individually.
    -   `Live Logs`: A button to open a real-time `tail` view of the system logs.
-   **Voice Integration**:
    -   Must support technical commands like "Liv, restart artifact agent," "Liv, why is voice latency high?," and "Liv, show me last 10 errors."

### 3.3. Access & Views

-   **Access Level**: Full administrative control over all system components. Can start/stop services and agents.
-   **Views**: The primary view is the technical command center. He can drill down into service-specific logs and performance metrics.

---

## 4. PDR/ADR (Planning & Decisions)

-   **PDRs (Product Design Requirements)**:
    -   **PDR-006: Zero Business Metrics**: The dashboard must not contain any business or financial information.
    -   **PDR-007: Sub-Second Data Refresh**: All health and performance metrics must refresh in near real-time (<1s).
    -   **PDR-008: Idempotent Emergency Controls**: All emergency actions (like restarting an agent) must be idempotent and safe to use repeatedly.
-   **ADRs (Architecture Decision Records)**:
    -   **ADR-004: Health Check Endpoints**: Every microservice and agent must expose a standardized `/health` endpoint for the dashboard to poll.
    -   **ADR-005: Centralized Logging**: All system components must write to a centralized logging service (e.g., ELK stack or similar) that the dashboard can query.

---

## 5. QA & Red Team Strategy

-   **QA Focus**:
    -   **Control Reliability**: Rigorously test the emergency controls to ensure they work as expected without causing cascading failures.
    -   **Metric Accuracy**: Verify that the resource usage and performance metrics on the dashboard exactly match the data from the underlying system.
    -   **Alert Timeliness**: Ensure that security and health alerts are displayed on the dashboard within seconds of occurring.
-   **Red Team Scenarios**:
    -   **Scenario 1: False Positives**: Flood the system with fake error logs to trigger a storm of false alerts on the dashboard, testing the operator's response.
    -   **Scenario 2: Control Bypass**: Attempt to gain shell access to the underlying host, bypassing the dashboard's emergency controls entirely.
    -   **Scenario 3: Agent State Corruption**: Try to put a core agent into an unrecoverable state that the "Restart Agent" function cannot fix, forcing a manual intervention.
