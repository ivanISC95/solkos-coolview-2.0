import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-graph-main',
  standalone: true,
  imports: [NzSelectModule],
  templateUrl: './GraphMain.component.html',
  styleUrl: './GraphMain.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphMainComponent { }
