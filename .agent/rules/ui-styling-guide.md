---
trigger: always_on
---

# UI Styling Guidelines

## 1. Design System Overview

### Technology

- **CSS Framework**: TailwindCSS v4
- **Component Library**: Shadcn/UI (Radix primitives)
- **Icons**: Lucide React
- **Theming**: next-themes (dark/light mode)

### Design Tokens (CSS Variables)

All colors are defined in `src/app/globals.css` using CSS variables:

```css
:root {
  --background: ...;
  --foreground: ...;
  --primary: ...;
  --primary-foreground: ...;
  --muted: ...;
  --muted-foreground: ...;
  --destructive: ...;
  --border: ...;
  --ring: ...;
  /* Charts */
  --chart-1 through --chart-5: ...;
}
```

**Always use semantic color tokens, never hardcode colors.**

```tsx
// ❌ BAD
<div className="bg-blue-500 text-white">

// ✅ GOOD
<div className="bg-primary text-primary-foreground">
```

---

## 2. Spacing & Layout

### Spacing Scale

Use Tailwind's spacing scale consistently:

| Use Case     | Class           | Value       |
| ------------ | --------------- | ----------- |
| Tiny gaps    | `gap-1`, `p-1`  | 4px         |
| Small gaps   | `gap-2`, `p-2`  | 8px         |
| Default gaps | `gap-3`, `p-3`  | 12px        |
| Medium gaps  | `gap-4`, `p-4`  | 16px        |
| Large gaps   | `gap-6`, `p-6`  | 24px        |
| Section gaps | `gap-8`, `py-8` | 32px        |
| Page margins | `px-4`, `py-16` | 16px / 64px |

### Container Patterns

```tsx
// Page container
<div className="container mx-auto px-4 py-8">

// Card content
<div className="p-4 md:p-6">

// Section with max-width
<div className="mx-auto max-w-2xl">
```

### Responsive Breakpoints

| Prefix | Min Width | Use Case          |
| ------ | --------- | ----------------- |
| (none) | 0px       | Mobile-first base |
| `sm:`  | 640px     | Large phones      |
| `md:`  | 768px     | Tablets           |
| `lg:`  | 1024px    | Laptops           |
| `xl:`  | 1280px    | Desktops          |

**Always design mobile-first, then add responsive modifiers.**

```tsx
// ❌ BAD - Desktop first
<div className="grid-cols-3 sm:grid-cols-1">

// ✅ GOOD - Mobile first
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

---

## 3. Typography

### Font Sizes

| Element       | Class                              | Usage            |
| ------------- | ---------------------------------- | ---------------- |
| Page title    | `text-2xl font-bold` or `text-3xl` | Main headings    |
| Section title | `text-xl font-semibold`            | Card headers     |
| Subsection    | `text-lg font-medium`              | List titles      |
| Body text     | `text-base` (default)              | Paragraphs       |
| Small text    | `text-sm`                          | Labels, hints    |
| Tiny text     | `text-xs`                          | Badges, captions |

### Text Colors

```tsx
// Primary text
<p className="text-foreground">Main content</p>

// Secondary/muted text
<p className="text-muted-foreground">Helper text</p>

// Accent text
<span className="text-primary">Highlighted</span>

// Error text
<span className="text-destructive">Error message</span>
```

---

## 4. Component Styling Patterns

### Cards

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>;
```

### Buttons

Use Shadcn Button variants consistently:

```tsx
<Button>Primary action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Tertiary</Button>
<Button variant="ghost">Minimal</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Link style</Button>
```

**Button sizes:**

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Form Inputs

Always use Shadcn form components with proper labels:

```tsx
<div className='space-y-2'>
  <Label htmlFor='name'>Name</Label>
  <Input id='name' placeholder='Enter name' />
</div>
```

### Loading States

Use Skeleton for loading UI:

```tsx
import { Skeleton } from '@/components/ui/skeleton';

// Loading card
<Skeleton className="h-32 w-full rounded-xl" />

// Loading text
<Skeleton className="h-4 w-3/4" />
```

---

## 5. Interactive States

### Hover & Focus

```tsx
// Interactive cards
<Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">

// Buttons with scale effect
<Button className="transition-transform hover:scale-[1.02]">

// Focus ring (usually handled by Shadcn)
<Input className="focus-visible:ring-2 focus-visible:ring-primary/50">
```

### Disabled States

```tsx
<Button disabled className='cursor-not-allowed opacity-50'>
  Disabled
</Button>
```

---

## 6. Animations & Transitions

### Transition Defaults

```tsx
// Standard transition
className = 'transition-all duration-200';

// Color only
className = 'transition-colors';

// Transform only
className = 'transition-transform';
```

### Common Animations

```tsx
// Fade in
className = 'animate-fade-in';

// Slide up
className = 'animate-in slide-in-from-bottom-4';

// Pulse (loading)
className = 'animate-pulse';

// Bounce (attention)
className = 'animate-bounce';
```

### Animation Guidelines

- Use subtle animations (150-300ms)
- Avoid animations that block user interaction
- Respect `prefers-reduced-motion`
- Use `transition-all` sparingly (prefer specific properties)

---

## 7. Dark Mode

### Implementation

Dark mode is handled by `next-themes`. Colors automatically switch via CSS variables.

### Testing

Always test both modes. Use the ThemeToggle component to switch.

### Custom Dark Styles

When needed, use the `dark:` prefix:

```tsx
<div className="bg-white dark:bg-gray-900">
```

**Prefer CSS variables over dark: prefix when possible.**

---

## 8. Icons

### Usage

```tsx
import { ChefHat, Plus, Trash2 } from 'lucide-react';

// Standard size
<ChefHat className="h-5 w-5" />

// With color
<ChefHat className="h-5 w-5 text-primary" />

// In button
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>

// Icon-only button
<Button size="icon" variant="ghost">
  <Trash2 className="h-4 w-4" />
</Button>
```

### Icon Sizes

| Context          | Size  | Class     |
| ---------------- | ----- | --------- |
| Inline with text | 16px  | `h-4 w-4` |
| Buttons          | 20px  | `h-5 w-5` |
| Cards/Headers    | 24px  | `h-6 w-6` |
| Hero/Feature     | 32px+ | `h-8 w-8` |

---

## 9. Common Patterns

### Page Layout

```tsx
export default function Page() {
  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Page header */}
      <div className='mb-8'>
        <h1 className='text-2xl font-bold'>Page Title</h1>
        <p className='text-muted-foreground'>Description</p>
      </div>

      {/* Content */}
      <div className='space-y-6'>{/* Sections */}</div>
    </div>
  );
}
```

### Grid Layouts

```tsx
// Responsive grid
<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
  {items.map((item) => (
    <Card key={item.id} />
  ))}
</div>
```

### Flex Layouts

```tsx
// Centered content
<div className="flex items-center justify-center">

// Space between
<div className="flex items-center justify-between">

// Vertical stack
<div className="flex flex-col gap-4">
```

### Empty States

```tsx
<div className='py-16 text-center'>
  <IconComponent className='text-muted-foreground/50 mx-auto h-12 w-12' />
  <h3 className='mt-4 text-lg font-medium'>No items yet</h3>
  <p className='text-muted-foreground mt-2'>Get started by adding your first item.</p>
  <Button className='mt-4'>Add Item</Button>
</div>
```

---

## 10. Do's and Don'ts

### ✅ DO

- Use Shadcn components as the base
- Use semantic color tokens (`primary`, `muted`, etc.)
- Design mobile-first
- Use consistent spacing (4px increments)
- Add hover/focus states for interactive elements
- Test in both light and dark modes

### ❌ DON'T

- Don't use arbitrary values (`w-[123px]`) unless absolutely necessary
- Don't mix styling approaches (inline styles + Tailwind)
- Don't use hardcoded colors (`#FF0000`, `blue-500`)
- Don't forget loading and error states
- Don't use `!important`
- Don't create one-off component styles that could be reused

---

## 11. Border Radius Reference

| Element         | Class          | Usage               |
| --------------- | -------------- | ------------------- |
| Buttons, badges | `rounded-md`   | Small elements      |
| Cards, inputs   | `rounded-lg`   | Standard containers |
| Modals, sheets  | `rounded-xl`   | Large overlays      |
| Pills, avatars  | `rounded-full` | Circular elements   |

---

## 12. Shadow Reference

| Use Case         | Class             |
| ---------------- | ----------------- |
| Subtle elevation | `shadow-sm`       |
| Cards            | `shadow`          |
| Hover state      | `hover:shadow-lg` |
| Modals/Dropdowns | `shadow-xl`       |
