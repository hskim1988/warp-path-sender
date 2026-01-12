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
function activate(context) {
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
            (0, child_process_1.exec)(`osascript -e '${appleScript.replace(/'/g, "\\'").replace(/\n/g, "' -e '")}'`, (error) => {
                if (error) {
                    vscode.window.showErrorMessage(`Failed to send to Warp: ${error.message}`);
                    return;
                }
                vscode.window.showInformationMessage(`Sent to Warp: ${textToSend}`);
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error: ${error}`);
        }
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map