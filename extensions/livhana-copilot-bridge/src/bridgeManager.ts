import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as chokidar from 'chokidar';
import { Logger } from './logger';
import { ClaudeListener } from './claudeListener';
import { CopilotListener } from './copilotListener';
import { MessageQueue } from './messageQueue';

export interface BridgeStats {
    messagesToCopilot: number;
    messagesFromCopilot: number;
    errors: number;
}

export class BridgeManager {
    private claudeListener: ClaudeListener;
    private copilotListener: CopilotListener;
    private messageQueue: MessageQueue;
    private stats: BridgeStats;
    private isRunning: boolean = false;

    constructor(
        private context: vscode.ExtensionContext,
        private logger: Logger
    ) {
        this.stats = {
            messagesToCopilot: 0,
            messagesFromCopilot: 0,
            errors: 0
        };

        this.messageQueue = new MessageQueue(logger);
        this.claudeListener = new ClaudeListener(logger, this.messageQueue);
        this.copilotListener = new CopilotListener(logger, this.messageQueue);
    }

    async start(): Promise<void> {
        if (this.isRunning) {
            throw new Error('Bridge is already running');
        }

        this.logger.info('Starting bridge manager...');

        // Ensure directories exist
        await this.ensureDirectories();

        // Start listeners
        await this.claudeListener.start();
        await this.copilotListener.start();

        // Start message processing
        this.startMessageProcessing();

        this.isRunning = true;
        this.logger.info('Bridge manager started successfully');
    }

    async stop(): Promise<void> {
        if (!this.isRunning) {
            return;
        }

        this.logger.info('Stopping bridge manager...');

        await this.claudeListener.stop();
        await this.copilotListener.stop();

        this.isRunning = false;
        this.logger.info('Bridge manager stopped');
    }

    getStats(): BridgeStats {
        return { ...this.stats };
    }

    private async ensureDirectories(): Promise<void> {
        const config = vscode.workspace.getConfiguration('livhanaCopilotBridge');
        const dirs = [
            config.get<string>('claudeOutputDir')!,
            config.get<string>('bridgeOutputDir')!
        ];

        for (const dir of dirs) {
            if (!fs.existsSync(dir)) {
                this.logger.info(`Creating directory: ${dir}`);
                fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
            }
        }
    }

    private startMessageProcessing(): void {
        // Process messages from Claude to Copilot
        this.messageQueue.onClaudeMessage(async (message) => {
            try {
                this.logger.debug('Processing Claude message for Copilot');
                await this.sendToCopilot(message);
                this.stats.messagesToCopilot++;
            } catch (error) {
                this.logger.error('Failed to send to Copilot', error);
                this.stats.errors++;
            }
        });

        // Process messages from Copilot to Claude
        this.messageQueue.onCopilotMessage(async (message) => {
            try {
                this.logger.debug('Processing Copilot message for Claude');
                await this.sendToClaude(message);
                this.stats.messagesFromCopilot++;
            } catch (error) {
                this.logger.error('Failed to send to Claude', error);
                this.stats.errors++;
            }
        });
    }

    private async sendToCopilot(message: any): Promise<void> {
        this.logger.info(`Sending to Copilot: ${message.content?.substring(0, 100)}...`);

        try {
            // Open Copilot chat with the query
            await vscode.commands.executeCommand('workbench.action.chat.open', {
                query: message.content
            });

            // Show notification
            vscode.window.showInformationMessage(
                `Sent to Copilot: ${message.content.substring(0, 50)}...`,
                'View Chat'
            ).then(selection => {
                if (selection === 'View Chat') {
                    vscode.commands.executeCommand('workbench.action.chat.open');
                }
            });
        } catch (error) {
            this.logger.error('Failed to execute Copilot command', error);
            throw error;
        }
    }

    private async sendToClaude(message: any): Promise<void> {
        const config = vscode.workspace.getConfiguration('livhanaCopilotBridge');
        const outputDir = config.get<string>('bridgeOutputDir')!;
        const timestamp = Date.now();
        const filename = `copilot_response_${timestamp}.json`;
        const filepath = path.join(outputDir, filename);

        this.logger.info(`Writing Copilot response to: ${filepath}`);

        const output = {
            timestamp,
            source: 'copilot',
            message: message.content,
            metadata: message.metadata || {},
            sessionId: message.sessionId
        };

        fs.writeFileSync(filepath, JSON.stringify(output, null, 2), 'utf8');
        this.logger.debug(`Copilot response written successfully: ${filename}`);
    }
}
