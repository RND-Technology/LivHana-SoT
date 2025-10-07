#!/bin/bash

# VIDEO PRODUCTION PIPELINE - SETUP SCRIPT
# This script sets up the video production pipeline environment

set -e  # Exit on error

echo "=========================================="
echo "Video Production Pipeline Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on macOS or Linux
OS="$(uname -s)"
echo "Detected OS: $OS"
echo ""

# ============================================================================
# 1. CHECK PREREQUISITES
# ============================================================================

echo "Step 1: Checking prerequisites..."
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"

    # Check if version is 18+
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        echo -e "${RED}✗${NC} Node.js version 18+ required. Please upgrade."
        exit 1
    fi
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check FFmpeg
if command -v ffmpeg &> /dev/null; then
    FFMPEG_VERSION=$(ffmpeg -version | head -n1)
    echo -e "${GREEN}✓${NC} FFmpeg installed: $FFMPEG_VERSION"
else
    echo -e "${RED}✗${NC} FFmpeg not found. Installing..."

    if [ "$OS" = "Darwin" ]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install ffmpeg
        else
            echo -e "${RED}✗${NC} Homebrew not found. Please install FFmpeg manually."
            echo "   Visit: https://ffmpeg.org/download.html"
            exit 1
        fi
    elif [ "$OS" = "Linux" ]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y ffmpeg
        elif command -v yum &> /dev/null; then
            sudo yum install -y ffmpeg
        else
            echo -e "${RED}✗${NC} Package manager not found. Please install FFmpeg manually."
            exit 1
        fi
    fi
fi

# Check Google Cloud SDK
if command -v gcloud &> /dev/null; then
    GCLOUD_VERSION=$(gcloud version --format="value(core)")
    echo -e "${GREEN}✓${NC} Google Cloud SDK installed"
else
    echo -e "${YELLOW}⚠${NC}  Google Cloud SDK not found."
    echo "   Install from: https://cloud.google.com/sdk/docs/install"
    echo "   (Required for GCS uploads)"
fi

echo ""

# ============================================================================
# 2. CREATE DIRECTORY STRUCTURE
# ============================================================================

echo "Step 2: Creating directory structure..."
echo ""

mkdir -p output/high-noon-cartoon
mkdir -p output/assets/audio/music
mkdir -p output/assets/images/backgrounds
mkdir -p output/assets/video
mkdir -p output/final-videos
mkdir -p output/metrics

echo -e "${GREEN}✓${NC} Directories created"
echo ""

# ============================================================================
# 3. SETUP ENVIRONMENT VARIABLES
# ============================================================================

echo "Step 3: Setting up environment variables..."
echo ""

if [ -f .env ]; then
    echo -e "${YELLOW}⚠${NC}  .env file already exists. Skipping..."
else
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓${NC} Created .env from .env.example"
        echo -e "${YELLOW}⚠${NC}  Please edit .env and add your API keys!"
    else
        echo -e "${RED}✗${NC} .env.example not found. Creating basic template..."
        cat > .env << 'EOF'
# Core API Keys
ANTHROPIC_API_KEY=
ELEVENLABS_API_KEY=
OPENAI_API_KEY=
D_ID_API_KEY=
SUNO_API_KEY=

# Distribution
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REFRESH_TOKEN=
TIKTOK_ACCESS_TOKEN=
INSTAGRAM_ACCESS_TOKEN=
FACEBOOK_PAGE_ID=

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=
EOF
        echo -e "${GREEN}✓${NC} Created basic .env template"
        echo -e "${YELLOW}⚠${NC}  Please edit .env and add your API keys!"
    fi
fi

echo ""

# ============================================================================
# 4. MAKE SCRIPTS EXECUTABLE
# ============================================================================

echo "Step 4: Making scripts executable..."
echo ""

chmod +x video-production-pipeline.mjs
chmod +x video-production-pipeline.test.mjs

echo -e "${GREEN}✓${NC} Scripts are now executable"
echo ""

# ============================================================================
# 5. VERIFY GOOGLE CLOUD SETUP
# ============================================================================

echo "Step 5: Verifying Google Cloud setup..."
echo ""

if command -v gcloud &> /dev/null; then
    # Check if authenticated
    if gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
        ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
        echo -e "${GREEN}✓${NC} Authenticated as: $ACTIVE_ACCOUNT"
    else
        echo -e "${YELLOW}⚠${NC}  Not authenticated. Run: gcloud auth login"
    fi

    # Check project
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
    if [ -n "$CURRENT_PROJECT" ]; then
        echo -e "${GREEN}✓${NC} Current project: $CURRENT_PROJECT"
    else
        echo -e "${YELLOW}⚠${NC}  No project set. Run: gcloud config set project YOUR_PROJECT_ID"
    fi
else
    echo -e "${YELLOW}⚠${NC}  Google Cloud SDK not installed. Skipping..."
fi

echo ""

# ============================================================================
# 6. RUN TESTS
# ============================================================================

echo "Step 6: Running tests..."
echo ""

if node video-production-pipeline.test.mjs; then
    echo -e "${GREEN}✓${NC} All tests passed!"
else
    echo -e "${YELLOW}⚠${NC}  Some tests failed (this is okay for initial setup)"
fi

echo ""

# ============================================================================
# 7. FINAL INSTRUCTIONS
# ============================================================================

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Configure API Keys:"
echo "   ${YELLOW}edit .env${NC}"
echo ""
echo "2. Add API keys for:"
echo "   - ElevenLabs (text-to-speech)"
echo "   - OpenAI (DALL-E 3 images)"
echo "   - D-ID (lip-sync videos)"
echo "   - Suno (music generation)"
echo "   - YouTube, TikTok, Instagram (distribution)"
echo ""
echo "3. Setup Google Cloud:"
echo "   ${YELLOW}gcloud auth login${NC}"
echo "   ${YELLOW}gcloud config set project YOUR_PROJECT_ID${NC}"
echo "   ${YELLOW}gcloud storage buckets create gs://hnc-episodes-prod${NC}"
echo ""
echo "4. Create a test episode script:"
echo "   ${YELLOW}output/high-noon-cartoon/episode_001.json${NC}"
echo ""
echo "5. Run your first production:"
echo "   ${YELLOW}./video-production-pipeline.mjs produce 1${NC}"
echo ""
echo "Documentation:"
echo "   ${YELLOW}PRODUCTION_PIPELINE_IMPLEMENTATION.md${NC}"
echo ""
echo "=========================================="
