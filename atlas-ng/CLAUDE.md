# Claude Code Guidelines for atlas-ng

## Component File Structure

**Always separate Angular component files into three distinct files:**

1. `component-name.component.ts` - TypeScript logic only
2. `component-name.component.html` - Template (HTML)
3. `component-name.component.scss` - Styles (SCSS)

**Never use inline templates or styles** in the `@Component` decorator. Always use:
```typescript
@Component({
  selector: 'app-component-name',
  templateUrl: './component-name.component.html',
  styleUrl: './component-name.component.scss',
})
```

## Directory Structure

Each component should have its own directory:
```
feature-name/
  component-name/
    component-name.component.ts
    component-name.component.html
    component-name.component.scss
```

## Naming Conventions

- Use kebab-case for file names
- Use PascalCase for class names
- Prefix selectors with `app-`

## User Feedback

**Never use `alert()` or `confirm()` dialog boxes.** Instead:

- Use Angular Material `MatSnackBar` for notifications and feedback
- Use Angular Material `MatDialog` for confirmations and complex interactions
- For confirmations, create a reusable confirmation dialog component

Example:
```typescript
// BAD - Never do this
alert('Settings saved!');
confirm('Are you sure?');

// GOOD - Use MatSnackBar
this.snackBar.open('Settings saved!', 'OK', { duration: 3000 });

// GOOD - Use MatDialog for confirmations
this.dialog.open(ConfirmDialogComponent, { data: { message: 'Are you sure?' } });
```

## Type Safety

**Use enums and types instead of string literals wherever possible.**

- Define enums for status values, types, and other categorical data
- Use TypeScript union types for constrained string values
- Avoid magic strings scattered throughout the code

Example:
```typescript
// BAD - Using string literals
status: 'RUNNING' | 'COMPLETE' | 'FAILED';
if (job.status === 'RUNNING') { ... }

// GOOD - Using enums
enum JobStatus {
  Running = 'RUNNING',
  Complete = 'COMPLETE',
  Failed = 'FAILED',
}
status: JobStatus;
if (job.status === JobStatus.Running) { ... }

// GOOD - Using const objects for string enums
const JobStatus = {
  Running: 'RUNNING',
  Complete: 'COMPLETE',
  Failed: 'FAILED',
} as const;
type JobStatus = typeof JobStatus[keyof typeof JobStatus];
```
