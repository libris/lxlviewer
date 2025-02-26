import { describe, it, expect } from 'vitest';
import addSpaceIfEndingQualifier from './addSpaceIfEndingQualifier';

describe('addSpaceIfEndingQualifier', () => {
	it('adds space to the end if string ends with qualifier', () => {
		expect(addSpaceIfEndingQualifier('contributor:"libris:fcrtpljz1qp2bdv%23it"')).toEqual(
			'contributor:"libris:fcrtpljz1qp2bdv%23it" '
		);
	});
	it("doesn't add space if the string already ends with a space", () => {
		expect(addSpaceIfEndingQualifier('contributor:"libris:fcrtpljz1qp2bdv%23it" ')).toEqual(
			'contributor:"libris:fcrtpljz1qp2bdv%23it" '
		);
	});
	it("doesn't add spaces to strings not ending with a qualifier", () => {
		expect(addSpaceIfEndingQualifier('contributor:"libris:fcrtpljz1qp2bdv%23it" hej')).toEqual(
			'contributor:"libris:fcrtpljz1qp2bdv%23it" hej'
		);
	});
});
