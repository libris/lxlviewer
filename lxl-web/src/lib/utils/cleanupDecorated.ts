import { Fmt, JsonLd } from '$lib/types/xl';
import { isObject } from './xl';

const METADATA_KEYS = new Set<string>([
	JsonLd.ID,
	JsonLd.TYPE,
	Fmt.LABEL,
	Fmt.STYLE,
	Fmt.CONTENT_BEFORE,
	Fmt.CONTENT_AFTER
]);

const CONTAINER_KEYS = new Set([Fmt.DISPLAY]);

type CleanResult = { value: unknown; alive: boolean };

function cleanRec(value: unknown): CleanResult {
	if (Array.isArray(value)) {
		const out: unknown[] = [];
		let alive = false;
		for (const item of value) {
			const r = cleanRec(item);
			if (r.alive) {
				out.push(r.value);
				alive = true;
			}
		}
		return { value: out, alive };
	}

	if (isObject(value)) {
		const realEntries: Record<string, unknown> = {};
		const metaEntries: Record<string, unknown> = {};
		let alive = false;

		for (const [k, v] of Object.entries(value)) {
			if (METADATA_KEYS.has(k)) {
				metaEntries[k] = v;
			} else if (CONTAINER_KEYS.has(k)) {
				const r = cleanRec(v);
				metaEntries[k] = r.value; // keep even if empty
				if (r.alive) alive = true;
			} else {
				const r = cleanRec(v);
				if (r.alive) {
					realEntries[k] = r.value;
					alive = true;
				}
			}
		}

		if (!alive) return { value: undefined, alive: false };

		// Preserve original key order
		const ordered: Record<string, unknown> = {};
		for (const k of Object.keys(value)) {
			if (k in metaEntries) ordered[k] = metaEntries[k];
			else if (k in realEntries) ordered[k] = realEntries[k];
		}
		return { value: ordered, alive: true };
	}

	if (value === null || value === undefined) {
		return { value, alive: false };
	}
	// data reached via a real (non-metadata) path -> alive
	return { value, alive: true };
}

/**
 * remove sub-trees that contain only formatting/metadata props,
 * root node is preserved
 */
export function cleanData<T>(root: T): T {
	if (Array.isArray(root)) return root.map((v) => cleanData(v)) as unknown as T;
	if (!isObject(root)) return root;

	const out: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(root)) {
		if (METADATA_KEYS.has(k)) {
			out[k] = v;
		} else if (CONTAINER_KEYS.has(k)) {
			out[k] = cleanRec(v).value;
		} else {
			const r = cleanRec(v);
			if (r.alive) out[k] = r.value;
		}
	}
	return out as T;
}
