import { execCommand } from "@/lib/serverUtils";

export async function GET() {
	try {
		await execCommand(
			`${
				process.env.NODE_ENV === "production"
					? `${process.cwd()}/.bin/rhubarb`
					: "rhubarb"
			} -f json -o audios/message_0.json audios/api_0.wav -r phonetic`
		);
		return Response.json({ message: "Success!" });
	} catch (error) {
		console.log("🚀 --> file: route.ts:6 --> GET --> error:", error);
		return Response.json(
			{ message: "Some error occurred. Please try again." },
			{ status: 500 }
		);
	}
}
