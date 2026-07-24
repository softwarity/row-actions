import { Directive, inject, input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User, USERS_DATA } from './table-data';

@Directive()
export abstract class TablePreviewBase {
  protected snackBar = inject(MatSnackBar);

  readonly leftDisabled = input(false);
  readonly rightDisabled = input(false);
  readonly variant = input<'' | 'filled' | 'tonal'>('');
  // closeOnClick (3.1.0): clicking a row closes every toolbar. Toggleable in
  // the playground so the behaviour difference is visible.
  readonly closeOnClick = input(true);

  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'status', 'actions'];
  dataSource = USERS_DATA;

  onEdit(user: User): void {
    this.snackBar.open(`Edit: ${user.name}`, 'Close', { duration: 2000 });
  }

  onDelete(user: User): void {
    this.snackBar.open(`Delete: ${user.name}`, 'Close', { duration: 2000 });
  }

  onView(user: User): void {
    this.snackBar.open(`View: ${user.name}`, 'Close', { duration: 2000 });
  }
}
