"use client"
import useChatStore from "@/store/chatStore";
import { Text } from "@react-three/drei";
import { GroupProps } from "@react-three/fiber";
import { useEffect, useState } from "react";

const Dots = (props: GroupProps) => {
	const { loading } = useChatStore();
	const [loadingText, setLoadingText] = useState("");
	useEffect(() => {
		if (loading) {
			const interval = setInterval(() => {
				setLoadingText((loadingText) => {
					if (loadingText.length > 2) {
						return ".";
					}
					return loadingText + ".";
				});
			}, 800);
			return () => clearInterval(interval);
		} else {
			setLoadingText("");
		}
	}, [loading]);
	if (!loading) return null;
	return (
		<group {...props}>
			<Text fontSize={0.14} anchorX={"left"} anchorY={"bottom"}>
				{loadingText}
				<meshBasicMaterial attach="material" color="black" />
			</Text>
		</group>
	);
};

export default Dots;
