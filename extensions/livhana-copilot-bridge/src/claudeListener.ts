import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as chokidar from 'chokidar';
import { Logger } from './logger';
import { MessageQueue } from './messageQueue';

export class ClaudeListener {
    private watcher: chokidar.FSWatcher | undefined;
    private processedFiles: Set<string> = new Set();

    constructor(
        private logger: Logger,
        private messageQueue: MessageQueue
    ) {}

    async start(): Promise<void> {
        const config = vscode.workspace.getConfiguration('livhanaCopilotBridge');
        const claudeDir = config.get<string>('claudeOutputDir')!;

        this.logger.info(`Starting Claude listener on: ${claudeDir}`);

        // Ensure directory exists
        if (!fs.existsSync(claudeDir)) {
            fs.mkdirSync(claudeDir, { recursive: true, mode: 0o755 });
        }

        // Watch for new files in the Claude output directory
        this.watcher = chokidar.watch(claudeDir, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true,
            ignoreInitial: false,
            awaitWriteFinish: {
                stabilityThreshold: 500,
                pollInterval: 100
            }
        });

        this.watcher.on('add', (filepath) => this.handleNewFile(filepath));
        this.watcher.on('change', (filepath) => this.handleFileChange(filepath));
        this.watcher.on('error', (error) => {
            this.logger.error('Claude watcher error', error);
        });

        this.logger.info('Claude listener started successfully');
    }

    async stop(): Promise<void> {
        if (this.watcher) {
            await this.watcher.close();
            this.watcher = undefined;
        }
        this.processedFiles.clear();
        this.logger.info('Claude listener stopped');
    }

    private async handleNewFile(filepath: string): Promise<void> {
        if (this.processedFiles.has(filepath)) {
            return;
        }

        // Only process JSON files that look like Claude commands
        if (!filepath.endsWith('.json') || !filepath.includes('claude_')) {
            return;
        }

        this.logger.info(`New Claude file detected: ${filepath}`);
        await this.processFile(filepath);
    }

    private async handleFileChange(filepath: string): Promise<void> {
        if (this.processedFiles.has(filepath)) {
            return;
        }

        if (!filepath.endsWith('.json') || !filepath.includes('claude_')) {
            return;
        }

        this.logger.debug(`Claude file changed: ${filepath}`);
        await this.processFile(filepath);
    }

    private async processFile(filepath: string): Promise<void> {
        try {
            const content = fs.readFileSync(filepath, 'utf8');
            const data = JSON.parse(content);

            // Extract message content
            const message = {
                id: path.basename(filepath, '.json'),
                content: data.query || data.message || data.content || JSON.stringify(data),
                timestamp: data.timestamp || Date.now(),
                metadata: {
                    source: 'claude',
                    filepath,
                    originalData: data
                }
            };

            this.logger.info(`Processing Claude message: ${message.content.substring(0, 100)}...`);
            this.messageQueue.addClaudeMessage(message);
            this.processedFiles.add(filepath);

            // Optionally move processed file to archive
            const archivePath = filepath + '.processed';
            fs.renameSync(filepath, archivePath);
            this.logger.debug(`Archived processed file: ${archivePath}`);
        } catch (error) {
            this.logger.error(`Failed to process Claude file: ${filepath}`, error);
        }
    }
}
