import * as vscode from 'vscode';
import * as fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { buildRefactorRequest, extractMarkdownSections } from '../utils/llama';

export class LLamaAgent {
    constructor(
        private request: string,
        private target = '*',
        private cwd = vscode.workspace.workspaceFolders?.[0].uri.fsPath,
        private llamaModel = 'codellama',
        private ollamaEndpoint = 'http://localhost:11434/api/chat'
    ) {
        
    }

    public async exec() {
        if (!this.cwd){
            vscode.window.showErrorMessage('[llama-agent]: Unable to detect current workspace path, refactor aborted.');
            return;
        }

        const files = await glob(this.target, { cwd: this.cwd });
		if (!files.length) {
			vscode.window.showErrorMessage('[llama-agent]: No files found within the current workspace, refactor aborted.');
            return;
		}

        vscode.window.showInformationMessage(`[llama-agent] Llama refactor matched ${files.length} files`);
		for (const file of files) {
			const fileContent = fs.readFileSync(path.join(this.cwd, file));
            if (fileContent) {
                const res = await fetch(this.ollamaEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: this.llamaModel,
                        messages: [
                            {
                                role: 'user',
                                content: buildRefactorRequest(this.request, fileContent.toString())
                            }
                        ],
                        stream: false
                    })
                });
                const data = await res.json();
                // @ts-expect-error
                const output = extractMarkdownSections(data?.message?.content)?.[0];
                if (output) {
                    fs.writeFileSync(path.join(this.cwd, file), output);
                }
            } else {
                vscode.window.showErrorMessage(`[llama-agent]: unable to retrieve file ${path.join(this.cwd, file)}`);
            }
		}
    }
}