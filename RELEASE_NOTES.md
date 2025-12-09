# Release Notes

## 3.0.1

### Breaking Changes
- **Removed `color` input** - The `color` input (`primary`, `accent`, `warn`) has been removed in favor of Material 3 theming via CSS custom properties
- **Migration**: Replace `[color]="'warn'"` with CSS: `row-actions mat-toolbar { --mat-toolbar-container-background-color: var(--mat-sys-error); --mat-toolbar-container-text-color: var(--mat-sys-on-error); }`

### Material 3 Support
- **M3 Design Tokens** - Uses Material 3 toolbar tokens (`--mat-toolbar-container-background-color`, `--mat-toolbar-container-text-color`)
- **Improved vertical alignment** - Toolbar now uses center positioning for better alignment with table rows

---

## 2.0.4

### Breaking Changes
- **Requires Angular 17+** - Uses Angular signals (`input()`) and `@if` control flow syntax

### Improvements
- **Improved animation** - Replaced `scaleX` animation with `clip-path` for smoother reveal effect without content distortion

### Code Quality
- Migrated to Angular signals (`input()`)
- Added `DestroyRef` for proper cleanup
- Improved typing throughout

### Testing
- **Unit tests** - Comprehensive test suite with 21 tests covering:
  - Row-actions display on hover
  - Position detection (left/right)
  - Vertical and horizontal alignment
  - Mouse interactions
  - Multiple rows behavior
  - Content projection
- **CI/CD** - Tests integrated in GitHub Actions workflow with coverage reports
- **Coverage** - 94%+ statement coverage

---

## 2.0.3

### New Features
- **Live Demo** - Interactive demo page deployed on GitHub Pages at [hhangular.github.io/row-actions](https://hhangular.github.io/row-actions/)
- Demo includes real-time configuration options (color, disabled state)
- Dynamic code preview with syntax highlighting

### Improvements
- Updated to Angular 18
- Standalone component ready for modern Angular applications

---

## 2.0.1

### Improvements
- Added compatibility with Angular 17+

---

## 1.18.4

### Improvements
- Added compatibility with Angular 17

---

## 1.18.3

### New Features
- Added `disabled` input to hide the component completely

---

## Previous Versions

For older releases, see the [commit history](https://github.com/hhangular/row-actions/commits/main).
