import { AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ElementRef, inject, input } from '@angular/core';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { BehaviorSubject } from 'rxjs';
import { RowActionsToolbarComponent, RowActionsVariant } from './row-actions-toolbar.component';

export { RowActionsVariant } from './row-actions-toolbar.component';

@Component({
  selector: 'span[rowActions], div[rowActions]',
  template: `
    @if (!disabled()) {
      <span style="display: flex; flex-grow: 1" cdkOverlayOrigin #trigger="cdkOverlayOrigin"></span>
      <ng-template cdkConnectedOverlay [cdkConnectedOverlayPositions]="overlayPositions" [cdkConnectedOverlayOrigin]="trigger" [cdkConnectedOverlayOpen]="!!(open$ | async)" [cdkConnectedOverlayOffsetY]="offsetY">
        <row-actions-toolbar
          [variant]="rowActions()"
          [animatedFrom]="animatedFrom"
          [height]="heightToolbar">
          <ng-content></ng-content>
        </row-actions-toolbar>
      </ng-template>
    }
  `,
  imports: [
    AsyncPipe,
    OverlayModule,
    RowActionsToolbarComponent,
  ],
  host: {
    'style': 'position: relative; height: 100%; display: flex;',
    '[style.margin-right.px]': 'marginRight',
    '[style.flex-grow]': 'flexGrow',
    '[style.left.px]': 'left',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowActionsDirective implements AfterViewInit {

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  private matRowElement: HTMLElement | null = null;
  private isNativeTable = false;
  private rowMouseMoveListener: (() => void) | null = null;
  private openTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private closeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private static readonly OPEN_DELAY = 50;
  private static readonly CLOSE_DELAY = 50;

  // Track all instances to close others when one opens
  private static instances = new Set<RowActionsDirective>();

  private static cancelOthers(except: RowActionsDirective): void {
    for (const instance of RowActionsDirective.instances) {
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

  animatedFrom: 'left' | 'right' | null = null;

  readonly disabled = input<boolean | null>(false);

  readonly rowActions = input<RowActionsVariant>('');

  marginRight = 0;
  flexGrow = 0;
  left = 0;
  offsetY = 0;

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

      this.cdr.markForCheck();
    });

    this.matRowElement = this.el.nativeElement.closest('tr[mat-row], mat-row') as HTMLElement | null;
    if (!this.matRowElement) {
      return;
    }

    // Detect if we're in a native table (tr element) vs component table (mat-row element)
    this.isNativeTable = this.matRowElement.tagName.toLowerCase() === 'tr';

    // Register this instance
    RowActionsDirective.instances.add(this);

    // Listen to mousemove on the row itself - more reliable than mouseenter
    this.rowMouseMoveListener = () => {
      // Cancel pending opens and close toolbars from other rows immediately
      RowActionsDirective.cancelOthers(this);

      // Cancel any pending close for this row
      if (this.closeTimeoutId) {
        clearTimeout(this.closeTimeoutId);
        this.closeTimeoutId = null;
      }

      if (!this.open$.value && !this.openTimeoutId) {
        this.openTimeoutId = setTimeout(() => {
          this.openTimeoutId = null;

          if (this.isNativeTable && this.matRowElement) {
            // Native table mode: calculate offsetY to center the overlay relative to the row
            // This is needed because height: 100% doesn't work in native table cells
            const rowRect = this.matRowElement.getBoundingClientRect();
            const triggerRect = this.el.nativeElement.getBoundingClientRect();
            const rowCenterY = rowRect.top + rowRect.height / 2;
            const triggerCenterY = triggerRect.top + triggerRect.height / 2;
            this.offsetY = rowCenterY - triggerCenterY - 1;
            this.heightToolbar = rowRect.height - 1 + 'px';
          } else {
            // Component table mode: no offset needed, use parent element height
            const currentParentStyle = getComputedStyle(parentElement);
            this.heightToolbar = parseInt(currentParentStyle.height) - 1 + 'px';
            this.offsetY = 0;
          }

          this.open$.next(true);
          document.addEventListener('mousemove', this.documentMouseMoveListener);
        }, RowActionsDirective.OPEN_DELAY);
      }
    };

    this.matRowElement.addEventListener('mousemove', this.rowMouseMoveListener);

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      RowActionsDirective.instances.delete(this);
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
      }, RowActionsDirective.CLOSE_DELAY);
    }
  };
}
