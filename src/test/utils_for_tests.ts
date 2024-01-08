import path from "path"
import * as vscode from "vscode"
import * as fs from "fs"
import { execSync } from "child_process"


export type CallBackCompleteStatus<T> = {
	complete: boolean,
	val: T | undefined
}

export function createTestDir(dirName: string): vscode.Uri {
    const mainDir = path.join(__dirname, "../../"+dirName)
    fs.mkdirSync(mainDir, {recursive: true})
    return vscode.Uri.file(mainDir)
}

export function getOrCreateNoCommitDir(): vscode.Uri | undefined{
    try{
        const mainDir = createTestDir("test_no_commit")
        process.chdir(mainDir.fsPath)
        execSync("git init")
        return mainDir
    }catch(err){}finally{
        process.chdir(__dirname)
    }
    return undefined
}

export function  getOrCreateOneCommitDir(): vscode.Uri | undefined {
    try{
        const mainDir =  createTestDir("test_one_commit")
        process.chdir(mainDir.fsPath)
        execSync("git init")
        fs.writeFileSync(path.join(mainDir.fsPath,"yolo.txt"), "yolo baby")
        execSync("git add "+path.join(mainDir.fsPath,"yolo.txt"))
        execSync("git commit -m \"test commit\"")
        return mainDir
    }catch(err){}finally{
        process.chdir(__dirname)
    }
    return undefined
}

export function deleteDir(dir: vscode.Uri) {
    if(fs.existsSync(dir.fsPath)){
        fs.rmSync(dir.fsPath, { recursive: true })
    }
}