import * as assert  from 'assert'
import path from 'path'
import * as vscode from 'vscode'
import * as fs from 'fs'
import * as utils from '../utils'
import { homedir } from 'os'
import { CallBackCompleteStatus, deleteDir, getOrCreateNoCommitDir, getOrCreateOneCommitDir } from './utils_for_tests'
import { CommitStatus } from '../utils'

suite("Testing Utils",()=>{
    test("Test getting parent dir", ()=>{
        const expected = vscode.Uri.file(__dirname)
        const testingfile = vscode.Uri.file(path.join(__dirname, "testingfile.txt"))
        let parentDir = utils.getParentDir(testingfile);
        assert.strictEqual(parentDir.fsPath, expected.fsPath)
    })

    test("Test dir is Git true", ()=>{
        const testingfile = vscode.Uri.file(path.join(__dirname, "testingfile.txt"))
        let parentDir = utils.getParentDir(testingfile);
        const result = utils.dirIsGit(parentDir)
        assert.strictEqual(result, true);
    })


    test("Test dir is Git false since imaginary", ()=>{
        const testingfile = vscode.Uri.file(path.join(__dirname, "/hehehehhe/asdsadl/testingfile.txt"))
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
        const projDir = vscode.Uri.file(path.join(__dirname, "../../"))
        const msg = utils.dirGetLastLogMessage(projDir);
        assert.notEqual(msg,undefined)
    })

    test("Test creating no commit dir", ()=>{
        const noCommitDir = getOrCreateNoCommitDir()
        assert.notDeepEqual(noCommitDir, undefined)
        test("Test deleting no commit dir", ()=>{
            deleteDir(noCommitDir!)
            const exists = fs.existsSync(noCommitDir!.fsPath)
            assert.equal(exists, false)
        })
    })

    test("Test getting last log message of a git directory with no previous commit", ()=>{
        const noCommitDir = getOrCreateNoCommitDir()
        const msg = utils.dirGetLastLogMessage(noCommitDir!)
        deleteDir(noCommitDir!)
        assert.equal(msg, undefined)
    })

    test("Test if can Start Git Commit on none commited git dir succesfully", async ()=>{
        const noCommitDir = getOrCreateNoCommitDir()
        const msg = utils.dirGetLastLogMessage(noCommitDir!)
        assert.equal(msg, undefined)
        //create file
        const testFile = vscode.Uri.file(path.join(noCommitDir!.fsPath, "Test.txt"))
        fs.writeFileSync(testFile.fsPath, "Hello")
		let callbackResult: CallBackCompleteStatus<CommitStatus> = {
			complete: false,
			val: undefined
		}
        await utils.startGitCommit(msg, testFile, (commitStatus)=> {
			callbackResult.complete = true
			callbackResult.val = commitStatus
		})
        const msgCommit = utils.dirGetLastLogMessage(noCommitDir!)
        assert.strictEqual(msgCommit, "First Commit.")
        process.chdir(__dirname)
        deleteDir(noCommitDir!)
        assert.equal(callbackResult.val!.status, "Comitted")
        assert.equal(callbackResult.val!.error, undefined)
    })

    test("Test if can start Git Commit on dir with already previous commits", async ()=>{
        const oneCommitDir = getOrCreateOneCommitDir() //has one file, yolo.txt
        assert.notEqual(oneCommitDir, undefined)
        const msg = utils.dirGetLastLogMessage(oneCommitDir!)
        assert.strictEqual(msg, "test commit")
        const code = utils.dirGetLastLogMessageCode(oneCommitDir!)
        assert.notEqual(code, undefined)
        //create file
        const testFile = vscode.Uri.file(path.join(oneCommitDir!.fsPath, "yolo.txt"))
        fs.appendFileSync(testFile.fsPath, "\nHello and Yolo\n")
		let callbackResult: CallBackCompleteStatus<CommitStatus> = {
			complete: false,
			val: undefined
		}
        await utils.startGitCommit(msg, testFile, (commitStatus)=> {
			callbackResult.complete = true
			callbackResult.val = commitStatus
		})
        process.chdir(__dirname)
        const newCode = utils.dirGetLastLogMessageCode(oneCommitDir!)
        assert.notEqual(newCode, undefined)
        assert.notEqual(newCode, code)
        deleteDir(oneCommitDir!)
        assert.equal(callbackResult.val!.status, "Comitted")
    })
})