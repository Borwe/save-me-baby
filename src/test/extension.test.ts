import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import path from 'path';
import { CommitStatus, dirGetLastLogMessageCode } from '../utils';
import { CallBackCompleteStatus, createTestDir, deleteDir, getOrCreateNoCommitDir } from './utils_for_tests';
import { Presenter } from '../presenter';
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

	test("turning start_saving on and try saving on a none-git repo, it should not start commit", async ()=>{
		await vscode.extensions.getExtension("borwe.save-me-baby")!.activate()
		const test_dir = createTestDir("test_dir")
		let result = await vscode.commands.executeCommand('save-me-baby.start-saving')
		assert.strictEqual(result, true)

		//emit an open command to open new file
		const file = vscode.Uri.file(path.join(test_dir.fsPath,"test.txt"))
		//get size of promises
		const length = Presenter.getInstance().promises.length
		//write some text to it and save the current file
		await writeToFile("Hello", file);
		const commitStatus = await Presenter.getInstance().promises[length]

		//when here means there must be a new Promise in currentGitted 
		//for saving the file and executing git cmd, check it
		//exists
		assert.equal(commitStatus!.status, "None" )

		deleteDir(test_dir)
	})


	test("turning start_saving on and try saving on a repo, it finish commit", async ()=>{
		await vscode.extensions.getExtension("borwe.save-me-baby")!.activate()
		const result = await vscode.commands.executeCommand('save-me-baby.start-saving')
		assert.strictEqual(result, true)

		//create testdir as git repo
		const dir = getOrCreateNoCommitDir()
		assert.notEqual(dir, undefined, "Dir shouldn't be undefined")

		//emit an open command to open new file
		const file = vscode.Uri.file(path.join(dir!.fsPath,"test.txt"))
		const length = Presenter.getInstance().promises.length
		//write some text to it and save the current file
		await writeToFile("Yebooo baby!", file);
		const commitStatus = await Presenter.getInstance().promises[length]

		//when here means there must be a new Promise in currentGitted 
		//for saving the file and executing git cmd, check it
		//exists

		assert.strictEqual(commitStatus!.status, "Comitted")
		const logCode = dirGetLastLogMessageCode(dir!)
		assert.notEqual(logCode, undefined)
		assert.strictEqual(logCode!.length>3, true)
		deleteDir(dir!)
	})
});
