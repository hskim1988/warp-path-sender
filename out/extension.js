"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
async function sendToWarp(textToSend) {
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
    (0, child_process_1.exec)(`osascript -e '${appleScript.replace(/'/g, "\\'").replace(/\n/g, "' -e '")}'`, (error) => {
        if (error) {
            vscode.window.showErrorMessage(`Failed to send to Warp: ${error.message}`);
            return;
        }
        vscode.window.showInformationMessage(`Sent to Warp: ${textToSend}`);
    });
}
function getRelativePath(editor) {
    const filePath = editor.document.uri.fsPath;
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    return workspaceFolder
        ? path.relative(workspaceFolder.uri.fsPath, filePath)
        : path.basename(filePath);
}
function activate(context) {
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
        }
        catch (error) {
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
        let textToSend;
        if (!selection.isEmpty) {
            const startLine = selection.start.line + 1;
            const endLine = selection.end.line + 1;
            const lineRange = startLine === endLine ? `#L${startLine}` : `#L${startLine}-${endLine}`;
            textToSend = `@${relativePath}${lineRange}`;
        }
        else {
            textToSend = `@${relativePath}`;
        }
        try {
            await sendToWarp(textToSend);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error: ${error}`);
        }
    });
    context.subscriptions.push(sendPathCommand, sendPathWithLineCommand);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map