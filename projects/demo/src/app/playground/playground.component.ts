import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TablePreviewComponent } from '../table-preview/table-preview.component';

const PALETTES = [
  'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
  'orange', 'chartreuse', 'spring-green', 'azure', 'violet', 'rose'
] as const;

@Component({
  selector: 'app-playground',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    TablePreviewComponent,
  ],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss'
})
export class PlaygroundComponent {
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

  constructor() {
    // React to config changes to update custom background
    effect(() => {
      this.containerOverride();
      this.filledOverride();
      this.tonalOverride();
      this.updateCustomBackground();
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
