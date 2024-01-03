import { defineConfig } from '@vscode/test-cli';
import * as dotenv from 'dotenv'


function getInstallationConfig() {
	dotenv.config()
	if(process.env.VSCODE_PATH){
		return {
			fromPath: process.env.VSCODE_PATH
		}
	}
	return undefined
}

export default defineConfig({
	files: 'out/test/**/*.test.js',
	workspaceFolder: "test_dir",
	mocha: {
		ui: "tdd",
		timeout: 5000000000000000
	},
	useInstallation: getInstallationConfig(),
});
