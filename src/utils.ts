import path from 'path'
import * as vscode from 'vscode'
import * as fs from 'fs'
import { execSync } from 'child_process'

export type CommitFunction =  (commitStatus: CommitStatus) => void

export type CommitStatusType =  "Comitted" | "Error" | "None" | "GitIgnored";
export type CommitStatus = {
    status: CommitStatusType 
    msg: string | undefined
    error: string | undefined
}

export type GitMergeOrRebase = {
    success: boolean,
    error: string
}

export function getParentDir(uri: vscode.Uri): vscode.Uri{
    return vscode.Uri.file(path.join(uri.fsPath, ".."))
}

export function dirIsGit(uri: vscode.Uri): boolean {
    const currDir = process.cwd()
    if(!fs.existsSync(uri.fsPath)){
        return false;
    }
    try{
        process.chdir(uri.fsPath)
        let buff = execSync("git status")
        let on = buff.indexOf("On");
        if(on>=0 && on < 3){
            return true;
        }
    }catch(err){}finally{
        process.chdir(currDir)
    }
    return false
}


export function dirGetLastLogMessage(uri: vscode.Uri): string | undefined {
    const cwd = process.cwd()
    process.chdir(uri.fsPath)
    let result  = ""
    try{
        const exec = execSync("git log --oneline")
        result = String(exec).split("\n")[0].trim()
    }catch(err: any){
        result = String(err.stderr)
    }
    process.chdir(cwd)
    if(result.includes("fatal: your current branch")){
        return undefined
    }
    let lastLogMessagePos = result.indexOf(" ")
    let lastLogMessage = result.substring(lastLogMessagePos+1)
    return lastLogMessage;
}

export function dirGetAllLogMessages(dir: vscode.Uri): Array<string> {
    let result: string[] = []
    const cwd = process.cwd()
    process.chdir(dir.fsPath)
    try{
        const exec = execSync("git log --oneline")
        String(exec).split("\n").map((line)=>{
            let startMsgPos = line.indexOf(" ")
            const msg = line.substring(startMsgPos).trim()
            if(msg.length>0){
                result.push(msg)
            }
        })
    }catch(err){}
    process.chdir(cwd)
    return result
}

export function doGitMergeAndRebase(msgToCommit: string, dir: vscode.Uri, func: (result: GitMergeOrRebase)=>void){
    const logLists = dirGetAllLogMessages(dir)
    for(const log of logLists ){
        console.log("Log:", log)
    }
}


export function dirGetLastLogMessageCode(uri: vscode.Uri): string | undefined {
    const cwd = process.cwd()
    process.chdir(uri.fsPath)
    let result  = ""
    try{
        const exec = execSync("git log --oneline")
        result = String(exec).split("\n")[0].trim()
    }catch(err: any){
        result = String(err.stderr)
    }
    process.chdir(cwd)
    if(result.includes("fatal: your current branch")){
        return undefined
    }
    let lastLogMessagePos = result.indexOf(" ");
    return result.substring(0,lastLogMessagePos)
}

export async function gitPush(dir: vscode.Uri) {
    const currDir = process.cwd()
    process.chdir(dir.fsPath)

    try{
        execSync("git push")
        const code = dirGetLastLogMessageCode(dir)
        vscode.window.showInformationMessage("😄 SaveMeBaby: Git push success ["+code!+"]")
    }catch(err: any){
        vscode.window.showErrorMessage("😞 SaveMeBaby: Git push failed, error: ["+err.stderr+"]")
    }
    process.chdir(currDir)
}

/** Returns the git code represntation of the commit,
 * if error occurs the string will contain the error message
 * and not the git commit code.
 */
export async function startGitCommit(logMsg: string | undefined, file: vscode.Uri, func: CommitFunction){
    let commitStatus: CommitStatus = {
        status: "None",
        msg: undefined,
        error: undefined
    }
    //file does not exists
    if(!fs.existsSync(file.fsPath)){
        commitStatus.status = "Error"
        commitStatus.error = "File "+file.fragment+"Doesn't exist on disk yet, can't be commited"
        func(commitStatus)
        return
    }
    if(logMsg===undefined){
        logMsg="First Commit."
    }
    let currDir = process.cwd()
    try{
        const parentDir = getParentDir(file)
        process.chdir(parentDir.fsPath)
        execSync("git add "+file.fsPath)
        execSync("git commit -m \""+logMsg+"\"")
        const gitCode = dirGetLastLogMessageCode(parentDir)
        if(gitCode===undefined){
            commitStatus.status = "Error"
            commitStatus.error = "Couldn't get last Log message, can't confirm commit"
            func(commitStatus)
            return
        }

        commitStatus.msg = gitCode!
        commitStatus.status = "Comitted"
        func(commitStatus)
        return
    }catch(err: any){
        const errString = String(err.stderr)
        if(errString.includes("paths are ignored")){
            console.log("FUCK YEAH!!!!!!!!!!!", file.fsPath)
            commitStatus.status = "GitIgnored"
        }else{
            commitStatus.status = "Error"
        }
        commitStatus.error = errString
        func(commitStatus)
        return
    }finally{
        process.chdir(currDir)
    }
}