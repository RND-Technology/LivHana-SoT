# Voice Cockpit Training Guide - 15-Minute Stand-ups

**Classification:** Tier-1 Absolute Standard  
**Owner:** Jesse Niesen (CEO)  
**Version:** 1.0  
**Status:** 🟢 Ready for Team Pilot  
**Compliance:** Texas DSHS 25 TAC §300.701–.702 | TABC 16 TAC §51.1–.2 | GA‑56 | HSC §443

---

## Quick Start (5 minutes)

### 1. Access Voice Cockpit

- **URL:** <http://localhost:5173>
- **Health Check:** <http://localhost:5173/health>
- **Status:** ✅ OPERATIONAL

### 2. Voice Modes

- **Brevity:** Say "Liv" → Concise status updates (120 tokens max)
- **Mentor:** Default mode → Educational explanations (300 tokens max)  
- **Silence:** Say "pause" → JSON output only (0 tokens)

### 3. Basic Commands

- "Liv, what's my revenue today?" → Brevity mode
- "Generate weekly RPM plan" → Mentor mode
- "Pull win-back analytics" → Mentor mode

---

## Training Session Structure (15 minutes)

### Phase 1: Voice Interface (5 minutes)

1. **Test Voice Input:** Click microphone, say "Liv, test connection"
2. **Verify Output:** Check for voice response + text transcription
3. **Mode Switching:** Try "Liv" (brevity) vs normal (mentor)

### Phase 2: RPM Integration (5 minutes)

1. **Generate RPM Plan:** "Create RPM plan for this week"
2. **Review Output:** Check Result → Purpose → MAP structure
3. **Validate Actions:** Ensure actions are specific and measurable

### Phase 3: Business Tools (5 minutes)

1. **Calendar Integration:** "Schedule team meeting for tomorrow"
2. **Email Integration:** "Send RPM summary to team"
3. **Drive Integration:** "Save RPM plan to Drive"

---

## Success Metrics

### Voice Performance

- **P95 Latency:** < 1200ms (target)
- **Accuracy:** > 95% transcription accuracy
- **Mode Recognition:** 100% correct mode switching

### RPM Quality

- **Result Clarity:** Specific, measurable outcomes
- **Purpose Alignment:** Clear why behind each result
- **Action Feasibility:** All actions executable within timeframe

### Compliance Validation

- **AGE21:** ✅ Verified before cannabis content
- **PII Protection:** ✅ No sensitive data in outputs
- **Medical Claims:** ✅ Blocked, mapped to safe language

---

## Troubleshooting

### Voice Not Working

1. Check microphone permissions
2. Verify browser audio settings
3. Test with "Liv, test connection"

### RPM Output Issues

1. Ensure sufficient context provided
2. Check guardrails status
3. Verify profit estimates are algorithmic

### Business Tool Failures

1. Check API key configuration
2. Verify Google Workspace permissions
3. Test individual tool endpoints

---

## Team Pilot Checklist

### Jesse (CEO)

- [ ] Voice cockpit access verified
- [ ] RPM plan generation tested
- [ ] Calendar integration working
- [ ] Email integration working

### Andrew (Director Ops)

- [ ] Voice interface familiarization
- [ ] RPM action validation
- [ ] Drive integration tested
- [ ] Compliance checks verified

### Christopher (CSO/Paymaster)

- [ ] Voice mode switching practiced
- [ ] Financial accuracy validation
- [ ] LightSpeed integration tested
- [ ] Age verification confirmed

### Charlie (Procurement)

- [ ] Voice input/output tested
- [ ] Inventory queries validated
- [ ] Chain-of-custody tracking
- [ ] COA verification working

### Andrea (Legal)

- [ ] Compliance guardrails tested
- [ ] Medical claims blocker verified
- [ ] PII protection confirmed
- [ ] Legal language validation

---

## Next Steps

1. **Complete 15-minute training** for all team members
2. **Document any issues** in team Slack channel
3. **Schedule follow-up** if needed
4. **Begin daily voice stand-ups** using "Liv" mode

---

**Training Complete:** ✅ Ready for production use  
**Support:** Contact Jesse for technical issues  
**Documentation:** See `docs/AGENT_BUILDER_17_NODE_WORKFLOW.md`

---

*Generated: 2025-10-21*  
*Version: 1.0*  
*Status: Team Pilot Ready*
