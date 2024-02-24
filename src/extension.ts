// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Presenter } from "./presenter";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const customCommitMessage: string | undefined = vscode.workspace
    .getConfiguration("saveMeBaby")
    .get("commitMessage");

  const ticketRegex = vscode.workspace
    .getConfiguration("saveMeBaby")
    .get("ticketRegex") as string;

  Presenter.getInstance({
    customCommitMessage,
    ticketRegex
  }).setupCommands(context);
  console.log('Congratulations, your extension "save-me-baby" is now active!');
}

// This method is called when your extension is deactivated
export function deactivate() {}
