import { AfterViewInit, ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { Field, form } from '@angular/forms/signals';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { RowActionComponent } from '@softwarity/row-actions';
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
    Field,
    MatTableModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDividerModule,
    MatCheckboxModule,
    MatSelectModule,
    RowActionComponent,
  ],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss'
})
export class PlaygroundComponent implements AfterViewInit {
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'status', 'actions'];
  dataSource = USERS_DATA;

  // Configuration options with Signal Forms
  protected configModel = signal({ disabled: false, customBackground: false });
  protected configForm = form(this.configModel);

  protected isDarkMode = signal(document.body.classList.contains('dark-mode'));

  // Palette selection
  protected palettes = PALETTES;
  protected selectedPalette = signal<string>('');

  // Custom background colors
  protected lightColor = signal('#e8def8');
  protected darkColor = signal('#4a4458');

  // Highlighted code for display
  highlightedCode = '';
  highlightedScssCode = '';

  constructor() {
    // React to config changes to update highlighted code
    effect(() => {
      this.configForm.disabled().value();
      this.configForm.customBackground().value();
      this.lightColor();
      this.darkColor();
      this.selectedPalette();
      this.highlightCode();
      this.updateCustomBackground();
    });
  }

  ngAfterViewInit(): void {
    this.highlightCode();
  }

  protected get generatedCode(): string {
    const attrs: string[] = [];
    if (this.configForm.disabled().value()) {
      attrs.push('[disabled]="true"');
    }
    const attrsStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';

    return `<row-actions${attrsStr}>
  <button matIconButton (click)="edit(element)">
    <mat-icon>edit</mat-icon>
  </button>
  <button matIconButton (click)="delete(element)">
    <mat-icon>delete</mat-icon>
  </button>
</row-actions>`;
  }

  highlightCode(): void {
    this.highlightedCode = Prism.highlight(this.generatedCode, Prism.languages.html, 'html');
    this.highlightedScssCode = Prism.highlight(this.generatedScssCode, Prism.languages.scss, 'scss');
  }

  protected get generatedScssCode(): string {
    const isCustomActive = this.configForm.customBackground().value();
    const lightVal = isCustomActive ? this.lightColor() : '#e8def8';
    const darkVal = isCustomActive ? this.darkColor() : '#4a4458';
    const customComment = isCustomActive ? '' : '// ';
    const palette = this.selectedPalette() || 'violet';

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
${customComment}    container-background-color: light-dark(${lightVal}, ${darkVal})
  ));
}`;
  }

  private styleElement: HTMLStyleElement | null = null;

  updateCustomBackground(): void {
    if (this.configForm.customBackground().value()) {
      if (!this.styleElement) {
        this.styleElement = document.createElement('style');
        document.head.appendChild(this.styleElement);
      }
      this.styleElement.textContent = `
        .cdk-overlay-container .row-actions-toolbar.mat-toolbar {
          --mat-toolbar-container-background-color: light-dark(${this.lightColor()}, ${this.darkColor()}) !important;
        }
      `;
    } else if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
  }

  onLightColorChange(event: Event): void {
    this.lightColor.set((event.target as HTMLInputElement).value);
  }

  onDarkColorChange(event: Event): void {
    this.darkColor.set((event.target as HTMLInputElement).value);
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
}
