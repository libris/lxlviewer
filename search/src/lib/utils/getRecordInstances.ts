function getRecordInstances(record) {
	if (record['@reverse']?.['instanceOf']) {
		const reverses = record['@reverse']?.['instanceOf'];
		// should we use quoted or mainEntity?
		return reverses;
	}
	return null;
}

export default getRecordInstances;
