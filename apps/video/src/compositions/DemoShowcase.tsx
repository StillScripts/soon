import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"

const CLAMP_RIGHT = { extrapolateRight: "clamp" } as const

export const DemoShowcase = () => {
	const frame = useCurrentFrame()
	const { fps } = useVideoConfig()

	const titleOpacity = interpolate(frame, [0, 30], [0, 1], CLAMP_RIGHT)
	const subtitleOpacity = interpolate(frame, [20, 50], [0, 1], CLAMP_RIGHT)
	const cardOpacity = interpolate(frame, [40, 60], [0, 1], CLAMP_RIGHT)
	const badgeOpacity = interpolate(frame, [100, 120], [0, 1], CLAMP_RIGHT)
	const ctaOpacity = interpolate(frame, [140, 170], [0, 1], CLAMP_RIGHT)

	const titleY = spring({
		frame,
		fps,
		config: { damping: 20, stiffness: 100 },
	})

	const cardScale = spring({
		frame: frame - 40,
		fps,
		config: { damping: 15, stiffness: 80 },
	})

	const buttonScale = spring({
		frame: frame - 80,
		fps,
		config: { damping: 12, stiffness: 100 },
	})

	const ctaY = spring({
		frame: frame - 140,
		fps,
		config: { damping: 20, stiffness: 80 },
	})

	return (
		<AbsoluteFill className="bg-background flex items-center justify-center">
			<div className="flex flex-col items-center gap-8">
				<div
					style={{
						opacity: titleOpacity,
						transform: `translateY(${interpolate(titleY, [0, 1], [40, 0])}px)`,
					}}
				>
					<h1 className="text-foreground text-7xl font-bold tracking-tight">Soon Starter</h1>
				</div>

				<div style={{ opacity: subtitleOpacity }}>
					<p className="text-muted-foreground text-2xl">
						Production-ready monorepo with React 19, Next.js & Convex
					</p>
				</div>

				<div
					style={{
						opacity: cardOpacity,
						transform: `scale(${interpolate(cardScale, [0, 1], [0.8, 1])})`,
					}}
				>
					<div className="flex gap-6">
						{/* Card with Button */}
						<div className="ring-foreground/10 bg-card text-card-foreground flex w-80 flex-col gap-6 overflow-hidden rounded-xl py-6 shadow-xs ring-1">
							<div className="px-6">
								<div className="text-base leading-normal font-medium">Component Library</div>
								<div className="text-muted-foreground text-sm">shadcn/ui + Base UI primitives</div>
							</div>
							<div className="px-6">
								<div
									style={{
										transform: `scale(${interpolate(buttonScale, [0, 1], [0.5, 1])})`,
									}}
								>
									<button className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-md px-2.5 text-sm font-medium transition-all">
										Get Started
									</button>
								</div>
							</div>
						</div>

						{/* Card with Badges */}
						<div className="ring-foreground/10 bg-card text-card-foreground flex w-80 flex-col gap-6 overflow-hidden rounded-xl py-6 shadow-xs ring-1">
							<div className="px-6">
								<div className="text-base leading-normal font-medium">Tech Stack</div>
								<div className="text-muted-foreground text-sm">Modern tools, zero config</div>
							</div>
							<div className="flex flex-wrap gap-2 px-6" style={{ opacity: badgeOpacity }}>
								{["React 19", "Next.js", "Convex", "Tailwind v4", "Bun"].map((tech) => (
									<span
										key={tech}
										className="bg-secondary text-secondary-foreground inline-flex h-5 items-center justify-center rounded-4xl px-2 text-xs font-medium"
									>
										{tech}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* CTA */}
				<div
					style={{
						opacity: ctaOpacity,
						transform: `translateY(${interpolate(ctaY, [0, 1], [20, 0])}px)`,
					}}
				>
					<p className="text-foreground text-xl font-medium">Build faster. Ship sooner.</p>
				</div>
			</div>
		</AbsoluteFill>
	)
}
