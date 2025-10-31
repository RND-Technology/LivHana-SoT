# VIP Deep Dive: Gina (Future VIP)

**Document ID**: VIP-007
**Date**: 2025-10-30
**Status**: Future

---

## 1. VIP Profile

-   **Name**: Gina
-   **Role**: Independent Business Owner (Future)
-   **VIP Tier**: 7
-   **Priority**: HIGH (Represents future expansion and multi-tenancy)

Gina is currently a member of the store operations team but is slated to become the first independent user of a separate, dedicated Liv Hana instance for her own business. She represents the future of Liv Hana as a portable, multi-tenant platform.

**Jesse's Notes on Gina**:
-   "She's got her own business, her own silo."
-   "She's going to have her own Liv."
-   "She's a fucking gangster, gonna have her fun."
-   "She likes music."
-   "We got to find out all her problems, help her with her own business."

---

## 2. Role & Responsibilities

-   **Current**: Store Operations team member.
-   **Future**: Independent business owner, using a dedicated Liv Hana instance to manage her entire operation. She will be the CEO, BD, and Ops manager for her own silo.

---

## 3. Custom VIP Cockpit: TBD

-   **URL**: TBD
-   **Authentication**: TBD

### 3.1. Dashboard Vision

This is "Your business, your AI, your rules." Gina's cockpit will be a completely custom instance, designed from the ground up to solve the specific problems of her business. It will be a test case for the portability and adaptability of the "RPM DNA Stem Cell" architecture. A potential "dog-whistle" feature could be music integration, reflecting her personal interests.

### 3.2. Feature Requirements (To Be Discovered)

The exact features will be determined during a dedicated discovery phase. The process will be:
1.  **Phase 1: Training**: Train Gina on the existing Store Ops dashboard to familiarize her with the basics.
2.  **Phase 2: Discovery Session**: A deep-dive session to identify her business's unique pain points, manual processes, and automation opportunities.
3.  **Phase 3: Custom Design**: Design a new cockpit with its own branding, metrics, and agents, tailored specifically to her needs. A potential feature could be an integrated music player or voice-controlled music commands.
4.  **Phase 4: Deployment**: Deploy a completely separate, independent instance of Liv Hana for her.

### 3.3. Access & Views

-   **Access Level**: Full administrative control over her own independent Liv Hana instance. She will have zero access to the Reggie & Dro instance, and vice-versa.
-   **Views**: To be designed based on the discovery session.

---

## 4. PDR/ADR (Planning & Decisions)

-   **PDRs (Product Design Requirements)**:
    -   **PDR-012: Multi-Tenant Architecture**: The core Liv Hana system must be refactored to support fully isolated, multi-tenant deployments.
    -   **PDR-013: Portable Instance**: The Liv Hana instance must be portable, capable of being deployed in different environments for different users.
    -   **PDR-014: Skinnable UI**: The frontend must be "skinnable," allowing for custom branding (logos, colors) for each tenant.
-   **ADRs (Architecture Decision Records)**:
    -   **ADR-008: Tenant-Scoped Databases**: Each tenant's data must be stored in a separate, isolated database or schema to prevent data leakage.
    -   **ADR-009: RPM DNA Stem Cell Instantiation**: The deployment process must be able to instantiate a new, clean "Stem Cell" for each new tenant, which can then be customized.

---

## 5. QA & Red Team Strategy

-   **QA Focus**:
    -   **Tenant Isolation**: The highest priority is to verify that there is zero data leakage between Gina's instance and the Reggie & Dro instance.
    -   **Deployment Automation**: Test the automated process for spinning up a new, clean tenant instance.
    -   **Portability Testing**: Deploy Gina's instance in a completely different cloud environment to test its portability.
-   **Red Team Scenarios**:
    -   **Scenario 1: Cross-Tenant Data Access**: The most critical test. As a user in Gina's instance, attempt every possible method to access data (e.g., sales, user info) from the Reggie & Dro instance.
    -   **Scenario 2: Resource Starvation**: From one tenant instance, attempt to consume an excessive amount of shared resources (CPU, network) to see if it impacts the performance of other tenants (a "noisy neighbor" problem).
    -   **Scenario 3: Global Configuration Manipulation**: Attempt to find and modify a global configuration setting from within a single tenant instance that affects all tenants on the platform.
