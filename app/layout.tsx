import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Virtual Girlfriend ❤️",
	description: "Created by Eric",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="w-full h-screen bg-gradient-to-br from-pink-300 to-slate-300">
				{children}
				<Analytics />
			</body>
		</html>
	);
}
