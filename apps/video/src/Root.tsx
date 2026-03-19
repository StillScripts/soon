import { Composition } from "remotion"

import { ComponentShowcase } from "./compositions/ComponentShowcase"
import { DemoShowcase } from "./compositions/DemoShowcase"
import "./index.css"

// 6 scenes + 6 transitions: 120+150+150+120+150+150+120 - 6*20 = 840 frames
const SHOWCASE_DURATION = 840

export const RemotionRoot = () => {
	return (
		<>
			<Composition
				id="ComponentShowcase"
				component={ComponentShowcase}
				durationInFrames={SHOWCASE_DURATION}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				id="DemoShowcase"
				component={DemoShowcase}
				durationInFrames={300}
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	)
}
