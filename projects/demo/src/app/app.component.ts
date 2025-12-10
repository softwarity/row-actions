import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PlaygroundComponent } from './playground/playground.component';
import { DocumentationComponent } from './documentation/documentation.component';

@Component({
  selector: 'app-root',
  imports: [
    MatIconModule,
    PlaygroundComponent,
    DocumentationComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {}
