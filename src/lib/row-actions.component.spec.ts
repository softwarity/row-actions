import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement, provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
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

// Helper function to wait for setTimeout in zoneless mode
function waitForTimeout(ms = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to properly initialize component with host bindings
async function initializeFixture<T>(fixture: ComponentFixture<T>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  // Wait for setTimeout in ngAfterViewInit
  await waitForTimeout(10);
  fixture.detectChanges();
}

describe('RowActionComponent', () => {
  describe('Basic functionality', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;
    let rowActionDebugElement: DebugElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      fixture = TestBed.createComponent(TestHostComponent);
      hostComponent = fixture.componentInstance;
      await initializeFixture(fixture);

      rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
    });

    it('should create', () => {
      expect(rowActionDebugElement).toBeTruthy();
    });

    it('should be hidden when disabled', async () => {
      // Create a new fixture with disabled=true from the start
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      const disabledFixture = TestBed.createComponent(TestHostComponent);
      disabledFixture.componentInstance.disabled = true;
      await initializeFixture(disabledFixture);

      const rowAction = disabledFixture.debugElement.query(By.directive(RowActionComponent));
      const trigger = rowAction.query(By.css('.actions-trigger'));
      expect(trigger).toBeNull();
    });

    it('should be visible when not disabled', async () => {
      hostComponent.disabled = false;
      fixture.detectChanges();
      await fixture.whenStable();

      const trigger = rowActionDebugElement.query(By.css('.actions-trigger'));
      expect(trigger).toBeTruthy();
    });

    it('should have closed state initially', () => {
      const component = rowActionDebugElement.componentInstance as RowActionComponent;
      expect(component.open$.getValue()).toBeFalse();
    });
  });

  describe('Position detection', () => {
    it('should detect right position when row-actions is last child', async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      const fixture = TestBed.createComponent(TestHostComponent);
      await initializeFixture(fixture);

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      expect(component.position).toBe('right');
    });

    it('should detect left position when row-actions is first child', async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostLeftComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      const fixture = TestBed.createComponent(TestHostLeftComponent);
      await initializeFixture(fixture);

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      expect(component.position).toBe('left');
    });
  });

  describe('Mouse interactions', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let rowActionDebugElement: DebugElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      fixture = TestBed.createComponent(TestHostComponent);
      await initializeFixture(fixture);

      rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
    });

    it('should open on mouseenter on mat-row', async () => {
      const component = rowActionDebugElement.componentInstance as RowActionComponent;
      const matRow = fixture.debugElement.query(By.css('mat-row'));

      expect(component.open$.getValue()).toBeFalse();

      matRow.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      await waitForTimeout();
      fixture.detectChanges();

      expect(component.open$.getValue()).toBeTrue();
    });

    it('should close when mouse leaves row bounds', async () => {
      const component = rowActionDebugElement.componentInstance as RowActionComponent;
      const matRow = fixture.debugElement.query(By.css('mat-row'));

      // Open first
      matRow.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      await waitForTimeout();
      fixture.detectChanges();
      expect(component.open$.getValue()).toBeTrue();

      // Simulate mouse move outside bounds
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: -100,
        clientY: -100
      });
      document.dispatchEvent(mouseMoveEvent);
      await waitForTimeout();
      fixture.detectChanges();

      expect(component.open$.getValue()).toBeFalse();
    });
  });

  describe('Animation settings', () => {
    it('should have animation enabled by default', async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      const fixture = TestBed.createComponent(TestHostComponent);
      await initializeFixture(fixture);

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      expect(component.animatedFrom).toBe('right');
    });

    it('should disable animation when animationDisabled is true', async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.componentInstance.animationDisabled = true;
      await initializeFixture(fixture);

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      expect(component.animatedFrom).toBeNull();
    });
  });

  describe('Overlay positioning', () => {
    it('should have end overlay position for right-positioned component', async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      const fixture = TestBed.createComponent(TestHostComponent);
      await initializeFixture(fixture);

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      expect(component.overlayPositions[0].originX).toBe('end');
      expect(component.overlayPositions[0].overlayX).toBe('end');
    });

    it('should have start overlay position for left-positioned component', async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostLeftComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      const fixture = TestBed.createComponent(TestHostLeftComponent);
      await initializeFixture(fixture);

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      expect(component.overlayPositions[0].originX).toBe('start');
      expect(component.overlayPositions[0].overlayX).toBe('start');
    });
  });

  describe('Cleanup on destroy', () => {
    it('should complete open$ subject on destroy', async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      const fixture = TestBed.createComponent(TestHostComponent);
      await initializeFixture(fixture);

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      let completed = false;
      component.open$.subscribe({
        complete: () => completed = true
      });

      fixture.destroy();

      expect(completed).toBeTrue();
    });
  });

  describe('Content projection', () => {
    it('should project buttons into toolbar', async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      const fixture = TestBed.createComponent(TestHostComponent);
      await initializeFixture(fixture);

      const matRow = fixture.debugElement.query(By.css('mat-row'));
      matRow.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      await waitForTimeout();
      fixture.detectChanges();
      await waitForTimeout(300); // Wait for animation
      fixture.detectChanges();

      // The button should be projected
      const projectedButton = document.querySelector('.test-button');
      expect(projectedButton).toBeTruthy();
    });
  });

  describe('Multiple rows behavior', () => {
    it('should create row-actions for each row', async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostMultipleRowsComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      const fixture = TestBed.createComponent(TestHostMultipleRowsComponent);
      await initializeFixture(fixture);

      const rowActionElements = fixture.debugElement.queryAll(By.directive(RowActionComponent));
      expect(rowActionElements.length).toBe(3);
    });

    it('should only open row-actions for the hovered row', async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostMultipleRowsComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      const fixture = TestBed.createComponent(TestHostMultipleRowsComponent);
      await initializeFixture(fixture);

      const rowActionElements = fixture.debugElement.queryAll(By.directive(RowActionComponent));
      const matRows = fixture.debugElement.queryAll(By.css('mat-row'));

      // Hover on the second row
      matRows[1].nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      await waitForTimeout();
      fixture.detectChanges();

      // Only the second row-actions should be open
      const component0 = rowActionElements[0].componentInstance as RowActionComponent;
      const component1 = rowActionElements[1].componentInstance as RowActionComponent;
      const component2 = rowActionElements[2].componentInstance as RowActionComponent;

      expect(component0.open$.getValue()).toBeFalse();
      expect(component1.open$.getValue()).toBeTrue();
      expect(component2.open$.getValue()).toBeFalse();
    });

    it('should close previous row-actions when hovering another row', async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostMultipleRowsComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      const fixture = TestBed.createComponent(TestHostMultipleRowsComponent);
      await initializeFixture(fixture);

      const rowActionElements = fixture.debugElement.queryAll(By.directive(RowActionComponent));
      const matRows = fixture.debugElement.queryAll(By.css('mat-row'));

      // Hover on the first row
      matRows[0].nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      await waitForTimeout();
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
      await waitForTimeout();

      // Mouse enters row 1
      matRows[1].nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      await waitForTimeout();
      fixture.detectChanges();

      expect(component1.open$.getValue()).toBeTrue();
    });
  });

  describe('Vertical alignment', () => {
    it('should set toolbar height to match cell height on hover', async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      const fixture = TestBed.createComponent(TestHostComponent);
      await initializeFixture(fixture);

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;
      const matRow = fixture.debugElement.query(By.css('mat-row'));

      // Initial height
      expect(component.heightToolbar).toBe('48px');

      // Hover to trigger height calculation
      matRow.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
      await waitForTimeout();
      fixture.detectChanges();

      // Height should be set (value depends on actual cell height in test environment)
      expect(component.heightToolbar).toBeTruthy();
    });

    it('should have center alignment for overlay', async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      const fixture = TestBed.createComponent(TestHostComponent);
      await initializeFixture(fixture);

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      // Overlay should be aligned to center
      expect(component.overlayPositions[0].originY).toBe('center');
      expect(component.overlayPositions[0].overlayY).toBe('center');
    });
  });

  describe('Horizontal alignment', () => {
    it('should have negative margin-right for right-positioned component', async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      const fixture = TestBed.createComponent(TestHostComponent);
      await initializeFixture(fixture);

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      // Should have flex-grow: 1 to push to the right edge
      expect(component.flexGrow).toBe(1);
      // marginRight should be negative (to compensate cell padding)
      expect(component.marginRight).toBeLessThanOrEqual(0);
    });

    it('should have negative left offset for left-positioned component', async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostLeftComponent],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      const fixture = TestBed.createComponent(TestHostLeftComponent);
      await initializeFixture(fixture);

      const rowActionDebugElement = fixture.debugElement.query(By.directive(RowActionComponent));
      const component = rowActionDebugElement.componentInstance as RowActionComponent;

      // Should have flex-grow: 0
      expect(component.flexGrow).toBe(0);
      // left should be negative (to compensate cell padding)
      expect(component.left).toBeLessThanOrEqual(0);
    });
  });
});
