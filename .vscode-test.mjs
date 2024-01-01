import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/**/*.test.js',
	workspaceFolder: "test_dir",
	mocha: {
		ui: "tdd",
		timeout: 5000000000000000
	}
});
