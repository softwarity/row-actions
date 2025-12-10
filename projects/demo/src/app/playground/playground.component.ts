import { AfterViewInit, ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { RowActionsDirective } from '@softwarity/row-actions';
import { MatDividerModule } from '@angular/material/divider';

const PALETTES = [
  'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
  'orange', 'chartreuse', 'spring-green', 'azure', 'violet', 'rose'
] as const;

declare const Prism: any;

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastUpdated: string;
}

const USERS_DATA: User[] = [
  { id: 1, name: 'Alice Martin', email: 'alice@example.com', role: 'Admin', status: 'Active', lastUpdated: '2024-01-15' },
  { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Active', lastUpdated: '2024-01-14' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Editor', status: 'Inactive', lastUpdated: '2024-01-13' },
  { id: 4, name: 'Diana Ross', email: 'diana@example.com', role: 'User', status: 'Active', lastUpdated: '2024-01-12' },
  { id: 5, name: 'Edward Smith', email: 'edward@example.com', role: 'Admin', status: 'Active', lastUpdated: '2024-01-11' },
  { id: 6, name: 'Fiona Green', email: 'fiona@example.com', role: 'Editor', status: 'Pending', lastUpdated: '2024-01-10' },
  { id: 7, name: 'George Wilson', email: 'george@example.com', role: 'User', status: 'Active', lastUpdated: '2024-01-09' },
  { id: 8, name: 'Helen Davis', email: 'helen@example.com', role: 'User', status: 'Inactive', lastUpdated: '2024-01-08' },
];

@Component({
  selector: 'app-playground',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDividerModule,
    MatCheckboxModule,
    MatSelectModule,
    RowActionsDirective,
  ],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss'
})
export class PlaygroundComponent implements AfterViewInit {
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'status', 'actions'];
  dataSource = USERS_DATA;

  // Disabled state for each rowActions (left and right)
  protected leftDisabled = signal(false);
  protected rightDisabled = signal(false);

  protected isDarkMode = signal(document.body.classList.contains('dark-mode'));

  // Palette selection
  protected palettes = PALETTES;
  protected selectedPalette = signal<string>('');

  // Override configurations for each variant (distinct colors, unchecked by default)
  protected containerOverride = signal({ enabled: false, light: '#ff6b6b', dark: '#8b0000' }); // Red tones
  protected filledOverride = signal({ enabled: false, light: '#4ecdc4', dark: '#006666' });    // Cyan tones
  protected tonalOverride = signal({ enabled: false, light: '#ffe66d', dark: '#806600' });     // Yellow tones

  // Variant selection for interactive HTML
  protected selectedVariant = signal<'' | 'filled' | 'tonal'>('');

  // Highlighted code for display
  highlightedCode = '';
  highlightedScssCode = '';

  constructor() {
    // React to config changes to update highlighted code
    effect(() => {
      this.leftDisabled();
      this.rightDisabled();
      this.containerOverride();
      this.filledOverride();
      this.tonalOverride();
      this.selectedPalette();
      this.highlightCode();
      this.updateCustomBackground();
    });
  }

  ngAfterViewInit(): void {
    this.highlightCode();
  }

  protected get generatedCode(): string {
    return `<span rowActions>
  <button matIconButton (click)="edit(element)">
    <mat-icon>edit</mat-icon>
  </button>
  <button matIconButton (click)="delete(element)">
    <mat-icon>delete</mat-icon>
  </button>
</span>`;
  }

  highlightCode(): void {
    this.highlightedCode = Prism.highlight(this.generatedCode, Prism.languages.html, 'html');
    this.highlightedScssCode = Prism.highlight(this.generatedScssCode, Prism.languages.scss, 'scss');
  }

  protected get generatedScssCode(): string {
    const palette = this.selectedPalette() || 'violet';
    const container = this.containerOverride();
    const filled = this.filledOverride();
    const tonal = this.tonalOverride();

    const lines: string[] = [];
    if (container.enabled) {
      lines.push(`    container-background-color: light-dark(${container.light}, ${container.dark})`);
    }
    if (filled.enabled) {
      lines.push(`    filled-background-color: light-dark(${filled.light}, ${filled.dark})`);
    }
    if (tonal.enabled) {
      lines.push(`    tonal-background-color: light-dark(${tonal.light}, ${tonal.dark})`);
    }

    const overrideContent = lines.length > 0 ? lines.join(',\n') : '    // No overrides';

    return `// In styles.scss
@use '@angular/material' as mat;
@use '@softwarity/row-actions/row-actions-theme' as row-actions;

html {
  color-scheme: light;
  @include mat.theme((color: mat.$${palette}-palette));

  & body.dark-mode {
    color-scheme: dark;
  }

  @include row-actions.overrides((
${overrideContent}
  ));
}`;
  }

  private styleElement: HTMLStyleElement | null = null;

  updateCustomBackground(): void {
    const container = this.containerOverride();
    const filled = this.filledOverride();
    const tonal = this.tonalOverride();

    const hasAnyOverride = container.enabled || filled.enabled || tonal.enabled;

    if (hasAnyOverride) {
      if (!this.styleElement) {
        this.styleElement = document.createElement('style');
        document.head.appendChild(this.styleElement);
      }
      const lines: string[] = [];
      if (container.enabled) {
        lines.push(`--row-actions-background: light-dark(${container.light}, ${container.dark});`);
      }
      if (filled.enabled) {
        lines.push(`--row-actions-filled-background: light-dark(${filled.light}, ${filled.dark});`);
      }
      if (tonal.enabled) {
        lines.push(`--row-actions-tonal-background: light-dark(${tonal.light}, ${tonal.dark});`);
      }
      this.styleElement.textContent = `:root { ${lines.join(' ')} }`;
    } else if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
  }

  toggleOverride(variant: 'container' | 'filled' | 'tonal'): void {
    const signalMap = {
      container: this.containerOverride,
      filled: this.filledOverride,
      tonal: this.tonalOverride
    };
    signalMap[variant].update(v => ({ ...v, enabled: !v.enabled }));
  }

  updateOverrideColor(variant: 'container' | 'filled' | 'tonal', mode: 'light' | 'dark', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const signalMap = {
      container: this.containerOverride,
      filled: this.filledOverride,
      tonal: this.tonalOverride
    };
    signalMap[variant].update(v => ({ ...v, [mode]: value }));
  }

  toggleColorScheme(): void {
    this.isDarkMode.update(dark => !dark);
    document.body.classList.toggle('dark-mode', this.isDarkMode());
  }

  onEdit(user: User): void {
    this.snackBar.open(`Edit: ${user.name}`, 'Close', { duration: 2000 });
  }

  onDelete(user: User): void {
    this.snackBar.open(`Delete: ${user.name}`, 'Close', { duration: 2000 });
  }

  onView(user: User): void {
    this.snackBar.open(`View: ${user.name}`, 'Close', { duration: 2000 });
  }

  onDuplicate(user: User): void {
    this.snackBar.open(`Duplicate: ${user.name}`, 'Close', { duration: 2000 });
  }

  onPaletteChange(palette: string): void {
    const html = document.documentElement;
    // Remove all palette classes
    PALETTES.forEach(p => html.classList.remove(p));
    // Add selected palette class
    if (palette) {
      html.classList.add(palette);
    }
    this.selectedPalette.set(palette);
  }

  onVariantChange(variant: '' | 'filled' | 'tonal'): void {
    this.selectedVariant.set(variant);
  }
}
