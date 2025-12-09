import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RowActionComponent } from '@hhangular/row-actions';


declare const Prism: any;

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
  selector: 'app-root',
  standalone: true,
  imports: [
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCheckboxModule,
    RowActionComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'status', 'actions'];
  dataSource = USERS_DATA;

  // Configuration options
  disabled = false;
  isDarkMode = false;

  // Highlighted code for display
  highlightedCode = '';

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.highlightCode();
  }

  get generatedCode(): string {
    const attrs: string[] = [];
    if (this.disabled) {
      attrs.push('[disabled]="true"');
    }
    const attrsStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';

    return `<row-actions${attrsStr}>
  <button mat-icon-button (click)="edit(element)">
    <mat-icon>edit</mat-icon>
  </button>
  <button mat-icon-button (click)="delete(element)">
    <mat-icon>delete</mat-icon>
  </button>
</row-actions>`;
  }

  highlightCode(): void {
    const code = this.generatedCode;
    this.highlightedCode = Prism.highlight(code, Prism.languages.html, 'html');
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  onEdit(user: User): void {
    this.snackBar.open(`Edit: ${user.name}`, 'Close', { duration: 2000 });
  }

  onDelete(user: User): void {
    this.snackBar.open(`Delete: ${user.name}`, 'Close', { duration: 2000 });
  }

  onView(user: User): void {
    this.snackBar.open(`View: ${user.name}`, 'Close', { duration: 2000 });
  }

  onDuplicate(user: User): void {
    this.snackBar.open(`Duplicate: ${user.name}`, 'Close', { duration: 2000 });
  }
}
