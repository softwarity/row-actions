import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RowActionsDirective } from '@softwarity/row-actions';
import { BadgeComponent } from '../badge/badge.component';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastUpdated: string;
}

const USERS_DATA: User[] = [
  { id: 1, name: 'Alice Martin', email: 'alice@example.com', role: 'Admin', status: 'Active', lastUpdated: '2024-01-15' },
  { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Active', lastUpdated: '2024-01-14' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Editor', status: 'Inactive', lastUpdated: '2024-01-13' },
  { id: 4, name: 'Diana Ross', email: 'diana@example.com', role: 'User', status: 'Active', lastUpdated: '2024-01-12' },
  { id: 5, name: 'Edward Smith', email: 'edward@example.com', role: 'Admin', status: 'Active', lastUpdated: '2024-01-11' },
  { id: 6, name: 'Fiona Green', email: 'fiona@example.com', role: 'Editor', status: 'Pending', lastUpdated: '2024-01-10' },
  { id: 7, name: 'George Wilson', email: 'george@example.com', role: 'User', status: 'Active', lastUpdated: '2024-01-09' },
  { id: 8, name: 'Helen Davis', email: 'helen@example.com', role: 'User', status: 'Inactive', lastUpdated: '2024-01-08' },
];

@Component({
  selector: 'app-table-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    RowActionsDirective,
    BadgeComponent,
  ],
  templateUrl: './table-preview.component.html',
  styleUrl: './table-preview.component.scss'
})
export class TablePreviewComponent {
  private snackBar = inject(MatSnackBar);

  // Inputs from playground
  readonly leftDisabled = input(false);
  readonly rightDisabled = input(false);
  readonly variant = input<'' | 'filled' | 'tonal'>('');

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
