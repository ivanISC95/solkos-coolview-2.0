import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CommonModule } from '@angular/common';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';


@Component({
  selector: 'app-graph-main',
  standalone: true,
  imports: [NzSelectModule,CommonModule,NzDrawerModule],
  templateUrl: './GraphMain.component.html',
  styleUrl: './GraphMain.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphMainComponent {  
  drawer_status : boolean = false; 

  close() {    
    this.drawer_status = false
  }
 }
