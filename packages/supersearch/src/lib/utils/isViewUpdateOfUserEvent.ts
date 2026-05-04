import type { ViewUpdate } from '@codemirror/view';
import type { UserEvent } from '$lib/types/superSearch.js';

/**
 * Check if a ViewUpdate contains a specific user event type
 */

function isViewUpdateOfUserEvent(viewUpdate: ViewUpdate, userEvent: UserEvent) {
	for (const transaction of viewUpdate.transactions) {
		const userEventType = transaction.isUserEvent(userEvent);
		if (userEventType) return true;
	}

	return false;
}

export default isViewUpdateOfUserEvent;
