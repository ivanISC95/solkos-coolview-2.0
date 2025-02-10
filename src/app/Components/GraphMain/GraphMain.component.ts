import { ChangeDetectionStrategy, Component, Input, ElementRef, viewChild, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CommonModule } from '@angular/common';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFlexDirective } from 'ng-zorro-antd/flex';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { DatasResponse } from '../../DatasResponse';
import { getTelemetryNamesTranslated, transformSafeZone, transformTelemetry2 } from '../../Functions/GraphFunctions';
import { graph_config, graph_layout, SAFE_ZONE } from '../../Functions/GraphVar';

@Component({
  selector: 'app-graph-main',
  standalone: true,
  imports: [NzSelectModule, CommonModule, NzDrawerModule, NzFlexDirective, NzCheckboxModule, FormsModule, NzDatePickerModule],
  templateUrl: './GraphMain.component.html',
  styleUrl: './GraphMain.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphMainComponent implements OnInit {
  @Input() data: DatasResponse | null = null
  @Input() selectOptionDefault : string = '' // Default option to Multiselect
  readonly el = viewChild.required<ElementRef>('chart');
  drawer_status: boolean = false;
  checked : boolean = false;
  date: null | Date[] = null;
  telemetryOptions: string[] = []; // Multiselect options
  selectedTelemetry: string[] = []; // MultiSelect value
  data_graph : any[] = []
  
  ngOnInit() {
    this.telemetryOptions = getTelemetryNamesTranslated(this.data)
    this.telemetryOptions.includes(this.selectOptionDefault) ? this.selectedTelemetry = [this.selectOptionDefault] : this.selectedTelemetry = []    
    this.data_graph = transformTelemetry2(this.data!.telemetry, [this.selectOptionDefault],[this.selectOptionDefault]);
    this.basicChart(this.data_graph);
  }  
  basicChart(data_graph:any,safe_zone?:any) {
    const element = this.el().nativeElement
    const data = data_graph;     
    Plotly.newPlot(element, data, graph_layout(safe_zone,this.selectedTelemetry), graph_config);
  }
  resizeChart() {
    const element = this.el().nativeElement;
    Plotly.Plots.resize(element);
  }
  close() {
    this.drawer_status = false
  }
  onChange(result: Date[]): void {
    this.date = result
  }
  
  logSelection() {    
    this.data_graph = transformTelemetry2(this.data!.telemetry,this.selectedTelemetry,this.selectedTelemetry);
    this.basicChart(this.data_graph);
  }
  // Logica botones drawer
  onCheckedChange(value: boolean,buttonID?:string) {    
    buttonID == 'safeZone' && value == true ? this.basicChart(this.data_graph,transformSafeZone(this.data!.safeZone ?? [])) : this.basicChart(this.data_graph)    
  }
}
