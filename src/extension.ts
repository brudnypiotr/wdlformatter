import * as vscode from 'vscode';
import * as child_process from 'child_process';

const WDL_TOOLS_CONFIG = 'WDL.formatter.wdlTools';
const FIXER_RB_CONFIG = 'WDL.formatter.fixerRb';
const WDL_LANGUAGE_ID = 'wdl';

export function activate(context: vscode.ExtensionContext) {
	console.log('WDL formatting activated');

	vscode.commands.registerCommand('WDL.formatter.fixer', () => {
		const { activeTextEditor } = vscode.window;

		if (activeTextEditor && activeTextEditor.document.languageId === WDL_LANGUAGE_ID) {
			const { document } = activeTextEditor;

			const fixerRbLocation = vscode.workspace.getConfiguration(FIXER_RB_CONFIG).get('location');

			child_process.execSync(`${fixerRbLocation} ${document.uri.path} > ${document.uri.path}_`);
			child_process.execSync(`mv ${document.uri.path}_ ${document.uri.path}`);
		}
	});

	vscode.commands.registerCommand('WDL.formatter.upgradedupa', () => {
		const { activeTextEditor } = vscode.window;

		if (activeTextEditor && activeTextEditor.document.languageId === WDL_LANGUAGE_ID) {
			const { document } = activeTextEditor;

			const wholeDocumentRange = getWholeDocumentRange(document);
			const wdlToolsJarLocation = vscode.workspace.getConfiguration(WDL_TOOLS_CONFIG).get('location');

			try {
				const out = child_process.execSync(`java -jar ${wdlToolsJarLocation} upgrade --nofollow-imports ${document.uri.path}`);
				const edit = new vscode.WorkspaceEdit();

				edit.replace(document.uri, wholeDocumentRange, out.toString());

				return vscode.workspace.applyEdit(edit);
			} catch (error) {
				reportErrorNoUpgrade({ message: getErrorMessage(error) });
			}
		}

		function getWholeDocumentRange(document: vscode.TextDocument) {
			const firstLine = document.lineAt(0);
			const lastLine = document.lineAt(document.lineCount - 1);

			const allTextRange = new vscode.Range(
				0,
				firstLine.range.start.character,
				document.lineCount - 1,
				lastLine.range.end.character
			);

			return allTextRange;
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
				let out = child_process.execSync(`java -jar ${wdlToolsLocation} format --nofollow-imports ${document.uri.path}`).toString();

				const commandRegExp = new RegExp('([ \t]*)command +<{3}([^]+)>{3}', 'mg');
				const bashCommand = commandRegExp.exec(out);

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
				const message = getErrorMessage(error);

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
