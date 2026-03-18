import { Composition } from "remotion"

import { DemoShowcase } from "./compositions/DemoShowcase"
import "./index.css"

export const RemotionRoot: React.FC = () => {
	return (
		<>
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
