import type { NumericRange } from '@sveltejs/kit';

export type apiError = {
	message: string;
	status_code: NumericRange<400, 599>;
	status: string;
};
