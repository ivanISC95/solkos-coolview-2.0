import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-select-main',
  standalone: true,
  imports: [],
  templateUrl: './SelectMain.component.html',
  styleUrl: './SelectMain.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectMainComponent { }
