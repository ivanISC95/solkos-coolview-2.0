import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-graph-main',
  standalone: true,
  imports: [NzSelectModule,CommonModule],
  templateUrl: './GraphMain.component.html',
  styleUrl: './GraphMain.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphMainComponent {  
 }
