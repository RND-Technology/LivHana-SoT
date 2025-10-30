#!/usr/bin/env bash
# 🎨 ENHANCED BOOT VISUALIZATIONS - COOLER THAN CHATGPT
# Liv Hana | Tier-1 Visual Excellence | Voice-First Terminal Art
# One Shot, One Kill | Grow Baby Grow, Sell Baby Sell

# Advanced color palette with gradients
NEON_CYAN='\033[38;5;51m'
NEON_MAGENTA='\033[38;5;201m'
NEON_GREEN='\033[38;5;46m'
NEON_YELLOW='\033[38;5;226m'
NEON_ORANGE='\033[38;5;208m'
NEON_PURPLE='\033[38;5;141m'
NEON_BLUE='\033[38;5;33m'
ELECTRIC_PINK='\033[38;5;199m'
CYBER_TEAL='\033[38;5;87m'
PLASMA_RED='\033[38;5;196m'
GRADIENT_1='\033[38;5;57m'
GRADIENT_2='\033[38;5;93m'
GRADIENT_3='\033[38;5;129m'
GRADIENT_4='\033[38;5;165m'
GRADIENT_5='\033[38;5;201m'
BOLD='\033[1m'
DIM='\033[2m'
ITALIC='\033[3m'
UNDERLINE='\033[4m'
BLINK='\033[5m'
REVERSE='\033[7m'
NC='\033[0m'

# Box drawing characters
BOX_TL='╔'
BOX_TR='╗'
BOX_BL='╚'
BOX_BR='╝'
BOX_H='═'
BOX_V='║'
BOX_VR='╠'
BOX_VL='╣'
BOX_HU='╩'
BOX_HD='╦'

# Unicode art characters
STAR='★'
COMET='☄'
ROCKET='🚀'
SPARKLE='✨'
FIRE='🔥'
ZAP='⚡'
WAVE='〜'
ARROW='➤'
CHECK='✓'
CROSS='✗'
BULLET='●'
CIRCLE='○'
DIAMOND='◆'

# Get terminal width for centering
TERM_WIDTH=$(tput cols 2>/dev/null || echo 80)

# Center text function
center_text() {
    local text="$1"
    # Strip ANSI codes for length calculation
    local stripped=$(echo -e "$text" | sed 's/\x1b\[[0-9;]*m//g')
    local text_length=${#stripped}
    local padding=$(( (TERM_WIDTH - text_length) / 2 ))
    printf "%${padding}s%b\n" "" "$text"
}

# Comet trail effect
comet_trail() {
    local message="$1"
    local color="$2"

    printf "${color}"
    for ((i=0; i<${#message}; i++)); do
        printf "%c" "${message:$i:1}"
        sleep 0.01
    done
    printf "${NC}\n"
}

# Plasma wave banner
plasma_banner() {
    local text="$1"
    local colors=("$GRADIENT_1" "$GRADIENT_2" "$GRADIENT_3" "$GRADIENT_4" "$GRADIENT_5")

    echo
    for ((i=0; i<${#text}; i++)); do
        local color_index=$((i % 5))
        printf "%b%c" "${colors[$color_index]}" "${text:$i:1}"
    done
    printf "${NC}\n"
    echo
}

# Neon glow effect
neon_glow() {
    local text="$1"

    echo
    printf "${BOLD}${NEON_CYAN}%s${NC}\n" "$text"
    printf "${DIM}${CYBER_TEAL}%s${NC}\n" "$(echo "$text" | tr '[:print:]' '▔')"
    echo
}

# Matrix-style progress bar
matrix_progress() {
    local percent="$1"
    local width=50
    local filled=$(( percent * width / 100 ))
    local empty=$(( width - filled ))

    printf "${NEON_GREEN}["
    for ((i=0; i<filled; i++)); do
        printf "█"
    done
    for ((i=0; i<empty; i++)); do
        printf "░"
    done
    printf "] ${BOLD}%3d%%${NC}\n" "$percent"
}

# Cyber box with title
cyber_box() {
    local title="$1"
    local content="$2"
    local width=$((TERM_WIDTH - 10))

    echo
    # Top border with title
    printf "${NEON_MAGENTA}${BOX_TL}"
    printf "${BOX_H}${BOX_H}${BOX_H} "
    printf "${BOLD}${ELECTRIC_PINK}%s${NC}${NEON_MAGENTA} " "$title"
    local title_len=$((${#title} + 5))
    for ((i=title_len; i<width; i++)); do printf "${BOX_H}"; done
    printf "${BOX_TR}${NC}\n"

    # Content
    while IFS= read -r line; do
        printf "${NEON_MAGENTA}${BOX_V}${NC} %-$((width-2))s ${NEON_MAGENTA}${BOX_V}${NC}\n" "$line"
    done <<< "$content"

    # Bottom border
    printf "${NEON_MAGENTA}${BOX_BL}"
    for ((i=0; i<width; i++)); do printf "${BOX_H}"; done
    printf "${BOX_BR}${NC}\n"
    echo
}

# Starfield animation (one frame)
starfield() {
    local message="$1"

    echo
    printf "${DIM}${NEON_BLUE}"
    for ((i=0; i<20; i++)); do
        printf " ${STAR}"
    done
    printf "${NC}\n"

    center_text "${BOLD}${NEON_CYAN}${message}${NC}"

    printf "${DIM}${NEON_BLUE}"
    for ((i=0; i<20; i++)); do
        printf " ${STAR}"
    done
    printf "${NC}\n"
    echo
}

# Holographic status display
holo_status() {
    local label="$1"
    local value="$2"
    local status="$3"  # "ok", "warning", "error"

    local status_color
    local status_icon

    case "$status" in
        "ok")
            status_color="$NEON_GREEN"
            status_icon="$CHECK"
            ;;
        "warning")
            status_color="$NEON_YELLOW"
            status_icon="⚠"
            ;;
        "error")
            status_color="$PLASMA_RED"
            status_icon="$CROSS"
            ;;
        *)
            status_color="$CYBER_TEAL"
            status_icon="$BULLET"
            ;;
    esac

    printf "${status_color}${status_icon} ${NC}${BOLD}${NEON_CYAN}%-25s${NC} ${DIM}${WAVE}${NC} ${NEON_PURPLE}%s${NC}\n" "$label" "$value"
}

# Epic ASCII art banner
epic_banner() {
    echo
    center_text "${BOLD}${NEON_MAGENTA}${BOX_TL}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_TR}${NC}"
    center_text "${BOLD}${GRADIENT_1}${BOX_V}  ${GRADIENT_2}██╗     ${GRADIENT_3}██╗${GRADIENT_4}██╗   ${GRADIENT_5}██╗    ${GRADIENT_1}██╗  ${GRADIENT_2}██╗${GRADIENT_3}█████╗ ${GRADIENT_4}███╗   ${GRADIENT_5}██╗${GRADIENT_1}█████╗   ${NEON_MAGENTA}${BOX_V}${NC}"
    center_text "${BOLD}${GRADIENT_1}${BOX_V}  ${GRADIENT_2}██║     ${GRADIENT_3}██║${GRADIENT_4}██║   ${GRADIENT_5}██║    ${GRADIENT_1}██║  ${GRADIENT_2}██║${GRADIENT_3}██╔══██╗${GRADIENT_4}████╗  ${GRADIENT_5}██║${GRADIENT_1}██╔══██╗ ${NEON_MAGENTA}${BOX_V}${NC}"
    center_text "${BOLD}${GRADIENT_1}${BOX_V}  ${GRADIENT_2}██║     ${GRADIENT_3}██║${GRADIENT_4}██║   ${GRADIENT_5}██║    ${GRADIENT_1}███████║${GRADIENT_2}${GRADIENT_3}███████║${GRADIENT_4}██╔██╗ ${GRADIENT_5}██║${GRADIENT_1}███████║ ${NEON_MAGENTA}${BOX_V}${NC}"
    center_text "${BOLD}${GRADIENT_1}${BOX_V}  ${GRADIENT_2}██║     ${GRADIENT_3}██║${GRADIENT_4}╚██╗ ${GRADIENT_5}██╔╝    ${GRADIENT_1}██╔══██║${GRADIENT_2}${GRADIENT_3}██╔══██║${GRADIENT_4}██║╚██╗${GRADIENT_5}██║${GRADIENT_1}██╔══██║ ${NEON_MAGENTA}${BOX_V}${NC}"
    center_text "${BOLD}${GRADIENT_1}${BOX_V}  ${GRADIENT_2}███████╗${GRADIENT_3}██║${GRADIENT_4} ╚████╔╝     ${GRADIENT_1}██║  ${GRADIENT_2}██║${GRADIENT_3}██║  ${GRADIENT_4}██║${GRADIENT_5}██║ ${GRADIENT_1}╚████║${GRADIENT_2}██║  ${GRADIENT_3}██║ ${NEON_MAGENTA}${BOX_V}${NC}"
    center_text "${BOLD}${GRADIENT_1}${BOX_V}  ${GRADIENT_2}╚══════╝${GRADIENT_3}╚═╝${GRADIENT_4}  ╚═══╝      ${GRADIENT_1}╚═╝  ${GRADIENT_2}╚═╝${GRADIENT_3}╚═╝  ${GRADIENT_4}╚═╝${GRADIENT_5}╚═╝  ${GRADIENT_1}╚═══╝${GRADIENT_2}╚═╝  ${GRADIENT_3}╚═╝ ${NEON_MAGENTA}${BOX_V}${NC}"
    center_text "${BOLD}${NEON_MAGENTA}${BOX_BL}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_H}${BOX_BR}${NC}"
    echo
    center_text "${BOLD}${ELECTRIC_PINK}${COMET} ${SPARKLE} TIER-1 AUTONOMOUS ORCHESTRATION ${SPARKLE} ${COMET}${NC}"
    center_text "${NEON_CYAN}Voice-First Cognitive Excellence | Claude Sonnet 4.5 OCT 2025${NC}"
    center_text "${DIM}${CYBER_TEAL}One Shot, One Kill ${BULLET} Grow Baby Grow ${BULLET} Sell Baby Sell${NC}"
    echo
}

# Voice mode activation animation
voice_activation() {
    echo
    center_text "${BOLD}${NEON_YELLOW}${ZAP}${ZAP}${ZAP} VOICE MODE ACTIVATION ${ZAP}${ZAP}${ZAP}${NC}"
    echo

    # Animated wave
    for i in {1..3}; do
        center_text "${NEON_GREEN}${WAVE}${WAVE}${WAVE}${WAVE}${WAVE}${WAVE}${WAVE}${WAVE}${WAVE}${WAVE}${NC}"
        sleep 0.1
        printf "\033[1A\033[K"  # Move up and clear line
    done

    holo_status "STT Service (Whisper)" "Port 2022" "ok"
    holo_status "TTS Service (Kokoro)" "Port 8880" "ok"
    holo_status "Voice Orchestrator" "Active" "ok"

    echo
    center_text "${BOLD}${NEON_MAGENTA}${FIRE} VOICE-FIRST MODE ${ARROW} ENGAGED ${FIRE}${NC}"
    echo
}

# Agent spawn visualization
agent_spawn() {
    local agent_name="$1"
    local agent_layer="$2"
    local status="$3"

    printf "${ROCKET} ${BOLD}${NEON_CYAN}%-20s${NC} ${DIM}Layer %s${NC} " "$agent_name" "$agent_layer"

    # Animated dots
    for i in {1..3}; do
        printf "${NEON_YELLOW}.${NC}"
        sleep 0.05
    done

    if [ "$status" = "ok" ]; then
        printf " ${NEON_GREEN}${CHECK} ${BOLD}ACTIVE${NC}\n"
    else
        printf " ${NEON_YELLOW}⚠ ${BOLD}PENDING${NC}\n"
    fi
}

# System health meter
health_meter() {
    local score="$1"
    local max="$2"
    local percent=$((score * 100 / max))

    echo
    center_text "${BOLD}${NEON_MAGENTA}${DIAMOND} SYSTEM HEALTH STATUS ${DIAMOND}${NC}"
    echo

    # Determine color based on health
    local meter_color
    if [ $percent -ge 90 ]; then
        meter_color="$NEON_GREEN"
    elif [ $percent -ge 70 ]; then
        meter_color="$NEON_YELLOW"
    else
        meter_color="$PLASMA_RED"
    fi

    # Draw health bar
    printf "  "
    matrix_progress $percent

    echo
    printf "  ${meter_color}${BOLD}SCORE: %d/%d${NC} " "$score" "$max"

    if [ $percent -ge 95 ]; then
        printf "${NEON_GREEN}${SPARKLE} EXCELLENT ${SPARKLE}${NC}\n"
    elif [ $percent -ge 80 ]; then
        printf "${NEON_YELLOW}${STAR} GOOD ${STAR}${NC}\n"
    elif [ $percent -ge 60 ]; then
        printf "${NEON_ORANGE}⚠ FAIR ⚠${NC}\n"
    else
        printf "${PLASMA_RED}${CROSS} POOR ${CROSS}${NC}\n"
    fi
    echo
}

# Completion fanfare
completion_fanfare() {
    clear
    echo
    echo

    # Big success banner
    center_text "${BOLD}${NEON_GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    center_text "${BOLD}${NEON_GREEN}║                                                           ║${NC}"
    center_text "${BOLD}${NEON_GREEN}║  ${SPARKLE}${SPARKLE}${SPARKLE}    ${ELECTRIC_PINK}BOOT SEQUENCE COMPLETE${NEON_GREEN}    ${SPARKLE}${SPARKLE}${SPARKLE}  ║${NC}"
    center_text "${BOLD}${NEON_GREEN}║                                                           ║${NC}"
    center_text "${BOLD}${NEON_GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"

    echo
    echo

    # Animated celebration
    for i in {1..3}; do
        center_text "${FIRE}${FIRE}${FIRE} ${ROCKET}${ROCKET}${ROCKET} ${ZAP}${ZAP}${ZAP} ${SPARKLE}${SPARKLE}${SPARKLE}"
        sleep 0.2
    done

    echo
    echo
    center_text "${BOLD}${NEON_CYAN}LIV HANA ${ELECTRIC_PINK}${BULLET} ${NEON_YELLOW}TIER-1 ORCHESTRATION ${ELECTRIC_PINK}${BULLET} ${NEON_GREEN}FULLY OPERATIONAL${NC}"
    echo
    center_text "${DIM}${CYBER_TEAL}One Shot, One Kill | Grow Baby Grow | Sell Baby Sell${NC}"
    echo
    echo
}

# Comet loading animation
comet_loading() {
    local message="$1"

    echo
    printf "  ${NEON_CYAN}${message}${NC} "

    for i in {1..10}; do
        printf "${NEON_YELLOW}${COMET}${NC}"
        sleep 0.1
    done

    printf " ${NEON_GREEN}${CHECK}${NC}\n"
}

# Export all functions
export -f center_text comet_trail plasma_banner neon_glow matrix_progress
export -f cyber_box starfield holo_status epic_banner voice_activation
export -f agent_spawn health_meter completion_fanfare comet_loading

# Demo mode (if run directly)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    clear

    epic_banner
    sleep 1

    cyber_box "SYSTEM INITIALIZATION" "Loading Tier-1 autonomous orchestration system
Initializing voice-first cognitive excellence
Preparing 5-agent foundation architecture"
    sleep 1

    comet_loading "Loading dependencies"
    sleep 0.5

    voice_activation
    sleep 1

    echo
    center_text "${BOLD}${NEON_MAGENTA}${DIAMOND} 5-AGENT FOUNDATION SPAWN ${DIAMOND}${NC}"
    echo

    agent_spawn "Planning Agent" "1.1" "ok"
    agent_spawn "Research Agent" "1.2" "ok"
    agent_spawn "Artifacts Agent" "1.3" "ok"
    agent_spawn "Execution Monitor" "1.4" "ok"
    agent_spawn "QA Agent" "1.5" "ok"

    sleep 1

    health_meter 118 120

    sleep 1

    completion_fanfare
fi
