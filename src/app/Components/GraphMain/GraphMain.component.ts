import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CommonModule } from '@angular/common';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFlexDirective } from 'ng-zorro-antd/flex';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

@Component({
  selector: 'app-graph-main',
  standalone: true,
  imports: [NzSelectModule,CommonModule,NzDrawerModule,NzFlexDirective,NzCheckboxModule,FormsModule,NzDatePickerModule],
  templateUrl: './GraphMain.component.html',
  styleUrl: './GraphMain.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphMainComponent {  
  drawer_status : boolean = false; 
  checked = true;
  date : null | Date[] = null;

  close() {    
    this.drawer_status = false
  }
  onChange(result: Date[]): void {
    this.date = result    
  }  
 }
