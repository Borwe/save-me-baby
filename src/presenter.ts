import * as vscode from 'vscode';
import { dirGetLastLogMessage, dirIsGit, getParentDir, gitPush, startGitCommit } from './utils';

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
			console.log("PLEASE STARTING SAVE:", file.fsPath)
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
				//get the parent dir of the file
				const parent_dir = getParentDir(doc.uri)
				if(dirIsGit(parent_dir)){
					//if so then go and get last git log
					let lastLog = dirGetLastLogMessage(parent_dir)
					//create git commit
					this.gitCommit(lastLog, doc.uri)
				}
				//Letter have a setting to allow initializing repo incase no git
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
		})
		context.subscriptions.push(disposable);

		this.loaded = true;
    }
}