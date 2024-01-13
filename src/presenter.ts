import * as vscode from 'vscode';
import { dirGetLastLogMessage, dirIsGit, doGitMergeAndRebase, getParentDir, gitPush, startGitCommit } from './utils';

export class Presenter {
    private _enabled: boolean = false
	private disposableForOnSaveListener: vscode.Disposable | null = null
	private loaded = false;

	private static instance: Presenter | null = null 

	// Hold onSalve listener object
	onSaveListener = false;

	static getInstance(): Presenter {
		if(!Presenter.instance){
			Presenter.instance = new Presenter()
		}
		return Presenter.instance
	}

    get enabled(): boolean { return this._enabled } 
    /** Toggle to enable or disable saving */
    toggle(){
        this._enabled = !this._enabled
    }

	gitCommit(logMsg: string | undefined, file: vscode.Uri){
		//start the git push and commit process here
		if(this._enabled){
			startGitCommit(logMsg, file, (commitStatus)=>{
				if(commitStatus.status === "Comitted"){
					//start git push
					gitPush(getParentDir(file))
				}else if(commitStatus.status === "Error"){
					//show popup of error
					vscode.window.showErrorMessage("🤯 Error in commiting: "+commitStatus.error)
				}
			})
		}
	}

    setupCommands(context: vscode.ExtensionContext){

		let disposable = vscode.commands.registerCommand('save-me-baby.start-saving', () => {
			this._enabled=true;
			this.disposableForOnSaveListener = vscode.workspace.onDidSaveTextDocument((doc)=>{
				if(this._enabled){
					//get the parent dir of the file
					const parent_dir = getParentDir(doc.uri)
					if(dirIsGit(parent_dir)){
						//if so then go and get last git log
						let lastLog = dirGetLastLogMessage(parent_dir)
						//create git commit
						this.gitCommit(lastLog, doc.uri)
					}
					//Letter have a setting to allow initializing repo incase no git
				}
			})
			vscode.window.showInformationMessage('Starting to Save You 😄!');
			return true;
		});
		context.subscriptions.push(disposable);
		disposable = vscode.commands.registerCommand('save-me-baby.stop-saving', () => {
			this.disposableForOnSaveListener?.dispose()
			this.disposableForOnSaveListener = null
			this._enabled=false;
			vscode.window.showInformationMessage('Stoping to Save Save you 😥!');
			return true;
		});
		context.subscriptions.push(disposable);

		disposable = vscode.commands.registerCommand('save-me-baby.toggle', () => {
			this.toggle()
			if(this.enabled){
				this.disposableForOnSaveListener?.dispose()
				this.disposableForOnSaveListener = null
				vscode.window.showInformationMessage('Stoping to Save Save you 😥!');
			}else{
				vscode.window.showInformationMessage('Starting to Save You 😄!');
			}
			return true;
		});
		context.subscriptions.push(disposable);

		disposable = vscode.commands.registerCommand("save-me-baby.compress", async ()=>{
			const result = await vscode.window.showInputBox({
				prompt: "Enter the the commit message to use",
				title: "Rebase/Compress message"
			})

			if(result === undefined || result.length === 0 ){
				vscode.window.showInformationMessage("SaveMeBaby: Sorry, no commit message provided for compression")
				return;
			}

			//get workspace
			const workspaces = vscode.workspace.workspaceFolders
			if( workspaces!== undefined && workspaces.length>0){
				const workspace = workspaces[0]
				doGitMergeAndRebase(result, workspace.uri,(result)=>{
					if(result.pushed===true){
						vscode.window.showInformationMessage("SaveMeBaby: Push success")
					}else if(result.commited===true && result.pushed===false){
						vscode.window.showInformationMessage("SaveMeBaby: Commited, but counldn't push pls 'git push -f'")
					}else if(result.error !== undefined){
						vscode.window.showInformationMessage("SaveMeBaby: Error occured while compressing "+result.error)
					}
				})
			}else if(workspaces!== undefined && workspaces?.length > 1){
				vscode.window.showInformationMessage("SaveMeBaby: Please close all open folders, and stay with one for this to work")
			}else{
				vscode.window.showInformationMessage("SaveMeBaby: Please open a folder before running this.")
			}
		})
		context.subscriptions.push(disposable);

		this.loaded = true;
    }
}