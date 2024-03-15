import * as vscode from 'vscode';
import * as child_process from 'child_process';

const WDL_TOOLS_CONFIG = 'WDL.formatter.wdlTools';
const FIXER_RB_CONFIG = 'WDL.formatter.fix.rubyRb';
const WDL_LANGUAGE_ID = 'wdl';

export function activate(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand('WDL.formatter.fix.ruby', () => {
        executeCommandForWdlFile(fixRubyCommand);
    });

    vscode.commands.registerCommand('WDL.formatter.check', () => {
        executeCommandForWdlFile(checkCommand);
    });

    vscode.commands.registerCommand('WDL.formatter.upgrade', () => {
        executeCommandForWdlFile(upgradeCommand);
    });

    vscode.languages.registerDocumentFormattingEditProvider('wdl', {
        provideDocumentFormattingEdits: formatWdlDocument
    });
}

async function executeCommandForWdlFile(command: (uri: vscode.Uri) => Promise<void>) {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor || activeEditor.document.languageId !== WDL_LANGUAGE_ID) {
        return;
    }

    try {
        await command(activeEditor.document.uri);
    } catch (error) {
        handleCommandError(error);
    }
}

async function fixRubyCommand(uri: vscode.Uri) {
    const document = vscode.workspace.textDocuments.find(doc => doc.uri === uri);
    if (!document) {
        return;
    }

    const fixerRbLocation = vscode.workspace.getConfiguration(FIXER_RB_CONFIG).get('location');
    const outputPath = `${uri.fsPath}_`;
    await executeChildProcess(`${fixerRbLocation} "${uri.fsPath}" > "${outputPath}"`);
    await executeChildProcess(`mv "${outputPath}" "${uri.fsPath}"`);
}

async function checkCommand(uri: vscode.Uri) {
    const wdlToolsJarLocation = vscode.workspace.getConfiguration(WDL_TOOLS_CONFIG).get('location');
    const outputChannel = vscode.window.createOutputChannel("WDL Formatter");
    outputChannel.show();

    try {
        const out = await executeChildProcess(`java -jar ${wdlToolsJarLocation} check "${uri.fsPath}"`);
        outputChannel.append(out);
    } catch (error) {
        handleCommandError(error);
    }
}

async function upgradeCommand(uri: vscode.Uri) {
    const wdlToolsJarLocation = vscode.workspace.getConfiguration(WDL_TOOLS_CONFIG).get('location');
    try {
        const out = await executeChildProcess(`java -jar ${wdlToolsJarLocation} upgrade --nofollow-imports "${uri.fsPath}"`);
        const edit = new vscode.WorkspaceEdit();
        edit.replace(uri, getWholeDocumentRange(uri), out);
        vscode.workspace.applyEdit(edit);
    } catch (error) {
        handleCommandError(error);
    }
}

async function formatWdlDocument(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
    const wdlToolsLocation = vscode.workspace.getConfiguration('WDL.formatter.wdlTools').get('location');
    try {
        let out = await executeChildProcess(`java -jar ${wdlToolsLocation} format --nofollow-imports "${document.uri.fsPath}"`);
        out = formatBashCommand(out);
        return [vscode.TextEdit.replace(getWholeDocumentRange(document.uri), out)];
    } catch (error) {
        handleCommandError(error);
        return [];
    }
}

function executeChildProcess(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        child_process.exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout.toString());
            }
        });
    });
}

function formatBashCommand(output: string): string {
	const commandRegExp = new RegExp('([ \t]*)command +<{3}([^]+)>{3}', 'mg');
    const bashCommand = commandRegExp.exec(output);

    if (bashCommand) {
        let formattedBash = child_process.execSync('shfmt', { input: bashCommand[2] }).toString();

        formattedBash = '        ' + formattedBash.replace(/\t/g, '    ')
			.replace(/\n/g, '\n        ')
			.replace(/\$/g, '$$$');
        output = output.replace(/([ \t]*)command +<{3}([^]+)>{3}/mg, '    command <<<\n' + formattedBash + '\n    >>>');
    }
    return output;
}

function getWholeDocumentRange(uri: vscode.Uri): vscode.Range {
    const document = vscode.workspace.textDocuments.find(doc => doc.uri === uri);
    if (!document) {
        return new vscode.Range(0, 0, 0, 0);
    }
    const firstLine = document.lineAt(0);
    const lastLine = document.lineAt(document.lineCount - 1);
    return new vscode.Range(firstLine.range.start, lastLine.range.end);
}

function handleCommandError(error: unknown) {
    const message = getErrorMessage(error);
    vscode.window.showErrorMessage(message);
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return 'Library formatting error: ' + error.message.split("\n")[2];
    }
    return 'Unknown Error';
}

export function deactivate() {
    console.log('WDL formatting deactivated');
}
