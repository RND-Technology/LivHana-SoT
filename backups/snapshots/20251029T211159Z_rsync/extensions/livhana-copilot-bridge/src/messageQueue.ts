import { Logger } from './logger';

type MessageHandler = (message: any) => Promise<void>;

export class MessageQueue {
    private claudeHandlers: MessageHandler[] = [];
    private copilotHandlers: MessageHandler[] = [];
    private claudeQueue: any[] = [];
    private copilotQueue: any[] = [];
    private processing: boolean = false;

    constructor(private logger: Logger) {}

    onClaudeMessage(handler: MessageHandler): void {
        this.claudeHandlers.push(handler);
        this.logger.debug('Registered Claude message handler');
    }

    onCopilotMessage(handler: MessageHandler): void {
        this.copilotHandlers.push(handler);
        this.logger.debug('Registered Copilot message handler');
    }

    addClaudeMessage(message: any): void {
        this.logger.debug(`Adding Claude message to queue: ${message.id}`);
        this.claudeQueue.push(message);
        this.processQueues();
    }

    addCopilotMessage(message: any): void {
        this.logger.debug(`Adding Copilot message to queue: ${message.id}`);
        this.copilotQueue.push(message);
        this.processQueues();
    }

    private async processQueues(): Promise<void> {
        if (this.processing) {
            return;
        }

        this.processing = true;

        try {
            // Process Claude messages
            while (this.claudeQueue.length > 0) {
                const message = this.claudeQueue.shift();
                if (message) {
                    await this.processClaudeMessage(message);
                }
            }

            // Process Copilot messages
            while (this.copilotQueue.length > 0) {
                const message = this.copilotQueue.shift();
                if (message) {
                    await this.processCopilotMessage(message);
                }
            }
        } catch (error) {
            this.logger.error('Error processing message queues', error);
        } finally {
            this.processing = false;
        }
    }

    private async processClaudeMessage(message: any): Promise<void> {
        this.logger.debug(`Processing Claude message: ${message.id}`);
        for (const handler of this.claudeHandlers) {
            try {
                await handler(message);
            } catch (error) {
                this.logger.error('Claude message handler error', error);
            }
        }
    }

    private async processCopilotMessage(message: any): Promise<void> {
        this.logger.debug(`Processing Copilot message: ${message.id}`);
        for (const handler of this.copilotHandlers) {
            try {
                await handler(message);
            } catch (error) {
                this.logger.error('Copilot message handler error', error);
            }
        }
    }

    getQueueSizes(): { claude: number; copilot: number } {
        return {
            claude: this.claudeQueue.length,
            copilot: this.copilotQueue.length
        };
    }
}
