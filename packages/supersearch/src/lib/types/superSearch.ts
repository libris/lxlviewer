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
export type PaginateQueryFunction = (searchParams: URLSearchParams) => URLSearchParams;
export type TransformerFunction = (data: unknown) => ResultItem[];
