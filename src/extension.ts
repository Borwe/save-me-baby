// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import PRESENTER from './presenter';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "save-me-baby" is now active!');

	let disposable = vscode.commands.registerCommand('save-me-baby.start-saving', () => {
		vscode.window.showInformationMessage('Starting to Save You 😄!');
		PRESENTER.toggle()
	});
	context.subscriptions.push(disposable);
	disposable = vscode.commands.registerCommand('save-me-baby.stop-saving', () => {
		vscode.window.showInformationMessage('Stoping to Save Save you 😥!');
		PRESENTER.toggle()
	});
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
