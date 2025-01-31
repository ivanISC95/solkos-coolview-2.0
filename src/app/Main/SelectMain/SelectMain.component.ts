import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent } from "../../Components/Select/Select.component";
import { GraphViewComponent } from "../../Components/GraphView/GraphView.component";
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { GraphMainComponent } from "../../Components/GraphMain/GraphMain.component";


@Component({
  selector: 'app-select-main',
  standalone: true,
  imports: [NzSelectModule, NzIconModule, GraphViewComponent, FormsModule, NzDatePickerModule, NzButtonModule, NzInputModule, GraphMainComponent],
  templateUrl: './SelectMain.component.html',
  styleUrl: './SelectMain.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SelectMainComponent { 
  date : null | Date[] = null;
  value = ''  
  view_grap_opt : null | number = 1;

  onChange(result: Date[]): void {
    this.date = result    
  }    
  searchCooler():void{
    console.log(this.date)
    console.log(this.value)
  }  
  recibirMensaje(mensaje: number) {
    this.view_grap_opt = mensaje;
    console.log(this.view_grap_opt)
  }  
  constructor(){
    console.log(this.view_grap_opt)
  }
}
