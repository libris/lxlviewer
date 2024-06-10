import type { NumericRange } from '@sveltejs/kit';

export type ApiError = {
	message: string;
	status_code: NumericRange<400, 599>;
	status: string;
};
