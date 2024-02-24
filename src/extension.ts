// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Presenter } from "./presenter";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  
  // get the config
  const config = vscode.workspace
    .getConfiguration("saveMeBaby");
    
  const customCommitMessage = config.get("commitMessage") as string;
  const ticketRegex = config.get("ticketRegex") as string;
  const useTicketRegex = config.get("useTicketRegex") as boolean;
  
  Presenter.getInstance({
    customCommitMessage,
    ticketRegex,
    useTicketRegex,
  }).setupCommands(context);
  console.log('Congratulations, your extension "save-me-baby" is now active!');
}

// This method is called when your extension is deactivated
export function deactivate() {}
