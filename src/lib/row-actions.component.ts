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
      this.heightToolbar = parseInt(currentParentStyle.height) - 1 + 'px';
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
