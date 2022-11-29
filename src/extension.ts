'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as child_process from "child_process";
import { stringify } from 'querystring';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('WDL formatting activated');

	vscode.commands.registerCommand('WDL.formatter.upgrade', () => {
		const { activeTextEditor } = vscode.window;

		if (activeTextEditor && activeTextEditor.document.languageId === 'wdl') {
			const { document } = activeTextEditor;
			const firstLine = document.lineAt(0);
			const lastLine = document.lineAt(document.lineCount - 1);

			const allTextRange = new vscode.Range(
				0,
				firstLine.range.start.character,
				document.lineCount - 1,
				lastLine.range.end.character
			);

			const wdlToolsLocation = vscode.workspace.getConfiguration('WDL.formatter.wdlTools').get('location');

			try {
				let out = child_process.execSync('java -jar ' + wdlToolsLocation + ' upgrade --nofollow-imports ' + document.uri.path);

				const edit = new vscode.WorkspaceEdit();
				edit.replace(document.uri, allTextRange, out.toString());
				return vscode.workspace.applyEdit(edit);

			} catch (error) {
				reportErrorNoUpgrade({ message: getErrorMessage(error) });
			}
		}
	});

	vscode.languages.registerDocumentFormattingEditProvider('wdl', {
		provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
			const firstLine = document.lineAt(0);
			const lastLine = document.lineAt(document.lineCount - 1);

			const allTextRange = new vscode.Range(
				0,
				firstLine.range.start.character,
				document.lineCount - 1,
				lastLine.range.end.character
			);

			const wdlToolsLocation = vscode.workspace.getConfiguration('WDL.formatter.wdlTools').get('location');

			try {
				let out = child_process.execSync('java -jar ' + wdlToolsLocation + ' format --nofollow-imports ' + document.uri.path).toString();

				let commandRegExp = new RegExp('([ \t]*)command +<{3}([^]+)>{3}', 'mg');
				let bashCommand = commandRegExp.exec(out);

				if (bashCommand) {
					let outBash = child_process.execSync('shfmt', { input: bashCommand[2] }).toString();
					outBash = '        ' + outBash;
					outBash = outBash.replace(/\t/g, '    ');
					outBash = outBash.replace(/\n/g, '\n        ');
					outBash = outBash.replace(/\$/g, '$$$');

					out = out.replace(/([ \t]*)command +<{3}([^]+)>{3}/mg, '    command <<<\n' + outBash.toString() + '\n    >>>');
				}

				return [vscode.TextEdit.replace(allTextRange, out)];
			} catch (error) {
				let message = getErrorMessage(error);

				if (message.includes('WDL version Draft_2 is not supported')) {
					reportError({ message }).then(result => {
						if (result) {
							vscode.commands.executeCommand('WDL.formatter.upgrade');
						}
					});
				} else {
					reportErrorNoUpgrade({ message });
				}

				return [];
			}
		}
	});

}

const reportError = ({ message }: { message: string }) => {
	return vscode.window.showErrorMessage(message, 'Perform file upgrade');
};

const reportErrorNoUpgrade = ({ message }: { message: string }) => {
	vscode.window.showErrorMessage(message);
};

function getErrorMessage(error: unknown) {
	let message = 'Unknown Error';
	if (error instanceof Error) {
		message = 'Library formatting error: ';
		let details = error.message.split("\n")[2];
		message += details;
	}

	return message;
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('WDL formatting deactivated');
}
