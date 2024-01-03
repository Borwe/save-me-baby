import * as vscode from 'vscode';
import { dirGetLastLogMessage, dirIsGit, getParentDir, startGitCommit } from './utils';
import { log } from 'console';

export class Presnter {
    private _enabled: boolean = false
	private disposableForOnSaveListener: vscode.Disposable | null = null
	currentGitted: Promise<void> | null = null
	private loaded = false;

	// Hold onSalve listener object
	onSaveListener = false;

    get enabled(): boolean { return this._enabled } 
    /** Toggle to enable or disable saving */
    toggle(){
        this._enabled = !this._enabled
    }

	async waitTillCommandsSetup(){
		while(!this.loaded){
			await new Promise((resolve)=>{
				setTimeout(()=>{},100)
			})
		}
	}

	gitCommit(logMsg: string | undefined){
		//if logMsg is undefined, show a message telling user
		// you going to use git message of "First commit"
		//then go ahead and save
		if(logMsg===undefined){
			logMsg = "First Commit"
		}
		//start the git push and commit process here
		startGitCommit(logMsg!)
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
					PRESENTER.gitCommit(lastLog)
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
			PRESENTER.toggle()
			if(PRESENTER.enabled){
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

const PRESENTER: Presnter = new Presnter()
export default PRESENTER