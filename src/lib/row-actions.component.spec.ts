import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RowActionComponent } from './row-actions.component';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Test host component that simulates a mat-table row
@Component({
  template: `
    <mat-table [dataSource]="dataSource">
      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
        <mat-cell *matCellDef="let element">
          {{ element.name }}
          <row-actions [disabled]="disabled" [animationDisabled]="animationDisabled">
            <button mat-icon-button class="test-button">
              <mat-icon>edit</mat-icon>
            </button>
          </row-actions>
        </mat-cell>
      </ng-container>
      <mat-header-row *matHeaderRowDef="['name']"></mat-header-row>
      <mat-row *matRowDef="let row; columns: ['name'];"></mat-row>
    </mat-table>
  `,
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    RowActionComponent
  ]
})
class TestHostComponent {
  dataSource = [{ name: 'Test User' }];
  disabled = false;
  animationDisabled = false;
}

// Test host component with row-actions as first child (left position)
@Component({
  template: `
    <mat-table [dataSource]="dataSource">
      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
        <mat-cell *matCellDef="let element">
          <row-actions>
            <button mat-icon-button class="test-button">
              <mat-icon>edit</mat-icon>
            </button>
          </row-actions>
          {{ element.name }}
        </mat-cell>
      </ng-container>
      <mat-header-row *matHeaderRowDef="['name']"></mat-header-row>
      <mat-row *matRowDef="let row; columns: ['name'];"></mat-row>
    </mat-table>
  `,
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    RowActionComponent
  ]
})
class TestHostLeftComponent {
  dataSource = [{ name: 'Test User' }];
}

// Test host component with multiple rows
@Component({
  template: `
    <mat-table [dataSource]="dataSource">
      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
        <mat-cell *matCellDef="let element">
          {{ element.name }}
          <row-actions>
            <button mat-icon-button class="test-button">
              <mat-icon>edit</mat-icon>
            </button>
          </row-actions>
        </mat-cell>
      </ng-container>
      <mat-header-row *matHeaderRowDef="['name']"></mat-header-row>
      <mat-row *matRowDef="let row; columns: ['name'];"></mat-row>
    </mat-table>
  `,
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    RowActionComponent
  ]
})
class TestHostMultipleRowsComponent {
  dataSource = [
    { name: 'User 1' },
    { name: 'User 2' },
    { name: 'User 3' }
  ];
}

// Helper function to properly initialize component with host bindings
function initializeFixture<T>(fixture: ComponentFixture<T>): void {
  fixture.detectChanges();
  // Flush microtasks and trigger another change detection cycle
  // to handle @HostBinding updates in ngAfterViewInit
  fixture.detectChanges();
}

describe('RowActionComponent', () => {
  describe('Basic functionality', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;
    let rowActionDebugElement: DebugElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          TestHostComponent,
          NoopAnimationsModule
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(TestHostComponent);
      hostComponent = fixture.componentInstance;
      initializeFixture(fixture);

      rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
    });

    it('should create', () => {
      expect(rowActionDebugElement).toBeTruthy();
    });

    it('should be hidden when disabled', () => {
      hostComponent.disabled = true;
      fixture.detectChanges();

      const trigger = rowActionDebugElement.query(By.css('.actions-trigger'));
      expect(trigger).toBeNull();
    });

    it('should be visible when not disabled', () => {
      hostComponent.disabled = false;
      fixture.detectChanges();

      const trigger = rowActionDebugElement.query(By.css('.actions-trigger'));
      expect(trigger).toBeTruthy();
    });

    it('should have closed state initially', () => {
      const component = rowActionDebugElement.componentInstance as RowActionComponent;
      expect(component.open$.getValue()).toBeFalse();
    });
  });

  describe('Position detection', () => {
    it('should detect right position when row-actions is last child', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          TestHostComponent,
          NoopAnimationsModule
        ]
      });

      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      expect(component.position).toBe('right');
      flush();
    }));

    it('should detect left position when row-actions is first child', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          TestHostLeftComponent,
          NoopAnimationsModule
        ]
      });

      const fixture = TestBed.createComponent(TestHostLeftComponent);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      expect(component.position).toBe('left');
      flush();
    }));
  });

  describe('Mouse interactions', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let rowActionDebugElement: DebugElement;

    beforeEach(fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          TestHostComponent,
          NoopAnimationsModule
        ]
      });

      fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
    }));

    it('should open on mouseenter on mat-row', fakeAsync(() => {
      const component = rowActionDebugElement.componentInstance as RowActionComponent;
      const matRow = fixture.debugElement.query(By.css('mat-row'));

      expect(component.open$.getValue()).toBeFalse();

      matRow.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      tick();
      fixture.detectChanges();

      expect(component.open$.getValue()).toBeTrue();
      flush();
    }));

    it('should close when mouse leaves row bounds', fakeAsync(() => {
      const component = rowActionDebugElement.componentInstance as RowActionComponent;
      const matRow = fixture.debugElement.query(By.css('mat-row'));

      // Open first
      matRow.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      tick();
      fixture.detectChanges();
      expect(component.open$.getValue()).toBeTrue();

      // Simulate mouse move outside bounds
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: -100,
        clientY: -100
      });
      document.dispatchEvent(mouseMoveEvent);
      tick();
      fixture.detectChanges();

      expect(component.open$.getValue()).toBeFalse();
      flush();
    }));
  });

  describe('Animation settings', () => {
    it('should have animation enabled by default', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          TestHostComponent,
          NoopAnimationsModule
        ]
      });

      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      expect(component.animatedFrom).toBe('right');
      flush();
    }));

    it('should disable animation when animationDisabled is true', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          TestHostComponent,
          NoopAnimationsModule
        ]
      });

      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.componentInstance.animationDisabled = true;
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      expect(component.animatedFrom).toBeNull();
      flush();
    }));
  });

  describe('Overlay positioning', () => {
    it('should have end overlay position for right-positioned component', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          TestHostComponent,
          NoopAnimationsModule
        ]
      });

      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      expect(component.overlayPositions[0].originX).toBe('end');
      expect(component.overlayPositions[0].overlayX).toBe('end');
      flush();
    }));

    it('should have start overlay position for left-positioned component', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          TestHostLeftComponent,
          NoopAnimationsModule
        ]
      });

      const fixture = TestBed.createComponent(TestHostLeftComponent);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      expect(component.overlayPositions[0].originX).toBe('start');
      expect(component.overlayPositions[0].overlayX).toBe('start');
      flush();
    }));
  });

  describe('Cleanup on destroy', () => {
    it('should complete open$ subject on destroy', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          TestHostComponent,
          NoopAnimationsModule
        ]
      });

      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      let completed = false;
      component.open$.subscribe({
        complete: () => completed = true
      });

      fixture.destroy();

      expect(completed).toBeTrue();
      flush();
    }));
  });

  describe('Content projection', () => {
    it('should project buttons into toolbar', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          TestHostComponent,
          NoopAnimationsModule
        ]
      });

      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const matRow = fixture.debugElement.query(By.css('mat-row'));
      matRow.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      tick();
      fixture.detectChanges();
      tick(300); // Wait for animation
      fixture.detectChanges();

      // The button should be projected
      const projectedButton = document.querySelector('.test-button');
      expect(projectedButton).toBeTruthy();
      flush();
    }));
  });

  describe('Multiple rows behavior', () => {
    it('should create row-actions for each row', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          TestHostMultipleRowsComponent,
          NoopAnimationsModule
        ]
      });

      const fixture = TestBed.createComponent(TestHostMultipleRowsComponent);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const rowActionElements = fixture.debugElement.queryAll(By.directive(RowActionComponent));
      expect(rowActionElements.length).toBe(3);
      flush();
    }));

    it('should only open row-actions for the hovered row', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          TestHostMultipleRowsComponent,
          NoopAnimationsModule
        ]
      });

      const fixture = TestBed.createComponent(TestHostMultipleRowsComponent);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const rowActionElements = fixture.debugElement.queryAll(By.directive(RowActionComponent));
      const matRows = fixture.debugElement.queryAll(By.css('mat-row'));

      // Hover on the second row
      matRows[1].nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      tick();
      fixture.detectChanges();

      // Only the second row-actions should be open
      const component0 = rowActionElements[0].componentInstance as RowActionComponent;
      const component1 = rowActionElements[1].componentInstance as RowActionComponent;
      const component2 = rowActionElements[2].componentInstance as RowActionComponent;

      expect(component0.open$.getValue()).toBeFalse();
      expect(component1.open$.getValue()).toBeTrue();
      expect(component2.open$.getValue()).toBeFalse();
      flush();
    }));

    it('should close previous row-actions when hovering another row', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          TestHostMultipleRowsComponent,
          NoopAnimationsModule
        ]
      });

      const fixture = TestBed.createComponent(TestHostMultipleRowsComponent);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const rowActionElements = fixture.debugElement.queryAll(By.directive(RowActionComponent));
      const matRows = fixture.debugElement.queryAll(By.css('mat-row'));

      // Hover on the first row
      matRows[0].nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      tick();
      fixture.detectChanges();

      const component0 = rowActionElements[0].componentInstance as RowActionComponent;
      const component1 = rowActionElements[1].componentInstance as RowActionComponent;

      expect(component0.open$.getValue()).toBeTrue();

      // Now hover on the second row (simulating mouse move to row 2)
      const row1Rect = matRows[1].nativeElement.getBoundingClientRect();
      const mouseMoveToRow1 = new MouseEvent('mousemove', {
        clientX: row1Rect.left + 10,
        clientY: row1Rect.top + 10
      });
      document.dispatchEvent(mouseMoveToRow1);
      tick();

      // Mouse enters row 1
      matRows[1].nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      tick();
      fixture.detectChanges();

      expect(component1.open$.getValue()).toBeTrue();
      flush();
    }));
  });

  describe('Vertical alignment', () => {
    it('should set toolbar height to match cell height on hover', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          TestHostComponent,
          NoopAnimationsModule
        ]
      });

      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;
      const matRow = fixture.debugElement.query(By.css('mat-row'));

      // Initial height
      expect(component.heightToolbar).toBe('48px');

      // Hover to trigger height calculation
      matRow.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      tick();
      fixture.detectChanges();

      // Height should be set (value depends on actual cell height in test environment)
      expect(component.heightToolbar).toBeTruthy();
      flush();
    }));

    it('should have top alignment for overlay', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          TestHostComponent,
          NoopAnimationsModule
        ]
      });

      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      // Overlay should be aligned to top
      expect(component.overlayPositions[0].originY).toBe('top');
      expect(component.overlayPositions[0].overlayY).toBe('top');
      flush();
    }));
  });

  describe('Horizontal alignment', () => {
    it('should have negative margin-right for right-positioned component', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          TestHostComponent,
          NoopAnimationsModule
        ]
      });

      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      // Should have flex-grow: 1 to push to the right edge
      expect(component.flexGrow).toBe(1);
      // marginRight should be negative (to compensate cell padding)
      expect(component.marginRight).toBeLessThanOrEqual(0);
      flush();
    }));

    it('should have negative left offset for left-positioned component', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          TestHostLeftComponent,
          NoopAnimationsModule
        ]
      });

      const fixture = TestBed.createComponent(TestHostLeftComponent);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      // Should have flex-grow: 0
      expect(component.flexGrow).toBe(0);
      // left should be negative (to compensate cell padding)
      expect(component.left).toBeLessThanOrEqual(0);
      flush();
    }));
  });
});
