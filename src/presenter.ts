import * as vscode from 'vscode';
import { dirIsGit, getParentDir } from './utils';

export class Presnter {
    private _enabled: boolean = false
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

    setupCommands(context: vscode.ExtensionContext){

		let disposable = vscode.commands.registerCommand('save-me-baby.start-saving', () => {
			this._enabled=true;
			vscode.workspace.onDidSaveTextDocument((doc)=>{
				//get the parent dir of the file
				const parent_dir = getParentDir(doc.uri)
				if(dirIsGit(parent_dir)){
					//if so then go and get last git log
				}
			})
			vscode.window.showInformationMessage('Starting to Save You 😄!');
			return true;
		});
		context.subscriptions.push(disposable);
		disposable = vscode.commands.registerCommand('save-me-baby.stop-saving', () => {
			this._enabled=false;
			vscode.window.showInformationMessage('Stoping to Save Save you 😥!');
			return true;
		});
		context.subscriptions.push(disposable);

		disposable = vscode.commands.registerCommand('save-me-baby.toggle', () => {
			PRESENTER.toggle()
			if(PRESENTER.enabled){
				vscode.window.showInformationMessage('Starting to Save You 😄!');
			}else{
				vscode.window.showInformationMessage('Stoping to Save Save you 😥!');
			}
			return true;
		});
		context.subscriptions.push(disposable);

		this.loaded = true;
    }
}

const PRESENTER: Presnter = new Presnter()
export default PRESENTER