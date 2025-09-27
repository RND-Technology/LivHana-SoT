{ pkgs }: {
  deps = [
    # Python 3.11 for MCP support
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.python311Packages.virtualenv

    # System dependencies for LLM and monitoring
    pkgs.git
    pkgs.curl
    pkgs.wget

    # Development tools
    pkgs.nodejs-18_x
    pkgs.nodePackages.npm

    # Database and storage
    pkgs.sqlite
    pkgs.postgresql

    # Monitoring tools
    pkgs.prometheus
    pkgs.grafana

    # MCP and WebSocket support
    pkgs.python311Packages.websockets
    pkgs.python311Packages.httpx
    pkgs.python311Packages.aiofiles

    # Data processing
    pkgs.python311Packages.pandas
    pkgs.python311Packages.numpy

    # Security and crypto
    pkgs.python311Packages.cryptography
    pkgs.openssl

    # Development and testing
    pkgs.python311Packages.pytest
    pkgs.python311Packages.black
    pkgs.python311Packages.flake8
  ];

  env = {
    # MCP Configuration
    MCP_ENABLED = "true";
    MCP_HOST = "0.0.0.0";
    MCP_PORT = "8765";
    MCP_SERVER_NAME = "LivHana-MCP-Server";
    MCP_VERSION = "1.0.0";
    API_BASE_URL = "http://localhost:8000";

    # MCP Client Configuration
    MCP_CLIENT_TIMEOUT = "30";
    MCP_MAX_RETRIES = "3";
    MCP_RETRY_DELAY = "1.0";

    # Replit MCP Integration
    REPLIT_MCP_ENABLED = "true";
    REPLIT_MCP_CLIENT_ID = "livhana-mcp";

    # Python Configuration
    PYTHONPATH = "./src";
    PYTHONUNBUFFERED = "1";

    # Development settings
    DEBUG_MODE = "false";
    LOG_LEVEL = "INFO";
  };

  # Build inputs for Replit
  buildInputs = with pkgs; [
    python311
    python311Packages.pip
    python311Packages.virtualenv
    git
    curl
    wget
    nodejs-18_x
    sqlite
    postgresql
    prometheus
    grafana
  ];

  # Shell hook for setup
  shellHook = ''
    # Create virtual environment if it doesn't exist
    if [ ! -d ".venv" ]; then
      python -m venv .venv
    fi

    # Activate virtual environment
    source .venv/bin/activate

    # Install Python dependencies
    pip install --upgrade pip
    pip install -r requirements.txt

    # Set Python path
    export PYTHONPATH="$PYTHONPATH:$(pwd)/src"

    echo "🚀 LivHana MCP Server Environment Ready!"
    echo "📡 MCP Server will run on port 8765"
    echo "🔗 API Base URL: http://localhost:8000"
    echo "✅ Virtual environment activated"
  '';
}
