# LivHana Copilot Bridge

A VS Code extension that creates a bidirectional communication bridge between Claude Code CLI and GitHub Copilot Chat.

## Features

- **Bidirectional Communication**: Seamlessly route messages between Claude Code CLI and GitHub Copilot
- **Real-time Monitoring**: Watch for Claude outputs and Copilot responses in real-time
- **Message Queue**: Reliable message handling with queuing system
- **Status Bar Integration**: Visual status indicator and quick access to bridge controls
- **Configurable**: Customize directories and behavior through VS Code settings
- **Production Ready**: Comprehensive error handling, logging, and TypeScript type safety

## Installation

### From Source

1. Clone or copy the extension to your local machine:
   ```bash
   cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/extensions/livhana-copilot-bridge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Compile the extension:
   ```bash
   npm run compile
   ```

4. Install the extension:
   ```bash
   code --install-extension .
   ```

   Or press `F5` in VS Code to launch a new Extension Development Host window.

### From VSIX Package

1. Package the extension:
   ```bash
   npm run package
   ```

2. Install the generated `.vsix` file:
   ```bash
   code --install-extension livhana-copilot-bridge-1.0.0.vsix
   ```

## Usage

### Quick Start

1. Open the Command Palette (`Cmd+Shift+P` on macOS, `Ctrl+Shift+P` on Windows/Linux)
2. Run: `LivHana: Start Copilot Bridge`
3. The status bar will show "🚀 Bridge Active"

### Commands

- **Start Bridge**: `LivHana: Start Copilot Bridge`
  - Activates the bridge and starts monitoring

- **Stop Bridge**: `LivHana: Stop Copilot Bridge`
  - Stops the bridge and releases resources

- **Show Status**: `LivHana: Show Bridge Status`
  - Displays detailed statistics and configuration

- **Send to Copilot**: `LivHana: Send to Copilot`
  - Manually send a message to Copilot Chat

### Status Bar

The status bar item shows the current bridge state:
- 🚀 **Bridge Active**: Running normally
- ⏸️ **Bridge Stopped**: Not currently active
- ⚠️ **Bridge Error**: Encountered an error (click for details)

Click the status bar item to view detailed statistics.

## Configuration

Access settings via: `Code > Settings > Extensions > LivHana Copilot Bridge`

### Available Settings

```json
{
  "livhanaCopilotBridge.claudeOutputDir": "/tmp/claude-code-bridge",
  "livhanaCopilotBridge.copilotSessionDir": "/Users/jesseniesen/Library/Application Support/Code/User/workspaceStorage/74671f46b2a812d26898a66338bbe743/chatSessions",
  "livhanaCopilotBridge.bridgeOutputDir": "/tmp/copilot-responses",
  "livhanaCopilotBridge.autoStart": false,
  "livhanaCopilotBridge.logLevel": "info"
}
```

### Settings Details

- **claudeOutputDir**: Directory where Claude CLI writes commands/outputs
  - Default: `/tmp/claude-code-bridge`
  - Claude should write JSON files here with format: `claude_*.json`

- **copilotSessionDir**: Directory where Copilot stores chat sessions
  - Default: VS Code's workspace storage path for chat sessions
  - Auto-detected on most systems

- **bridgeOutputDir**: Directory where bridge writes Copilot responses
  - Default: `/tmp/copilot-responses`
  - Claude can read responses from this directory

- **autoStart**: Automatically start bridge on VS Code startup
  - Default: `false`
  - Set to `true` for always-on bridge

- **logLevel**: Logging verbosity
  - Options: `debug`, `info`, `warn`, `error`
  - Default: `info`

## Architecture

### Components

1. **Bridge Manager**: Orchestrates all components and manages lifecycle
2. **Claude Listener**: Monitors Claude output directory for new commands
3. **Copilot Listener**: Watches Copilot session directory for responses
4. **Message Queue**: Ensures reliable, ordered message processing
5. **Logger**: Configurable logging with multiple levels

### Message Flow

```
Claude CLI → File System → Claude Listener → Message Queue → Bridge Manager → VS Code API → Copilot Chat
                                                                                                    ↓
Claude CLI ← File System ← Bridge Manager ← Message Queue ← Copilot Listener ← File System ← Copilot Chat
```

### File Formats

#### Claude Input (from Claude CLI)
```json
{
  "query": "Message to send to Copilot",
  "timestamp": 1234567890,
  "metadata": {}
}
```

#### Copilot Output (to Claude CLI)
```json
{
  "timestamp": 1234567890,
  "source": "copilot",
  "message": "Response from Copilot",
  "metadata": {},
  "sessionId": "session-id"
}
```

## Integration with Claude Code CLI

To integrate with Claude Code CLI, configure Claude to write commands to the `claudeOutputDir`:

```bash
# Example: Send a message from Claude to Copilot
echo '{"query": "Explain this code", "timestamp": '$(date +%s)'}' > /tmp/claude-code-bridge/claude_$(date +%s).json
```

Claude can then monitor the `bridgeOutputDir` for responses:

```bash
# Monitor for Copilot responses
ls -lt /tmp/copilot-responses/*.json | head -1
```

## Development

### Prerequisites

- Node.js 18+
- VS Code 1.85.0+
- TypeScript 5.3+

### Setup

```bash
cd extensions/livhana-copilot-bridge
npm install
npm run compile
```

### Watch Mode

```bash
npm run watch
```

### Debugging

1. Open the extension folder in VS Code
2. Press `F5` to launch Extension Development Host
3. Set breakpoints in TypeScript files
4. View logs in the "LivHana-Bridge" output channel

### Testing

```bash
# Run linter
npm run lint

# Compile and check for errors
npm run compile
```

## Troubleshooting

### Bridge Won't Start

1. Check that directories exist and are writable:
   ```bash
   ls -la /tmp/claude-code-bridge
   ls -la /tmp/copilot-responses
   ```

2. View logs: Open Output panel (`Cmd+Shift+U`) → Select "LivHana-Bridge"

3. Verify Copilot is installed and active

### Messages Not Being Sent

1. Check log level is set to `debug` for verbose output
2. Verify file permissions on watch directories
3. Ensure JSON files are properly formatted
4. Check that files match naming patterns (`claude_*.json`)

### Copilot Responses Not Captured

1. Verify `copilotSessionDir` path is correct
2. Check that Copilot is creating session files
3. Ensure bridge has read permissions on session directory
4. Try updating the Copilot session directory path in settings

## Performance

- **Low Overhead**: File watching uses efficient native APIs
- **Async Processing**: All I/O operations are asynchronous
- **Smart Throttling**: File change detection includes stability thresholds
- **Memory Efficient**: Processed files are tracked to avoid reprocessing

## Security

- **Sandboxed**: Runs in VS Code's extension sandbox
- **No Network Calls**: All communication via local file system
- **Permission Aware**: Respects file system permissions
- **Safe File Handling**: Validates and sanitizes all file inputs

## Contributing

This extension is part of the LivHana Trinity project. For contributions:

1. Follow TypeScript best practices
2. Maintain test coverage
3. Update documentation
4. Follow existing code style

## License

MIT

## Support

For issues or questions:
- Check the output logs (`LivHana-Bridge` channel)
- Review troubleshooting section above
- Open an issue in the LivHana-SoT repository

## Version History

### 1.0.0 (2025-10-28)
- Initial release
- Bidirectional Claude ↔ Copilot communication
- Real-time file monitoring
- Status bar integration
- Comprehensive logging
- Production-ready error handling
