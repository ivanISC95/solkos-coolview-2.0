import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [],
  templateUrl: './Select.component.html',
  styleUrl: './Select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent { }
