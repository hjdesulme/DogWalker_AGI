import { Configuration, OpenAIApi, ChatCompletionFunctions, ChatCompletionRequestMessage } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

const MODEL = 'gpt-3.5-turbo-0613'

const config = new Configuration({
	apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)
export const runtime = 'edge'

const servoFunctionFactory = () => {
	const servos = [
		{ name: 'back_right_lower', description: "Rotate the back right leg's forearm forward or backward from the elbow" },
		{ name: 'back_right_upper', description: "Rotate the back right leg's thigh forward or backward from the hip" },
		{ name: 'back_right_hip', description: 'Rotate the back right leg left or right' },
		{ name: 'back_left_lower', description: "Rotate the back left leg's forearm forward or backward from the elbow" },
		{ name: 'back_left_upper', description: "Rotate the back left leg's thigh forward or backward from the hip" },
		{ name: 'back_left_hip', description: 'Rotate the back left leg left or right' },
		{ name: 'front_left_lower', description: "Rotate the front left leg's forearm forward or backward from the elbow" },
		{ name: 'front_left_upper', description: "Rotate the front left leg's thigh forward or backward from the hip" },
		{ name: 'front_left_hip', description: 'Rotate the front left leg left or right' },
		{
			name: 'front_right_lower',
			description: "Rotate the front right leg's forearm forward or backward from the elbow"
		},
		{ name: 'front_right_upper', description: "Rotate the front right leg's thigh forward or backward from the hip" },
		{ name: 'front_right_hip', description: 'Rotate the front right leg left or right' }
	]
	return servos.map((servo) => {
		return {
			name: `move_${servo.name}`,
			description: servo.description,
			parameters: {
				type: 'object',
				properties: {
					angle: {
						type: 'number',
						description: 'angle to move servo to (from 0-180)'
					},
					duration: {
						type: 'number',
						description: 'time in milliseconds to perform the movement'
					}
				},
				required: ['angle']
			}
		}
	})
}

const functions: ChatCompletionFunctions[] = [
	...servoFunctionFactory(),
	{
		name: 'wag_tail',
		description: `wag the tail`,
		parameters: {
			type: 'object',
			properties: {
				speed: {
					type: 'number',
					description: 'time in milliseconds to do a full side-to-side wag (0 to stop)'
				}
			}
		}
	}
]

const messages: ChatCompletionRequestMessage[] = [
	{
		role: 'system',
		content:
			'You are an assistant that controls a robotic dog with a tail, four legs and three servos per leg. You receive instructions to move in a relative direction and speed. You may also receive sensor data as vectors: orientation, angular velocity, acceleration, and obstacle distance. You should adjust the servos on demand to learn and meet the requested requirements. Respond with one TypeScript function at a time. Do not include commentary, just the function calls.'
	},
	{
		role: 'user',
		content: 'I want to move forward by 2 feet.'
	}
]

export async function POST(req: Request) {
	// Ask OpenAI for a streaming chat completion given the prompt
	const response = await openai.createChatCompletion({
		model: MODEL,
		stream: true,
		messages,
		functions
	})

	const stream = OpenAIStream(response)
	// const stream = OpenAIStream(response, {
	// 	async experimental_onFunctionCall(payload, createFunctionCallMessages) {
	// 		const { name, arguments: args } = payload
	// 		console.log(`function received:`, { name, args })

	// 		const newMessages = createFunctionCallMessages({
	// 			data: {
	// 				position: { x: 0, y: 0, z: 0 },
	// 				angular: { x: 0, y: 0, z: 0 },
	// 				acceleration: { x: 0, y: 0, z: 0 }
	// 			}
	// 		}) as ChatCompletionRequestMessage[]

	// 		return openai.createChatCompletion({
	// 			messages: [...messages, ...newMessages],
	// 			stream: true,
	// 			model: MODEL,
	// 			functions
	// 		})
	// 	}
	// })
	// Respond with the stream
	return new StreamingTextResponse(stream)
}
