import path from 'path'
import * as vscode from 'vscode'
import * as fs from 'fs'
import { execSync } from 'child_process'

export type CommitStatusType =  "Comitted" | "Error" | "None";
export type CommitStatus = {
    status: CommitStatusType 
    msg: string | undefined
    error: string | undefined
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

/** Returns the git code represntation of the commit,
 * if error occurs the string will contain the error message
 * and not the git commit code.
 */
export async function startGitCommit(logMsg: string | undefined, file: vscode.Uri): Promise<CommitStatus>{
    let commitStatus: CommitStatus = {
        status: "None",
        msg: undefined,
        error: undefined
    }
    //file does not exists
    if(!fs.existsSync(file.fsPath)){
        commitStatus.status = "Error"
        commitStatus.error = "File "+file.fragment+"Doesn't exist on disk yet, can't be commited"
        return commitStatus
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
            return commitStatus
        }

        commitStatus.msg = gitCode!
        commitStatus.status = "Comitted"
        return commitStatus
    }catch(err: any){
        commitStatus.status = "Error"
        commitStatus.error = "Error, couldn't commit "+err.stderr
        return commitStatus
    }finally{
        process.chdir(currDir)
    }
}