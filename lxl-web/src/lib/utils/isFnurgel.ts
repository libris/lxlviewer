function isFnurgel(value: string) {
	return /^[a-z0-9]{15,}$/.test(value);
}

export default isFnurgel;
