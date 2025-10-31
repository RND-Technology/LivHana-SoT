# VIP Deep Dive: Store Operations Team

**Document ID**: VIP-004
**Date**: 2025-10-30
**Status**: Active

---

## 1. VIP Profile

-   **Names**: Christopher Rocha, Dylan Rocha, Geena Sanchez, Darren Greene
-   **Role**: Store Operations (Sales, Inventory, Compliance, Security)
-   **VIP Tier**: 3
-   **Priority**: MEDIUM

This group forms the frontline team, directly interacting with customers and managing the physical store. They operate in a fast-paced environment and require a shared tool that provides real-time visibility and enhances team coordination.

**Key Pain Points**:
-   Lack of real-time sales and inventory visibility.
-   Difficulty tracking customer feedback and preferences.
-   Manual processes for compliance and shift coordination.
-   Need for a simple way to log security incidents.

---

## 2. Role & Responsibilities

-   **Sales**: Act as budtenders, serving customers and processing sales.
-   **Inventory**: Manage stock levels, handle restocks, and prevent stockouts.
-   **Compliance**: Enforce age verification, perform ID scans, and maintain daily logs.
-   **Customer Experience**: Track customer feedback and ensure a high-quality in-store experience.
-   **Security (Darren)**: Handle security incidents and cash management.

---

## 3. Custom VIP Cockpit: "Store Operations Dashboard" (Shared)

-   **URL**: `http://localhost:9000/vip/store-ops`
-   **Authentication**: Requires `DASHBOARD_API_KEY`.

### 3.1. Dashboard Vision

This is "Boss mode for the frontline." It's a shared dashboard, likely displayed on a tablet behind the counter, that gives the entire team a single source of truth for everything happening in the store. It focuses on real-time data feeds and quick actions to minimize time spent on the device and maximize time with customers.

### 3.2. Feature Requirements

-   **Today's Sales Panel**:
    -   A real-time feed of every transaction as it happens.
    -   A large revenue counter that updates with each sale.
    -   A graph showing sales by the hour.
-   **Inventory Alerts Panel**:
    -   Prominent warnings for products with low stock (< 10 units).
    -   Triggers for reordering from suppliers.
-   **Customer Feedback Panel**:
    -   A live feed of customer ratings and comments.
    -   A customer satisfaction score (CSAT).
-   **Compliance Status Panel**:
    -   A counter for ID scans performed today.
    -   A log of age verifications and any failed scans.
-   **Team Coordination Panel**:
    -   The shift schedule for the current day/week.
    -   A simple messaging system for staff communication.
-   **Quick Actions**:
    -   Large, easy-to-tap buttons for: "Log Customer Interaction," "Scan Barcode" (for inventory check), and "Emergency Contact Jesse."
-   **Voice Integration**:
    -   Must support simple, quick commands like "Liv, log customer loved Pink Suits," "Liv, scan barcode [number]," and "Liv, who's on shift tomorrow?"

### 3.3. Access & Views

-   **Access Level**: All team members have the same level of access to the shared dashboard. They can log interactions and check inventory but cannot change system settings.
-   **Views**: A single, shared view for the entire team. There are no individualized views for this group.

---

## 4. PDR/ADR (Planning & Decisions)

-   **PDRs (Product Design Requirements)**:
    -   **PDR-009: Shared Cockpit**: The dashboard must be designed for simultaneous use by multiple team members on a shared device.
    -   **PDR-010: Glanceable UI**: All key information must be "glanceable" from a distance. Use large fonts and clear visual indicators.
    -   **PDR-011: Sub-Second Actions**: Quick actions like logging an interaction must be instantaneous.
-   **ADRs (Architecture Decision Records)**:
    -   **ADR-006: Real-Time Data with WebSockets**: The sales and feedback feeds must be pushed to the dashboard in real-time using WebSockets to avoid polling.
    -   **ADR-007: Optimistic UI Updates**: For quick actions, the UI should update immediately (optimistically) while the data is being saved to the backend to provide a snappy user experience.

---

## 5. QA & Red Team Strategy

-   **QA Focus**:
    -   **Concurrency Testing**: Test what happens when multiple users try to perform actions simultaneously on the shared dashboard.
    -   **Real-Time Feed Reliability**: Ensure the WebSocket connection is stable and that the sales/feedback feeds update reliably without dropping messages.
    -   **Usability Testing**: Observe the team using the dashboard in a real store environment to identify any UI/UX friction.
-   **Red Team Scenarios**:
    -   **Scenario 1: Inventory Desync**: Attempt to manipulate the inventory database directly, causing the dashboard to display incorrect stock levels, potentially leading to a stockout or overstock situation.
    -   **Scenario 2: Feedback Spam**: Flood the customer feedback feed with fake positive or negative reviews to disrupt operations or damage morale.
    -   **Scenario 3: Price Manipulation**: If the dashboard shows prices, attempt to alter the price of a product at the data source, testing if the change is reflected and if it could be exploited at the point of sale.
