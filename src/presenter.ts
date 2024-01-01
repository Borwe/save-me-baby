import * as vscode from 'vscode';

export class Presnter {
    private _enabled: boolean = false
	currentGitted: Promise<void> | null = null
	private loaded = false;

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
			vscode.window.showInformationMessage('Starting to Save You 😄!');
			PRESENTER.toggle()
			return true;
		});
		context.subscriptions.push(disposable);
		disposable = vscode.commands.registerCommand('save-me-baby.stop-saving', () => {
			vscode.window.showInformationMessage('Stoping to Save Save you 😥!');
			PRESENTER.toggle()
			return true;
		});
		context.subscriptions.push(disposable);

		disposable = vscode.commands.registerCommand('save-me-baby.toggle', () => {
			vscode.window.showInformationMessage('Stoping to Save Save you 😥!');
			PRESENTER.toggle()
			return true;
		});
		context.subscriptions.push(disposable);

		this.loaded = true;
    }
}

const PRESENTER: Presnter = new Presnter()
export default PRESENTER