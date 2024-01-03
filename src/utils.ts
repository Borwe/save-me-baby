import path from 'path'
import * as vscode from 'vscode'
import * as fs from 'fs'
import { execSync } from 'child_process'

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

export async function startGitCommit(logMsg: string): Promise<string | undefined>{
    return undefined
}