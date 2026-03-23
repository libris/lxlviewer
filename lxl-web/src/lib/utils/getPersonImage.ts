const images = new Map();
const pending = new Map();

export async function getPersonImage(id: string) {
	if (images.has(id)) {
		return images.get(id);
	}

	if (pending.has(id)) {
		return pending.get(id);
	}

	const promise = (async () => {
		const res = await fetch(`/api/sv/${id}`);
		if (!res.ok) {
			pending.delete(id);
		}

		const data = await res.json();
		const image = data.image.url;

		images.set(id, image);
		pending.delete(id);

		return image;
	})();

	pending.set(id, promise);
	return promise;
}
