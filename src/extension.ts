import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';

async function sendToWarp(textToSend: string): Promise<void> {
    await vscode.env.clipboard.writeText(textToSend);

    const appleScript = `
        tell application "Warp" to activate
        delay 0.2
        tell application "System Events"
            tell process "Warp"
                click menu item "Paste" of menu "Edit" of menu bar 1
            end tell
        end tell
    `;

    exec(`osascript -e '${appleScript.replace(/'/g, "\\'").replace(/\n/g, "' -e '")}'`, (error) => {
        if (error) {
            vscode.window.showErrorMessage(`Failed to send to Warp: ${error.message}`);
            return;
        }
        vscode.window.showInformationMessage(`Sent to Warp: ${textToSend}`);
    });
}

function getRelativePath(editor: vscode.TextEditor): string {
    const filePath = editor.document.uri.fsPath;
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    return workspaceFolder
        ? path.relative(workspaceFolder.uri.fsPath, filePath)
        : path.basename(filePath);
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Warp Path Sender is now active!');

    // 기존 커맨드: 파일 경로만 전송
    const sendPathCommand = vscode.commands.registerCommand('warp-path-sender.sendToWarp', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }

        const relativePath = getRelativePath(editor);
        const textToSend = `@${relativePath}`;

        try {
            await sendToWarp(textToSend);
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error}`);
        }
    });

    // 새 커맨드: 파일 경로 + 라인 범위 전송
    const sendPathWithLineCommand = vscode.commands.registerCommand('warp-path-sender.sendToWarpWithLine', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }

        const relativePath = getRelativePath(editor);
        const selection = editor.selection;
        let textToSend: string;

        if (!selection.isEmpty) {
            const startLine = selection.start.line + 1;
            const endLine = selection.end.line + 1;
            const lineRange = startLine === endLine ? `#L${startLine}` : `#L${startLine}-${endLine}`;
            textToSend = `@${relativePath}${lineRange}`;
        } else {
            textToSend = `@${relativePath}`;
        }

        try {
            await sendToWarp(textToSend);
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error}`);
        }
    });

    context.subscriptions.push(sendPathCommand, sendPathWithLineCommand);
}

export function deactivate() {}
