import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import PRESENTER from '../presenter';
import path, { resolve } from 'path';
import * as fs from 'fs';
// import * as myExtension from '../../extension';

async function writeToFile(content: string, file: vscode.Uri){
	vscode.workspace.fs.writeFile(file, Buffer.from(content))
	console.log("File at: ",file);
}

suite('Test commands', () => {

	let test_dir = path.join(process.cwd(),"../../test_dir")
	suiteSetup(async ()=>{
		try{
			console.log("DIR CREATION", test_dir)
			fs.mkdirSync(test_dir);
		}catch(error){}
		await vscode.extensions.getExtension("borwe.save-me-baby")!.activate()
	})


	test("turning start_saving on and see if it works", async ()=>{
		let result = await vscode.commands.executeCommand("save-me-baby.start-saving")
		assert.strictEqual(result, true)

		//get the current promise, it should be null
		assert.strictEqual(PRESENTER.currentGitted, null, "Current getter should be null")

		//emit an open command to open new file
		const file = vscode.Uri.file(path.join(test_dir,"test.txt"))
		//write some text to it and save the current file
		await writeToFile("Hello", file);
		await new Promise((resolve)=>{
			setTimeout(resolve,100)
		});

		//when here means there must be a new Promise in currentGitted 
		//for saving the file and executing git cmd, check it
		//exists
		assert.notStrictEqual(PRESENTER.currentGitted, null, "Current getter should not be null")
	})
});
