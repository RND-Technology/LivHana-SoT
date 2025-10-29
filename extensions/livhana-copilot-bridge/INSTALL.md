# Installation Guide for LivHana Copilot Bridge

## Quick Install

### Method 1: Development Install (Recommended)

```bash
# Navigate to extension directory
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/extensions/livhana-copilot-bridge

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Install extension locally
code --install-extension .
```

### Method 2: Package and Install

```bash
# Navigate to extension directory
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/extensions/livhana-copilot-bridge

# Install dependencies
npm install

# Compile
npm run compile

# Create VSIX package
npm run package

# Install the VSIX
code --install-extension livhana-copilot-bridge-1.0.0.vsix
```

### Method 3: Symlink (Development)

```bash
# Link extension to VS Code extensions folder
ln -s /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/extensions/livhana-copilot-bridge \
      ~/.vscode/extensions/livhana-copilot-bridge

# Compile
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/extensions/livhana-copilot-bridge
npm install
npm run compile

# Reload VS Code
```

## Post-Installation Setup

### 1. Configure Directories

Open VS Code Settings (Cmd+,) and search for "LivHana". Configure:

```json
{
  "livhanaCopilotBridge.claudeOutputDir": "/tmp/claude-code-bridge",
  "livhanaCopilotBridge.copilotSessionDir": "/Users/jesseniesen/Library/Application Support/Code/User/workspaceStorage/74671f46b2a812d26898a66338bbe743/chatSessions",
  "livhanaCopilotBridge.bridgeOutputDir": "/tmp/copilot-responses",
  "livhanaCopilotBridge.autoStart": true,
  "livhanaCopilotBridge.logLevel": "info"
}
```

### 2. Create Required Directories

```bash
mkdir -p /tmp/claude-code-bridge
mkdir -p /tmp/copilot-responses
chmod 755 /tmp/claude-code-bridge
chmod 755 /tmp/copilot-responses
```

### 3. Verify Installation

1. Open Command Palette (Cmd+Shift+P)
2. Type "LivHana" - you should see 4 commands:
   - LivHana: Start Copilot Bridge
   - LivHana: Stop Copilot Bridge
   - LivHana: Show Bridge Status
   - LivHana: Send to Copilot

3. Run "LivHana: Start Copilot Bridge"
4. Check status bar - should show "🚀 Bridge Active"

### 4. Test the Bridge

Create a test file for Claude:

```bash
# Create a test message from Claude
echo '{
  "query": "Hello Copilot, this is a test message from Claude Code CLI",
  "timestamp": '$(date +%s)'
}' > /tmp/claude-code-bridge/claude_test_$(date +%s).json
```

You should see:
1. A VS Code notification
2. Copilot Chat opening with the message
3. Status bar update

Check for Copilot responses:

```bash
ls -lt /tmp/copilot-responses/
```

## Troubleshooting

### Extension Not Loading

```bash
# Check VS Code logs
code --log trace

# Check extension is installed
code --list-extensions | grep livhana

# Force reload
code --disable-extensions --enable-extension livhana.livhana-copilot-bridge
```

### Compilation Errors

```bash
# Clean and rebuild
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/extensions/livhana-copilot-bridge
rm -rf out node_modules package-lock.json
npm install
npm run compile
```

### Permission Issues

```bash
# Fix directory permissions
sudo chown -R $(whoami) /tmp/claude-code-bridge
sudo chown -R $(whoami) /tmp/copilot-responses
chmod -R 755 /tmp/claude-code-bridge
chmod -R 755 /tmp/copilot-responses
```

### View Logs

1. Open Output panel: View → Output (Cmd+Shift+U)
2. Select "LivHana-Bridge" from dropdown
3. Set log level to "debug" in settings for verbose output

## Uninstall

```bash
# Remove extension
code --uninstall-extension livhana.livhana-copilot-bridge

# Clean up directories (optional)
rm -rf /tmp/claude-code-bridge
rm -rf /tmp/copilot-responses
```

## Development Mode

For active development:

```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/extensions/livhana-copilot-bridge

# Watch mode (auto-recompile on changes)
npm run watch

# In VS Code, press F5 to launch Extension Development Host
```

## Next Steps

- Read [README.md](README.md) for usage instructions
- Configure Claude CLI integration
- Set up automated workflows
- Customize settings for your environment
