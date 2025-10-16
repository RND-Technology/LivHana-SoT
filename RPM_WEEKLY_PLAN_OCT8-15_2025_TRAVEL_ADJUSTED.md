# RPM WEEKLY PLAN: OCT 8-15, 2025
**CRITICAL CONSTRAINT**: Travel to Texas by Oct 10, 7:30 PM CST
**R&D Team Meeting**: Oct 10, 7:30-9:30 PM (In-Person Operational Strategy)

---

## WEEK OVERVIEW

**Key Events**:
- **Oct 8 (TODAY)**: Deploy ReggieAndDro fixes, Ecwid API setup, HNC production prep
- **Oct 9**: Generate HNC Episode 9, finalize meeting prep, travel prep
- **Oct 10**: Travel to Texas, R&D Team Meeting (7:30-9:30 PM)
- **Oct 11-12**: Post-meeting execution, staff training
- **Oct 13-17**: Weekly operations, HNC content pipeline
- **Oct 18**: Pumpkin Night Event (content capture opportunity)

---

## CRITICAL PRIORITIES (OCT 8-10)

### **TODAY (Oct 8): Deploy & Prepare**

#### **Priority 1: ReggieAndDro 911 Resolution** ⏱️ 10 minutes
- [ ] Deploy category button CSS fix (5 min)
  - Login: https://my.ecwid.com/cp/CP.html
  - Settings → Design → Custom CSS
  - Paste: `/fixes/reggieanddro-category-buttons-FIX.css`
  - Save + Preview
- [ ] Deploy checkout calendar CSS fix (5 min)
  - Append: `/fixes/reggieanddro-checkout-calendar-FIX.css`
  - Save + Test checkout flow

**Success Metric**: Category buttons clean, checkout calendar smooth

---

#### **Priority 2: Ecwid API Max Setup** ⏱️ 25 minutes
- [ ] Backup current Ecwid tokens (2 min)
  - Document current LIGHTSPEED_TOKEN, ECWID credentials
- [ ] Reinstall app: custom-app-117254578-1 (5 min)
  - URL: https://my.business.shop/cp/#develop-apps
  - Uninstall → Reinstall
  - Activate `update_store_profile` scope
- [ ] Get new OAuth tokens (8 min)
  - Copy Client ID, Client Secret
  - Generate new Access Token
- [ ] Update .env file (5 min)
  - `backend/integration-service/.env`
  - Add ECWID_STORE_ID, ECWID_ACCESS_TOKEN
- [ ] Test API access (5 min)
  - Run: `node backend/integration-service/test-ecwid-api.js`
  - Verify all scopes working

**Success Metric**: API test passes, full store automation unlocked

**Guide**: `/backend/integration-service/ECWID_LIGHTSPEED_API_MAX_SETUP.md`

---

#### **Priority 3: R&D Meeting Preparation** ⏱️ 2 hours
- [ ] Review meeting prep document (30 min)
  - File: `/empire/content-engine/RD_TEAM_MEETING_OCT10_PREP.md`
  - Prepare talking points for each agenda item
- [ ] Gather compliance materials (30 min)
  - DSHS corrective action acceptance (Oct 7 email)
  - Age verification SOP
  - Event liability waiver templates
  - FTC review guidelines
  - ADA service animal policy
- [ ] Finalize event logistics (30 min)
  - Pumpkin Night (Oct 18): Budget, supplies, marketing
  - Halloween Party (Oct 31): Budget, decorations, contest rules
- [ ] Create action items template (30 min)
  - Meeting notes document
  - Task assignment matrix
  - Follow-up schedule

**Success Metric**: All meeting materials ready, confident in talking points

---

### **TOMORROW (Oct 9): Content & Travel Prep**

#### **Priority 4: HNC Episode 9 Production** ⏱️ 30 minutes
- [ ] Review Episode 9 script (5 min)
  - File: `/empire/content-engine/scripts/episode-09-industry-news-UPDATED.md`
  - DSHS permanent rules breaking news
- [ ] Generate voice (ElevenLabs) (5 min)
  - Jesse dialogue: Scenes 1, 2, 4
  - Liv Hana dialogue: Scene 3
- [ ] Create lip-sync video (HeyGen) (10 min)
  - Upload Jesse character images (from Midjourney - if ready)
  - Generate 4 video clips
- [ ] Add music (Suno AI) (5 min)
  - Use Episode 9 soundtrack (Epic Texas Revolution)
- [ ] Export final video (5 min)
  - Format: 1080x1920 MP4 (9:16)
  - Duration: 60 seconds

**Success Metric**: Episode 9 ready to publish, viral timing captured

**Why This Matters**: DSHS news from Oct 7 = breaking story, first to cover = authority

---

#### **Priority 5: Travel Logistics** ⏱️ 1 hour
- [ ] Book flight/drive to Texas (30 min)
  - Must arrive by 7:30 PM CST on Oct 10
  - Allow buffer time
- [ ] Pack essentials (15 min)
  - Laptop (meeting notes, presentations)
  - Meeting materials (printed if needed)
  - Chargers, adapters
- [ ] Coordinate with team (15 min)
  - Confirm meeting attendance (Christopher, Dylan, Gabriela, Geena, Darren)
  - Test Savanna's virtual connection

**Success Metric**: Travel confirmed, arrival guaranteed by 7:30 PM

---

### **OCT 10 (THURSDAY): Travel & Meeting Day**

#### **Morning**: Final Prep
- [ ] Review meeting agenda (30 min)
- [ ] Test presentation tech (if needed)
- [ ] Confirm travel logistics

#### **Afternoon**: Travel to Texas
- [ ] Arrive at Reggie & Dro by 7:00 PM CST (30 min buffer)

#### **Evening**: R&D Team Meeting (7:30-9:30 PM)

**Meeting Flow**:
1. **Opening** (7:30-7:40): DSHS compliance update
2. **Operations** (7:40-8:20): Try Before You Buy, Free Gram, ID Checks
3. **Events** (8:20-8:50): Puff & Paint, marketing, lounge access
4. **Procedures** (8:50-9:10): Closing/opening, cleaning, inventory, service animals
5. **Scheduling** (9:10-9:20): Staff schedule changes
6. **Event Details** (9:20-9:30): Pumpkin Night & Halloween Party logistics

**Capture**:
- Detailed notes for HNC content
- Action items with owners
- Team feedback on compliance procedures
- Event marketing ideas

**Success Metric**: Team aligned, 6+ HNC episode ideas captured, action plan for Oct 11-18

---

## POST-MEETING EXECUTION (OCT 11-15)

### **Friday, Oct 11: Meeting Follow-Up**
- [ ] Distribute meeting notes to all attendees
- [ ] Create action item tracker (with deadlines)
- [ ] Schedule compliance training session
- [ ] Begin HNC Episode 10 script (ID Checks topic from meeting)

### **Saturday, Oct 12: Content Production**
- [ ] Produce HNC Episode 10 (ID Check Best Practices)
- [ ] Finalize Pumpkin Night logistics (Oct 18 deadline)
- [ ] Create event marketing materials

### **Sunday, Oct 13: Staff Training Prep**
- [ ] Prepare compliance training materials
- [ ] Update SOPs based on meeting decisions
- [ ] Create training schedule

### **Monday, Oct 14: Team Execution**
- [ ] Staff compliance training session
- [ ] Launch Pumpkin Night marketing campaign
- [ ] Produce HNC Episode 11 (Free Sample Compliance)

### **Tuesday, Oct 15: Event Prep**
- [ ] Order Pumpkin Night supplies
- [ ] Finalize event schedule
- [ ] Produce HNC Episode 12 (Service Animals)

---

## HNC CONTENT PIPELINE (OCT 8-15)

**Week 1 Episodes** (Tied to R&D Meeting Topics):
1. **Episode 9**: DSHS Permanent Rules (Oct 9 production)
2. **Episode 10**: ID Check Best Practices (Oct 11-12)
3. **Episode 11**: Free Sample Compliance (Oct 14)
4. **Episode 12**: Service Animals in Dispensaries (Oct 15)

**Publishing Schedule**:
- Oct 9: Episode 9 (YouTube, TikTok, Instagram, X)
- Oct 12: Episode 10
- Oct 14: Episode 11
- Oct 15: Episode 12

**Content Strategy**:
- Every R&D meeting topic = HNC episode
- Real store operations = authentic education
- Position HNC as THE Texas cannabis authority

---

## SUCCESS METRICS

**Oct 8-10 (Pre-Meeting)**:
- ✅ ReggieAndDro CSS fixes deployed
- ✅ Ecwid API fully activated
- ✅ HNC Episode 9 produced
- ✅ Meeting materials prepared
- ✅ Travel completed, arrive by 7:30 PM

**Oct 10 (Meeting)**:
- ✅ Team aligned on compliance procedures
- ✅ Event logistics finalized
- ✅ 6+ HNC episode ideas captured
- ✅ Action items assigned with owners

**Oct 11-15 (Post-Meeting)**:
- ✅ 4 HNC episodes produced (9-12)
- ✅ Staff compliance training completed
- ✅ Pumpkin Night prep 100% complete
- ✅ All action items from meeting in progress

**Oct 18 (Event)**:
- ✅ Pumpkin Night executed flawlessly
- ✅ Content captured for HNC Episode 14
- ✅ Customer engagement + marketing ROI measured

---

## RISK MITIGATION

**Risk 1**: Travel delay causes meeting miss
**Mitigation**: Leave 3+ hours early, confirm backup virtual attendance option

**Risk 2**: HNC production time exceeds estimate
**Mitigation**: Prioritize Episode 9 only (DSHS news), delay Episodes 10-12 to post-meeting

**Risk 3**: Meeting runs over schedule
**Mitigation**: Set hard stop at 9:30 PM, schedule follow-up for unfinished items

**Risk 4**: Team not aligned on compliance procedures
**Mitigation**: Bring DSHS Oct 7 email as proof of current requirement, offer training session

---

## ULTIMATE SUCCESS = K+ VALUE DELIVERY

**ReggieAndDro**:
- ✅ CSS fixes deployed → improved UX → higher conversion
- ✅ Ecwid API activated → full store automation → operational efficiency
- ✅ Team meeting → compliance alignment → reduced risk
- ✅ Events executed → customer engagement → revenue growth

**HNC**:
- ✅ Episode 9 (DSHS news) → viral timing → authority positioning
- ✅ Episodes 10-12 (meeting topics) → authentic content → audience trust
- ✅ Real operations footage → differentiated content → competitive advantage

**Trinity Ecosystem**:
- ✅ Operational insights → HNC content → brand authority → customer acquisition → revenue
- ✅ Automated systems → efficiency → scale → K+ value delivery

---

**STATUS**: READY TO EXECUTE
**CONSTRAINTS**: 60 hours until meeting (Oct 8, 11 AM → Oct 10, 7:30 PM)
**PRIORITY SEQUENCE**: CSS fixes (10 min) → Ecwid API (25 min) → Meeting prep (2 hrs) → HNC Episode 9 (30 min) → Travel (Oct 10)

**This is the critical path to success. Execute in sequence. No distractions.**

---

*RPM DNA: 1.6.2.1_WEEKLY_PLAN_OCT8-15_TRAVEL_ADJUSTED_20251008*
*Created: October 8, 2025, 11:00 AM*
*Updated: October 8, 2025, 11:30 AM*
*Next Review: October 11, 2025 (Post-Meeting)*
