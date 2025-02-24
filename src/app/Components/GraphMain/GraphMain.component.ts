import { ChangeDetectionStrategy, Component, Input, ElementRef, viewChild, OnInit } from '@angular/core';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CommonModule } from '@angular/common';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFlexDirective } from 'ng-zorro-antd/flex';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { DatasResponse, DrawerOptions } from '../../Interfaces/DatasResponse';
import { getTelemetryNamesTranslated, transformDesconectionsZone, transformFailsToAnnotations2, transformSafeZone, transformTelemetry2, transformTelemetryZoneEvents } from '../../Functions/GraphFunctions';
import { graph_config, graph_layout } from '../../Functions/GraphVar';

@Component({
  selector: 'app-graph-main',
  standalone: true,
  imports: [NzSelectModule, CommonModule, NzDrawerModule, NzFlexDirective, NzCheckboxModule, FormsModule, NzDatePickerModule,NzButtonModule],
  templateUrl: './GraphMain.component.html',
  styleUrl: './GraphMain.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphMainComponent implements OnInit {
  @Input() data: DatasResponse | null = null
  @Input() selectOptionDefault: string = '' // Default option to Multiselect
  @Input() date_select_main: Date[] | null = null
  @Input() search_Main!: (value:any) => Promise<void>;
  readonly el = viewChild.required<ElementRef>('chart');
  drawer_status: boolean = false;
  date: null | Date[] = null;
  drawer_options: DrawerOptions = { checked_safe_disc: false, checked_safe_zone: false, checked_disconection: false, checked_events_zone: false, checked_Alerts: true, checked_Fails: true, checked_Info: true, checked_Desconections: true } // variables drawer
  telemetryOptions: string[] = []; // Multiselect options
  selectedTelemetry: string[] = []; // MultiSelect value
  data_graph: any[] = [] // Datas from graph
  datas_min_max: number[] = [] // Y datas for min and max
  drawer_safezone_disconection: string[] = [] // Vale to know option safezone or disconectionzone
  drawer_data_filter: string[] = []; // Values to filter events zone from drawer

  ngOnInit() {
    this.telemetryOptions = getTelemetryNamesTranslated(this.data)
    this.telemetryOptions.includes(this.selectOptionDefault) ? this.selectedTelemetry = [this.selectOptionDefault] : this.selectedTelemetry = []
    this.data_graph = transformTelemetry2(this.data!.telemetry, [this.selectOptionDefault], [this.selectOptionDefault]);
    this.datas_min_max = this.data_graph.flatMap((value) => value.y)
    this.basicChart([...this.data_graph, ...transformTelemetryZoneEvents(this.data!.fails, this.datas_min_max)], null, this.datas_min_max);
    console.log(this.datas_min_max)
  }
  basicChart(data_graph: any, safe_zone?: any, min_max?: number[], events_filter?: string[]) {    
    const element = this.el().nativeElement
    const data = data_graph;
    const filteredData = transformFailsToAnnotations2(this.data, this.date_select_main, min_max ?? [],events_filter).filter((item: any) => {
      const sourceLower = item.source.toLowerCase(); // Convertir a minúsculas para coincidencias más seguras
      if (this.drawer_data_filter.includes('FAIL') && sourceLower.includes('/fails/')) {
        return false;
      }
      if (this.drawer_data_filter.includes('ALERT') && sourceLower.includes('/alerts/')) {
        return false;
      }
      if (this.drawer_data_filter.includes('INFORMATIVES') && sourceLower.includes('/informativos/')) {
        return false;
      }
      if (this.drawer_data_filter.includes('DESCONECTIONS') && (sourceLower.includes('desconexion') || sourceLower.includes('reconexion'))) {
        return false;
      }

      return true; // Incluir todos los demás
    });

    Plotly.newPlot(element, data, graph_layout(safe_zone, this.selectedTelemetry, filteredData, this.date_select_main ?? []), graph_config).then((graph: any) => {
      graph.on('plotly_relayout', (eventData: any) => {
        console.log(eventData)
        if (eventData['xaxis.range[0]']) {
          const dateEnd = new Date(eventData['xaxis.range[1]'])
          dateEnd.setUTCHours(23, 59, 59, 999)
          this.date_select_main = [new Date(eventData['xaxis.range[0]']), dateEnd]
        }
        if (eventData['yaxis.autorange'] || eventData['xaxis.autorange']) {
          const dateInit = new Date(this.date_select_main![0])
          dateInit.setUTCHours(0,0,0,0)
          const dateEnd = new Date(this.date_select_main![1])
          dateEnd.setUTCHours(23, 59, 59, 999)                      
          this.date_select_main = [dateInit, dateEnd]
        }
        if (eventData["xaxis.range"]) {
          const [xMin, xMax] = eventData["xaxis.range"];
          this.date_select_main = [new Date(xMin), new Date(xMax)]
        }
        const newAnnotations = transformFailsToAnnotations2(this.data, this.date_select_main, min_max ?? []);        
        if (newAnnotations.length) {
          Plotly.update(element, {}, { images: newAnnotations });
        }
      })
    })
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
    this.data_graph = transformTelemetry2(this.data!.telemetry, this.selectedTelemetry, this.selectedTelemetry);
    this.drawer_options.checked_safe_zone == true 
    ? this.basicChart([...this.data_graph, ...transformTelemetryZoneEvents(this.data!.fails, this.datas_min_max,this.selectedTelemetry)], transformSafeZone(this.data!.safeZone ?? []), this.datas_min_max,this.selectedTelemetry) 
    : this.basicChart([...this.data_graph, ...transformTelemetryZoneEvents(this.data!.fails, this.datas_min_max,this.selectedTelemetry)], null, this.datas_min_max,this.selectedTelemetry)
    console.log(this.datas_min_max)
    console.log(this.data_graph)
  }

  onCheckedChange(value: boolean, buttonID?: string) {
    if (buttonID) {
      const index = this.drawer_safezone_disconection.indexOf(buttonID);
      value ? index === -1 && this.drawer_safezone_disconection.push(buttonID) : index !== -1 && this.drawer_safezone_disconection.splice(index, 1);

      // Manejo de drawer_data_filter
      const filterIndex = this.drawer_data_filter.indexOf(buttonID);
      if (value == false) {
        if (filterIndex === -1 && ['FAIL', 'ALERT', 'INFORMATIVES', 'DESCONECTIONS'].includes(buttonID)) {
          this.drawer_data_filter.push(buttonID);
        }
      } else {
        if (filterIndex !== -1) {
          this.drawer_data_filter.splice(filterIndex, 1);
        }
      }
    }

    const filteredData = transformTelemetryZoneEvents(this.data!.fails, this.datas_min_max).filter(item => {
      if (this.drawer_data_filter.includes('FAIL') && item.name.includes('Falla')) {
        return false;
      }
      if (this.drawer_data_filter.includes('ALERT') && item.name.includes('Alerta')) {
        return false;
      }
      if (this.drawer_data_filter.includes('INFORMATIVES') && item.name.includes('Informativo')) {
        return false;
      }
      if (this.drawer_data_filter.includes('DESCONECTIONS') && item.name.includes('Desconexión')) {
        return false;
      }
      if (this.drawer_data_filter.includes('DESCONECTIONS') && item.name.includes('Conexión')) {
        return false;
      }
      return true; // Incluye todos los demás
    });
    const options = this.drawer_safezone_disconection;
    const data = [...this.data_graph, ...filteredData];
    const zones = options.includes('safe_and_disconection') || (options.includes('safeZone') && options.includes('disconection'))
      ? [...transformSafeZone(this.data!.safeZone ?? []), ...transformDesconectionsZone(this.data!.fails ?? [], this.datas_min_max)]
      : options.includes('safeZone')
        ? transformSafeZone(this.data!.safeZone ?? [])
        : options.includes('disconection')
          ? transformDesconectionsZone(this.data!.fails ?? [], this.datas_min_max)
          : null;
    this.basicChart(data, zones, this.datas_min_max, this.drawer_data_filter);
  }

  async search() {  
    if (this.search_Main) {      
      await this.search_Main(this.date);
    }
  }
}
