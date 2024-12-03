"use client";
import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { UI } from "./UI";
import Experience from "./Experience";

const AIApp = () => {
	return (
		<>
			<Loader />
			<Leva hidden />
			<UI />
			<Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
				<Experience />
			</Canvas>
		</>
	);
};

export default AIApp;
