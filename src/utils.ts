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
    }catch(err){}
    return false
}