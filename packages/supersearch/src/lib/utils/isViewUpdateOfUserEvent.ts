import type { ViewUpdate } from '@codemirror/view';

/**
 * Check if a ViewUpdate contains a specific user event type
 */

function isViewUpdateOfUserEvent(
	viewUpdate: ViewUpdate,
	userEvent:
		| 'input'
		| 'input.type'
		| 'input.paste'
		| 'input.drop'
		| 'input.complete'
		| 'delete'
		| 'delete.selection'
		| 'delete.forward'
		| 'delete.backward'
		| 'delete.cut'
		| 'move'
		| 'move.drop'
		| 'select'
		| 'select.pointer'
		| 'undo'
		| 'redo' // see: https://codemirror.net/docs/ref/#state.Transaction%5EuserEvent
) {
	for (const transaction of viewUpdate.transactions) {
		const userEventType = transaction.isUserEvent(userEvent);
		if (userEventType) return true;
	}

	return false;
}

export default isViewUpdateOfUserEvent;
