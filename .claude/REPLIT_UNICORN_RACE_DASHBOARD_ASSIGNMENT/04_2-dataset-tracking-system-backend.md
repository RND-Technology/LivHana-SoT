### 2. Dataset & Tracking System (Backend)

**Database Schema**:
```sql
-- Unicorn Race Participants
CREATE TABLE unicorn_racers (
    id UUID PRIMARY KEY,
    name VARCHAR,
    business_name VARCHAR,
    starting_net_worth DECIMAL,
    current_net_worth DECIMAL,
    ai_tools_used TEXT[], -- Array of tools: ["Claude", "ChatGPT", etc.]
    industry VARCHAR,
    location VARCHAR,
    journey_start_date DATE,
    is_public BOOLEAN, -- Can they be listed publicly?
    case_study_permission BOOLEAN,

    -- Contact info (for lead gen)
    email VARCHAR,
    phone VARCHAR,

    -- Engagement tracking
    resources_accessed TEXT[],
    consultation_requested BOOLEAN,
    converted_to_client BOOLEAN,

    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Progress Updates
CREATE TABLE progress_updates (
    id UUID PRIMARY KEY,
    racer_id UUID REFERENCES unicorn_racers(id),
    net_worth DECIMAL,
    milestone VARCHAR, -- "First $100K", "First viral hit", etc.
    description TEXT,
    proof_url VARCHAR, -- Link to revenue screenshot, etc.
    update_date DATE,
    created_at TIMESTAMP
);

-- Resources (Lead Magnets)
CREATE TABLE resources (
    id UUID PRIMARY KEY,
    title VARCHAR,
    type VARCHAR, -- "video", "tool", "guide", "assessment"
    description TEXT,
    youtube_url VARCHAR,
    download_url VARCHAR,
    thumbnail_url VARCHAR,
    view_count INT DEFAULT 0,
    download_count INT DEFAULT 0,
    lead_conversion_rate DECIMAL,
    created_at TIMESTAMP
);

-- Leads (From Dashboard)
CREATE TABLE leads (
    id UUID PRIMARY KEY,
    email VARCHAR,
    name VARCHAR,
    source VARCHAR, -- "unicorn_dashboard", "hne", "opc", "herb"
    resource_accessed VARCHAR, -- Which free resource they got
    consultation_requested BOOLEAN DEFAULT FALSE,
    consultation_date TIMESTAMP,
    converted_to_client BOOLEAN DEFAULT FALSE,
    lifetime_value DECIMAL DEFAULT 0,
    created_at TIMESTAMP
);

-- Consultation Funnel
CREATE TABLE consultations (
    id UUID PRIMARY KEY,
    lead_id UUID REFERENCES leads(id),
    business_name VARCHAR,
    current_revenue DECIMAL,
    ai_maturity_level VARCHAR, -- "none", "beginner", "intermediate", "advanced"
    goals TEXT,
    consultation_notes TEXT,
    proposal_sent BOOLEAN DEFAULT FALSE,
    proposal_amount DECIMAL,
    closed_deal BOOLEAN DEFAULT FALSE,
    close_date DATE,
    created_at TIMESTAMP
);
```
