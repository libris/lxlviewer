import type { NumericRange } from '@sveltejs/kit';

export type ApiError = {
	message: string;
	status_code: NumericRange<400, 599>;
	status: string;
};

export interface HoldingStatus {
	item_information: ItemInformation;
}

interface ItemInformation {
	library_code: string;
	count: number;
	error?: string;
	items: HoldingItem[] | [];
}

// https://www.kb.se/download/18.2705879d169b8ba882a43cc/1555822604043/lanestatus_11.pdf
interface HoldingItem {
	Item_No: string;
	UniqueItemId: string;
	Location: string;
	Call_No: string;
	Status: string;
	Status_Date_Description?: string;
	Status_Date?: string;
	Loan_Policy: string;
}
