---
title: UI Components
description: Available components in the @repo/ui package with usage examples.
---

The `@repo/ui` package provides shadcn/ui components built on Base UI primitives with Tailwind CSS v4.

## Installation

Components are pre-installed. Import from:

```tsx
import { Button } from "@repo/ui/components/ui/button"
```

Or use the barrel export:

```tsx
import { Button, Card, Input } from "@repo/ui/components/ui"
```

## Available Components

### Button

```tsx
import { Button } from "@repo/ui/components/ui/button"

<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>

<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

<Button size="icon"><IconComponent /></Button>
<Button size="icon-sm"><IconComponent /></Button>
```

### Card

```tsx
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card"
;<Card>
	<CardHeader>
		<CardTitle>Card Title</CardTitle>
		<CardDescription>Card description text</CardDescription>
	</CardHeader>
	<CardContent>
		<p>Card content goes here</p>
	</CardContent>
	<CardFooter>
		<Button>Action</Button>
	</CardFooter>
</Card>
```

### Input

```tsx
import { Input } from "@repo/ui/components/ui/input"

<Input type="text" placeholder="Enter text..." />
<Input type="email" placeholder="Email address" />
<Input type="password" placeholder="Password" />
<Input disabled placeholder="Disabled" />
```

### Textarea

```tsx
import { Textarea } from "@repo/ui/components/ui/textarea"

<Textarea placeholder="Enter long text..." />
<Textarea rows={6} />
```

### Label

```tsx
import { Label } from "@repo/ui/components/ui/label"

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

### Field Components

Complete form field system with labels, descriptions, and errors:

```tsx
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
	FieldTitle,
} from "@repo/ui/components/ui/field"
;<FieldGroup>
	<Field>
		<FieldLabel htmlFor="name">Name</FieldLabel>
		<Input id="name" />
		<FieldDescription>Enter your full name</FieldDescription>
		<FieldError errors={[{ message: "Required" }]} />
	</Field>
</FieldGroup>
```

### Input Group

```tsx
import { InputGroup, InputGroupText } from "@repo/ui/components/ui/input-group"
;<InputGroup>
	<InputGroupText>$</InputGroupText>
	<Input type="number" placeholder="0.00" />
</InputGroup>
```

### Select

```tsx
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/ui/select"
;<Select>
	<SelectTrigger>
		<SelectValue placeholder="Select option" />
	</SelectTrigger>
	<SelectContent>
		<SelectGroup>
			<SelectLabel>Fruits</SelectLabel>
			<SelectItem value="apple">Apple</SelectItem>
			<SelectItem value="banana">Banana</SelectItem>
		</SelectGroup>
		<SelectSeparator />
		<SelectGroup>
			<SelectLabel>Vegetables</SelectLabel>
			<SelectItem value="carrot">Carrot</SelectItem>
		</SelectGroup>
	</SelectContent>
</Select>
```

### Combobox

```tsx
import { Combobox } from "@repo/ui/components/ui/combobox"

const options = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
]

<Combobox
  options={options}
  placeholder="Select framework..."
  emptyMessage="No framework found."
/>
```

### Dropdown Menu

```tsx
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu"
;<DropdownMenu>
	<DropdownMenuTrigger asChild>
		<Button variant="outline">Open Menu</Button>
	</DropdownMenuTrigger>
	<DropdownMenuContent>
		<DropdownMenuLabel>My Account</DropdownMenuLabel>
		<DropdownMenuSeparator />
		<DropdownMenuItem>Profile</DropdownMenuItem>
		<DropdownMenuItem>Settings</DropdownMenuItem>
		<DropdownMenuSeparator />
		<DropdownMenuItem>Log out</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
```

### Alert Dialog

```tsx
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@repo/ui/components/ui/alert-dialog"
;<AlertDialog>
	<AlertDialogTrigger asChild>
		<Button variant="destructive">Delete</Button>
	</AlertDialogTrigger>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Are you sure?</AlertDialogTitle>
			<AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<AlertDialogAction>Continue</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
```

### Badge

```tsx
import { Badge } from "@repo/ui/components/ui/badge"

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

### Separator

```tsx
import { Separator } from "@repo/ui/components/ui/separator"

<Separator />
<Separator orientation="vertical" />
```

## Utilities

### cn (Class Name Merger)

```tsx
import { cn } from "@repo/ui/lib/utils"

<div className={cn(
  "base-class",
  isActive && "active-class",
  className
)}>
```

## Adding New Components

```bash
cd packages/ui
bunx shadcn@latest add <component>
```

After adding, update the import path:

```diff
- import { cn } from "@/lib/utils"
+ import { cn } from "../../lib/utils"
```

## Styling

Components use Tailwind CSS v4 with oklch color theme. Global styles:

```css
@import "@repo/ui/styles/globals.css";
```

### CSS Variables

Theme colors are defined as CSS variables in `globals.css`:

```css
:root {
	--background: oklch(1 0 0);
	--foreground: oklch(0.145 0 0);
	--primary: oklch(0.205 0 0);
	--primary-foreground: oklch(0.985 0 0);
	/* ... */
}
```
