import * as assert  from 'assert'
import path from 'path'
import * as vscode from 'vscode'
import * as utils from '../utils'

suite("Testing Utils",()=>{
    test("Test getting parent dir", ()=>{
        const expected = vscode.Uri.file(process.cwd())
        const testingfile = vscode.Uri.file(path.join(process.cwd(), "testingfile.txt"))
        let parentDir = utils.getParentDir(testingfile);
        assert.strictEqual(parentDir.fsPath, expected.fsPath)
    })
})