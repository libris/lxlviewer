module.exports = {
	ci: {
		collect: {
			url: 'http://localhost:4137/',
			startServerCommand: 'npm run preview'
		},
		assert: {
			// assert options here
		},
		upload: {
			target: 'filesystem',
			outputDir: './build/_lighthouse',
			reportFilenamePattern: '%%PATHNAME%%.report.%%EXTENSION%%'
		},
		server: {
			// server options here
		},
		wizard: {
			// wizard options here
		}
	}
};
