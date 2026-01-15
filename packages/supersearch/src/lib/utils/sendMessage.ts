import { StateEffect } from '@codemirror/state';

export const sendMessage = StateEffect.define<{ message: string }>();
