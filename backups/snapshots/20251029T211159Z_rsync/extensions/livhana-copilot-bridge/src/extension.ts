import * as vscode from 'vscode';
import { BridgeManager } from './bridgeManager';
import { Logger } from './logger';

let bridgeManager: BridgeManager | undefined;
let statusBarItem: vscode.StatusBarItem;
let logger: Logger;

export function activate(context: vscode.ExtensionContext) {
    logger = new Logger('LivHana-Bridge');
    logger.info('LivHana Copilot Bridge extension activating...');

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    statusBarItem.command = 'livhana-copilot-bridge.status';
    context.subscriptions.push(statusBarItem);
    updateStatusBar('stopped');

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('livhana-copilot-bridge.start', async () => {
            await startBridge(context);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('livhana-copilot-bridge.stop', async () => {
            await stopBridge();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('livhana-copilot-bridge.status', async () => {
            showStatus();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('livhana-copilot-bridge.sendToCopilot', async (query?: string) => {
            await sendToCopilot(query);
        })
    );

    // Auto-start if configured
    const config = vscode.workspace.getConfiguration('livhanaCopilotBridge');
    if (config.get<boolean>('autoStart', false)) {
        logger.info('Auto-start enabled, starting bridge...');
        startBridge(context);
    }

    logger.info('LivHana Copilot Bridge extension activated successfully');
}

async function startBridge(context: vscode.ExtensionContext) {
    if (bridgeManager) {
        vscode.window.showWarningMessage('Bridge is already running');
        return;
    }

    try {
        logger.info('Starting bridge manager...');
        bridgeManager = new BridgeManager(context, logger);
        await bridgeManager.start();
        updateStatusBar('running');
        vscode.window.showInformationMessage('LivHana Copilot Bridge started successfully');
    } catch (error) {
        logger.error('Failed to start bridge', error);
        vscode.window.showErrorMessage(`Failed to start bridge: ${error}`);
        updateStatusBar('error');
    }
}

async function stopBridge() {
    if (!bridgeManager) {
        vscode.window.showWarningMessage('Bridge is not running');
        return;
    }

    try {
        logger.info('Stopping bridge manager...');
        await bridgeManager.stop();
        bridgeManager = undefined;
        updateStatusBar('stopped');
        vscode.window.showInformationMessage('LivHana Copilot Bridge stopped');
    } catch (error) {
        logger.error('Failed to stop bridge', error);
        vscode.window.showErrorMessage(`Failed to stop bridge: ${error}`);
    }
}

async function sendToCopilot(query?: string) {
    if (!query) {
        query = await vscode.window.showInputBox({
            prompt: 'Enter message to send to Copilot',
            placeHolder: 'Type your message here...'
        });
    }

    if (!query) {
        return;
    }

    try {
        logger.info(`Sending to Copilot: ${query.substring(0, 100)}...`);
        await vscode.commands.executeCommand('workbench.action.chat.open', { query });
        vscode.window.showInformationMessage('Message sent to Copilot');
    } catch (error) {
        logger.error('Failed to send to Copilot', error);
        vscode.window.showErrorMessage(`Failed to send to Copilot: ${error}`);
    }
}

function showStatus() {
    const config = vscode.workspace.getConfiguration('livhanaCopilotBridge');
    const status = bridgeManager ? 'Running' : 'Stopped';
    const stats = bridgeManager?.getStats() || {
        messagesToCopilot: 0,
        messagesFromCopilot: 0,
        errors: 0
    };

    const message = `
LivHana Copilot Bridge Status:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: ${status}
Messages to Copilot: ${stats.messagesToCopilot}
Messages from Copilot: ${stats.messagesFromCopilot}
Errors: ${stats.errors}

Configuration:
Claude Output: ${config.get('claudeOutputDir')}
Copilot Sessions: ${config.get('copilotSessionDir')}
Bridge Output: ${config.get('bridgeOutputDir')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    vscode.window.showInformationMessage(message, { modal: true });
}

function updateStatusBar(state: 'running' | 'stopped' | 'error') {
    switch (state) {
        case 'running':
            statusBarItem.text = '$(rocket) Bridge Active';
            statusBarItem.backgroundColor = undefined;
            statusBarItem.tooltip = 'LivHana Copilot Bridge is running. Click for status.';
            break;
        case 'stopped':
            statusBarItem.text = '$(debug-pause) Bridge Stopped';
            statusBarItem.backgroundColor = undefined;
            statusBarItem.tooltip = 'LivHana Copilot Bridge is stopped. Click for status.';
            break;
        case 'error':
            statusBarItem.text = '$(error) Bridge Error';
            statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
            statusBarItem.tooltip = 'LivHana Copilot Bridge encountered an error. Click for status.';
            break;
    }
    statusBarItem.show();
}

export function deactivate() {
    logger?.info('Deactivating extension...');
    if (bridgeManager) {
        bridgeManager.stop();
    }
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    logger?.info('Extension deactivated');
}
