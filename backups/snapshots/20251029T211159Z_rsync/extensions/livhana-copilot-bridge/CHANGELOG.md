# Changelog

All notable changes to the LivHana Copilot Bridge extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-28

### Added
- Initial release of LivHana Copilot Bridge
- Bidirectional communication between Claude Code CLI and GitHub Copilot Chat
- Real-time file system monitoring for Claude outputs
- Real-time monitoring of Copilot chat sessions
- Message queue system for reliable message handling
- Status bar integration with visual indicators
- Four VS Code commands:
  - Start Copilot Bridge
  - Stop Copilot Bridge
  - Show Bridge Status
  - Send to Copilot
- Comprehensive logging system with configurable log levels
- Configuration settings for directories and behavior
- Auto-start option for automatic bridge activation
- File archiving for processed Claude messages
- Support for multiple Copilot session file formats
- Error handling and recovery mechanisms
- Production-ready TypeScript implementation
- Complete documentation (README, INSTALL, CHANGELOG)
- VS Code extension manifest with proper metadata

### Features
- **Claude Listener**: Monitors `/tmp/claude-code-bridge` for new commands
- **Copilot Listener**: Watches Copilot session directory for responses
- **Message Queue**: Asynchronous processing with error isolation
- **Bridge Manager**: Orchestrates component lifecycle
- **Logger**: Multi-level logging with output channel integration
- **Statistics Tracking**: Counts messages and errors
- **Status Display**: Modal dialog with detailed stats and configuration

### Technical Details
- Built with TypeScript 5.3+
- Uses chokidar for efficient file watching
- VS Code Extension API 1.85.0+
- Node.js 18+ compatible
- Async/await throughout for modern JS patterns
- Strong typing with TypeScript interfaces
- Comprehensive error handling
- Resource cleanup on deactivation

### Documentation
- Complete README with usage examples
- Installation guide with multiple methods
- Troubleshooting section
- Architecture documentation
- File format specifications
- Configuration reference
- Development setup instructions

## [Unreleased]

### Planned
- WebSocket support for lower-latency communication
- Plugin system for custom message transformers
- Message history viewer UI
- Statistics dashboard
- Export/import of bridge sessions
- Multi-workspace support
- Custom notification preferences
- Integration with other AI assistants
- REST API endpoint for external tools
- Performance metrics and monitoring
