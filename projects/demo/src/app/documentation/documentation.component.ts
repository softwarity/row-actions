import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';

declare const Prism: any;

@Component({
  selector: 'app-documentation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './documentation.component.html',
  styleUrl: './documentation.component.scss'
})
export class DocumentationComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    Prism.highlightAll();
  }
}
