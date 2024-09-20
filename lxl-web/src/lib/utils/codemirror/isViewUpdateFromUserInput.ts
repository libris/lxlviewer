import type { ViewUpdate } from '@codemirror/view';
import { Transaction } from '@codemirror/state';

/**
 * Check if a ViewUpdate contains User Events.
 * See: https://discuss.codemirror.net/t/distinguish-user-input-updates/5052/1
 */

function isViewUpdateFromUserInput(viewUpdate: ViewUpdate) {
	// Make sure document has changed, ensuring user events like selections don't count.
	if (viewUpdate.docChanged) {
		// Check transactions for any that are direct user input, not changes from Y.js or another extension.
		for (const transaction of viewUpdate.transactions) {
			// Not using Transaction.isUserEvent because that only checks for a specific User event type ( "input", "delete", etc.). Checking the annotation directly allows for any type of user event.
			const userEventType = transaction.annotation(Transaction.userEvent);
			if (userEventType) return userEventType;
		}
	}

	return false;
}

export default isViewUpdateFromUserInput;
