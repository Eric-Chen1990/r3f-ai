"use client";
import { CameraControls, ContactShadows, Environment } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import Dots from "./Dots";
import useChatStore from "@/store/chatStore";
import Avatar from "./Avatar";

const Experience = () => {
	const cameraControls = useRef<CameraControls | null>(null);
	const { cameraZoomed } = useChatStore();

	useEffect(() => {
		cameraControls.current?.setLookAt(0, 2, 5, 0, 1.5, 0);
	}, []);

	useEffect(() => {
		if (cameraZoomed) {
			cameraControls.current?.setLookAt(0, 1.5, 1.5, 0, 1.5, 0, true);
		} else {
			cameraControls.current?.setLookAt(0, 2.2, 5, 0, 1.0, 0, true);
		}
	}, [cameraZoomed]);
	return (
		<>
			<CameraControls
				ref={cameraControls}
				minDistance={1}
				maxDistance={10}
				minPolarAngle={0}
				maxPolarAngle={0.75 * Math.PI}
			/>
			<Environment files={"/images/venice_sunset_1k.hdr"} />
			Wrapping Dots into Suspense to prevent Blink when Troika/Font is loaded
			<Suspense>
				<Dots position-y={1.8} position-x={-0.1} />
			</Suspense>
			<Avatar position-x={-0.08} />
			<ContactShadows opacity={0.7} position-y={-0.02} />
		</>
	);
};

export default Experience;
