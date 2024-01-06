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

export function  getOrCreateOneCommitDir(): vscode.Uri | undefined {
    const mainDir = path.join(__dirname, "../../test_one_commit")
    try{
        fs.mkdirSync(mainDir, {recursive: true})
        process.chdir(mainDir)
        execSync("git init")
        fs.writeFileSync(path.join(mainDir,"yolo.txt"), "yolo baby")
        execSync("git add "+path.join(mainDir,"yolo.txt"))
        execSync("git commit -m \"test commit\"")
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