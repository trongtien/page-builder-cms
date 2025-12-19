---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals

**Coverage target**: 100% of new/changed code

**Scope:**

- Unit tests for all 5 new components (Input, Select, Radio, Checkbox, Textarea)
- Integration test for FormCheckbox wrapper
- Accessibility tests for all components
- Dark mode rendering tests

**Alignment:**

- All success criteria from requirements must be testable
- Design specifications must be validated

## Unit Tests

### Input Component

- [ ] **Renders with label and input**: Verify label text and input element render
- [ ] **Applies error styling when error prop present**: Check className includes error styles
- [ ] **Displays helper text when provided**: Verify helper text renders below input
- [ ] **Displays error message instead of helper text**: Error takes priority
- [ ] **Forwards ref correctly**: Verify ref.current points to input element
- [ ] **Supports disabled state**: Check disabled attribute and styling
- [ ] **Passes through native input props**: Verify placeholder, type, value work
- [ ] **Applies custom className**: Verify className prop merges correctly
- [ ] **Applies wrapperClassName**: Verify wrapper div gets custom class
- [ ] **Sets aria-invalid when error present**: Check accessibility attribute
- [ ] **Associates label with input via id**: Verify htmlFor and id match
- [ ] **Sets aria-describedby for helper text**: Check accessibility association
- [ ] **Sets aria-describedby for error**: Check error association

### Select Component

- [ ] **Renders with label and select element**: Verify basic rendering
- [ ] **Renders options from options prop**: Check option elements created
- [ ] **Supports single selection (default)**: Verify multiple attr not set
- [ ] **Supports multiple selection**: Verify multiple attr when prop true
- [ ] **Displays error styling when error prop present**: Check error classes
- [ ] **Displays helper text when provided**: Verify helper text renders
- [ ] **Displays error message instead of helper text**: Error priority
- [ ] **Forwards ref correctly**: Verify ref.current is select element
- [ ] **Supports disabled state**: Check disabled attribute
- [ ] **Passes through native select props**: Verify defaultValue, onChange work
- [ ] **Applies custom className**: Verify className merging
- [ ] **Applies wrapperClassName**: Verify wrapper class
- [ ] **Sets aria-invalid when error present**: Check accessibility
- [ ] **Associates label with select**: Verify htmlFor/id
- [ ] **Handles empty options array**: No errors with empty array

### Radio Component

- [ ] **Renders with label and radio input**: Verify basic structure
- [ ] **Applies error styling when error prop present**: Check error classes
- [ ] **Displays helper text when provided**: Verify helper text
- [ ] **Displays error message**: Verify error rendering
- [ ] **Forwards ref correctly**: Verify ref points to input
- [ ] **Supports disabled state**: Check disabled styling
- [ ] **Passes through native input props (name, value)**: Verify radio group support
- [ ] **Applies custom className**: Verify className merge
- [ ] **Applies wrapperClassName**: Verify wrapper class
- [ ] **Sets aria-invalid when error present**: Accessibility check
- [ ] **Associates label with input**: htmlFor/id match
- [ ] **Works in radio group (same name)**: Multiple radios with same name

### Checkbox Component

- [ ] **Renders with label and checkbox input**: Basic rendering
- [ ] **Applies error styling when error prop present**: Error classes
- [ ] **Displays helper text when provided**: Helper text renders
- [ ] **Displays error message instead of helper text**: Error priority
- [ ] **Forwards ref correctly**: Ref points to input
- [ ] **Supports disabled state**: Disabled styling
- [ ] **Passes through native input props (checked, onChange)**: Native props work
- [ ] **Applies custom className**: ClassName merging
- [ ] **Applies wrapperClassName**: Wrapper class
- [ ] **Sets aria-invalid when error present**: Accessibility
- [ ] **Associates label with input**: htmlFor/id match
- [ ] **Sets aria-describedby for helper text**: Helper text association
- [ ] **Sets aria-describedby for error**: Error association

### Textarea Component

- [ ] **Renders with label and textarea element**: Basic rendering
- [ ] **Applies error styling when error prop present**: Error classes
- [ ] **Displays helper text when provided**: Helper text renders
- [ ] **Displays error message instead of helper text**: Error priority
- [ ] **Forwards ref correctly**: Ref points to textarea
- [ ] **Supports disabled state**: Disabled styling
- [ ] **Passes through native textarea props (rows, cols)**: Native props
- [ ] **Applies custom className**: ClassName merging
- [ ] **Applies wrapperClassName**: Wrapper class
- [ ] **Auto-resizes when autoResize=true**: Height adjusts to content
- [ ] **Does not auto-resize when autoResize=false/undefined**: Height fixed
- [ ] **Sets aria-invalid when error present**: Accessibility
- [ ] **Associates label with textarea**: htmlFor/id match
- [ ] **Sets aria-describedby for helper text**: Helper association
- [ ] **Sets aria-describedby for error**: Error association

## Integration Tests

- [ ] **FormCheckbox uses base Checkbox component**: Verify wrapper works
- [ ] **FormCheckbox integrates with react-hook-form**: Controller integration
- [ ] **All components export from common/index.ts**: Import statements work
- [ ] **Components work with existing Button/Card**: No style conflicts
- [ ] **Dark mode styles apply correctly**: Test in dark mode
- [ ] **FormClasses configuration extended correctly**: New styles available
- [ ] **No circular dependencies**: Import graph is clean

## End-to-End Tests

- [ ] **User can fill out form with all input types**: Complete user flow
- [ ] **Validation errors display correctly**: Error messages appear
- [ ] **Form submission with new components**: Integration with form library
- [ ] **Keyboard navigation works**: Tab through inputs, space for checkbox/radio
- [ ] **Screen reader announces labels and errors**: Accessibility validation

## Test Data

**Mock data for Select component:**

```typescript
const mockOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" }
];
```

**Mock error messages:**

```typescript
const mockError = "This field is required";
```

**Test refs:**

```typescript
const ref = React.createRef<HTMLInputElement>();
```

## Test Reporting & Coverage

**Run tests:**

```bash
cd packages/core/ui
pnpm test
```

**Check coverage:**

```bash
pnpm test -- --coverage
```

**Coverage expectations:**

- All new files: 100% line, branch, function coverage
- FormCheckbox.tsx: Update tests to use new base component

**Coverage gaps:**

- Document any intentional gaps (e.g., defensive code)
- Auto-resize logic: test with jsdom environment

## Manual Testing

**UI/UX Checklist:**

- [ ] All components render correctly in host-root app
- [ ] All components render correctly in render-root app
- [ ] Light mode styling looks consistent
- [ ] Dark mode styling looks consistent
- [ ] Disabled state has proper cursor and opacity
- [ ] Error state is clearly visible
- [ ] Helper text is readable
- [ ] Labels are properly aligned
- [ ] Focus states are visible and consistent
- [ ] Input widths are responsive

**Browser Compatibility:**

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari

**Accessibility:**

- [ ] Keyboard navigation (Tab, Space, Enter)
- [ ] Screen reader announces labels
- [ ] Screen reader announces errors
- [ ] Focus indicators visible
- [ ] Color contrast sufficient (WCAG AA)

**Functional Testing:**

- [ ] Input accepts text and numbers
- [ ] Select single selection works
- [ ] Select multiple selection works
- [ ] Radio group allows single selection
- [ ] Checkbox can be checked/unchecked
- [ ] Textarea accepts multi-line text
- [ ] Textarea auto-resize works (when enabled)
- [ ] Disabled inputs cannot be interacted with

## Performance Testing

**Render performance:**

- [ ] Components render in < 16ms (60fps)
- [ ] No unnecessary re-renders
- [ ] Auto-resize doesn't cause jank

**Bundle size:**

- [ ] Check bundle size impact (should be minimal)
- [ ] No heavy dependencies added

## Bug Tracking

**Issue categories:**

- **Critical**: Blocks functionality or accessibility
- **High**: Significant UX issue
- **Medium**: Minor visual or behavior issue
- **Low**: Edge case or nice-to-have

**Regression tests:**

- Add test case for any bug found
- Verify fix doesn't break existing functionality

## Test Execution Order

1. **Unit tests first**: Validate individual components
2. **Integration tests**: Verify component interactions
3. **Manual testing**: Visual and functional validation
4. **Accessibility audit**: Screen reader and keyboard testing
5. **Performance check**: Render performance validation

## Success Metrics

**Definition of Done:**

- [ ] 100% unit test coverage for all new components
- [ ] All integration tests passing
- [ ] Manual testing checklist complete
- [ ] No accessibility violations
- [ ] No console errors or warnings
- [ ] Performance benchmarks met
- [ ] Code review approved
