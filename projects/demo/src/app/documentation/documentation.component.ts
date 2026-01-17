import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import '@softwarity/interactive-code';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './documentation.component.html',
  styleUrl: './documentation.component.scss'
})
export class DocumentationComponent {}
