import * as vscode from "vscode";
import {
  dirGetLastLogMessage,
  dirIsGit,
  doGitMergeAndRebase,
  getParentDir,
  gitPush,
  startGitCommit,
} from "./utils";
import { execSync } from "node:child_process";

interface PresenterInput {
  customCommitMessage: string | undefined;
  ticketRegex: string;
  useTicketRegex: boolean;
  pushOnSave: boolean;
  statusBarItem: vscode.StatusBarItem;
}

export class Presenter {
  private _enabled: boolean = false;
  private loaded: boolean = false;
  private disposableForOnSaveListener: vscode.Disposable | null = null;

  private static instance: Presenter | null = null;
  private customCommitMessage: string | undefined;
  private ticketRegex: string;
  private useTicketRegex: boolean;
  private pushOnSave: boolean;
  private statusBarItem: vscode.StatusBarItem;

  // Hold onSalve listener object
  onSaveListener = false;

  constructor(input: PresenterInput) {
    this.customCommitMessage = input.customCommitMessage;
    this.ticketRegex = input.ticketRegex;
    this.useTicketRegex = input.useTicketRegex;
    this.pushOnSave = input.pushOnSave;
    this.statusBarItem = config.statusBarItem;
  }

  static getInstance(config: PresenterConfig): Presenter {
    if (!Presenter.instance) {
      Presenter.instance = new Presenter(config);
    }
    return Presenter.instance;
  }

  get enabled(): boolean {
    return this._enabled;
  }
  /** Toggle to enable or disable saving */
  toggle() {
    this._enabled = !this._enabled;

    if (this._enabled) {
      this.statusBarItem.text = "$(save) Saving";
    } else {
      this.statusBarItem.text = "$(save) Not Saving";
    }
  }

  gitCommit(logMsg: string | undefined, file: vscode.Uri) {
    //start the git push and commit process here
    if (this._enabled) {
      startGitCommit(logMsg, file, (commitStatus) => {
        if (commitStatus.status === "Comitted") {
          //start git push
          if (this.pushOnSave) {
            gitPush(getParentDir(file));
          }
        } else if (commitStatus.status === "Error") {
          //show popup of error
          vscode.window.showErrorMessage(
            "🤯 Error in commiting: " + commitStatus.error
          );
        }
      });
    }
  }

  setupCommands(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand(
      "save-me-baby.start-saving",
      () => {
        this._enabled = true;
        this.disposableForOnSaveListener =
          vscode.workspace.onDidSaveTextDocument((doc) => {
            if (this._enabled) {
              //get the parent dir of the file
              const parentDir = getParentDir(doc.uri);
              if (dirIsGit(parentDir)) {
                //if so then go and get last git log
                let commitMessage = dirGetLastLogMessage(parentDir);

                // if the user has a custom commit message
                if (this.customCommitMessage !== undefined) {
                  commitMessage = this.customCommitMessage;
                }
                
                // if the user has a ticket regex
                if (this.useTicketRegex && this.ticketRegex !== undefined) {
                  // get the branch that the user has checked out
                  const branches = execSync("git branch -v", {
                    cwd: parentDir.fsPath,
                  }).toString();
                  const currentBranchLineMatches = branches.match(/\* (.*)/);

                  // [WIP] {{ticket}} I Am doing the needful"
                  if (currentBranchLineMatches && currentBranchLineMatches[1]) {
                    const ticketNumberMatches =
                      currentBranchLineMatches[1].match(this.ticketRegex);

                    if (ticketNumberMatches && ticketNumberMatches[1]) {
                      commitMessage = this.customCommitMessage?.replace(
                        "{{ticket}}",
                        ticketNumberMatches[1]
                      );
                    }
                  }
                }

                //create git commit
                this.gitCommit(commitMessage, doc.uri);
              }
              //Letter have a setting to allow initializing repo incase no git
            }
          });
        vscode.window.showInformationMessage("Starting to Save You 😄!");
        return true;
      }
    );
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand(
      "save-me-baby.stop-saving",
      () => {
        this.disposableForOnSaveListener?.dispose();
        this.disposableForOnSaveListener = null;
        this._enabled = false;
        vscode.window.showInformationMessage("Stoping to Save Save you 😥!");
        return true;
      }
    );
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand("save-me-baby.toggle", () => {
      if (this.enabled) {
        this.disposableForOnSaveListener?.dispose();
        this.disposableForOnSaveListener = null;
        vscode.window.showInformationMessage("Stopping to Save Save you 😥!");
      } else {
        vscode.window.showInformationMessage("Starting to Save You 😄!");
      }

      this.toggle();
      return true;
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand(
      "save-me-baby.compress",
      async () => {
        const result = await vscode.window.showInputBox({
          prompt: "Enter the the commit message to use",
          title: "Rebase/Compress message",
        });

        if (result === undefined || result.length === 0) {
          vscode.window.showInformationMessage(
            "SaveMeBaby: Sorry, no commit message provided for compression"
          );
          return;
        }

        //get workspace
        const workspaces = vscode.workspace.workspaceFolders;
        if (workspaces !== undefined && workspaces.length > 0) {
          const workspace = workspaces[0];
          doGitMergeAndRebase(result, workspace.uri, (result) => {
            if (result.pushed === true) {
              vscode.window.showInformationMessage("SaveMeBaby: Push success");
            } else if (result.commited === true && result.pushed === false) {
              vscode.window.showInformationMessage(
                "SaveMeBaby: Commited, but counldn't push pls 'git push -f'"
              );
            } else if (result.error !== undefined) {
              vscode.window.showInformationMessage(
                "SaveMeBaby: Error occured while compressing " + result.error
              );
            }
          });
        } else if (workspaces !== undefined && workspaces?.length > 1) {
          vscode.window.showInformationMessage(
            "SaveMeBaby: Please close all open folders, and stay with one for this to work"
          );
        } else {
          vscode.window.showInformationMessage(
            "SaveMeBaby: Please open a folder before running this."
          );
        }
      }
    );
    context.subscriptions.push(disposable);

    this.loaded = true;
  }
}
