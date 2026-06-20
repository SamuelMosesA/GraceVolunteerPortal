# Tutorial: Frontend Development with Svelte 5 and Tailwind CSS

Welcome! This tutorial is designed to teach you frontend development using **Svelte 5** and **Tailwind CSS**. We will use this volunteer scheduling project as a template, breaking down the exact patterns, code blocks, and classes already used in the codebase.

---

## Table of Contents

1. [Svelte 5 Core Concepts (Runes & Context)](#1-svelte-5-core-concepts-runes--context)
   - [`$state` - Declaring Reactive State](#state---declaring-reactive-state)
   - [`$derived` - Computed Values](#derived---computed-values)
   - [`$props` and `$bindable` - Component Communication](#props-and-bindable---component-communication)
   - [`$effect` - Running Side Effects](#effect---running-side-effects)
   - [Snippets (`{@render}`) - Replaces Slots](#snippets-render---replaces-slots)
   - [Event Handlers in Svelte 5](#event-handlers-in-svelte-5)
   - [Transitions and Animations](#transitions-and-animations)
   - [Global Context (State Sharing across files)](#global-context-state-sharing-across-files)
2. [Tailwind CSS Layout & Alignment (Flex & Grid)](#2-tailwind-css-layout--alignment-flex--grid)
   - [Flexbox: Aligning along a Single Axis](#flexbox-aligning-along-a-single-axis)
   - [CSS Grid: Row and Column Layouts](#css-grid-row-and-column-layouts)
   - [Responsive Design (`sm:`, `md:`, `lg:`)](#responsive-design-sm-md-lg)
   - [Theming & Color Variables](#theming--color-variables)
   - [Inventory of Tailwind Utilities Used in This Project](#inventory-of-tailwind-utilities-used-in-this-project)
3. [Advanced Layout & Theming Guides (Dashboards & Buttons)](#3-advanced-layout--theming-guides-dashboards--buttons)
   - [How to Design a Responsive Dashboard Grid](#how-to-design-a-responsive-dashboard-grid)
   - [How to Build Themed Component Variants (Button Example)](#how-to-build-themed-component-variants-button-example)
4. [Project Configuration (Tailwind CSS v4 & TypeScript)](#4-project-configuration-tailwind-css-v4--typescript)
   - [Vite Configuration (`vite.config.ts`)](#vite-configuration-viteconfigts)
   - [Tailwind CSS v4 Configuration (`src/app.css`)](#tailwind-css-v4-configuration-srcappcss)
   - [Svelte Configuration (`svelte.config.js`)](#svelte-configuration-svelteconfigjs)
   - [TypeScript Configuration (`tsconfig.json`)](#typescript-configuration-tsconfigjson)
5. [Putting it Together: Building a Custom Component](#5-putting-it-together-building-a-custom-component)

---

## 1. Svelte 5 Core Concepts (Runes & Context)

Svelte 5 introduces **Runes**, a set of built-in functions that control reactivity. Runes look like functions starting with `$` but are actually compiler instructions. Let's explore how they are used in this project.

### `$state` - Declaring Reactive State

In Svelte 5, you declare a variable reactive by wrapping its initial value in `$state()`. Whenever this variable is reassigned, Svelte automatically updates the DOM.

**Example from `src/routes/views/instructions/+page.svelte`:**

```svelte
<script lang="ts">
	// Declaring local state variables
	let instructions = $state<RoleInstruction[]>([]);
	let isLoading = $state(true);
	let searchQuery = $state('');
	let zoomedImageSrc = $state<string | null>(null);
</script>
```

- **Why use it?** If you type into the search bar, `searchQuery` updates, which triggers any UI components reading it to update.

---

### `$derived` - Computed Values

Sometimes state is calculated from other state. Instead of updating variables manually, use `$derived()`. It computes the value on-the-fly whenever the dependencies change.

**Example from `src/routes/views/instructions/+page.svelte`:**

```svelte
<script lang="ts">
	// searchQuery and instructions are reactive $state variables.
	// filteredAndSortedInstructions will automatically recalculate
	// whenever searchQuery or instructions change.
	let filteredAndSortedInstructions = $derived(
		instructions
			.filter((instruction) => {
				const searchLower = searchQuery.toLowerCase();
				return (
					instruction.team.toLowerCase().includes(searchLower) ||
					instruction.role.toLowerCase().includes(searchLower)
				);
			})
			.sort((a, b) => a.team.localeCompare(b.team))
	);
</script>
```

- **Why use it?** This prevents bugs where search results get out of sync with the user's input query or the loaded instructions list.

---

### `$props` and `$bindable` - Component Communication

In Svelte 5, inputs to a component are received via the `$props()` rune. To allow a child component to modify a parent's variable, we wrap the property with `$bindable()`.

**Example from `src/lib/components/RosterDialog.svelte`:**

```svelte
<script lang="ts">
	let {
		isOpen = $bindable(false),
		teamShiftDetails = null
	}: { isOpen: boolean; teamShiftDetails: Roster | null } = $props();

	function close() {
		isOpen = false; // Modifying this updates the parent's bound variable!
	}
</script>
```

**Usage in parent page (`src/routes/views/home/+page.svelte`):**

```svelte
<!-- Bind the parent's `isRosterOpen` to the dialog's `isOpen` prop -->
<RosterDialog bind:isOpen={isRosterOpen} teamShiftDetails={selectedRoster} />
```

---

### `$effect` - Running Side Effects

Use `$effect()` when you need to run code in response to a state change (like DOM changes, logging, or navigating to another page).

**Example from `src/routes/+layout.svelte`:**

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';

	// This effect runs initially, and reruns whenever authState.user changes
	$effect(() => {
		if (authState.user === null) {
			goto('/'); // Redirect to login if user logs out
		}
	});
</script>
```

---

### Snippets (`{@render}`) - Replaces Slots

In previous Svelte versions, `<slot />` was used to pass HTML blocks into components. Svelte 5 replaces slots with **Snippets** for greater type-safety and flexibility. The default slot content is passed as a prop called `children` of type `Snippet`.

**Example from `src/routes/views/+layout.svelte`:**

```svelte
<script lang="ts">
	// Deconstruct children from props
	let { children } = $props();
</script>

<main class="bg-background flex-grow">
	<div class="w-full max-w-500 p-16 md:mx-auto">
		<!-- Render the page children here -->
		{@render children()}
	</div>
</main>
```

---

### Event Handlers in Svelte 5

Svelte 5 drops `on:click` in favor of standard HTML event attributes like `onclick`, `onkeydown`, `oninput`, etc.

**Example:**

```svelte
<!-- Svelte 5 style -->
<button onclick={logout}>Logout</button>

<!-- Event delegation handling in custom divs -->
<div onclick={handleInstructionClick}>...</div>
```

---

### Transitions and Animations

Svelte has built-in transition support out of the box. You import transitions from `'svelte/transition'` and apply them using the `transition:` directive.

**Example from `src/lib/components/RosterDialog.svelte`:**

```svelte
<script lang="ts">
	import { fade, scale } from 'svelte/transition';
</script>

{#if isOpen}
	<!-- Backdrop fades in/out over 200ms -->
	<div transition:fade={{ duration: 200 }} class="bg-background/80 fixed inset-0 z-50"></div>

	<!-- Modal scale transitions in/out -->
	<div transition:scale={{ duration: 200, start: 0.95 }} class="fixed top-1/2 left-1/2 z-50">
		<!-- Dialog Content -->
	</div>
{/if}
```

---

### Global Context (State Sharing across files)

When building complex apps, you often need to share state (like user credentials) across multiple routes. In Svelte 5, we combine Svelte's Context API with `$state` to share reactive objects globally.

**Example from `src/lib/firebase/auth.svelte.ts` & `src/routes/+layout.svelte`:**

1. In `src/routes/+layout.svelte`, we instantiate the reactive object and register it with the context:

```svelte
<script lang="ts">
	import { setAuthState } from '$lib/firebase/auth.svelte';

	// Create the reactive user state
	let authState = $state<AuthState>({ user: null });

	// Register it to Svelte's context tree
	setAuthState(authState);
</script>
```

2. Inside `src/lib/firebase/auth.svelte.ts`, we handle context registration and retrievals:

```typescript
import { getContext, setContext } from 'svelte';

const authKey = Symbol('authState');

export function setAuthState(state: AuthState) {
	setContext(authKey, state);
}

export function getAuthState() {
	return getContext(authKey) as AuthState;
}
```

3. In any child page (like `src/routes/views/home/+page.svelte`), we import and consume it:

```svelte
<script lang="ts">
	import { getAuthState } from '$lib/firebase/auth.svelte';
	let auth = getAuthState(); // auth.user is reactive!
</script>
```

---

## 2. Tailwind CSS Layout & Alignment (Flex & Grid)

Tailwind CSS provides low-level utility classes that write CSS for you. The two most common page layout systems are **Flexbox** and **CSS Grid**.

### Flexbox: Aligning along a Single Axis

Flexbox is ideal for single-dimensional layouts (a row or a column).

To use Flexbox, add the class `flex` to the parent container. By default, its items align in a row.

#### Flex Direction

- `flex-row` (default): Items layout horizontally.
- `flex-col`: Items layout vertically.

#### Alignment & Justification

- `items-center`: Vertically centers items in a row (or horizontally in a column).
- `items-stretch`: Stretches items to fill the container's height/width.
- `justify-between`: Pushes first and last items to the edges, spreading the space evenly between them.
- `justify-center`: Centers everything along the main axis.
- `justify-end`: Pushes items to the end of the flexbox.

#### Example: Navigation Bar (`src/lib/components/responsive_navbar.svelte`)

```html
<div class="flex items-center justify-between">
	<!-- Brand Name (Left aligned) -->
	<a href="/views/home" class="text-2xl font-bold">Portal</a>

	<!-- Navigation List (Right aligned) -->
	<ul class="flex items-center space-x-6">
		<li><a href="/views/home">Home</a></li>
		<li><button onclick="{logout}">Logout</button></li>
	</ul>
</div>
```

- `flex` activates Flexbox on the wrapper.
- `items-center` ensures the logo and list align vertically.
- `justify-between` forces the logo to the far left and the list to the far right.
- `space-x-6` applies horizontal margins between list items (`li`).

---

### CSS Grid: Row and Column Layouts

Grid is best for two-dimensional layouts (rows AND columns) or aligning items precisely to a grid.

To use Grid, add the class `grid`.

#### Key Grid Classes:

- `grid-cols-1 md:grid-cols-2`: Defines 1 column on mobile, and 2 columns on medium screens and up.
- `gap-4`, `gap-6`: Controls space between grid cells.
- `col-span-2`: Spans an item across 2 grid columns.
- `justify-self-center`: Centers a grid item horizontally within its own cell.

**Example of Grid layout for cards:**

```html
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
	<div class="bg-card rounded border p-4">Card 1</div>
	<div class="bg-card rounded border p-4">Card 2</div>
	<div class="bg-card rounded border p-4">Card 3</div>
</div>
```

- Creates a single column on mobile, 2 columns on tablet, and 3 columns on desktop.

---

### Responsive Design (`sm:`, `md:`, `lg:`)

Tailwind uses a **mobile-first** responsive system. Classes without prefixes apply to all screen sizes. Prefixes like `md:` override them on larger screens.

- `sm:` screen width $\ge$ 640px
- `md:` screen width $\ge$ 768px
- `lg:` screen width $\ge$ 1024px

**Example: Next Scheduled Card (`src/routes/views/home/+page.svelte`):**

```html
<div class="flex flex-col items-center gap-6 md:flex-row md:items-stretch">
	<!-- Left Section (Pill) -->
	<div class="w-full md:min-w-[220px]">...</div>

	<!-- Right Section (Details) -->
	<div class="flex-1 text-center md:text-left">...</div>
</div>
```

- **On Mobile:** Layout is `flex-col` (items stacked vertically), items are centered (`items-center`), and text is centered (`text-center`). The left section takes up full width (`w-full`).
- **On Desktop (`md:`):** Layout changes to `flex-row` (horizontal side-by-side), items stretch vertically to match height (`md:items-stretch`), and text aligns to the left (`md:text-left`). The left section is restricted to a minimum width (`md:min-w-[220px]`).

---

### Theming & Color Variables

Instead of hardcoding color classes (like `bg-white` or `text-black`), this project uses CSS variables mapped to Tailwind configuration. This makes support for **Dark Mode** seamless.

- `bg-background`: The main canvas background color.
- `bg-card`: Color for cards/containers.
- `text-foreground`: Text color that automatically contrasts the background.
- `text-primary`: Primary accent color (e.g., brand color).
- `border-border`: Main border styling color.

**Example from `src/lib/components/responsive_navbar.svelte`:**

```html
<nav class="bg-card text-foreground border-border rounded-lg border shadow-md">...</nav>
```

- If the user switches dark mode on, `bg-card` shifts from light gray/white to dark charcoal automatically!

---

### Inventory of Tailwind Utilities Used in This Project

Below is a categorized guide of the actual Tailwind classes utilized in this workspace:

| Category               | Tailwind Class          | CSS Equivalent / Purpose                                                               |
| :--------------------- | :---------------------- | :------------------------------------------------------------------------------------- |
| **Sizing & Widths**    | `w-full`                | `width: 100%;`                                                                         |
|                        | `w-1/2`                 | `width: 50%;`                                                                          |
|                        | `max-w-4xl`             | `max-width: 56rem;` (caps reading width of container)                                  |
|                        | `max-w-md`              | `max-width: 28rem;` (used for responsive modals)                                       |
|                        | `max-h-[60vh]`          | `max-height: 60vh;` (enforces viewport height limit for modal rosters)                 |
|                        | `min-w-[220px]`         | `min-width: 220px;` (ensures date badge has a fixed structure)                         |
| **Spacing**            | `my-6 mx-auto`          | `margin-top: 1.5rem; margin-bottom: 1.5rem; margin-left/right: auto;`                  |
|                        | `space-y-4`             | Adds vertical spacing between direct child elements                                    |
|                        | `gap-6`                 | Sets `column-gap` and `row-gap` on flex/grid elements                                  |
| **Borders & Rounding** | `border`                | `border-width: 1px;`                                                                   |
|                        | `border-border`         | Uses the theme's custom configured variable for border color                           |
|                        | `rounded-lg`            | `border-radius: 0.5rem;` (smooth cornering)                                            |
|                        | `rounded-full`          | `border-radius: 9999px;` (creates circles/capsule pills)                               |
| **Colors & Opacity**   | `bg-primary/10`         | Primary color with a 10% opacity backdrop (modern pill styling)                        |
|                        | `bg-muted/30`           | Muted gray backdrop with 30% opacity                                                   |
|                        | `text-muted-foreground` | Secondary/greyed-out typography color                                                  |
| **Interactive States** | `group`                 | Parent container anchor to target nested hover states (e.g. `group-hover:scale-105`)   |
|                        | `hover:text-primary`    | Changes text color to theme primary on mouse hover                                     |
|                        | `cursor-zoom-in`        | `cursor: zoom-in;` (used on images to signify zoomability)                             |
| **Positioning & Blur** | `fixed inset-0`         | Positions element relative to screen overlay (`top: 0; right: 0; bottom: 0; left: 0;`) |
|                        | `z-50`                  | `z-index: 50;` (places modal overlays on top of everything else)                       |
|                        | `backdrop-blur-sm`      | Applies `backdrop-filter: blur(4px);` to elements behind it                            |
| **Animations**         | `animate-in`            | Enters slide-in/fade-in animation sequences                                            |
|                        | `fade-in`               | Fades opacity from 0% to 100%                                                          |
|                        | `zoom-in-95`            | Scale starts at 95% and animates to 100%                                               |
| **Typography plugin**  | `prose`                 | Auto-styles unstyled markdown HTML (e.g., headers, lists, links)                       |
|                        | `dark:prose-invert`     | Reverses prose styling colors to white text in dark mode                               |

---

## 3. Advanced Layout & Theming Guides (Dashboards & Buttons)

Creating clean layouts and maintaining styling consistency across different component states can be tricky. This section walks you through how to construct layouts from scratch.

### How to Design a Responsive Dashboard Grid

A standard dashboard features a sidebar (navigation/settings) and a main workspace (graphs, tables, action cards). We combine **Flexbox** (for the root outer container) and **CSS Grid** (for internal cards layouts).

Here is a template structure for a clean responsive dashboard:

```svelte
<!-- 1. Outer Container: Column on mobile (stacked), Row on desktop (side-by-side) -->
<div class="bg-background text-foreground flex min-h-screen flex-col md:flex-row">
	<!-- 2. Sidebar: Full width on mobile, fixed width on desktop -->
	<aside class="bg-card border-border w-full border-b p-6 md:w-64 md:border-r md:border-b-0">
		<h2 class="text-primary text-xl font-bold tracking-tight">Dashboard</h2>
		<nav class="mt-6 flex flex-row gap-4 md:flex-col md:gap-2">
			<a href="#home" class="hover:text-primary text-sm font-semibold transition">Home</a>
			<a
				href="#settings"
				class="hover:text-primary text-muted-foreground text-sm font-semibold transition"
				>Settings</a
			>
		</nav>
	</aside>

	<!-- 3. Main Workspace Content -->
	<main class="flex-1 space-y-8 p-6 md:p-10">
		<!-- Header -->
		<header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-3xl font-extrabold tracking-tight">Overview</h1>
				<p class="text-muted-foreground">Welcome back, Coordinator!</p>
			</div>
			<button
				class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition"
			>
				+ New Shift
			</button>
		</header>

		<!-- 4. The Grid: Responsive columns based on screens -->
		<section class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<!-- Stat Card 1 -->
			<div class="bg-card border-border rounded-2xl border p-6 shadow-sm">
				<span class="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
					>Total Volunteers</span
				>
				<p class="mt-2 text-4xl font-extrabold">128</p>
			</div>

			<!-- Stat Card 2 -->
			<div class="bg-card border-border rounded-2xl border p-6 shadow-sm">
				<span class="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
					>Active Shifts Today</span
				>
				<p class="mt-2 text-4xl font-extrabold text-yellow-500">4</p>
			</div>

			<!-- Detailed Activity Feed: Spans across two columns on large screens! -->
			<div
				class="bg-card border-border rounded-2xl border p-6 shadow-sm sm:col-span-2 lg:col-span-1"
			>
				<span class="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
					>Urgent Alerts</span
				>
				<p class="mt-2 text-sm font-medium text-red-500">2 open roles in Sound team this Sunday!</p>
			</div>

			<!-- Full Width Roster Table Wrapper -->
			<div
				class="bg-card border-border col-span-1 rounded-2xl border p-6 shadow-sm sm:col-span-2 lg:col-span-3"
			>
				<h3 class="mb-4 text-lg font-bold">Upcoming Schedule</h3>
				<div class="overflow-x-auto">
					<!-- Dashboard tables go here -->
					<div class="text-muted-foreground text-sm">Table container goes here...</div>
				</div>
			</div>
		</section>
	</main>
</div>
```

#### Key Layout Rules applied here:

1. **Outer Flex Direction**: `flex-col md:flex-row` ensures the navigation sidebar stacks on top on phones, but becomes a left-hand column on desktop.
2. **Width constraints**: `w-full md:w-64` handles responsive sizing for sidebar. `flex-1` tells the main container to grow and fill the rest of the available space.
3. **Grid Column Spanning**:
   - `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` sets the columns to resize automatically.
   - `col-span-1 sm:col-span-2 lg:col-span-3` makes the schedule table stretch across all available columns depending on screen size. This keeps your dashboard balanced.

---

### How to Build Themed Component Variants (Button Example)

A professional component should change styling systematically based on its **variant** (Primary, Outline, Ghost) and **state** (hover, active, focus, disabled).

When styling custom components using variables (`bg-primary`, `text-primary-foreground` etc.), you should map prop variables directly to custom Tailwind class strings.

Here is a complete, reusable **Theme Button** component (`src/lib/components/Button.svelte`):

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	// 1. Define Svelte 5 Props
	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		onclick,
		children
	}: {
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
		children: Snippet;
	} = $props();

	// 2. Map styling variants to tailwind strings matching the project variables
	const variantStyles = {
		primary:
			'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border border-transparent',
		secondary:
			'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent',
		outline:
			'border border-border bg-background text-foreground hover:bg-muted/50 hover:text-foreground',
		ghost: 'text-foreground hover:bg-muted/50 hover:text-foreground border border-transparent',
		destructive:
			'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm border border-transparent'
	};

	// 3. Map size paddings and typography
	const sizeStyles = {
		sm: 'h-9 px-3 text-xs rounded-md',
		md: 'h-10 px-4 py-2 text-sm rounded-lg',
		lg: 'h-11 px-8 text-base rounded-xl'
	};
</script>

<!-- 4. Combine baseline styles, dynamic styles, and interactive state rules -->
<button
	{onclick}
	{disabled}
	class="focus-visible:ring-ring inline-flex items-center justify-center font-semibold tracking-tight transition-all
           duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none
           active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50
           {variantStyles[variant]} {sizeStyles[size]}"
>
	{@render children()}
</button>
```

#### How this makes styling buttons easy:

1. **Consistency**: Color classes use semantic theme names (`bg-primary`, `bg-secondary`, `bg-destructive`, `text-primary-foreground`, `hover:bg-muted/50`). They will match your light and dark modes instantly.
2. **Interactive States**:
   - `hover:bg-...`: Modulates background opacity or color when hovering.
   - `active:scale-[0.98]`: A micro-animation that shrinks the button slightly when clicked, making it feel tactile and dynamic.
   - `focus-visible:...`: Only shows rings when accessibility keyboards focus on the element.
   - `disabled:pointer-events-none disabled:opacity-50`: Handles standard forms disabled state cleanly.
3. **Snippets**: Uses Svelte 5 snippets (`{@render children()}`) so you can pass text, icons, or complex layouts inside the button easily.

---

## 4. Project Configuration (Tailwind CSS v4 & TypeScript)

Modern SvelteKit projects use **Vite** as a bundler and **TypeScript** for strict type safety. This project uses the brand new **Tailwind CSS v4**, which introduces a **CSS-first** build pipeline, completely eliminating the need for `tailwind.config.js` or `postcss.config.js`.

Let's see how each config file handles this setup.

### Vite Configuration (`vite.config.ts`)

Vite acts as the fast building server. Tailwind CSS v4 is loaded directly as a Vite plugin:

```typescript
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		sveltekit(), // Connects Svelte files compilation to Vite
		tailwindcss() // Connects Tailwind v4 compilation pipeline to Vite
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
```

- **Why it's clean:** In v3, Tailwind required PostCSS. In v4, Vite compiles your Tailwind directives directly, resulting in blazingly fast compilation and HMR (Hot Module Replacement) speeds.

---

### Tailwind CSS v4 Configuration (`src/app.css`)

In Tailwind v4, all configuration (theme extensions, custom variables, keyframes) is defined directly inside your CSS file using the `@theme` directive, instead of a JavaScript config file.

```css
/* 1. Import Tailwind directive */
@import 'tailwindcss';

/* 2. Import animations */
@import 'tw-animate-css';
@plugin "@tailwindcss/typography";

/* 3. Register a custom selector for dark mode */
@custom-variant dark (&:is(.dark *));

/* 4. Define CSS custom variables for Light Mode */
:root {
	--radius: 0.5rem;
	--background: oklch(1 0 0);
	--foreground: oklch(0.141 0.005 285.823);
	--card: oklch(1 0 0);
	--primary: oklch(0.795 0.184 86.047);
	--border: oklch(0.92 0.004 286.32);
}

/* 5. Define CSS custom variables for Dark Mode */
.dark {
	--background: oklch(0.141 0.005 285.823);
	--foreground: oklch(0.985 0 0);
	--card: oklch(0.21 0.006 285.885);
	--primary: oklch(0.795 0.184 86.047);
	--border: oklch(1 0 0 / 10%);
}

/* 6. Map CSS variables to Tailwind classes */
@theme inline {
	--radius-sm: calc(var(--radius) - 4px);
	--radius-lg: var(--radius);
	--color-background: var(--background); /* Enables 'bg-background' utility */
	--color-foreground: var(--foreground); /* Enables 'text-foreground' utility */
	--color-card: var(--card); /* Enables 'bg-card' utility */
	--color-primary: var(--primary); /* Enables 'text-primary' & 'bg-primary' */
	--color-border: var(--border); /* Enables 'border-border' utility */
}

/* 7. Inject baseline rules */
@layer base {
	* {
		@apply border-border outline-ring/50; /* All components inherit standard borders */
	}
	body {
		@apply bg-background text-foreground; /* Body sets the default theme colors */
	}
}
```

- **OKLCH Colors**: The theme values are specified in OKLCH space (e.g., `oklch(lightness chroma hue)`), which provides more consistent brightness gradients than RGB or HSL, especially for dark mode transitions.

---

### Svelte Configuration (`svelte.config.js`)

Svelte needs to preprocess scripts (for TypeScript) and extensions (such as Markdown parsing plugins like `mdsvex`).

```javascript
import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// 1. Preprocesses script tags using vitePreprocess (compiles Typescript) and mdsvex (compiles Markdown)
	preprocess: [vitePreprocess(), mdsvex()],

	kit: {
		// 2. Specifies build adapters (static in this project)
		adapter: adapter({
			fallback: 'index.html' // Required for Single Page Apps (SPA) fallback routing
		})
	},

	// 3. Registers .svelte and .svx files as valid Svelte files
	extensions: ['.svelte', '.svx']
};

export default config;
```

---

### TypeScript Configuration (`tsconfig.json`)

SvelteKit autogenerates all route types and path aliases (like `$lib/` which maps to `src/lib/`) dynamically. The root `tsconfig.json` extends this generated structure.

```json
{
	"extends": "./.svelte-kit/tsconfig.json",
	"compilerOptions": {
		"allowJs": true,
		"checkJs": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"resolveJsonModule": true,
		"skipLibCheck": true,
		"sourceMap": true,
		"strict": true,
		"moduleResolution": "bundler"
	}
}
```

#### TypeScript & Svelte 5 File Extensions:

1. `.svelte` files: Normal Svelte components. Can write TypeScript within `<script lang="ts">`.
2. `.ts` files: Plain TypeScript files. Cannot write Svelte 5 runes (`$state`, `$derived`) here.
3. `.svelte.ts` files: TypeScript files containing **Svelte 5 Runes** (e.g. state machines, stores, auth structures). The compiler recognizes the `.svelte.ts` extension and compiles the reactive runes correctly.

---

## 5. Putting it Together: Building a Custom Component

Let's build a clean, responsive **Volunteer Profile Card** that utilizes Svelte 5 and Tailwind CSS layout principles.

Save this as a new file in your project, e.g., `src/lib/components/VolunteerCard.svelte`:

```svelte
<script lang="ts">
	// 1. Defining Props (Inputs)
	let {
		name = 'Volunteer Name',
		role = 'Unassigned',
		team = 'General',
		status = 'Inactive'
	} = $props();

	// 2. Local State for expanded information
	let isExpanded = $state(false);

	// 3. Computed Status Styling
	let statusColor = $derived(
		status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
	);
</script>

<!-- Card Container -->
<div
	class="bg-card border-border text-foreground overflow-hidden rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md"
>
	<!-- Header: Flexbox layout with item alignment -->
	<div class="flex items-center justify-between">
		<div>
			<h4 class="text-xl font-bold tracking-tight">{name}</h4>
			<p class="text-muted-foreground text-sm">{team} — {role}</p>
		</div>

		<!-- Status Indicator Pill -->
		<span class="rounded-full px-3 py-1 text-xs font-semibold uppercase {statusColor}">
			{status}
		</span>
	</div>

	<!-- Toggle Action -->
	<div class="mt-4 flex items-center justify-between">
		<button
			onclick={() => (isExpanded = !isExpanded)}
			class="text-primary text-sm font-semibold hover:underline"
		>
			{isExpanded ? 'Hide Details' : 'Show Details'}
		</button>
	</div>

	<!-- Conditional Detail View -->
	{#if isExpanded}
		<div class="bg-muted/30 mt-4 space-y-2 rounded-lg p-4 text-sm">
			<p><strong>Primary Team:</strong> {team}</p>
			<p><strong>Assigned Role:</strong> {role}</p>
		</div>
	{/if}
</div>
```

### Key Elements of the Example:

1. **Props**: Destructured from `$props()` with fallback values.
2. **State & Derived**: `$state(false)` tracks if details are open, and `$derived` computes the color class dynamically based on the `status` prop.
3. **Flex Layout**: `flex items-center justify-between` aligns the info to the left and status pill to the right, centered vertically.
4. **Conditional Block**: `{#if isExpanded}` only renders the detail drawer when the button is clicked.
5. **Tailwind Classes**: Standard utility spacing (`mt-4`, `p-6`), styling (`bg-card`, `border-border`), and hover effects (`hover:shadow-md`).

---

Now you have the tools to build interactive, state-driven user interfaces in Svelte 5 styled with the responsive power of Tailwind CSS! Refer to this document whenever you need a quick refresh on layout rules or state syntax.
