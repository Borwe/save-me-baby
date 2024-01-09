import * as vscode from 'vscode';
import { CommitFunction, CommitStatus, dirGetLastLogMessage, dirIsGit, getParentDir, startGitCommit } from './utils';

export class Presenter {
    private _enabled: boolean = false
	private disposableForOnSaveListener: vscode.Disposable | null = null
	promises: Array<Promise<CommitStatus>> = new Array()
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

	gitCommit(logMsg: string | undefined, dir: vscode.Uri){
		//start the git push and commit process here
		if(this._enabled){
			const pos = this.promises.length
			this.promises.push(new Promise((resolve)=>{
				console.log("PLEASE STARTING SAVE:", dir.fsPath)
				startGitCommit(logMsg, dir, resolve)
				if(pos>0){
					this.promises.splice(pos-1,1)
				}else{
					this.promises = new Array()
				}
			}))
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

		this.loaded = true;
    }
}