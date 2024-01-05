import * as assert  from 'assert'
import path from 'path'
import * as vscode from 'vscode'
import * as fs from 'fs'
import * as utils from '../utils'
import { homedir } from 'os'
import { deleteCreatedNoCommitDir, getOrCreateNoCommitDir } from './utils_for_tests'

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
            deleteCreatedNoCommitDir(noCommitDir!)
            const exists = fs.existsSync(noCommitDir!.fsPath)
            assert.equal(exists, false)
        })
    })

    test("Test getting last log message of a git directory with no previous commit", ()=>{
        const noCommitDir = getOrCreateNoCommitDir()
        const msg = utils.dirGetLastLogMessage(noCommitDir!)
        deleteCreatedNoCommitDir(noCommitDir!)
        assert.equal(msg, undefined)
    })

    test("Test if can Start Git Commit on none commited git dir succesfully", async ()=>{
        const noCommitDir = getOrCreateNoCommitDir()
        const msg = utils.dirGetLastLogMessage(noCommitDir!)
        assert.equal(msg, undefined)
        //create file
        const testFile = vscode.Uri.file(path.join(noCommitDir!.fsPath, "Test.txt"))
        fs.writeFileSync(testFile.fsPath, "Hello")
        const commitStatus: utils.CommitStatus = await utils.startGitCommit(msg, testFile)
        const msgCommit = utils.dirGetLastLogMessage(noCommitDir!)
        assert.strictEqual(msgCommit, "First Commit.")
        process.chdir(__dirname)
        deleteCreatedNoCommitDir(noCommitDir!)
        const commitSuccess: utils.CommitStatus = {
            error: undefined,
            msg: undefined,
            status: "Comitted"
        }
        assert.equal(commitStatus.status, commitSuccess.status)
        assert.equal(commitStatus.error, undefined)
    })

    test("Test if can start Git Commit on dir with already previous commits", ()=>{
        //const oneCommitDir = getOrCreateOneCommitDir() //has one file, yolo.txt
        //const msg = utils.dirGetLastLogMessage(oneCommitDir!)
        //assert.strictEqual(msg, "test commit")
        //const code = utils.dirGetLastLogMessageCode(oneCommitDir)
        ////create file
        //const testFile = vscode.Uri.file(path.join(oneCommitDir!.fsPath, "yolo.txt"))
        //fs.appendFileSync(testFile.fsPath, "\nHello and Yolo\n")
        //const commitCode: utils.CommitStatus = await utils.startGitCommit(msg!, testFile)
        //process.chdir(__dirname)
        //deleteCreatedNoCommitDir(oneCommitDir!)
        //const commitSuccess: utils.CommitStatus = {
        //    error: undefined,
        //    msg: undefined,
        //    status: "Comitted"
        //}
        //assert.equal(commitCode.status, commitSuccess.status)
        //console.log("CODE IS:",commitCode.error)
    })
})