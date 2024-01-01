import * as assert  from 'assert'
import path from 'path'
import * as vscode from 'vscode'
import * as utils from '../utils'
import { homedir } from 'os'

suite("Testing Utils",()=>{
    test("Test getting parent dir", ()=>{
        const expected = vscode.Uri.file(process.cwd())
        const testingfile = vscode.Uri.file(path.join(process.cwd(), "testingfile.txt"))
        let parentDir = utils.getParentDir(testingfile);
        assert.strictEqual(parentDir.fsPath, expected.fsPath)
    })

    test("Test dir is Git true", ()=>{
        const testingfile = vscode.Uri.file(path.join(process.cwd(), "testingfile.txt"))
        let parentDir = utils.getParentDir(testingfile);
        const result = utils.dirIsGit(parentDir)
        assert.strictEqual(result, true);
    })


    test("Test dir is Git false since imaginary", ()=>{
        const testingfile = vscode.Uri.file(path.join(process.cwd(), "/hehehehhe/asdsadl/testingfile.txt"))
        let parentDir = utils.getParentDir(testingfile);
        const result = utils.dirIsGit(parentDir)
        assert.strictEqual(result, false);
    })

    test("Test dir is not git, but it exists", ()=>{
        const home = vscode.Uri.file(homedir())
        const result = utils.dirIsGit(home)
        //we are assuming nobody has set their home dir as a
        // git repo, lol.
        assert.strictEqual(result, false)
    })

    test("Test getting last log message of a git directory", ()=>{
        const projDir = vscode.Uri.file(path.join(process.cwd(), "../../"))
        const msg = utils.dirGetLastLogMessage(projDir);

    })
})