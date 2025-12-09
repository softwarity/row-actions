import { AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ElementRef, HostBinding, inject, input, ViewEncapsulation } from '@angular/core';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'row-actions',
  template: `
    @if (!disabled()) {
      <span class="actions-trigger" cdkOverlayOrigin #trigger="cdkOverlayOrigin"></span>
      <ng-template cdkConnectedOverlay [cdkConnectedOverlayPositions]="overlayPositions" [cdkConnectedOverlayOrigin]="trigger" [cdkConnectedOverlayOpen]="!!(open$ | async)">
        <mat-toolbar
          class="row-actions-toolbar"
          [style.height]="heightToolbar"
          [style.min-height]="heightToolbar"
          [style.max-height]="heightToolbar"
          [class.expand-from-right]="animatedFrom === 'right'"
          [class.expand-from-left]="animatedFrom === 'left'"
          [class.no-animation]="animatedFrom === null"
          animate.enter="enter-animation"
          animate.leave="leave-animation">
          <ng-content></ng-content>
        </mat-toolbar>
      </ng-template>
    }
  `,
  styleUrl: './row-actions.component.scss',
  imports: [
    AsyncPipe,
    MatToolbarModule,
    OverlayModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class RowActionComponent implements AfterViewInit {

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  private matRowElement: HTMLElement | null = null;
  private rowMouseMoveListener: (() => void) | null = null;
  private openTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private closeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private static readonly OPEN_DELAY = 50;
  private static readonly CLOSE_DELAY = 50;

  // Track all instances to close others when one opens
  private static instances = new Set<RowActionComponent>();

  private static cancelOthers(except: RowActionComponent): void {
    for (const instance of RowActionComponent.instances) {
      // Only affect instances from OTHER rows, not the same row
      if (instance.matRowElement !== except.matRowElement) {
        // Cancel pending open
        if (instance.openTimeoutId) {
          clearTimeout(instance.openTimeoutId);
          instance.openTimeoutId = null;
        }
        // Close if open
        if (instance.open$.value) {
          instance.closeImmediately();
        }
      }
    }
  }

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

    // Register this instance
    RowActionComponent.instances.add(this);

    // Listen to mousemove on the row itself - more reliable than mouseenter
    this.rowMouseMoveListener = () => {
      // Cancel pending opens and close toolbars from other rows immediately
      RowActionComponent.cancelOthers(this);

      // Cancel any pending close for this row
      if (this.closeTimeoutId) {
        clearTimeout(this.closeTimeoutId);
        this.closeTimeoutId = null;
      }

      if (!this.open$.value && !this.openTimeoutId) {
        this.openTimeoutId = setTimeout(() => {
          this.openTimeoutId = null;
          const currentParentStyle = getComputedStyle(parentElement);
          this.heightToolbar = parseInt(currentParentStyle.height) - 1 + 'px';
          this.open$.next(true);
          document.addEventListener('mousemove', this.documentMouseMoveListener);
        }, RowActionComponent.OPEN_DELAY);
      }
    };

    this.matRowElement.addEventListener('mousemove', this.rowMouseMoveListener);

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      RowActionComponent.instances.delete(this);
      this.open$.complete();
      if (this.openTimeoutId) {
        clearTimeout(this.openTimeoutId);
      }
      if (this.closeTimeoutId) {
        clearTimeout(this.closeTimeoutId);
      }
      document.removeEventListener('mousemove', this.documentMouseMoveListener);
      if (this.matRowElement && this.rowMouseMoveListener) {
        this.matRowElement.removeEventListener('mousemove', this.rowMouseMoveListener);
      }
    });
  }

  private closeImmediately(): void {
    if (this.openTimeoutId) {
      clearTimeout(this.openTimeoutId);
      this.openTimeoutId = null;
    }
    if (this.closeTimeoutId) {
      clearTimeout(this.closeTimeoutId);
      this.closeTimeoutId = null;
    }
    if (this.open$.value) {
      this.open$.next(false);
      document.removeEventListener('mousemove', this.documentMouseMoveListener);
    }
  }

  private readonly documentMouseMoveListener = (event: MouseEvent): void => {
    if (this.matRowElement) {
      const rect = this.matRowElement.getBoundingClientRect();
      const isInHorizontalBounds = event.clientX >= rect.left && event.clientX <= rect.right;
      const isInVerticalBounds = event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (isInHorizontalBounds && isInVerticalBounds) {
        return;
      }
    }

    // Cancel any pending open
    if (this.openTimeoutId) {
      clearTimeout(this.openTimeoutId);
      this.openTimeoutId = null;
    }

    // Debounce close
    if (!this.closeTimeoutId) {
      this.closeTimeoutId = setTimeout(() => {
        this.closeTimeoutId = null;
        this.open$.next(false);
        document.removeEventListener('mousemove', this.documentMouseMoveListener);
      }, RowActionComponent.CLOSE_DELAY);
    }
  };
}
