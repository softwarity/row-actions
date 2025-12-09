import { animate, state, style, transition, trigger } from '@angular/animations';
import { AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ElementRef, HostBinding, inject, input } from '@angular/core';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'row-actions',
  standalone: true,
  template: `
    @if (!disabled()) {
      <span class="actions-trigger" cdkOverlayOrigin #trigger="cdkOverlayOrigin"></span>
      <ng-template cdkConnectedOverlay [cdkConnectedOverlayPositions]="overlayPositions" [cdkConnectedOverlayOrigin]="trigger" [cdkConnectedOverlayOpen]="!!(open$ | async)">
        <mat-toolbar [style.height]="heightToolbar" [style.min-height]="heightToolbar" [style.max-height]="heightToolbar" [@expandFromRight]="animatedFrom" [@expandFromLeft]="animatedFrom">
          <ng-content></ng-content>
        </mat-toolbar>
      </ng-template>
    }
  `,
  styles: [`
    :host {
      position: relative;
      height: 100%;
      display: flex;
    }
    .actions-trigger {
      display: flex;
      flex-grow: 1;
    }
    mat-toolbar {
      gap: 0.5em;
      /* Reset default mat-toolbar padding for compact display */
      padding: 0 8px;
      /* Material 3 theming - uses primary color by default */
      background-color: var(--mat-sys-primary, var(--mat-toolbar-container-background-color, #673ab7));
      color: var(--mat-sys-on-primary, var(--mat-toolbar-container-text-color, white));
    }
    /* Icon button styling - compact size for table rows */
    ::ng-deep mat-toolbar [mat-icon-button] {
      --mdc-icon-button-state-layer-size: 36px;
      --mdc-icon-button-icon-size: 18px;
      width: 36px;
      height: 36px;
      padding: 9px;
    }
    ::ng-deep mat-toolbar [mat-icon-button] mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    /* Inherit color for icon buttons from toolbar */
    ::ng-deep mat-toolbar [mat-icon-button] {
      color: inherit;
    }
  `],
  imports: [
    AsyncPipe,
    MatToolbarModule,
    OverlayModule,
  ],
  animations: [
    trigger('expandFromRight', [
      state('void', style({ clipPath: 'inset(0 0 0 100%)' })),
      state('right', style({ clipPath: 'inset(0 0 0 0)' })),
      transition('void => right', animate('300ms ease-out')),
      transition('right => void', animate('300ms ease-in'))
    ]),
    trigger('expandFromLeft', [
      state('void', style({ clipPath: 'inset(0 100% 0 0)' })),
      state('left', style({ clipPath: 'inset(0 0 0 0)' })),
      transition('void => left', animate('300ms ease-out')),
      transition('left => void', animate('300ms ease-in'))
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RowActionComponent implements AfterViewInit {

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  private matRowElement: HTMLElement | null = null;
  private mouseEnterListener: (() => void) | null = null;

  overlayPositions: ConnectedPosition[] = [{ originY: 'center', originX: 'end', overlayY: 'center', overlayX: 'end' }];

  open$ = new BehaviorSubject<boolean>(false);

  heightToolbar = '48px';

  position: 'left' | 'right' = 'right';

  readonly animationDisabled = input<boolean>(false);

  animatedFrom: 'left' | 'right' | null = null;

  readonly disabled = input<boolean | null>(false);

  // Host bindings for positioning
  @HostBinding('style.margin-right.px')
  marginRight = 0;

  @HostBinding('style.flex-grow')
  flexGrow = 0;

  @HostBinding('style.left.px')
  left = 0;

  ngAfterViewInit(): void {
    const parentElement = this.el.nativeElement.parentElement;
    if (!parentElement) {
      return;
    }

    // Use setTimeout to defer host binding updates to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      const parentStyle = getComputedStyle(parentElement);
      this.position = parentElement.childNodes[0] === this.el.nativeElement ? 'left' : 'right';
      this.animatedFrom = this.position;

      if (this.position === 'left') {
        this.overlayPositions = [{ originY: 'center', originX: 'start', overlayY: 'center', overlayX: 'start' }];
        this.flexGrow = 0;
        this.left = -parseFloat(parentStyle.paddingLeft);
      } else {
        this.overlayPositions = [{ originY: 'center', originX: 'end', overlayY: 'center', overlayX: 'end' }];
        this.flexGrow = 1;
        this.marginRight = -parseFloat(parentStyle.paddingRight);
      }

      if (this.animationDisabled()) {
        this.animatedFrom = null;
      }

      this.cdr.markForCheck();
    });

    this.matRowElement = this.el.nativeElement.closest('tr[mat-row], mat-row') as HTMLElement | null;
    if (!this.matRowElement) {
      return;
    }

    this.mouseEnterListener = () => {
      const currentParentStyle = getComputedStyle(parentElement);
      this.heightToolbar = currentParentStyle.height;
      this.open$.next(true);
      document.addEventListener('mousemove', this.mouseMoveListener);
    };

    this.matRowElement.addEventListener('mouseenter', this.mouseEnterListener);

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      this.open$.complete();
      document.removeEventListener('mousemove', this.mouseMoveListener);
      if (this.matRowElement && this.mouseEnterListener) {
        this.matRowElement.removeEventListener('mouseenter', this.mouseEnterListener);
      }
    });
  }

  private readonly mouseMoveListener = (event: MouseEvent): void => {
    if (this.matRowElement) {
      const rect = this.matRowElement.getBoundingClientRect();
      const isInHorizontalBounds = event.clientX >= rect.left && event.clientX <= rect.right;
      const isInVerticalBounds = event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (isInHorizontalBounds && isInVerticalBounds) {
        return;
      }
    }
    this.open$.next(false);
    document.removeEventListener('mousemove', this.mouseMoveListener);
  };
}
