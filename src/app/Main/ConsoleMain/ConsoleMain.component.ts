import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-console-main',
  standalone: true,
  imports: [],
  templateUrl: './ConsoleMain.component.html',
  styleUrl: './ConsoleMain.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsoleMainComponent { }
