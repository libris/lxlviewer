export type ResourceData =
	| null
	| boolean
	| string
	| number
	| ResourceData[]
	| undefined
	| { [key: string]: ResourceData };
