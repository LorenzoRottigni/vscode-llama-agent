import * as vscode from 'vscode';
import refactorCommand from './lib/commands/refactor.command';

export function activate(context: vscode.ExtensionContext) {
	console.log('loaded llama agent');
	const disposable = vscode.commands.registerCommand('llama-agent.refactor', refactorCommand);
	context.subscriptions.push(disposable);
}

export function deactivate() {}
