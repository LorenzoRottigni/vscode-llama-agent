import * as vscode from 'vscode';
import { LLamaAgent } from '../agents/llama.agent';

export default async () => {
    try {
        const request = await vscode.window.showInputBox({
            prompt: 'Request',
            placeHolder: 'Use imports API instead of require legacy API',
        });
        if (!request) {
            vscode.window.showErrorMessage('[llama-agent]: No request provided, refactor aborted.');
            return;
        }

        const target = (await vscode.window.showInputBox({
            prompt: 'Target',
            placeHolder: '*/**.ts'
        })) || '*';
        if (target === '*') {
            vscode.window.showWarningMessage('[llama-agent]: Matching all files within the current workspace.');
        }

        const agent = new LLamaAgent(request, target);

        await agent.exec();
    } catch(e) {
        console.error(e);
        vscode.window.showErrorMessage(`[llama-agent]: ${e}`);
    }
};