import { CUSTOM_ELEMENTS_SCHEMA, Component, effect, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TablePreviewComponent } from '../table-preview/table-preview.component';
import { TablePreviewNativeComponent } from '../table-preview-native/table-preview-native.component';
import { LoadingIndicatorComponent } from '@softwarity/loading-indicator';
import '@softwarity/interactive-code';

const PALETTES = [
  'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
  'orange', 'chartreuse', 'spring-green', 'azure', 'violet', 'rose'
] as const;

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    MatIconModule,
    TablePreviewComponent,
    TablePreviewNativeComponent,
    LoadingIndicatorComponent,
  ],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss'
})
export class PlaygroundComponent {
  protected leftDisabled = signal(false);
  protected rightDisabled = signal(false);
  protected selectedVariant = signal<'' | 'filled' | 'tonal'>('');
  // closeOnClick (3.1.0): a row click closes every toolbar — toggleable to see it.
  protected closeOnClick = signal(true);

  protected isDarkMode = signal(document.body.classList.contains('dark-mode'));

  // Table syntax: 'component' = <mat-table>, 'native' = <table mat-table>
  protected isNativeTable = signal(false);

  // Row height
  protected rowHeight = signal<32 | 48 | 52 | 64>(52);

  // Palette selection
  protected palettes = PALETTES;
  protected selectedPalette = signal<string>('');

  // Override configurations for each variant (distinct colors, unchecked by default)
  protected containerOverride = signal({ enabled: false, light: '#ff6b6b', dark: '#8b0000' }); // Red tones
  protected filledOverride = signal({ enabled: false, light: '#4ecdc4', dark: '#006666' });    // Cyan tones
  protected tonalOverride = signal({ enabled: false, light: '#ffe66d', dark: '#806600' });     // Yellow tones

  constructor() {
    // React to config changes to update custom background
    effect(() => {
      this.containerOverride();
      this.filledOverride();
      this.tonalOverride();
      this.updateCustomBackground();
    });

    // React to row height changes
    effect(() => {
      this.updateRowHeight(this.rowHeight());
    });
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
        lines.push(`--row-actions-container-background-color: light-dark(${container.light}, ${container.dark});`);
      }
      if (filled.enabled) {
        lines.push(`--row-actions-filled-background-color: light-dark(${filled.light}, ${filled.dark});`);
      }
      if (tonal.enabled) {
        lines.push(`--row-actions-tonal-background-color: light-dark(${tonal.light}, ${tonal.dark});`);
      }
      this.styleElement.textContent = `:root { ${lines.join(' ')} }`;
    } else if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
  }

  toggleColorScheme(): void {
    this.isDarkMode.update(dark => !dark);
    document.body.classList.toggle('dark-mode', this.isDarkMode());
  }

  toggleTableSyntax(): void {
    this.isNativeTable.update(native => !native);
  }

  onBindingChange(event: Event): void {
    const target = event.target as HTMLElement;
    const key = target.getAttribute('key');
    const value = (target as unknown as { value: unknown }).value;

    switch (key) {
      case 'darkMode':
        this.isDarkMode.set(value == 'dark');
        document.body.classList.toggle('dark-mode', value == 'dark');
        break;
      case 'nativeTable':
        this.isNativeTable.set(value as boolean);
        break;
      case 'leftDisabled':
        this.leftDisabled.set(value as boolean);
        break;
      case 'rightDisabled':
        this.rightDisabled.set(value as boolean);
        break;
      case 'closeOnClick':
        this.closeOnClick.set(value as boolean);
        break;
      case 'variant':
        this.selectedVariant.set(value as '' | 'filled' | 'tonal');
        break;
      case 'palette':
        this.onPaletteChange(value as string);
        break;
      case 'rowHeight':
        this.rowHeight.set(parseInt(value as string, 10) as 32 | 48 | 52 | 64);
        break;
      case 'containerEnabled':
        this.containerOverride.update(v => ({ ...v, enabled: value as boolean }));
        break;
      case 'containerLight':
        this.containerOverride.update(v => ({ ...v, light: value as string }));
        break;
      case 'containerDark':
        this.containerOverride.update(v => ({ ...v, dark: value as string }));
        break;
      case 'filledEnabled':
        this.filledOverride.update(v => ({ ...v, enabled: value as boolean }));
        break;
      case 'filledLight':
        this.filledOverride.update(v => ({ ...v, light: value as string }));
        break;
      case 'filledDark':
        this.filledOverride.update(v => ({ ...v, dark: value as string }));
        break;
      case 'tonalEnabled':
        this.tonalOverride.update(v => ({ ...v, enabled: value as boolean }));
        break;
      case 'tonalLight':
        this.tonalOverride.update(v => ({ ...v, light: value as string }));
        break;
      case 'tonalDark':
        this.tonalOverride.update(v => ({ ...v, dark: value as string }));
        break;
    }
  }

  private onPaletteChange(palette: string): void {
    const html = document.documentElement;
    // Remove all palette classes
    PALETTES.forEach(p => html.classList.remove(p));
    // Add selected palette class
    if (palette) {
      html.classList.add(palette);
    }
    this.selectedPalette.set(palette);
  }

  private rowHeightStyleElement: HTMLStyleElement | null = null;

  private updateRowHeight(height: number): void {
    if (!this.rowHeightStyleElement) {
      this.rowHeightStyleElement = document.createElement('style');
      document.head.appendChild(this.rowHeightStyleElement);
    }
    this.rowHeightStyleElement.textContent = `
      .table-preview-wrapper {
        --row-height: ${height}px;
      }
      .table-preview-wrapper mat-row,
      .table-preview-wrapper tr[mat-row] {
        --mat-table-row-item-container-height: var(--row-height);
      }
    `;
  }
}
