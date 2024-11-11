import { lxlQueryLanguage } from '../dist/index.js';
import { fileTests } from '@lezer/generator/dist/test';
import { describe, it } from 'vitest';

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const caseDir = path.dirname(fileURLToPath(import.meta.url));

for (const file of fs.readdirSync(caseDir)) {
	if (!/\.txt$/.test(file)) continue;

	const name = /^[^.]*/.exec(file)?.[0];
	if (name) {
		describe(name, () => {
			for (const { name, run } of fileTests(fs.readFileSync(path.join(caseDir, file), 'utf8'), file))
				it(name, () => run(lxlQueryLanguage.parser));
		});
	}
}
