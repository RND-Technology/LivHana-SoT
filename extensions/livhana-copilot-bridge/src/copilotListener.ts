import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as chokidar from 'chokidar';
import { Logger } from './logger';
import { MessageQueue } from './messageQueue';

export class CopilotListener {
    private watcher: chokidar.FSWatcher | undefined;
    private processedSessions: Set<string> = new Set();
    private lastProcessedTimestamp: number = Date.now();

    constructor(
        private logger: Logger,
        private messageQueue: MessageQueue
    ) {}

    async start(): Promise<void> {
        const config = vscode.workspace.getConfiguration('livhanaCopilotBridge');
        const copilotDir = config.get<string>('copilotSessionDir')!;

        this.logger.info(`Starting Copilot listener on: ${copilotDir}`);

        // Check if directory exists
        if (!fs.existsSync(copilotDir)) {
            this.logger.warn(`Copilot session directory does not exist: ${copilotDir}`);
            this.logger.warn('Copilot responses will not be monitored until directory is created');
            return;
        }

        // Watch for changes in the Copilot session directory
        this.watcher = chokidar.watch(copilotDir, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true,
            ignoreInitial: false,
            depth: 2,
            awaitWriteFinish: {
                stabilityThreshold: 1000,
                pollInterval: 200
            }
        });

        this.watcher.on('add', (filepath) => this.handleNewFile(filepath));
        this.watcher.on('change', (filepath) => this.handleFileChange(filepath));
        this.watcher.on('error', (error) => {
            this.logger.error('Copilot watcher error', error);
        });

        this.logger.info('Copilot listener started successfully');
    }

    async stop(): Promise<void> {
        if (this.watcher) {
            await this.watcher.close();
            this.watcher = undefined;
        }
        this.processedSessions.clear();
        this.logger.info('Copilot listener stopped');
    }

    private async handleNewFile(filepath: string): Promise<void> {
        // Only process JSON files
        if (!filepath.endsWith('.json')) {
            return;
        }

        this.logger.debug(`New Copilot file detected: ${filepath}`);
        await this.processFile(filepath);
    }

    private async handleFileChange(filepath: string): Promise<void> {
        if (!filepath.endsWith('.json')) {
            return;
        }

        this.logger.debug(`Copilot file changed: ${filepath}`);
        await this.processFile(filepath);
    }

    private async processFile(filepath: string): Promise<void> {
        try {
            const stats = fs.statSync(filepath);
            if (stats.mtimeMs <= this.lastProcessedTimestamp) {
                // File hasn't been modified since last check
                return;
            }

            const content = fs.readFileSync(filepath, 'utf8');
            const data = JSON.parse(content);

            // Extract Copilot responses from session data
            const responses = this.extractResponses(data, filepath);

            for (const response of responses) {
                if (!this.processedSessions.has(response.id)) {
                    this.logger.info(`Processing Copilot response: ${response.content.substring(0, 100)}...`);
                    this.messageQueue.addCopilotMessage(response);
                    this.processedSessions.add(response.id);
                }
            }

            this.lastProcessedTimestamp = stats.mtimeMs;
        } catch (error) {
            this.logger.error(`Failed to process Copilot file: ${filepath}`, error);
        }
    }

    private extractResponses(data: any, filepath: string): any[] {
        const responses: any[] = [];
        const sessionId = path.basename(filepath, '.json');

        try {
            // Handle different Copilot session formats
            if (Array.isArray(data)) {
                // Array of messages
                for (const item of data) {
                    if (item.role === 'assistant' && item.content) {
                        responses.push({
                            id: `${sessionId}_${item.timestamp || Date.now()}`,
                            content: this.extractTextContent(item.content),
                            timestamp: item.timestamp || Date.now(),
                            sessionId,
                            metadata: {
                                source: 'copilot',
                                filepath,
                                role: item.role,
                                originalData: item
                            }
                        });
                    }
                }
            } else if (data.messages && Array.isArray(data.messages)) {
                // Object with messages array
                for (const msg of data.messages) {
                    if (msg.role === 'assistant' && msg.content) {
                        responses.push({
                            id: `${sessionId}_${msg.timestamp || Date.now()}`,
                            content: this.extractTextContent(msg.content),
                            timestamp: msg.timestamp || Date.now(),
                            sessionId,
                            metadata: {
                                source: 'copilot',
                                filepath,
                                role: msg.role,
                                originalData: msg
                            }
                        });
                    }
                }
            } else if (data.response) {
                // Direct response object
                responses.push({
                    id: `${sessionId}_${Date.now()}`,
                    content: this.extractTextContent(data.response),
                    timestamp: Date.now(),
                    sessionId,
                    metadata: {
                        source: 'copilot',
                        filepath,
                        originalData: data
                    }
                });
            }
        } catch (error) {
            this.logger.error('Failed to extract Copilot responses', error);
        }

        return responses;
    }

    private extractTextContent(content: any): string {
        if (typeof content === 'string') {
            return content;
        }
        if (content && typeof content === 'object') {
            if (content.text) {
                return content.text;
            }
            if (content.value) {
                return content.value;
            }
            return JSON.stringify(content);
        }
        return String(content);
    }
}
