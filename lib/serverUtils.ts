"use server";
import { exec } from "child_process";
import fs from "fs/promises";

const audioFileToBase64 = async (file: string) => {
	const data = await fs.readFile(file);
	return data.toString("base64");
};

const readJsonTranscript = async (file: string) => {
	const data = await fs.readFile(file, "utf8");
	const josnData = JSON.parse(data);
	return {
		mouthCues: josnData.mouthCues,
	};
};

const deleteFile = async (file: string) => {
	try {
		await fs.unlink(file);
		console.log(`Deleted file: ${file}`);
	} catch (error) {
		console.error(`Error deleting file: ${file}`, error);
	}
};

const execCommand = (command: string) => {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout) => {
			if (error) reject(error);
			resolve(stdout);
		});
	});
};

export { audioFileToBase64, readJsonTranscript, deleteFile, execCommand };
