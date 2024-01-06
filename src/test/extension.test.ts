import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import PRESENTER from '../presenter';
import path, { resolve } from 'path';
import * as fs from 'fs';
import { CommitStatus } from '../utils';
// import * as myExtension from '../../extension';

async function writeToFile(content: string, file: vscode.Uri){
	await vscode.workspace.fs.writeFile(file, Buffer.from(content))
	const doc = await vscode.workspace.openTextDocument(file)
	const editor = await vscode.window.showTextDocument(doc)
	await editor.edit((e)=>{
		e.insert(new vscode.Position(0,100),"YEEEEEEEHHHH WWOOOOOOOOOOOOOOOOOH")
	})
	await editor.document.save()
	console.log("File at: ",file.fsPath);
}

suite('Test commands', () => {

	let test_dir = path.join(__dirname,"../../test_dir")
	suiteSetup(async ()=>{
		try{
			console.log("DIR CREATION", test_dir)
			fs.mkdirSync(test_dir);
		}catch(error){}
		await vscode.extensions.getExtension("borwe.save-me-baby")!.activate()
	})


	test("turning start_saving on and see if it works", async ()=>{
		let result = await vscode.commands.executeCommand('save-me-baby.start-saving')
		assert.strictEqual(result, true)

		//emit an open command to open new file
		const file = vscode.Uri.file(path.join(test_dir,"test.txt"))
		//write some text to it and save the current file
		await writeToFile("Hello", file);

		//when here means there must be a new Promise in currentGitted 
		//for saving the file and executing git cmd, check it
		//exists
		assert.notEqual(PRESENTER.currentGitted, undefined)
		const commitResult = await PRESENTER.currentGitted!
		assert.strictEqual(commitResult.status,"Comitted")
	})
});
