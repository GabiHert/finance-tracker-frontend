# Feature: M1-F3 Design System Foundation

## Description
Establish the foundational design system tokens and base styles for the Finance Tracker application. This creates a consistent visual language and theming capability.

## User Story
As a developer, I want a design system with consistent tokens so that I can build a cohesive UI with minimal effort.

## Business Value
- Ensures visual consistency across the application
- Reduces design-to-code translation time
- Enables easy theming and dark mode support
- Improves maintainability of styles

## Functional Requirements

### Core Functionality
- CSS custom properties for design tokens
- Color palette (primary, secondary, semantic colors)
- Typography scale
- Spacing scale
- Border radius values
- Shadow values
- Dark mode support via CSS variables

### Token Structure
```
Colors:
- Primary: Blue (#3b82f6)
- Secondary: Indigo (#6366f1)
- Success: Green (#22c55e)
- Warning: Amber (#f59e0b)
- Error: Red (#ef4444)
- Neutral: Slate scale

Typography:
- Font family: System UI stack
- Font sizes: xs, sm, base, lg, xl, 2xl, 3xl, 4xl
- Font weights: normal, medium, semibold, bold

Spacing:
- 4px base unit
- Scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24
```

## Definition of Done

### Functionality Checklist
- [x] CSS variables defined in globals.css
- [x] Color tokens for light and dark mode
- [x] Typography tokens
- [x] Spacing tokens
- [x] Dark mode toggle capability

### Testing Checklist
- [x] E2E test for dark mode switching
- [x] Visual verification in both modes
