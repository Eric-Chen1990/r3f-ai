"use client";

import { chatCloudFunc } from "@/action/chatCloudFunc";
import { corresponding } from "@/const/corresponding";
import { facialExpressions } from "@/const/facialExpressions";
import useChatStore, { LipsyncType } from "@/store/chatStore";
import { useAnimations, useGLTF } from "@react-three/drei";
import { GroupProps, useFrame, useGraph } from "@react-three/fiber";
import { button, useControls } from "leva";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTF, SkeletonUtils } from "three-stdlib";

let setupMode = false;

type GLTFResult = GLTF & {
	nodes: {
		Wolf3D_Hair: THREE.SkinnedMesh;
		Wolf3D_Body: THREE.SkinnedMesh;
		Wolf3D_Outfit_Bottom: THREE.SkinnedMesh;
		Wolf3D_Outfit_Footwear: THREE.SkinnedMesh;
		Wolf3D_Outfit_Top: THREE.SkinnedMesh;
		EyeLeft: THREE.SkinnedMesh;
		EyeRight: THREE.SkinnedMesh;
		Wolf3D_Head: THREE.SkinnedMesh;
		Wolf3D_Teeth: THREE.SkinnedMesh;
		Hips: THREE.Bone;
	};
	materials: {
		Wolf3D_Hair: THREE.MeshStandardMaterial;
		Wolf3D_Body: THREE.MeshStandardMaterial;
		Wolf3D_Outfit_Bottom: THREE.MeshStandardMaterial;
		Wolf3D_Outfit_Footwear: THREE.MeshStandardMaterial;
		Wolf3D_Outfit_Top: THREE.MeshStandardMaterial;
		Wolf3D_Eye: THREE.MeshStandardMaterial;
		Wolf3D_Skin: THREE.MeshStandardMaterial;
		Wolf3D_Teeth: THREE.MeshStandardMaterial;
	};
	animations: [];
};

const Avatar = (props: GroupProps) => {
	const { scene } = useGLTF("/models/674da39f565cd4473b840ddc-transformed.glb");
	const { animations } = useGLTF("/models/animations.glb");
	const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);

	const { nodes, materials } = useGraph(clone) as GLTFResult;

	const { message, messages, setMessages } = useChatStore();

	const [lipsync, setLipsync] = useState<LipsyncType | null>(null);
	const [blink, setBlink] = useState(false);
	const [winkLeft, setWinkLeft] = useState(false);
	const [winkRight, setWinkRight] = useState(false);
	const [facialExpression, setFacialExpression] =
		useState<keyof typeof facialExpressions>("default");
	const [audio, setAudio] = useState<HTMLAudioElement | undefined>(undefined);
	const group = useRef<THREE.Group>(null);

	const adjustedAnimations = useMemo(
		() =>
			animations.map((animation) => {
				animation.tracks = animation.tracks.filter(
					(track) =>
						!track.name.includes("_end.") && !track.name.startsWith("Armature")
				);
				return animation;
			}),
		[animations]
	);
	const { actions } = useAnimations(adjustedAnimations, group);
	const [animation, setAnimation] = useState(
		adjustedAnimations.find((a) => a.name === "Idle")
			? "Idle"
			: adjustedAnimations[0].name
	);

	useEffect(() => {
		if (actions && actions[animation]) {
			actions[animation].reset().fadeIn(0.5).play();
		}
		return () => {
			if (actions && actions[animation]) {
				actions[animation].fadeOut(0.5);
			}
		};
	}, [animation, actions]);

	useEffect(() => {
		console.log(message);
		if (!message) {
			setAnimation("Idle");
			return;
		}
		setAnimation(message.animation);
		setFacialExpression(
			message.facialExpression as keyof typeof facialExpressions
		);
		setLipsync(message.lipsync as LipsyncType);
		const audio = new Audio("data:audio/mp3;base64," + message.audio);
		audio.play();
		setAudio(audio);
		audio.onended = () => {
			setMessages(messages.slice(1));
		};
	}, [messages, message, setMessages]);

	const lerpMorphTarget = (target: string, value: number, speed = 0.1) => {
		clone.traverse((child) => {
			if (child instanceof THREE.SkinnedMesh && child.morphTargetDictionary) {
				const index = child.morphTargetDictionary[target];
				if (
					index !== undefined &&
					child.morphTargetInfluences &&
					child.morphTargetInfluences[index] !== undefined
				) {
					child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
						child.morphTargetInfluences[index],
						value,
						speed
					);
					if (!setupMode && value !== undefined) {
						try {
							set({ [target]: value });
						} catch (e) {
							console.log(e);
						}
					}
				}
			}
		});
	};

	useFrame(() => {
		if (!setupMode) {
			Object.keys(nodes.EyeLeft.morphTargetDictionary as object).forEach(
				(key) => {
					const mapping = facialExpressions[facialExpression];
					if (key !== "eyeBlinkLeft" && key !== "eyeBlinkRight") {
						lerpMorphTarget(
							key,
							mapping && (mapping as Record<string, number>)[key]
								? (mapping as Record<string, number>)[key]
								: 0,
							0.1
						);
					}
				}
			);
			lerpMorphTarget("eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
			lerpMorphTarget("eyeBlinkRight", blink || winkRight ? 1 : 0, 0.5);
			if (message && lipsync) {
				const currentAudioTime = audio ? audio.currentTime : 0;
				const appliedMorphTargets = lipsync.mouthCues
					.filter(
						(mouthCue) =>
							currentAudioTime >= mouthCue.start &&
							currentAudioTime <= mouthCue.end
					)
					.map(
						(mouthCue) =>
							corresponding[mouthCue.value as keyof typeof corresponding]
					);
				appliedMorphTargets.forEach((value) => lerpMorphTarget(value, 1, 0.2));
				Object.values(corresponding).forEach((value) => {
					if (!appliedMorphTargets.includes(value)) {
						lerpMorphTarget(value, 0, 0.1);
					}
				});
			}
		}
	});

	useControls("FacialExpressions", {
		chat: button(async () => {
			const data = await chatCloudFunc("test");
			if (data?.messages) {
				setMessages(data.messages);
			}
		}),
		winkLeft: button(() => {
			setWinkLeft(true);
			setTimeout(() => setWinkLeft(false), 300);
		}),
		winkRight: button(() => {
			setWinkRight(true);
			setTimeout(() => setWinkRight(false), 300);
		}),
		animation: {
			value: animation,
			options: adjustedAnimations.map((a) => a.name),
			onChange: (value) => setAnimation(value),
		},
		facialExpression: {
			options: Object.keys(facialExpressions),
			onChange: (value) => setFacialExpression(value),
		},
		enableSetupMode: button(() => {
			setupMode = true;
		}),
		disableSetupMode: button(() => {
			setupMode = false;
		}),
		logMorphTargetValues: button(() => {
			const emotionValues: { [key: string]: number } = {};

			Object.keys(nodes.EyeLeft.morphTargetDictionary as object).forEach(
				(key) => {
					if (
						key !== "eyeBlinkLeft" &&
						key !== "eyeBlinkRight" &&
						nodes.EyeLeft.morphTargetInfluences &&
						nodes.EyeLeft.morphTargetDictionary
					) {
						const value =
							nodes.EyeLeft.morphTargetInfluences[
								nodes.EyeLeft.morphTargetDictionary[key]
							];
						if (value > 0.01) {
							emotionValues[key] = value;
						}
					}
				}
			);
			console.log(JSON.stringify(emotionValues, null, 2));
		}),
	});

	const [, set] = useControls("MorphTarget", () =>
		Object.assign(
			{},
			...Object.keys(nodes.EyeLeft.morphTargetDictionary as object)
				.sort()
				.map((key) => ({
					[key]: {
						label: key,
						value: 0,
						min:
							nodes.EyeLeft.morphTargetInfluences &&
							nodes.EyeLeft.morphTargetDictionary
								? nodes.EyeLeft.morphTargetInfluences[
										nodes.EyeLeft.morphTargetDictionary[key]
								  ]
								: 0,
						max: 1,
						onChange: (val: number) => {
							if (setupMode) {
								lerpMorphTarget(key, val, 1);
							}
						},
					},
				}))
		)
	);

	useEffect(() => {
		const blinkInterval = setInterval(() => {
			setBlink(true);
			setTimeout(() => setBlink(false), 200);
		}, THREE.MathUtils.randInt(1000, 5000));
		return () => clearInterval(blinkInterval);
	}, []);

	return (
		<group {...props} dispose={null} ref={group}>
			<primitive object={nodes.Hips} />
			{/* ...other skinnedMesh components... */}
			<skinnedMesh
				name="Wolf3D_Body"
				geometry={nodes.Wolf3D_Body.geometry}
				material={materials.Wolf3D_Body}
				skeleton={nodes.Wolf3D_Body.skeleton}
			/>
			<skinnedMesh
				name="Wolf3D_Outfit_Bottom"
				geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
				material={materials.Wolf3D_Outfit_Bottom}
				skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
			/>
			<skinnedMesh
				name="Wolf3D_Outfit_Footwear"
				geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
				material={materials.Wolf3D_Outfit_Footwear}
				skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
			/>
			<skinnedMesh
				name="Wolf3D_Outfit_Top"
				geometry={nodes.Wolf3D_Outfit_Top.geometry}
				material={materials.Wolf3D_Outfit_Top}
				skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
			/>
			<skinnedMesh
				name="Wolf3D_Hair"
				geometry={nodes.Wolf3D_Hair.geometry}
				material={materials.Wolf3D_Hair}
				skeleton={nodes.Wolf3D_Hair.skeleton}
			/>
			<skinnedMesh
				name="EyeLeft"
				geometry={nodes.EyeLeft.geometry}
				material={materials.Wolf3D_Eye}
				skeleton={nodes.EyeLeft.skeleton}
				morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
				morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
			/>
			<skinnedMesh
				name="EyeRight"
				geometry={nodes.EyeRight.geometry}
				material={materials.Wolf3D_Eye}
				skeleton={nodes.EyeRight.skeleton}
				morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
				morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
			/>
			<skinnedMesh
				name="Wolf3D_Head"
				geometry={nodes.Wolf3D_Head.geometry}
				material={materials.Wolf3D_Skin}
				skeleton={nodes.Wolf3D_Head.skeleton}
				morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
				morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
			/>
			<skinnedMesh
				name="Wolf3D_Teeth"
				geometry={nodes.Wolf3D_Teeth.geometry}
				material={materials.Wolf3D_Teeth}
				skeleton={nodes.Wolf3D_Teeth.skeleton}
				morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
				morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
			/>
		</group>
	);
};

export default Avatar;

useGLTF.preload("/models/674da39f565cd4473b840ddc-transformed.glb");
useGLTF.preload("/models/animations.glb");
