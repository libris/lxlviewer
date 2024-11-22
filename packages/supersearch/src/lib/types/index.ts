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
