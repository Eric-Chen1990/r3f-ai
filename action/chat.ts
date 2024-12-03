"use server";
import OpenAI from "openai";
import { ElevenLabsClient } from "elevenlabs";
import {
	audioFileToBase64,
	deleteFile,
	execCommand,
	readJsonTranscript,
} from "@/lib/serverUtils";
import { createWriteStream } from "fs";
import { MessageTypes } from "@/store/chatStore";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY || "-", // Your OpenAI API key here, I used "-" to avoid errors when the key is not set but you should not do that
});

const elevenlabs = new ElevenLabsClient({
	apiKey: process.env.ELEVENLABS_API_KEY, // Defaults to process.env.ELEVENLABS_API_KEY
});

const chat = async (userMessage: string) => {
	if (!userMessage) {
		return {
			messages: [
				{
					text: "Hey dear... How was your day?",
					audio: await audioFileToBase64("audios/intro_0.wav"),
					lipsync: await readJsonTranscript("audios/intro_0.json"),
					facialExpression: "smile",
					animation: "Talking_1",
				},
				{
					text: "I missed you so much... Please don't go for so long!",
					audio: await audioFileToBase64("audios/intro_1.wav"),
					lipsync: await readJsonTranscript("audios/intro_1.json"),
					facialExpression: "sad",
					animation: "Crying",
				},
			],
		};
		return;
	}
	if (!process.env.OPENAI_API_KEY || !process.env.ELEVENLABS_API_KEY) {
		return {
			messages: [
				{
					text: "Please my dear, don't forget to add your API keys!",
					audio: await audioFileToBase64("audios/api_0.wav"),
					lipsync: await readJsonTranscript("audios/api_0.json"),
					facialExpression: "angry",
					animation: "Angry",
				},
			],
		};
	}
	const replyMessages = await openAiChat(userMessage);
	const updatedMessages = await textToSpeech(replyMessages);
	return { messages: updatedMessages };
};

const openAiChat = async (userMessage: string) => {
	const data = await openai.chat.completions.create({
		model: "gpt-3.5-turbo-1106",
		max_tokens: 1000,
		temperature: 0.6,
		response_format: {
			type: "json_object",
		},
		messages: [
			{
				role: "system",
				content: `
        You are a virtual girlfriend.
        You will always reply with a JSON array of messages. With a maximum of 3 messages.
        Each message has a text, facialExpression, and animation property.
        The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
        The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry. 
        `,
			},
			{
				role: "user",
				content: userMessage || "Hello",
			},
		],
	});
	let messages = JSON.parse(data.choices[0].message.content as string);
	if (messages.messages) {
		messages = messages.messages; // ChatGPT is not 100% reliable, sometimes it directly returns an array and sometimes a JSON object with a messages property
	}
	return messages;
};

const textToSpeech = async (messages: MessageTypes[]) => {
	const generateAudio = async (message: MessageTypes, index: number) => {
		const fileName = `audios/message_${index}.mp3`;
		const textInput = message.text;

		const audio = await elevenlabs.generate({
			voice: "Matilda",
			text: textInput,
			model_id: "eleven_multilingual_v2",
		});

		const fileStream = createWriteStream(fileName);

		await new Promise((resolve, reject) => {
			audio.pipe(fileStream);
			fileStream.on("finish", () => resolve(fileName));
			fileStream.on("error", reject);
		});

		await lipSyncMessage(index);
		message.audio = await audioFileToBase64(fileName);
		message.lipsync = await readJsonTranscript(`audios/message_${index}.json`);

		await deleteFile(fileName);
		await deleteFile(`audios/message_${index}.wav`);
		await deleteFile(`audios/message_${index}.json`);
		return message;
	};

	const updatedMessages = await Promise.all(
		messages.map((message, index) => generateAudio(message, index))
	);

	return updatedMessages;
};

const lipSyncMessage = async (index: number) => {
	const time = new Date().getTime();
	console.log(`Starting conversion for message ${index}`);
	await execCommand(
		`ffmpeg -y -i audios/message_${index}.mp3 audios/message_${index}.wav`
		// -y to overwrite the file
	);
	console.log(`Conversion done in ${new Date().getTime() - time}ms`);
	await execCommand(
		`${
			process.env.NODE_ENV === "production" ? ".bin/rhubarb" : "rhubarb"
		} -f json -o audios/message_${index}.json audios/message_${index}.wav -r phonetic`
	);
	// -r phonetic is faster but less accurate
	console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

export { chat };
