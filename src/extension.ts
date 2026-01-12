import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('Warp Path Sender is now active!');

    const disposable = vscode.commands.registerCommand('warp-path-sender.sendToWarp', async () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }

        // 활성 파일의 절대 경로 가져오기
        const filePath = editor.document.uri.fsPath;

        // workspace 기준 상대 경로 계산
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        const relativePath = workspaceFolder
            ? path.relative(workspaceFolder.uri.fsPath, filePath)
            : path.basename(filePath);

        // @상대경로 형식으로 텍스트 생성
        const textToSend = `@${relativePath}`;

        try {
            // 클립보드에 복사
            await vscode.env.clipboard.writeText(textToSend);

            // AppleScript로 Warp 활성화 후 붙여넣기
            const appleScript = `
                tell application "Warp" to activate
                delay 0.3
                tell application "System Events" to keystroke "v" using command down
            `;

            exec(`osascript -e '${appleScript.replace(/'/g, "\\'").replace(/\n/g, "' -e '")}'`, (error) => {
                if (error) {
                    vscode.window.showErrorMessage(`Failed to send to Warp: ${error.message}`);
                    return;
                }
                vscode.window.showInformationMessage(`Sent to Warp: ${textToSend}`);
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
