// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "llama-agent" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('llama-agent.helloWorld', async (...args) => {
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

			const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
			if (!workspaceFolder){
				vscode.window.showErrorMessage('[llama-agent]: Unable to detect current workspace path, refactor aborted.');
				return;
			}

			const files = await glob(target, { cwd: workspaceFolder });
			if (!files.length) {
				vscode.window.showErrorMessage('[llama-agent]: No files found within the current workspace, refactor aborted.');
				return;
			}

			vscode.window.showInformationMessage(`[llama-agent] Llama refactor matched ${files.length} files`);

			const fileContent = fs.readFileSync(path.join(workspaceFolder, files[0]));
			const content = `
				Apply the following request:
				${request}
				to the following file:
				${fileContent}
			`;

			vscode.window.showInformationMessage(content);
			const res = await fetch('http://localhost:11434/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'codellama',
					messages: [
						{
							role: 'user',
							content
						}
					],
					stream: false
				})
			});
			const data = await res.json();
			// @ts-expect-error
			vscode.window.showInformationMessage(data?.message?.content);

			/* for (const file of files) {
				const fileContent = fs.readFileSync(file);

				const content = `
					Apply the following request:
					${request}
					to the following file:
					${fileContent}
				`;

				const res = await fetch('http://localhost:11434/api/chat', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						model: 'codellama',
						messages: [
							{
								role: 'user',
								content
							}
						],
						stream: false
					})
				});

				const data = await res.json();
				vscode.window.showInformationMessage(data?.message?.content);
			} */
		} catch(e) {
			console.error(e);
			vscode.window.showErrorMessage(`[llama-agent]: ${e}`);
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
