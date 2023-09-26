import { defineStore } from "pinia";

export const useDirectoryCareStore = defineStore('directoryCare', {
	state: () => ({
		sender: null,
		senderHoldings: [],
		reciever: null,
		recieverHoldings: [],
		selectedHoldings: [],
		holdingsMoved: [],
	}),
	actions: {
		// TODO: Remove this, also check if it even works like this?
		setDirectoryCare(data) {
			this.sender = data['sender'];
			this.senderHoldings = data['senderHoldings'];
			this.reciever = data['reciever'];
			this.recieverHoldings = data['recieverHoldings'];
			this.selectedHoldings = data['selectedHoldings'];
			this.holdingsMoved = data['holdingsMoved'];
		},
	},
});
