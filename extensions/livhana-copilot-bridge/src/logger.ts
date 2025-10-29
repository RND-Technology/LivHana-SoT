import * as vscode from 'vscode';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
    private outputChannel: vscode.OutputChannel;
    private logLevel: LogLevel;

    constructor(channelName: string) {
        this.outputChannel = vscode.window.createOutputChannel(channelName);
        this.logLevel = this.getConfiguredLogLevel();

        // Watch for config changes
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('livhanaCopilotBridge.logLevel')) {
                this.logLevel = this.getConfiguredLogLevel();
                this.info('Log level changed to: ' + this.logLevel);
            }
        });
    }

    private getConfiguredLogLevel(): LogLevel {
        const config = vscode.workspace.getConfiguration('livhanaCopilotBridge');
        return config.get<LogLevel>('logLevel', 'info');
    }

    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex >= currentLevelIndex;
    }

    private log(level: LogLevel, message: string, data?: any): void {
        if (!this.shouldLog(level)) {
            return;
        }

        const timestamp = new Date().toISOString();
        const levelStr = level.toUpperCase().padEnd(5);
        let logMessage = `[${timestamp}] [${levelStr}] ${message}`;

        if (data !== undefined) {
            if (data instanceof Error) {
                logMessage += `\n  Error: ${data.message}`;
                if (data.stack) {
                    logMessage += `\n  Stack: ${data.stack}`;
                }
            } else if (typeof data === 'object') {
                try {
                    logMessage += `\n  Data: ${JSON.stringify(data, null, 2)}`;
                } catch (e) {
                    logMessage += `\n  Data: [Unable to stringify]`;
                }
            } else {
                logMessage += `\n  Data: ${data}`;
            }
        }

        this.outputChannel.appendLine(logMessage);

        // Also show in console for errors
        if (level === 'error') {
            console.error(logMessage);
        }
    }

    debug(message: string, data?: any): void {
        this.log('debug', message, data);
    }

    info(message: string, data?: any): void {
        this.log('info', message, data);
    }

    warn(message: string, data?: any): void {
        this.log('warn', message, data);
    }

    error(message: string, data?: any): void {
        this.log('error', message, data);
    }

    show(): void {
        this.outputChannel.show();
    }

    dispose(): void {
        this.outputChannel.dispose();
    }
}
