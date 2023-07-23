'use client'

import { useState, Suspense } from 'react'
import { useCompletion } from 'ai/react'
import { Canvas } from '@react-three/fiber'
import { Box, Torus, Sphere, useFBX } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'

export interface IHistory {
	user: string
	bot: string
}

const RightLegLower = () => {
	const ModelSparkyLegRightLower = useFBX('/models/sparky-right-leg-lower.fbx')
	return <primitive object={ModelSparkyLegRightLower} scale={0.025} />
}
const RightLegUpper = () => {
	const ModelSparkyLegRightUpper = useFBX('/models/sparky-right-leg-upper.fbx')
	return <primitive object={ModelSparkyLegRightUpper} scale={0.025} />
}
const RightLegServoHub = () => {
	const ModelSparkyLegRightHub = useFBX('/models/sparky-right-leg-servo-hub.fbx')
	return <primitive object={ModelSparkyLegRightHub} scale={0.025} />
}

const SimulationPreview = () => {
	// const ModelSparkyLegRightUpper = useFBX('/models/sparky-right-leg-upper.fbx')

	return (
		<div
			id="simulation-preview"
			className="mt-4 max-w-md mx-auto w-full"
			style={{ height: '24rem', backgroundColor: 'black' }}>
			<Canvas>
				<Suspense>
					<ambientLight intensity={0.15} />
					<pointLight position={[10, 10, 10]} intensity={0.15} />
					<Physics>
						<RigidBody position={[0, 0, 0]} colliders={'hull'}>
							<RightLegLower />
						</RigidBody>
						<RigidBody position={[0, 0, 1]} colliders={'hull'}>
							<RightLegUpper />
						</RigidBody>
						<RigidBody position={[0, 0, 1]} colliders={'hull'}>
							<RightLegServoHub />
						</RigidBody>
						{/* <RigidBody colliders={'hull'} restitution={2}>
							<RightLegUpper />
						</RigidBody> */}
						{/* <RigidBody position={[0, 2, 0]} colliders={'hull'} restitution={2}>
							<Torus />
						</RigidBody> */}
						<CuboidCollider position={[0, -2, 0]} args={[20, 0.5, 20]} />
					</Physics>
				</Suspense>
			</Canvas>
		</div>
	)
}

export default function SloganGenerator() {
	const { completion, input, handleInputChange, handleSubmit } = useCompletion({ api: '/api/completion' })

	const [history, setHistory] = useState<IHistory[]>([])

	const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		handleSubmit(e)
		setHistory((prevHistory) => [...prevHistory, { user: input, bot: completion }])

		// send a POST request to your backend
		fetch('/api/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ input: input })
		})
			.then((response) => response.json())
			.then((data) => console.log(data))
	}

	return (
		<div className="mx-auto w-full max-w-md min-h-screen py-8 px-4 bg-gradient-to-b from-black to-white text-black flex flex-col justify-between">
			<SimulationPreview></SimulationPreview>
			<div className="overflow-auto">
				{history.map((entry, index) => (
					<div key={index} className="mb-4">
						<div className="font-bold text-white mb-2">You: {entry.user}</div>
						<div className="font-semibold text-white">Bot: {entry.bot}</div>
					</div>
				))}
			</div>
			<form onSubmit={handleFormSubmit} className="mt-4">
				<input
					className="w-full bg-white text-black rounded p-2"
					value={input}
					placeholder="Enter movement command..."
					onChange={handleInputChange}
				/>
				<button className="w-full mt-2 bg-white text-black py-2 rounded">Submit</button>
			</form>
		</div>
	)
}
