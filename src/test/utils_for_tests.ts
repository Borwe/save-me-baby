import path from "path"
import * as vscode from "vscode"
import * as fs from "fs"
import { execSync } from "child_process"

export function getOrCreateNoCommitDir(): vscode.Uri | undefined{
    const mainDir = path.join(__dirname, "../../test_no_commit")
    try{
        fs.mkdirSync(mainDir, {recursive: true})
        process.chdir(mainDir)
        execSync("git init")
        return vscode.Uri.file(mainDir)
    }catch(err){}finally{
        process.chdir(__dirname)
    }
    return undefined
}

export function deleteCreatedNoCommitDir(dir: vscode.Uri) {
    if(fs.existsSync(dir.fsPath)){
        fs.rmSync(dir.fsPath, { recursive: true })
    }
}