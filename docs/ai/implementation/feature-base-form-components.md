---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup

**Prerequisites:**

- Node.js 18+
- pnpm workspace configured
- TypeScript and React types available

**Environment setup:**

```bash
# Navigate to ui package
cd packages/core/ui

# Install dependencies (if needed)
pnpm install
```

## Code Structure

**Directory structure:**

```
packages/core/ui/src/
├── common/
│   ├── Input.tsx          # NEW
│   ├── Select.tsx         # NEW
│   ├── Radio.tsx          # NEW
│   ├── Checkbox.tsx       # NEW
│   ├── Textarea.tsx       # NEW
│   ├── index.ts           # UPDATED
│   ├── Button.tsx
│   ├── Card.tsx
│   └── ...
├── forms/
│   ├── components/
│   │   └── FormCheckbox.tsx  # UPDATED (uses common/Checkbox)
│   └── config.ts          # UPDATED (extended formClasses)
└── lib/
    └── utils.ts           # cn() utility
```

## Implementation Notes

### Core Pattern

All components follow this pattern:

```typescript
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { formClasses } from "../forms/config"; // or relative path

interface ComponentProps extends HTMLAttributes<HTMLElement> {
  label?: string;
  helperText?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Component = forwardRef<HTMLElement, ComponentProps>(
  ({ label, helperText, error, className, wrapperClassName, ...props }, ref) => {
    return (
      <div className={cn("w-full", wrapperClassName)}>
        {label && <label>{label}</label>}
        <element
          ref={ref}
          className={cn(formClasses.element, error && "ring-red-500", className)}
          {...props}
        />
        {helperText && !error && <p className={formClasses.helperText}>{helperText}</p>}
        {error && <p className={formClasses.error}>{error}</p>}
      </div>
    );
  }
);
```

### 1. formClasses Configuration Extension

**File**: `packages/core/ui/src/forms/config.ts`

Add these new style definitions:

```typescript
export const formClasses = {
    // Existing
    checkbox: "...",
    helperText: "...",
    error: "...",

    // NEW: Label styles
    label: "block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1",

    // NEW: Input styles
    input: [
        "w-full",
        "rounded-md",
        "border",
        "border-gray-300",
        "bg-white",
        "px-3",
        "py-2",
        "text-sm",
        "text-gray-900",
        "placeholder:text-gray-400",
        "focus:border-blue-500",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:ring-offset-2",
        "disabled:cursor-not-allowed",
        "disabled:opacity-60",
        "dark:border-gray-600",
        "dark:bg-gray-800",
        "dark:text-gray-100",
        "dark:placeholder:text-gray-500",
        "dark:focus:ring-offset-gray-900"
    ].join(" "),

    // NEW: Select styles
    select: [
        "w-full",
        "rounded-md",
        "border",
        "border-gray-300",
        "bg-white",
        "px-3",
        "py-2",
        "text-sm",
        "text-gray-900",
        "focus:border-blue-500",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:ring-offset-2",
        "disabled:cursor-not-allowed",
        "disabled:opacity-60",
        "dark:border-gray-600",
        "dark:bg-gray-800",
        "dark:text-gray-100",
        "dark:focus:ring-offset-gray-900"
    ].join(" "),

    // NEW: Radio styles
    radio: [
        "h-4",
        "w-4",
        "border-gray-300",
        "text-blue-600",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:ring-offset-2",
        "disabled:cursor-not-allowed",
        "disabled:opacity-60",
        "dark:border-gray-600",
        "dark:bg-gray-700",
        "dark:focus:ring-offset-gray-800"
    ].join(" "),

    // NEW: Textarea styles
    textarea: [
        "w-full",
        "rounded-md",
        "border",
        "border-gray-300",
        "bg-white",
        "px-3",
        "py-2",
        "text-sm",
        "text-gray-900",
        "placeholder:text-gray-400",
        "focus:border-blue-500",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:ring-offset-2",
        "disabled:cursor-not-allowed",
        "disabled:opacity-60",
        "dark:border-gray-600",
        "dark:bg-gray-800",
        "dark:text-gray-100",
        "dark:placeholder:text-gray-500",
        "dark:focus:ring-offset-gray-900"
    ].join(" ")
} as const;
```

### 2. Checkbox Component (Base)

**File**: `packages/core/ui/src/common/Checkbox.tsx`

Framework-agnostic checkbox component:

```typescript
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { formClasses } from "../forms/config";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  helperText?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, helperText, error, className, wrapperClassName, disabled, id, ...props }, ref) => {
    const inputId = id || props.name || `checkbox-${Math.random()}`;

    return (
      <div className={cn("w-full", wrapperClassName)}>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              {...props}
              type="checkbox"
              id={inputId}
              ref={ref}
              disabled={disabled}
              className={cn(
                formClasses.checkbox,
                error && "ring-red-500 focus:ring-red-500",
                className
              )}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={
                error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
              }
            />
          </div>
          <div className="ml-3">
            <label
              htmlFor={inputId}
              className={cn(
                "text-sm font-medium text-gray-900 dark:text-gray-200",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              {label}
            </label>
            {helperText && !error && (
              <p id={`${inputId}-helper`} className={cn(formClasses.helperText, "mt-0")}>
                {helperText}
              </p>
            )}
          </div>
        </div>
        {error && (
          <p id={`${inputId}-error`} className={formClasses.error} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
```

### 3. Input Component

**File**: `packages/core/ui/src/common/Input.tsx`

### 4. Select Component

**File**: `packages/core/ui/src/common/Select.tsx`

Handle both single and multiple selection with the `multiple` prop.

### 5. Radio Component

**File**: `packages/core/ui/src/common/Radio.tsx`

### 6. Textarea Component

**File**: `packages/core/ui/src/common/Textarea.tsx`

Auto-resize implementation using useEffect:

```typescript
useEffect(() => {
    if (autoResize && ref.current) {
        ref.current.style.height = "auto";
        ref.current.style.height = ref.current.scrollHeight + "px";
    }
}, [value, autoResize]);
```

### 7. Update FormCheckbox

**File**: `packages/core/ui/src/forms/components/FormCheckbox.tsx`

Refactor to use base Checkbox component:

```typescript
import { Controller } from "react-hook-form";
import { Checkbox, type CheckboxProps } from "../../common/Checkbox";

// Wrap Checkbox with react-hook-form Controller
```

## Patterns & Best Practices

**1. Always use forwardRef**

- Allows integration with form libraries
- Follow the pattern used in Button component

**2. Use cn() for className merging**

- Merge formClasses with custom className
- Handle conditional classes (error states, disabled)

**3. Accessibility first**

- Always associate labels with inputs (htmlFor/id)
- Use aria-invalid for error states
- Use aria-describedby for helper text and errors
- Add role="alert" to error messages

**4. Dark mode support**

- Use dark: variants in formClasses
- Test components in both modes

**5. Consistent prop naming**

- label, helperText, error, wrapperClassName across all components
- Extend native HTML attributes with Omit when necessary

## Error Handling

**Input validation:**

- Components are presentational, validation handled by consumers
- Accept error prop to display validation messages
- Apply error styling when error prop is present

**Accessibility errors:**

- Use aria-invalid and role="alert" for screen readers
- Ensure error messages are associated via aria-describedby

## Performance Considerations

**Memo optimization:**

- Components are simple enough without React.memo initially
- Add if performance issues arise

**Auto-resize Textarea:**

- Use useEffect with value dependency
- Only runs when autoResize prop is true

**Avoid unnecessary re-renders:**

- Keep components stateless
- Pass through props directly

## Security Notes

**Input sanitization:**

- React handles XSS prevention automatically
- No dangerouslySetInnerHTML used
- Validation should happen in form submission handlers

**No eval or dynamic code execution:**

- All code is static and type-safe
