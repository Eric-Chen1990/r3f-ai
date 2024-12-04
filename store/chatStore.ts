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
	messages: MessageTypes[] | null;
	setLoading: (loading: boolean) => void;
	setCameraZoomed: (zoomed: boolean) => void;
	setMessage: (message: MessageTypes | null) => void;
	setMessages: (messages: MessageTypes[] | null) => void;
}

const useChatStore = create<ChatStore>((set) => ({
	loading: false,
	message: null,
	messages: null,
	cameraZoomed: true,
	setLoading: (loading) => set({ loading }),
	setCameraZoomed: (zoomed) => set({ cameraZoomed: zoomed }),
	setMessage: (message) => set({ message }),
	setMessages: (messages) =>
		set({
			messages,
			message: messages && messages.length > 0 ? messages[0] : null,
		}),
}));

export default useChatStore;
