import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent } from "../../Components/Select/Select.component";
import { GraphViewComponent } from "../../Components/GraphView/GraphView.component";
import { FormsModule } from '@angular/forms';


import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
@Component({
  selector: 'app-select-main',
  standalone: true,
  imports: [SelectComponent, GraphViewComponent,FormsModule,NzDatePickerModule],
  templateUrl: './SelectMain.component.html',
  styleUrl: './SelectMain.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectMainComponent { 
  date = null;

  onChange(result: Date[]): void {
    console.log('onChange: ', result);
  }    
}
