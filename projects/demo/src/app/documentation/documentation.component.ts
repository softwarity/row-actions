import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-documentation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './documentation.component.html',
  styleUrl: './documentation.component.scss'
})
export class DocumentationComponent {}
