export const chatCloudFunc = async (message: string) => {
	try {
		const response = await fetch(
			process.env.NEXT_PUBLIC_CLOUD_FUNCTION_URL as string,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					// "x-api-key": process.env.NEXT_PUBLIC_CLOUD_FUNCTION_KEY as string,
				},
				body: JSON.stringify({ message }),
			}
		);
		const data = await response.json();
		return data;
	} catch (error) {
		console.log(
			"🚀 --> file: chatCloudFunc.ts:24 --> chatCloudFunc --> error:",
			error
		);
	}
};
