function getDisplayType(type: string) {
	if (Array.isArray(type)) {
		return type[0];
	}
	return type;
}

export default getDisplayType;
