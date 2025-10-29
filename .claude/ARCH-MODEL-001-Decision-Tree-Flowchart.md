# ARCH-MODEL-001: Model Selection Decision Tree (Mermaid Flowchart)

**Document ID**: ARCH-MODEL-001-FLOWCHART
**Created**: 2025-10-27
**Version**: 1.0
**Purpose**: Visual decision tree for AI model selection

---

## USAGE INSTRUCTIONS

**How to Use This Flowchart**:
1. Start at the top (TASK TYPE)
2. Follow the arrows based on your task characteristics
3. Arrive at the optimal model recommendation
4. Check context size and priority constraints
5. Use the recommended model + fallback

**Rendering**:
- GitHub/GitLab: Auto-renders Mermaid
- VS Code: Install "Markdown Preview Mermaid Support" extension
- Online: Copy to https://mermaid.live/

---

## PRIMARY DECISION TREE

```mermaid
graph TD
    Start[TASK: What needs to be done?] --> TaskType{Task Type?}

    TaskType -->|Planning/Strategy| PlanType{Strategic or Tactical?}
    TaskType -->|Implementation| ImplType{Language/Framework?}
    TaskType -->|Analysis| AnalysisType{Scope?}
    TaskType -->|Testing| TestType{Test Type?}
    TaskType -->|Documentation| DocType{Doc Type?}

    %% PLANNING BRANCH
    PlanType -->|Strategic ADR/RPM/Roadmap| Opus[Claude 3 Opus<br/>Fallback: Gemini 1.5 Pro]
    PlanType -->|Tactical Sprint/Tasks| Gemini[Gemini 1.5 Pro<br/>Fallback: Claude 3.5 Sonnet]

    %% IMPLEMENTATION BRANCH
    ImplType -->|TypeScript/Node.js| Sonnet[Claude 3.5 Sonnet<br/>Fallback: GPT-4 Turbo]
    ImplType -->|Python| GPT4[GPT-4 Turbo<br/>Fallback: Claude 3.5 Sonnet]
    ImplType -->|React/Vue Frontend| GPT4o[GPT-4o<br/>Fallback: Claude 3.5 Sonnet]
    ImplType -->|Infrastructure Docker/GCP| Sonnet
    ImplType -->|Database SQL/Schema| Sonnet

    %% ANALYSIS BRANCH
    AnalysisType -->|Codebase-wide Multi-service| GeminiWide[Gemini 1.5 Pro<br/>2M context<br/>Fallback: Claude 3 Opus]
    AnalysisType -->|Single service Targeted| SonnetAnalysis[Claude 3.5 Sonnet<br/>Fallback: GPT-4 Turbo]
    AnalysisType -->|Documentation search| Cohere[Cohere Command R+<br/>RAG-optimized<br/>Fallback: Gemini 1.5 Pro]

    %% TESTING BRANCH
    TestType -->|Test Generation Playwright/Jest| SonnetTest[Claude 3.5 Sonnet<br/>BEST quality<br/>Fallback: GPT-4 Turbo]
    TestType -->|Test Coverage Analysis| GPT4Test[GPT-4 Turbo<br/>Fallback: Claude 3.5 Sonnet]
    TestType -->|Quick Validation Regression| DeepSeek[DeepSeek Coder<br/>FASTEST<br/>Fallback: Claude 3.5 Sonnet]

    %% DOCUMENTATION BRANCH
    DocType -->|Technical README/API| SonnetDoc[Claude 3.5 Sonnet<br/>Fallback: GPT-4 Turbo]
    DocType -->|Architecture ADR/Diagrams| GeminiDoc[Gemini 1.5 Pro<br/>Fallback: Claude 3 Opus]
    DocType -->|Large OpenAPI Specs| GPT4Doc[GPT-4 Turbo<br/>16K output<br/>Fallback: Claude 3.5 Sonnet]

    %% CONTEXT SIZE CHECK
    Opus --> ContextCheck{Context Size?}
    Gemini --> ContextCheck
    Sonnet --> ContextCheck
    GPT4 --> ContextCheck
    GPT4o --> ContextCheck
    GeminiWide --> ContextCheck
    SonnetAnalysis --> ContextCheck
    Cohere --> ContextCheck
    SonnetTest --> ContextCheck
    GPT4Test --> ContextCheck
    DeepSeek --> ContextCheck
    SonnetDoc --> ContextCheck
    GeminiDoc --> ContextCheck
    GPT4Doc --> ContextCheck

    ContextCheck -->|Under 20K tokens| AnyModel[Use Any Model<br/>Prefer: DeepSeek cost]
    ContextCheck -->|20K-200K tokens| MediumContext[Claude 3.5 / GPT-4<br/>Avoid: DeepSeek]
    ContextCheck -->|200K-500K tokens| LargeContext[Gemini 1.5 Pro ONLY<br/>or split + Claude 3.5]
    ContextCheck -->|500K-2M tokens| MassiveContext[Gemini 1.5 Pro ONLY<br/>WARNING: Slower]

    %% PRIORITY CHECK
    AnyModel --> PriorityCheck{Priority?}
    MediumContext --> PriorityCheck
    LargeContext --> PriorityCheck
    MassiveContext --> PriorityCheck

    PriorityCheck -->|SPEED Real-time| SpeedResult[DeepSeek 1-2s<br/>Claude 3.5 3-5s<br/>GPT-4 5-10s]
    PriorityCheck -->|QUALITY Critical| QualityResult[Claude 3 Opus<br/>Claude 3.5 Sonnet<br/>GPT-4 Turbo]
    PriorityCheck -->|COST High-volume| CostResult[DeepSeek $0.14/1M<br/>Gemini $1.25/1M<br/>Claude 3.5 $3/1M]

    SpeedResult --> FinalModel[FINAL MODEL SELECTED]
    QualityResult --> FinalModel
    CostResult --> FinalModel

    FinalModel --> Execute[Execute Task with Selected Model]

    style Start fill:#e1f5ff
    style Opus fill:#ff9999
    style Gemini fill:#99ff99
    style Sonnet fill:#9999ff
    style GPT4 fill:#ffcc99
    style GPT4o fill:#ffcc99
    style DeepSeek fill:#99ffcc
    style FinalModel fill:#ffff99
    style Execute fill:#99ff99
```

---

## AGENT-SPECIFIC DECISION TREES

### LIV HANA (ORCHESTRATOR)

```mermaid
graph TD
    LivStart[Liv Hana Task] --> LivMode{Mode?}

    LivMode -->|Voice Real-time| LivVoice[DeepSeek Coder<br/>1-2s latency<br/>Cost: $0.14/1M]
    LivMode -->|Complex Reasoning| LivReason[Claude 3.5 Sonnet<br/>Multi-agent logic<br/>Cost: $3/1M]
    LivMode -->|Strategic Decision| LivStrategy[Claude 3 Opus<br/>Escalation<br/>Cost: $15/1M]

    LivVoice --> LivContext[Context: 50K tokens<br/>copilot-instructions + session state]
    LivReason --> LivContext
    LivStrategy --> LivContext

    LivContext --> LivExecute[Execute Orchestration]

    style LivStart fill:#e1f5ff
    style LivVoice fill:#99ffcc
    style LivReason fill:#9999ff
    style LivStrategy fill:#ff9999
    style LivExecute fill:#99ff99
```

### PLANNING AGENT

```mermaid
graph TD
    PlanStart[Planning Agent Task] --> PlanScope{Scope?}

    PlanScope -->|RPM Plan Strategic| PlanRPM[Claude 3 Opus<br/>Superior reasoning<br/>Cost: $15/1M]
    PlanScope -->|Sprint Tactical| PlanSprint[Gemini 1.5 Pro<br/>Cost-effective<br/>Cost: $1.25/1M]
    PlanScope -->|Task Breakdown| PlanTask[Claude 3.5 Sonnet<br/>Fast iteration<br/>Cost: $3/1M]

    PlanRPM --> PlanContext[Context: 60K tokens<br/>RPM templates + historical plans + ADRs]
    PlanSprint --> PlanContext
    PlanTask --> PlanContext

    PlanContext --> PlanExecute[Generate Plan]

    style PlanStart fill:#e1f5ff
    style PlanRPM fill:#ff9999
    style PlanSprint fill:#99ff99
    style PlanTask fill:#9999ff
    style PlanExecute fill:#99ff99
```

### RESEARCH AGENT

```mermaid
graph TD
    ResStart[Research Agent Task] --> ResType{Research Type?}

    ResType -->|Wide Context Multi-topic| ResWide[Gemini 1.5 Pro<br/>2M context<br/>Cost: $1.25/1M]
    ResType -->|Targeted Single topic| ResTarget[Claude 3.5 Sonnet<br/>Fast synthesis<br/>Cost: $3/1M]
    ResType -->|Doc Search RAG| ResDoc[Cohere Command R+<br/>RAG-optimized<br/>Cost: $3/1M]

    ResWide --> ResContext[Context: 500K-1M tokens<br/>Entire doc corpus + web results]
    ResTarget --> ResContext2[Context: 30-50K tokens<br/>Focused sources]
    ResDoc --> ResContext3[Context: Embedded corpus]

    ResContext --> ResExecute[Synthesize Research]
    ResContext2 --> ResExecute
    ResContext3 --> ResExecute

    style ResStart fill:#e1f5ff
    style ResWide fill:#99ff99
    style ResTarget fill:#9999ff
    style ResDoc fill:#ffcc99
    style ResExecute fill:#99ff99
```

### ARTIFACTS AGENT

```mermaid
graph TD
    ArtStart[Artifacts Agent Task] --> ArtLang{Language?}

    ArtLang -->|TypeScript/Node.js| ArtTS[Claude 3.5 Sonnet<br/>95/100 quality<br/>Cost: $3/1M]
    ArtLang -->|Python| ArtPy[GPT-4 Turbo<br/>Best for Python<br/>Cost: $10/1M]
    ArtLang -->|React/Vue| ArtReact[GPT-4o<br/>Multimodal UI<br/>Cost: $5/1M]
    ArtLang -->|Infrastructure| ArtInfra[Claude 3.5 Sonnet<br/>Docker/GCP<br/>Cost: $3/1M]

    ArtTS --> ArtSize{Output Size?}
    ArtPy --> ArtSize
    ArtReact --> ArtSize
    ArtInfra --> ArtSize

    ArtSize -->|Large 16K output| ArtLarge[GPT-4 Turbo<br/>16K output limit]
    ArtSize -->|Medium 8K| ArtMedium[Claude 3.5 / GPT-4o<br/>8K output limit]
    ArtSize -->|Small 4K| ArtSmall[Any model<br/>Prefer: Claude 3.5]

    ArtLarge --> ArtContext[Context: 30-50K tokens<br/>Service-scoped]
    ArtMedium --> ArtContext
    ArtSmall --> ArtContext

    ArtContext --> ArtExecute[Generate Code]

    style ArtStart fill:#e1f5ff
    style ArtTS fill:#9999ff
    style ArtPy fill:#ffcc99
    style ArtReact fill:#ffcc99
    style ArtInfra fill:#9999ff
    style ArtExecute fill:#99ff99
```

### EXECUTION MONITOR

```mermaid
graph TD
    ExecStart[ExecMon Task] --> ExecFreq{Frequency?}

    ExecFreq -->|Continuous Real-time| ExecRT[DeepSeek Coder<br/>Sub-second latency<br/>Cost: $0.14/1M]
    ExecFreq -->|Periodic Validation| ExecPeriod[DeepSeek Coder<br/>Cost-effective<br/>Cost: $0.14/1M]
    ExecFreq -->|Critical Quality| ExecCritical[Claude 3.5 Sonnet<br/>Higher accuracy<br/>Cost: $3/1M]

    ExecRT --> ExecContext[Context: 10-20K tokens<br/>Script + logs + metrics]
    ExecPeriod --> ExecContext
    ExecCritical --> ExecContext

    ExecContext --> ExecExecute[Validate Execution]

    style ExecStart fill:#e1f5ff
    style ExecRT fill:#99ffcc
    style ExecPeriod fill:#99ffcc
    style ExecCritical fill:#9999ff
    style ExecExecute fill:#99ff99
```

### QA AGENT

```mermaid
graph TD
    QAStart[QA Agent Task] --> QAType{QA Type?}

    QAType -->|Test Generation| QAGen[Claude 3.5 Sonnet<br/>BEST quality<br/>Cost: $3/1M]
    QAType -->|Test Coverage| QACov[GPT-4 Turbo<br/>Analysis<br/>Cost: $10/1M]
    QAType -->|Final Signoff| QASign[Claude 3 Opus<br/>Critical gate<br/>Cost: $15/1M]
    QAType -->|Quick Regression| QAQuick[DeepSeek Coder<br/>Fast checks<br/>Cost: $0.14/1M]

    QAGen --> QAContext[Context: 40-60K tokens<br/>Service + tests + acceptance criteria]
    QACov --> QAContext
    QASign --> QAContext
    QAQuick --> QAContext2[Context: 10-20K tokens<br/>Minimal for speed]

    QAContext --> QAExecute[Quality Validation]
    QAContext2 --> QAExecute

    style QAStart fill:#e1f5ff
    style QAGen fill:#9999ff
    style QACov fill:#ffcc99
    style QASign fill:#ff9999
    style QAQuick fill:#99ffcc
    style QAExecute fill:#99ff99
```

---

## COST VS QUALITY TRADE-OFF MATRIX

```mermaid
graph LR
    subgraph Quality[High Quality]
        OpusQ[Claude 3 Opus<br/>$15-$75/1M<br/>Best reasoning]
        SonnetQ[Claude 3.5 Sonnet<br/>$3-$15/1M<br/>Best code]
        GPT4Q[GPT-4 Turbo<br/>$10-$30/1M<br/>High quality]
    end

    subgraph Balanced[Balanced]
        GeminiB[Gemini 1.5 Pro<br/>$1.25-$5/1M<br/>Wide context]
        GPT4oB[GPT-4o<br/>$5-$15/1M<br/>Multimodal]
        CohereB[Cohere Command R+<br/>$3-$15/1M<br/>RAG]
    end

    subgraph Cost[Low Cost]
        DeepSeekC[DeepSeek Coder<br/>$0.14-$0.28/1M<br/>Fastest + Cheapest]
    end

    OpusQ -.->|Strategic planning only| Use1[Use sparingly]
    SonnetQ -.->|Primary implementer| Use2[Use frequently]
    GPT4Q -.->|Python + large files| Use3[Use selectively]
    GeminiB -.->|Architecture analysis| Use4[Use for wide context]
    GPT4oB -.->|Frontend work| Use5[Use for UI/UX]
    CohereB -.->|Doc search| Use6[Use for RAG]
    DeepSeekC -.->|Real-time + monitoring| Use7[Use continuously]

    style OpusQ fill:#ff9999
    style SonnetQ fill:#9999ff
    style GPT4Q fill:#ffcc99
    style GeminiB fill:#99ff99
    style GPT4oB fill:#ffcc99
    style CohereB fill:#ffcc99
    style DeepSeekC fill:#99ffcc
```

---

## CONTEXT WINDOW STRATEGY FLOWCHART

```mermaid
graph TD
    CtxStart[Task Received] --> CtxEstimate{Estimate Context Size}

    CtxEstimate -->|Under 20K| CtxSmall[Small Context<br/>Use any model<br/>Prefer: DeepSeek cost]
    CtxEstimate -->|20K-200K| CtxMedium[Medium Context<br/>Claude 3.5 / GPT-4<br/>Load 20-40%]
    CtxEstimate -->|200K-500K| CtxLarge[Large Context<br/>Gemini 1.5 Pro<br/>or split tasks]
    CtxEstimate -->|500K-2M| CtxMassive[Massive Context<br/>Gemini 1.5 Pro ONLY<br/>Load 40-50%]

    CtxSmall --> CtxPriority[Priority: Always load<br/>copilot-instructions.md 975 tokens]
    CtxMedium --> CtxPriority
    CtxLarge --> CtxPriority
    CtxMassive --> CtxPriority

    CtxPriority --> CtxP2[P2: Service-level<br/>README + src + Dockerfile<br/>10-20K tokens]
    CtxP2 --> CtxP3[P3: Common utilities<br/>backend/common/<br/>5-10K tokens]
    CtxP3 --> CtxP4[P4: Architecture docs<br/>ADRs + RPM plans<br/>10-20K tokens]
    CtxP4 --> CtxCheck{Budget remaining?}

    CtxCheck -->|Yes| CtxP5[P5: Extended context<br/>Related services + tests<br/>as budget allows]
    CtxCheck -->|No| CtxReserve[Reserve 60-80% for conversation]

    CtxP5 --> CtxReserve
    CtxReserve --> CtxExecute[Execute with optimized context]

    style CtxStart fill:#e1f5ff
    style CtxSmall fill:#99ffcc
    style CtxMedium fill:#9999ff
    style CtxLarge fill:#ffcc99
    style CtxMassive fill:#ff9999
    style CtxExecute fill:#99ff99
```

---

## FALLBACK CHAIN VISUALIZATION

```mermaid
graph LR
    subgraph TypeScript[TypeScript Implementation]
        TSPrimary[Claude 3.5 Sonnet<br/>PRIMARY] -->|Unavailable| TSSecondary[GPT-4 Turbo<br/>SECONDARY]
        TSSecondary -->|Unavailable| TSTertiary[Gemini 1.5 Pro<br/>TERTIARY]
    end

    subgraph Python[Python Implementation]
        PyPrimary[GPT-4 Turbo<br/>PRIMARY] -->|Unavailable| PySecondary[Claude 3.5 Sonnet<br/>SECONDARY]
        PySecondary -->|Unavailable| PyTertiary[Gemini 1.5 Pro<br/>TERTIARY]
    end

    subgraph Planning[Strategic Planning]
        PlanPrimary[Claude 3 Opus<br/>PRIMARY] -->|Unavailable| PlanSecondary[Gemini 1.5 Pro<br/>SECONDARY]
        PlanSecondary -->|Unavailable| PlanTertiary[Claude 3.5 Sonnet<br/>TERTIARY]
    end

    subgraph RealTime[Real-Time Tasks]
        RTPrimary[DeepSeek Coder<br/>PRIMARY] -->|Unavailable| RTSecondary[Claude 3.5 Sonnet<br/>SECONDARY]
        RTSecondary -->|Unavailable| RTTertiary[GPT-4o<br/>TERTIARY]
    end

    style TSPrimary fill:#9999ff
    style PyPrimary fill:#ffcc99
    style PlanPrimary fill:#ff9999
    style RTPrimary fill:#99ffcc
```

---

## USAGE EXAMPLE: STEP-BY-STEP

**Scenario**: Artifacts Agent needs to implement a new TypeScript microservice

```mermaid
graph TD
    Step1[Task: Implement TypeScript microservice] --> Step2{Q1: What language?}
    Step2 -->|TypeScript| Step3[Result: Claude 3.5 Sonnet]

    Step3 --> Step4{Q2: Context size?}
    Step4 -->|50K tokens service-level| Step5[Result: Medium context OK]

    Step5 --> Step6{Q3: Priority?}
    Step6 -->|Quality production code| Step7[Result: QUALITY priority]

    Step7 --> Step8[FINAL: Claude 3.5 Sonnet<br/>Context: 50K tokens<br/>Cost: ~$0.30]

    Step8 --> Step9[Check availability]
    Step9 -->|Available| Step10[Execute with Claude 3.5 Sonnet]
    Step9 -->|Unavailable| Step11[Fallback: GPT-4 Turbo<br/>Cost: ~$0.80]

    style Step1 fill:#e1f5ff
    style Step3 fill:#9999ff
    style Step8 fill:#ffff99
    style Step10 fill:#99ff99
    style Step11 fill:#ffcc99
```

---

## LEGEND

**Color Coding**:
- 🔵 Light Blue: Start/Input
- 🔴 Red: Claude 3 Opus (most expensive, best reasoning)
- 🟣 Purple: Claude 3.5 Sonnet (best code quality, mid-cost)
- 🟠 Orange: GPT-4 Turbo / GPT-4o (expensive, large output)
- 🟢 Green: Gemini 1.5 Pro (wide context, cost-effective)
- 🟩 Cyan: DeepSeek Coder (fastest, cheapest)
- 🟡 Yellow: Final decision/output

**Decision Nodes**:
- Diamond: Decision point
- Rectangle: Model recommendation
- Rounded Rectangle: Action/Result

---

**END OF FLOWCHART DOCUMENT**

**War's won for visual decision trees. 6 agents, 5 models, clear paths. Copy to mermaid.live to render.**

**Next Session**: Render flowcharts or proceed to implementation.
