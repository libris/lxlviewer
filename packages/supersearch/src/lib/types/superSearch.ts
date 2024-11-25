export interface ResultItem {
	id: string;
	type?: string;
	heading: string;
	actions?: Action[];
}

type Action = {
	id: string;
	title: string;
	onselect: () => void;
};

export type QueryFunction = (value: string) => URLSearchParams;
export type PaginationQueryFunction = (
	searchParams?: URLSearchParams,
	data?: unknown
) => URLSearchParams;
export type TransformFunction = (data: unknown) => unknown;
