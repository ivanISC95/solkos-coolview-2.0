import { ChangeDetectionStrategy, Component, Input, ElementRef, viewChild, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CommonModule } from '@angular/common';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFlexDirective } from 'ng-zorro-antd/flex';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { DatasResponse, DrawerOptions } from '../../DatasResponse';
import { getTelemetryNamesTranslated, transformDesconectionsZone, transformFailsToAnnotations2, transformSafeZone, transformTelemetry2, transformTelemetryZoneEvents } from '../../Functions/GraphFunctions';
import { graph_config, graph_layout } from '../../Functions/GraphVar';

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
  @Input() selectOptionDefault: string = '' // Default option to Multiselect
  @Input() date_select_main: Date[] | null = null
  readonly el = viewChild.required<ElementRef>('chart');
  drawer_status: boolean = false;
  checked: boolean = false;
  date: null | Date[] = null;
  drawer_options: DrawerOptions = { checked_safe_disc: false, checked_safe_zone: false, checked_disconection: false } // variables drawer
  telemetryOptions: string[] = []; // Multiselect options
  selectedTelemetry: string[] = []; // MultiSelect value
  data_graph: any[] = [] // Datas from graph
  datas_min_max: number[] = [] // Y datas for min and max
  drawer_safezone_disconection: string[] = [] // Vale to know option safezone or disconectionzone

  ngOnInit() {
    this.telemetryOptions = getTelemetryNamesTranslated(this.data)
    this.telemetryOptions.includes(this.selectOptionDefault) ? this.selectedTelemetry = [this.selectOptionDefault] : this.selectedTelemetry = []
    this.data_graph = transformTelemetry2(this.data!.telemetry, [this.selectOptionDefault], [this.selectOptionDefault]);
    this.datas_min_max = this.data_graph.flatMap((value) => value.y)
    this.basicChart([...this.data_graph, ...transformTelemetryZoneEvents(this.data, this.datas_min_max)], null, this.datas_min_max);
  }
  basicChart(data_graph: any, safe_zone?: any, min_max?: number[]) {
    const element = this.el().nativeElement
    const data = data_graph;
    Plotly.newPlot(element, data, graph_layout(safe_zone, this.selectedTelemetry, transformFailsToAnnotations2(this.data, this.date_select_main, min_max ?? []), this.date_select_main ?? []), graph_config).then((graph: any) => {
      graph.on('plotly_relayout', (eventData: any) => {
        if (eventData['xaxis.range[0]']) {
          const dateEnd = new Date(eventData['xaxis.range[1]'])
          dateEnd.setUTCHours(23, 59, 59, 999)
          this.date_select_main = [new Date(eventData['xaxis.range[0]']), dateEnd]
        }
        if (eventData['yaxis.autorange'] || eventData['xaxis.autorange']) {
          const dateEnd = new Date(this.date_select_main![1] ?? eventData['xaxis.range'][1])
          dateEnd.setUTCHours(23, 59, 59, 999)
          this.date_select_main = [this.date_select_main![1], dateEnd]
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
    this.drawer_options.checked_safe_zone == true ? this.basicChart([...this.data_graph, ...transformTelemetryZoneEvents(this.data, this.datas_min_max)], transformSafeZone(this.data!.safeZone ?? []), this.datas_min_max) : this.basicChart([...this.data_graph, ...transformTelemetryZoneEvents(this.data, this.datas_min_max)], null, this.datas_min_max)
  }
  // Logica botones drawer

  onCheckedChange(value: boolean, buttonID?: string) {
    if (buttonID) {
      const index = this.drawer_safezone_disconection.indexOf(buttonID);
      value ? index === -1 && this.drawer_safezone_disconection.push(buttonID) : index !== -1 && this.drawer_safezone_disconection.splice(index, 1);
    }
    const options = this.drawer_safezone_disconection;
    const data = [...this.data_graph, ...transformTelemetryZoneEvents(this.data, this.datas_min_max)];
    const zones = options.includes('safe_and_disconection') || (options.includes('safeZone') && options.includes('disconection'))
      ? [...transformSafeZone(this.data!.safeZone ?? []), ...transformDesconectionsZone(this.data!.fails ?? [], this.datas_min_max)]
      : options.includes('safeZone')
        ? transformSafeZone(this.data!.safeZone ?? [])
        : options.includes('disconection')
          ? transformDesconectionsZone(this.data!.fails ?? [], this.datas_min_max)
          : null;
    this.basicChart(data, zones, this.datas_min_max);
  }

}
