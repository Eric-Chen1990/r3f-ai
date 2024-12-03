import { create } from "zustand";

export type LipsyncType = {
	mouthCues: { start: number; end: number; value: string }[];
};
export interface MessageTypes {
	text: string;
	audio?: string;
	lipsync?: LipsyncType;
	facialExpression: string;
	animation: string;
}

interface ChatStore {
	loading: boolean;
	cameraZoomed: boolean;
	message: MessageTypes | null;
	messages: MessageTypes[];
	setCameraZoomed: (zoomed: boolean) => void;
	setMessage: (message: MessageTypes) => void;
	setMessages: (messages: MessageTypes[]) => void;
}

const useChatStore = create<ChatStore>((set) => ({
	loading: false,
	message: null,
	messages: [],
	cameraZoomed: true,
	setCameraZoomed: (zoomed) => set({ cameraZoomed: zoomed }),
	setMessage: (message) => set({ message }),
	setMessages: (messages) =>
		set({ messages, message: messages.length > 0 ? messages[0] : null }),
}));

export default useChatStore;
