import * as assert  from 'assert'
import path from 'path'
import * as vscode from 'vscode'
import * as fs from 'fs'
import * as utils from '../utils'
import { homedir } from 'os'
import { CallBackCompleteStatus, deleteDir, getOrCreateNoCommitDir, getOrCreateNoCommitDirWithGitIgnore, getOrCreateOneCommitDir } from './utils_for_tests'
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

    test("Test if can create commit on file that is inside .gitginore, should not", async()=>{
        const gitIgnoreContent = 
`hehe.txt
*.toIgnore
toIgnore/*`
        const noCommitWithGitIgoreDir: vscode.Uri| undefined = getOrCreateNoCommitDirWithGitIgnore(gitIgnoreContent)
        assert.notEqual(noCommitWithGitIgoreDir, undefined)

        //test saving hehe.txt
        const heheFile =  vscode.Uri.file(path.join(noCommitWithGitIgoreDir!.fsPath, "hehe.txt"))
        fs.appendFileSync(heheFile.fsPath,"Hehehe baby\r\n")
		let callbackResult: CallBackCompleteStatus<CommitStatus> = {
			complete: false,
			val: undefined
		}
        const msg = "Shouldn't commit"
        await utils.startGitCommit(msg,heheFile,(commitResult)=>{
            callbackResult.complete = true
            callbackResult.val = commitResult
        })
        assert.strictEqual(callbackResult.complete, true)
        assert.strictEqual(callbackResult.val!.status, "GitIgnored" )

        //testing saving for *.toIgnore file
        const toIgnoreFile =  vscode.Uri.file(path.join(noCommitWithGitIgoreDir!.fsPath, "hehe.toIgnore"))
        fs.appendFileSync(toIgnoreFile.fsPath,"Ignore This Baby\r\n")
		const callbackResultIgnore: CallBackCompleteStatus<CommitStatus> = {
			complete: false,
			val: undefined
		}
        await utils.startGitCommit(msg,toIgnoreFile,(commitResult)=>{
            callbackResultIgnore.complete = true
            callbackResultIgnore.val = commitResult
        })
        assert.strictEqual(callbackResultIgnore.complete, true)
        assert.strictEqual(callbackResultIgnore.val!.status, "GitIgnored" )


        //testing saving for *.toIgnore file
        const toIgnoreFile2 =  vscode.Uri.file(path.join(noCommitWithGitIgoreDir!.fsPath, "toIgnore/", "hehe.yolo"))
        fs.mkdirSync(utils.getParentDir(toIgnoreFile2).fsPath)
        fs.appendFileSync(toIgnoreFile2.fsPath,"Ignore This Baby Too\r\n")
		const callbackResultIgnore2: CallBackCompleteStatus<CommitStatus> = {
			complete: false,
			val: undefined
		}
        await utils.startGitCommit(msg,toIgnoreFile2,(commitResult)=>{
            callbackResultIgnore2.complete = true
            callbackResultIgnore2.val = commitResult
        })
        assert.strictEqual(callbackResultIgnore2.complete, true)
        assert.strictEqual(callbackResultIgnore2.val!.status, "GitIgnored" )


        //testing saving a file that isn't in gitignore, should pass
        const notIgnore =  vscode.Uri.file(path.join(noCommitWithGitIgoreDir!.fsPath, "notIgnore/", "not.yolo"))
        fs.mkdirSync(utils.getParentDir(notIgnore).fsPath)
        fs.appendFileSync(notIgnore.fsPath,"Don't ignore this Baby\r\n")
		const callbackResultIgnore3: CallBackCompleteStatus<CommitStatus> = {
			complete: false,
			val: undefined
		}
        await utils.startGitCommit(msg,notIgnore,(commitResult)=>{
            callbackResultIgnore3.complete = true
            callbackResultIgnore3.val = commitResult
        })
        assert.strictEqual(callbackResultIgnore3.complete, true)
        assert.strictEqual(callbackResultIgnore3.val!.status, "Comitted" )

        deleteDir(noCommitWithGitIgoreDir!)
    })

    test("Compressing previous commits", async ()=>{
        const noCommit = getOrCreateNoCommitDir()
        assert.notStrictEqual(noCommit, undefined)

        const heheFile = vscode.Uri.file(path.join(noCommit!.fsPath, "hehe_lol.txt"))

        let commitCallback: CallBackCompleteStatus<CommitStatus> = {
            complete: false,
            val: undefined
        }
        const reset = (commitCB: CallBackCompleteStatus<CommitStatus>)=>{
            commitCB.complete = false
            commitCB.val = undefined
            return commitCB
        }

        //do a commit
        fs.writeFileSync(heheFile.fsPath, "1\n")
        const funcToDo = (commitResult: CommitStatus)=>{
            commitCallback.complete = true
            commitCallback.val = commitResult
        }
        await utils.startGitCommit(undefined,heheFile,funcToDo)
        assert.strictEqual(commitCallback.complete, true)
        const msgLog = utils.dirGetLastLogMessage(noCommit!)
        assert.notStrictEqual(msgLog, undefined)


        //do another commit
        fs.writeFileSync(heheFile.fsPath, "2\n")
        commitCallback = reset(commitCallback)
        await utils.startGitCommit(undefined,heheFile,funcToDo)
        assert.strictEqual(commitCallback.complete, true)
        assert.strictEqual(msgLog!,utils.dirGetLastLogMessage(noCommit!))

        //do 3rd commit
        fs.writeFileSync(heheFile.fsPath, "3\n")
        commitCallback = reset(commitCallback)
        await utils.startGitCommit(undefined,heheFile,funcToDo)
        assert.strictEqual(commitCallback.complete, true)
        assert.strictEqual(msgLog!,utils.dirGetLastLogMessage(noCommit!))

        //do 4th commit
        fs.writeFileSync(heheFile.fsPath, "4\n")
        commitCallback = reset(commitCallback)
        await utils.startGitCommit(undefined,heheFile,funcToDo)
        assert.strictEqual(commitCallback.complete, true)
        assert.strictEqual(msgLog!,utils.dirGetLastLogMessage(noCommit!))

        const logMessages: Array<string> = utils.dirGetAllLogMessages(noCommit!)
        assert.strictEqual(logMessages.length, 4)
        //do the merge/rebase with message
        const msgToCommit = "Bind here BABY"
        let success = false;
        let error: string | undefined = undefined;
        await utils.doGitMergeAndRebase(msgToCommit, noCommit!, (result: utils.GitMergeOrRebase)=>{
            success = result.success
            error = result.error
        })
        assert.strictEqual(success, true)
        const currentLogMessages: Array<string> = utils.dirGetAllLogMessages(noCommit!)
        assert.strictEqual(currentLogMessages.length<logMessages.length, true)
        assert.strictEqual(currentLogMessages.length, 2)
        const currentTopLog = utils.dirGetLastLogMessage(noCommit!)
        assert.strictEqual(currentTopLog, msgToCommit)
    })
})