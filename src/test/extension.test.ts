import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import PRESENTER from '../presenter';
// import * as myExtension from '../../extension';

suite('Test commands', () => {

	test("start-saving exists", async () =>{
		let exists = await vscode.commands
			.executeCommand<boolean>("save-me-baby.start-saving")
		assert.notStrictEqual(exists, undefined)
	})

	test("stop-saving exists", async () =>{
		let exists  = await vscode.commands
			.executeCommand<boolean>("save-me-baby.stop-saving")
		assert.notStrictEqual(exists, undefined)
	})

	test("toggle exists", async () =>{
		let exists = await vscode.commands
			.executeCommand<boolean>("save-me-baby.toggle")
		assert.notStrictEqual(exists, undefined)
	})
});
