import { TransitionSeries, linearTiming } from "@remotion/transitions"
import { fade } from "@remotion/transitions/fade"
import { slide } from "@remotion/transitions/slide"
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const

// ─── Scene: Intro ────────────────────────────────────────────────────────────

const IntroScene = () => {
	const frame = useCurrentFrame()
	const { fps } = useVideoConfig()

	const titleProgress = spring({ frame, fps, config: { damping: 200 } })
	const subtitleOpacity = interpolate(frame, [20, 45], [0, 1], CLAMP)
	const lineWidth = interpolate(frame, [30, 60], [0, 200], CLAMP)
	const tagOpacity = interpolate(frame, [50, 70], [0, 1], CLAMP)

	return (
		<AbsoluteFill className="bg-background flex flex-col items-center justify-center gap-6">
			<div
				style={{
					opacity: interpolate(titleProgress, [0, 1], [0, 1]),
					transform: `translateY(${interpolate(titleProgress, [0, 1], [50, 0])}px)`,
				}}
			>
				<h1 className="text-foreground text-8xl font-bold tracking-tight">Component Showcase</h1>
			</div>
			<div
				className="bg-primary rounded-full"
				style={{ width: lineWidth, height: 4, opacity: subtitleOpacity }}
			/>
			<div style={{ opacity: subtitleOpacity }}>
				<p className="text-muted-foreground text-3xl">shadcn/ui + Base UI primitives</p>
			</div>
			<div style={{ opacity: tagOpacity }}>
				<p className="text-muted-foreground text-xl">@repo/ui</p>
			</div>
		</AbsoluteFill>
	)
}

// ─── Scene: Buttons ──────────────────────────────────────────────────────────

const BUTTON_VARIANTS = [
	{ label: "Default", classes: "bg-primary text-primary-foreground" },
	{ label: "Secondary", classes: "bg-secondary text-secondary-foreground" },
	{ label: "Outline", classes: "border-input bg-background text-foreground border" },
	{ label: "Ghost", classes: "text-foreground" },
	{ label: "Destructive", classes: "bg-destructive text-white" },
	{ label: "Link", classes: "text-primary underline" },
] as const

const BUTTON_SIZES = [
	{ label: "xs", height: "h-7 px-2 text-xs" },
	{ label: "sm", height: "h-8 px-3 text-sm" },
	{ label: "default", height: "h-9 px-4 text-sm" },
	{ label: "lg", height: "h-10 px-5 text-base" },
] as const

const ButtonScene = () => {
	const frame = useCurrentFrame()
	const { fps } = useVideoConfig()

	const titleProgress = spring({ frame, fps, config: { damping: 200 } })

	return (
		<AbsoluteFill className="bg-background flex flex-col items-center justify-center gap-14 px-40">
			<div
				style={{
					opacity: interpolate(titleProgress, [0, 1], [0, 1]),
					transform: `translateY(${interpolate(titleProgress, [0, 1], [30, 0])}px)`,
				}}
			>
				<h2 className="text-foreground text-6xl font-bold">Button</h2>
				<p className="text-muted-foreground mt-2 text-center text-xl">
					6 variants &middot; 4 sizes &middot; icon support
				</p>
			</div>

			{/* Variants row */}
			<div className="flex gap-4">
				{BUTTON_VARIANTS.map((variant, i) => {
					const progress = spring({
						frame: frame - 15,
						fps,
						delay: i * 4,
						config: { damping: 15, stiffness: 120 },
					})
					return (
						<div
							key={variant.label}
							style={{
								opacity: interpolate(progress, [0, 1], [0, 1]),
								transform: `scale(${interpolate(progress, [0, 1], [0.5, 1])})`,
							}}
						>
							<button
								className={`inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-medium ${variant.classes}`}
							>
								{variant.label}
							</button>
						</div>
					)
				})}
			</div>

			{/* Sizes row */}
			<div className="flex items-end gap-4">
				{BUTTON_SIZES.map((size, i) => {
					const progress = spring({
						frame: frame - 50,
						fps,
						delay: i * 5,
						config: { damping: 15, stiffness: 120 },
					})
					return (
						<div
							key={size.label}
							className="flex flex-col items-center gap-2"
							style={{
								opacity: interpolate(progress, [0, 1], [0, 1]),
								transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px)`,
							}}
						>
							<button
								className={`bg-primary text-primary-foreground inline-flex items-center justify-center rounded-lg font-medium ${size.height}`}
							>
								Size: {size.label}
							</button>
							<span className="text-muted-foreground text-sm">{size.label}</span>
						</div>
					)
				})}
			</div>
		</AbsoluteFill>
	)
}

// ─── Scene: Cards ────────────────────────────────────────────────────────────

const CardScene = () => {
	const frame = useCurrentFrame()
	const { fps } = useVideoConfig()

	const titleProgress = spring({ frame, fps, config: { damping: 200 } })

	const cards = [
		{
			title: "Project Alpha",
			description: "A next-generation platform built with modern tools.",
			footer: "Updated 2 days ago",
			badge: "Active",
		},
		{
			title: "Design System",
			description: "Consistent, accessible components for your entire team.",
			footer: "v2.4.0 released",
			badge: "New",
		},
		{
			title: "Analytics",
			description: "Real-time insights and performance monitoring dashboard.",
			footer: "1.2k daily users",
			badge: "Beta",
		},
	]

	return (
		<AbsoluteFill className="bg-background flex flex-col items-center justify-center gap-14 px-32">
			<div
				style={{
					opacity: interpolate(titleProgress, [0, 1], [0, 1]),
					transform: `translateY(${interpolate(titleProgress, [0, 1], [30, 0])}px)`,
				}}
			>
				<h2 className="text-foreground text-6xl font-bold">Card</h2>
				<p className="text-muted-foreground mt-2 text-center text-xl">
					Header, content, footer &middot; composable layout
				</p>
			</div>

			<div className="flex gap-8">
				{cards.map((card, i) => {
					const progress = spring({
						frame: frame - 20,
						fps,
						delay: i * 8,
						config: { damping: 15, stiffness: 80 },
					})
					return (
						<div
							key={card.title}
							style={{
								opacity: interpolate(progress, [0, 1], [0, 1]),
								transform: `scale(${interpolate(progress, [0, 1], [0.85, 1])}) translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
							}}
						>
							<div className="ring-foreground/10 bg-card text-card-foreground flex w-96 flex-col gap-6 overflow-hidden rounded-xl py-6 shadow-sm ring-1">
								<div className="flex items-start justify-between px-6">
									<div>
										<div className="text-lg font-semibold">{card.title}</div>
										<div className="text-muted-foreground mt-1 text-sm">{card.description}</div>
									</div>
									<span className="bg-primary text-primary-foreground inline-flex h-5 items-center rounded-full px-2 text-xs font-medium">
										{card.badge}
									</span>
								</div>
								<div className="bg-muted mx-6 h-28 rounded-lg" />
								<div className="border-foreground/5 border-t px-6 pt-4">
									<span className="text-muted-foreground text-sm">{card.footer}</span>
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</AbsoluteFill>
	)
}

// ─── Scene: Badges ───────────────────────────────────────────────────────────

const BADGE_VARIANTS = [
	{ label: "Default", classes: "bg-primary text-primary-foreground" },
	{ label: "Secondary", classes: "bg-secondary text-secondary-foreground" },
	{ label: "Destructive", classes: "bg-destructive text-white" },
	{ label: "Outline", classes: "border-input text-foreground border bg-transparent" },
	{ label: "Ghost", classes: "text-foreground bg-transparent" },
] as const

const EXAMPLE_BADGES = [
	["React 19", "Next.js 16", "TypeScript 5.9", "Bun", "Tailwind v4"],
	["Published", "Draft", "Archived", "Featured", "Pinned"],
	["v2.4.0", "stable", "canary", "nightly", "rc-1"],
] as const

const BadgeScene = () => {
	const frame = useCurrentFrame()
	const { fps } = useVideoConfig()

	const titleProgress = spring({ frame, fps, config: { damping: 200 } })

	return (
		<AbsoluteFill className="bg-background flex flex-col items-center justify-center gap-14 px-40">
			<div
				style={{
					opacity: interpolate(titleProgress, [0, 1], [0, 1]),
					transform: `translateY(${interpolate(titleProgress, [0, 1], [30, 0])}px)`,
				}}
			>
				<h2 className="text-foreground text-6xl font-bold">Badge</h2>
				<p className="text-muted-foreground mt-2 text-center text-xl">
					5 variants &middot; inline icons &middot; status indicators
				</p>
			</div>

			{/* Variant showcase */}
			<div className="flex gap-5">
				{BADGE_VARIANTS.map((variant, i) => {
					const progress = spring({
						frame: frame - 15,
						fps,
						delay: i * 4,
						config: { damping: 12, stiffness: 100 },
					})
					return (
						<div
							key={variant.label}
							style={{
								opacity: interpolate(progress, [0, 1], [0, 1]),
								transform: `scale(${interpolate(progress, [0, 1], [0.3, 1])})`,
							}}
						>
							<span
								className={`inline-flex h-6 items-center justify-center rounded-full px-3 text-sm font-medium ${variant.classes}`}
							>
								{variant.label}
							</span>
						</div>
					)
				})}
			</div>

			{/* Example rows */}
			<div className="flex flex-col gap-5">
				{EXAMPLE_BADGES.map((row, rowIdx) => (
					<div key={rowIdx} className="flex justify-center gap-3">
						{row.map((badge, i) => {
							const progress = spring({
								frame: frame - 40 - rowIdx * 10,
								fps,
								delay: i * 3,
								config: { damping: 15, stiffness: 120 },
							})
							return (
								<div
									key={badge}
									style={{
										opacity: interpolate(progress, [0, 1], [0, 1]),
										transform: `translateY(${interpolate(progress, [0, 1], [15, 0])}px)`,
									}}
								>
									<span className="bg-secondary text-secondary-foreground inline-flex h-6 items-center justify-center rounded-full px-3 text-xs font-medium">
										{badge}
									</span>
								</div>
							)
						})}
					</div>
				))}
			</div>
		</AbsoluteFill>
	)
}

// ─── Scene: Form Elements ────────────────────────────────────────────────────

const FormScene = () => {
	const frame = useCurrentFrame()
	const { fps } = useVideoConfig()

	const titleProgress = spring({ frame, fps, config: { damping: 200 } })

	const formProgress = spring({
		frame: frame - 20,
		fps,
		config: { damping: 200 },
	})

	const selectProgress = spring({
		frame: frame - 35,
		fps,
		config: { damping: 200 },
	})

	const textareaProgress = spring({
		frame: frame - 50,
		fps,
		config: { damping: 200 },
	})

	return (
		<AbsoluteFill className="bg-background flex flex-col items-center justify-center gap-14 px-40">
			<div
				style={{
					opacity: interpolate(titleProgress, [0, 1], [0, 1]),
					transform: `translateY(${interpolate(titleProgress, [0, 1], [30, 0])}px)`,
				}}
			>
				<h2 className="text-foreground text-6xl font-bold">Form Elements</h2>
				<p className="text-muted-foreground mt-2 text-center text-xl">
					Input, Textarea, Select, Label, Field &middot; accessible by default
				</p>
			</div>

			<div className="flex gap-10">
				{/* Input + Label card */}
				<div
					style={{
						opacity: interpolate(formProgress, [0, 1], [0, 1]),
						transform: `translateY(${interpolate(formProgress, [0, 1], [25, 0])}px)`,
					}}
				>
					<div className="ring-foreground/10 bg-card flex w-[420px] flex-col gap-5 rounded-xl p-8 shadow-sm ring-1">
						<h3 className="text-foreground text-lg font-semibold">Create Account</h3>
						<div className="flex flex-col gap-1.5">
							<label className="text-foreground text-sm font-medium">Full Name</label>
							<div className="border-input bg-background flex h-9 items-center rounded-md border px-3 text-sm">
								<span className="text-muted-foreground">Jane Doe</span>
							</div>
						</div>
						<div className="flex flex-col gap-1.5">
							<label className="text-foreground text-sm font-medium">Email</label>
							<div className="border-input bg-background flex h-9 items-center rounded-md border px-3 text-sm">
								<span className="text-muted-foreground">jane@example.com</span>
							</div>
						</div>
						<button className="bg-primary text-primary-foreground inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium">
							Sign Up
						</button>
					</div>
				</div>

				{/* Select */}
				<div
					className="flex flex-col gap-6"
					style={{
						opacity: interpolate(selectProgress, [0, 1], [0, 1]),
						transform: `translateY(${interpolate(selectProgress, [0, 1], [25, 0])}px)`,
					}}
				>
					<div className="ring-foreground/10 bg-card flex w-[340px] flex-col gap-4 rounded-xl p-8 shadow-sm ring-1">
						<h3 className="text-foreground text-lg font-semibold">Select</h3>
						<div className="flex flex-col gap-1.5">
							<label className="text-foreground text-sm font-medium">Framework</label>
							<div className="border-input bg-background flex h-9 items-center justify-between rounded-md border px-3 text-sm">
								<span>Next.js</span>
								<svg width="12" height="12" viewBox="0 0 12 12" className="text-muted-foreground">
									<path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
								</svg>
							</div>
						</div>
						<div className="flex flex-col gap-1.5">
							<label className="text-foreground text-sm font-medium">Theme</label>
							<div className="border-input bg-background flex h-9 items-center justify-between rounded-md border px-3 text-sm">
								<span>System</span>
								<svg width="12" height="12" viewBox="0 0 12 12" className="text-muted-foreground">
									<path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
								</svg>
							</div>
						</div>
					</div>
				</div>

				{/* Textarea */}
				<div
					style={{
						opacity: interpolate(textareaProgress, [0, 1], [0, 1]),
						transform: `translateY(${interpolate(textareaProgress, [0, 1], [25, 0])}px)`,
					}}
				>
					<div className="ring-foreground/10 bg-card flex w-[340px] flex-col gap-4 rounded-xl p-8 shadow-sm ring-1">
						<h3 className="text-foreground text-lg font-semibold">Textarea</h3>
						<div className="flex flex-col gap-1.5">
							<label className="text-foreground text-sm font-medium">Message</label>
							<div className="border-input bg-background min-h-[120px] rounded-md border p-3 text-sm">
								<span className="text-muted-foreground">
									Tell us about your project and how we can help...
								</span>
							</div>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground text-xs">Markdown supported</span>
							<span className="text-muted-foreground text-xs">0 / 500</span>
						</div>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	)
}

// ─── Scene: Alert Dialog & Dropdown ──────────────────────────────────────────

const OverlayScene = () => {
	const frame = useCurrentFrame()
	const { fps } = useVideoConfig()

	const titleProgress = spring({ frame, fps, config: { damping: 200 } })

	const dialogProgress = spring({
		frame: frame - 20,
		fps,
		config: { damping: 15, stiffness: 80 },
	})

	const dropdownProgress = spring({
		frame: frame - 40,
		fps,
		config: { damping: 15, stiffness: 80 },
	})

	return (
		<AbsoluteFill className="bg-background flex flex-col items-center justify-center gap-14 px-40">
			<div
				style={{
					opacity: interpolate(titleProgress, [0, 1], [0, 1]),
					transform: `translateY(${interpolate(titleProgress, [0, 1], [30, 0])}px)`,
				}}
			>
				<h2 className="text-foreground text-6xl font-bold">Overlays</h2>
				<p className="text-muted-foreground mt-2 text-center text-xl">
					AlertDialog &middot; DropdownMenu &middot; accessible modals
				</p>
			</div>

			<div className="flex gap-16">
				{/* Alert Dialog mockup */}
				<div
					style={{
						opacity: interpolate(dialogProgress, [0, 1], [0, 1]),
						transform: `scale(${interpolate(dialogProgress, [0, 1], [0.9, 1])})`,
					}}
				>
					<div className="relative">
						{/* Dimmed background */}
						<div className="bg-foreground/5 flex h-[320px] w-[500px] items-center justify-center rounded-2xl">
							{/* Dialog */}
							<div className="bg-card ring-foreground/10 w-[380px] rounded-xl p-6 shadow-lg ring-1">
								<h3 className="text-foreground text-lg font-semibold">Are you sure?</h3>
								<p className="text-muted-foreground mt-2 text-sm">
									This action cannot be undone. This will permanently delete your account and remove
									your data.
								</p>
								<div className="mt-6 flex justify-end gap-3">
									<button className="border-input text-foreground inline-flex h-9 items-center rounded-md border bg-transparent px-4 text-sm font-medium">
										Cancel
									</button>
									<button className="bg-destructive inline-flex h-9 items-center rounded-md px-4 text-sm font-medium text-white">
										Delete
									</button>
								</div>
							</div>
						</div>
						<div className="text-muted-foreground mt-3 text-center text-sm">AlertDialog</div>
					</div>
				</div>

				{/* Dropdown mockup */}
				<div
					style={{
						opacity: interpolate(dropdownProgress, [0, 1], [0, 1]),
						transform: `scale(${interpolate(dropdownProgress, [0, 1], [0.9, 1])})`,
					}}
				>
					<div className="relative">
						<div className="bg-foreground/5 flex h-[320px] w-[340px] flex-col items-center rounded-2xl pt-10">
							{/* Trigger button */}
							<button className="border-input text-foreground inline-flex h-9 items-center rounded-md border bg-transparent px-4 text-sm font-medium">
								Open Menu ▾
							</button>
							{/* Dropdown content */}
							<div className="bg-card ring-foreground/10 mt-2 w-56 rounded-lg p-1 shadow-lg ring-1">
								{["Profile", "Settings", "Keyboard shortcuts"].map((item) => (
									<div
										key={item}
										className="text-foreground flex h-8 items-center rounded-md px-3 text-sm"
									>
										{item}
									</div>
								))}
								<div className="bg-foreground/10 my-1 h-px" />
								{["Team", "New Team"].map((item) => (
									<div
										key={item}
										className="text-foreground flex h-8 items-center rounded-md px-3 text-sm"
									>
										{item}
									</div>
								))}
								<div className="bg-foreground/10 my-1 h-px" />
								<div className="text-destructive flex h-8 items-center rounded-md px-3 text-sm">
									Log out
								</div>
							</div>
						</div>
						<div className="text-muted-foreground mt-3 text-center text-sm">DropdownMenu</div>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	)
}

// ─── Scene: Outro ────────────────────────────────────────────────────────────

const OutroScene = () => {
	const frame = useCurrentFrame()
	const { fps } = useVideoConfig()

	const titleProgress = spring({ frame, fps, config: { damping: 200 } })
	const subtitleProgress = spring({ frame: frame - 15, fps, config: { damping: 200 } })
	const lineWidth = interpolate(frame, [20, 50], [0, 300], CLAMP)

	const components = [
		"Button",
		"Card",
		"Badge",
		"Input",
		"Select",
		"Textarea",
		"AlertDialog",
		"DropdownMenu",
		"Combobox",
		"Field",
		"Separator",
		"Label",
	]

	return (
		<AbsoluteFill className="bg-background flex flex-col items-center justify-center gap-8">
			<div
				style={{
					opacity: interpolate(titleProgress, [0, 1], [0, 1]),
					transform: `translateY(${interpolate(titleProgress, [0, 1], [40, 0])}px)`,
				}}
			>
				<h1 className="text-foreground text-7xl font-bold tracking-tight">
					Build faster. Ship sooner.
				</h1>
			</div>

			<div
				className="bg-primary rounded-full"
				style={{
					width: lineWidth,
					height: 4,
					opacity: interpolate(subtitleProgress, [0, 1], [0, 1]),
				}}
			/>

			<div
				style={{
					opacity: interpolate(subtitleProgress, [0, 1], [0, 1]),
				}}
			>
				<p className="text-muted-foreground text-2xl">
					{components.length} components &middot; accessible &middot; composable &middot; themeable
				</p>
			</div>

			<div className="mt-4 flex flex-wrap justify-center gap-3">
				{components.map((name, i) => {
					const progress = spring({
						frame: frame - 25,
						fps,
						delay: i * 3,
						config: { damping: 15, stiffness: 120 },
					})
					return (
						<div
							key={name}
							style={{
								opacity: interpolate(progress, [0, 1], [0, 1]),
								transform: `scale(${interpolate(progress, [0, 1], [0.5, 1])})`,
							}}
						>
							<span className="bg-secondary text-secondary-foreground inline-flex h-8 items-center rounded-full px-4 text-sm font-medium">
								{name}
							</span>
						</div>
					)
				})}
			</div>
		</AbsoluteFill>
	)
}

// ─── Main Composition ────────────────────────────────────────────────────────

const TRANSITION_DURATION = 20

export const ComponentShowcase = () => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={120}>
				<IntroScene />
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				presentation={fade()}
				timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
			/>

			<TransitionSeries.Sequence durationInFrames={150}>
				<ButtonScene />
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				presentation={slide({ direction: "from-right" })}
				timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
			/>

			<TransitionSeries.Sequence durationInFrames={150}>
				<CardScene />
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				presentation={fade()}
				timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
			/>

			<TransitionSeries.Sequence durationInFrames={120}>
				<BadgeScene />
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				presentation={slide({ direction: "from-left" })}
				timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
			/>

			<TransitionSeries.Sequence durationInFrames={150}>
				<FormScene />
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				presentation={fade()}
				timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
			/>

			<TransitionSeries.Sequence durationInFrames={150}>
				<OverlayScene />
			</TransitionSeries.Sequence>

			<TransitionSeries.Transition
				presentation={fade()}
				timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
			/>

			<TransitionSeries.Sequence durationInFrames={120}>
				<OutroScene />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	)
}
