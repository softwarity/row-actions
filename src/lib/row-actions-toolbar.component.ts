import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type RowActionsVariant = 'filled' | 'tonal' | '';

// Inject global keyframes once
let keyframesInjected = false;
const KEYFRAMES_CSS = `
@keyframes rowActionsExpandFromRight {
  0% { clip-path: inset(0 0 0 100%); }
  100% { clip-path: inset(0 0 0 0); }
}
@keyframes rowActionsExpandFromLeft {
  0% { clip-path: inset(0 100% 0 0); }
  100% { clip-path: inset(0 0 0 0); }
}`;

function injectKeyframes(doc: Document): void {
  if (keyframesInjected) return;
  const style = doc.createElement('style');
  style.textContent = KEYFRAMES_CSS;
  doc.head.appendChild(style);
  keyframesInjected = true;
}

@Component({
  selector: 'row-actions-toolbar',
  template: `<ng-content></ng-content>`,
  host: {
    'class': 'row-actions-toolbar',
    '[class.row-actions-filled]': "variant() === 'filled'",
    '[class.row-actions-tonal]': "variant() === 'tonal'",
    '[style]': 'hostStyles()',
  },
  styles: `
    :host {
      display: flex;
      box-sizing: border-box;
      flex-direction: row;
      align-items: center;
      white-space: nowrap;
      gap: 0.5em;
      padding: 0 8px;
      margin-top: 1px;
      background: var(--row-actions-background, var(--mat-sys-surface-container));
      color: var(--mat-sys-on-surface);
    }
    :host(.row-actions-filled) {
      background: var(--row-actions-filled-background, var(--mat-sys-primary-container));
    }
    :host(.row-actions-tonal) {
      background: var(--row-actions-tonal-background, var(--mat-sys-secondary-container));
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowActionsToolbarComponent {
  readonly variant = input<RowActionsVariant>('');
  readonly animatedFrom = input<'left' | 'right' | null>(null);
  readonly height = input<string>('48px');

  constructor() {
    injectKeyframes(inject(DOCUMENT));
  }

  protected readonly hostStyles = computed(() => {
    const h = this.height();
    const from = this.animatedFrom();

    let styles = `height: ${h}; min-height: ${h}; max-height: ${h};`;

    // Border radius based on direction
    if (from === 'right') {
      styles += ' border-radius: 9999px 0 0 9999px;';
    } else if (from === 'left') {
      styles += ' border-radius: 0 9999px 9999px 0;';
    }

    // Animation via clip-path - cubic-bezier for smooth deceleration
    if (from === 'right') {
      styles += ' animation: rowActionsExpandFromRight 250ms cubic-bezier(0.0, 0.0, 0.2, 1) forwards;';
    } else if (from === 'left') {
      styles += ' animation: rowActionsExpandFromLeft 250ms cubic-bezier(0.0, 0.0, 0.2, 1) forwards;';
    }

    return styles;
  });
}
