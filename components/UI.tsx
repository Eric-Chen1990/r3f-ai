"use client";
import { chatCloudFunc } from "@/action/chatCloudFunc";
import useChatStore from "@/store/chatStore";
import { useEffect, useState, useTransition } from "react";

type UIProps = {
	hidden?: boolean;
};

export const UI = ({ hidden }: UIProps) => {
	const [inputValue, setInputValue] = useState("");
	const [isPending, startTransition] = useTransition();
	const { cameraZoomed, setCameraZoomed, messages, setMessages } =
		useChatStore();
	const [disableSend, setDisableSend] = useState(false);

	useEffect(() => {
		setDisableSend(messages.length > 0 || isPending);
	}, [messages, isPending, inputValue]);

	const sendMessage = () => {
		startTransition(async () => {
			const data = await chatCloudFunc(inputValue);
			if (data?.messages) {
				setMessages(data.messages);
			}
			setInputValue("");
		});
	};

	if (hidden) {
		return null;
	}

	return (
		<>
			<div className="fixed top-0 bottom-0 left-0 right-0 z-10 flex flex-col justify-between p-4 pointer-events-none">
				<div className="self-start p-4 bg-white bg-opacity-50 rounded-lg backdrop-blur-md">
					<h1 className="text-xl font-black">Virtual GF</h1>
					<p>I will always love you ❤️</p>
				</div>
				<div className="flex flex-col items-end justify-center w-full gap-4">
					<button
						onClick={() => setCameraZoomed(!cameraZoomed)}
						className="p-4 text-white bg-pink-500 rounded-md pointer-events-auto hover:bg-pink-600"
					>
						{cameraZoomed ? (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="w-6 h-6"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
								/>
							</svg>
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="w-6 h-6"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
								/>
							</svg>
						)}
					</button>
				</div>
				<div className="flex items-center w-full max-w-screen-sm gap-2 mx-auto pointer-events-auto">
					<input
						className="w-full p-4 bg-white bg-opacity-50 rounded-md placeholder:text-gray-800 placeholder:italic backdrop-blur-md"
						placeholder="Type a message..."
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !disableSend) {
								sendMessage();
							}
						}}
					/>
					<button
						disabled={disableSend}
						onClick={sendMessage}
						className={`bg-pink-500 hover:bg-pink-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${
							disableSend ? "cursor-not-allowed opacity-30" : ""
						}`}
					>
						Send
					</button>
				</div>
			</div>
		</>
	);
};
