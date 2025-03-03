type JSONPrimitive = string | number | boolean | null | undefined;

export type JSONValue =
	| JSONPrimitive
	| JSONValue[]
	| {
			[key: string]: JSONValue;
	  };
