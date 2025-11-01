# Voice Experiments Archive - October 31, 2025

**Purpose**: Archive of experimental voice service scripts and prototypes  
**Date Archived**: 2025-11-01  
**Status**: Historical - DO NOT USE

---

## What's Archived Here

This directory contains experimental voice service scripts that were used during the development and testing phase of the LivHana voice mode system. These scripts are archived for historical reference only.

**DO NOT USE** these scripts in production or new development.

---

## Archived Scripts (Examples)

The following types of scripts may be found here:
- `start_vocode_service.sh` - Legacy vocode integration
- `start_whisper_service.sh` - Legacy whisper/transcription service
- Experimental TTS implementations
- Prototype queue systems
- Test harnesses

---

## Current Production System

The production voice mode system is located at:
- **Voice Service**: `backend/voice-service/`
- **Reasoning Gateway**: `backend/reasoning-gateway/`
- **Frontend**: `frontend/vibe-cockpit/`
- **Startup Script**: `./START.sh voice`

See:
- Main README: `/README.md`
- Voice Service README: `/backend/voice-service/README.md`
- Voice Audit Plan: `/docs/voice_mode_audit_plan.md`

---

## Why Archived

These scripts were archived because:
1. **Replaced by production system**: Current voice service in `backend/voice-service/`
2. **Not maintained**: No longer receive updates or bug fixes
3. **May be incomplete**: Experimental code, not production-ready
4. **Confusing for new developers**: Could be mistaken for current implementation

---

## Historical Context

These experiments helped inform the design of the current production system documented in:
- **ADR-002**: Voice Mode Queue Architecture & Guardrails
- **Voice Service README**: Production implementation details
- **Voice Audit Plan**: Comprehensive audit framework

---

## If You Need to Reference These

If you need to understand the evolution of the voice system:
1. Check git history: `git log -- archive/voice-experiments-20251031/`
2. Review ADR-002 for architectural decisions
3. See production implementation in `backend/voice-service/`
4. Ask team members who worked on the experiments

---

## Migration Notes

If migrating scripts from this archive:
1. Review against current EA_PRECISION standards
2. Update to use current API patterns
3. Add comprehensive tests
4. Document in ADR if architectural
5. Get code review approval

---

**Archived By**: Operations Team  
**Last Verified**: 2025-11-01  
**Contact**: jesse@reggieanddro.com
