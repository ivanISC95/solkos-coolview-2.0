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
import { getTelemetryNamesTranslated, hideFirstYTick, transformDesconectionsZone, transformFailsToAnnotations2, transformSafeZone, transformTelemetry2, transformTelemetryZoneEvents } from '../../Functions/GraphFunctions';
import { graph_config, graph_layout } from '../../Functions/GraphVar';

@Component({
  selector: 'app-graph-main',
  standalone: true,
  imports: [NzSelectModule, CommonModule, NzDrawerModule, NzFlexDirective, NzCheckboxModule, FormsModule, NzDatePickerModule, NzButtonModule],
  templateUrl: './GraphMain.component.html',
  styleUrl: './GraphMain.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphMainComponent implements OnInit {
  @Input() data: DatasResponse | null = null
  @Input() selectOptionDefault: string = '' // Default option to Multiselect
  @Input() date_select_main: Date[] | null = null
  @Input() search_Main!: (value: any) => Promise<void>;
  readonly el = viewChild.required<ElementRef>('chart');
  readonly NoData = viewChild.required<ElementRef>('NoData');
  drawer_status: boolean = false;
  date: null | Date[] = null;
  drawer_options: DrawerOptions = { checked_safe_disc: false, checked_safe_zone: false, checked_disconection: false, checked_events_zone: false, checked_Alerts: false, checked_Fails: false, checked_Info: false, checked_Desconections: false } // variables drawer
  telemetryOptions: string[] = []; // Multiselect options
  selectedTelemetry: string[] = []; // MultiSelect value
  data_graph: any[] = [] // Datas from graph
  datas_min_max: number[] = [] // Y datas for min and max
  drawer_safezone_disconection: string[] = [] // Vale to know option safezone or disconectionzone
  drawer_data_filter: string[] = []; // Values to filter events zone from drawer
  checkBoxStatus: { [key: string]: boolean } = {
    'Desconexiones': false,
    'Fallas': false,
    'Alertas': false,
    'Informativos': false,
  };


  ngOnInit() {
    this.telemetryOptions = getTelemetryNamesTranslated(this.data)
    this.telemetryOptions.includes(this.selectOptionDefault) ? this.selectedTelemetry = [this.selectOptionDefault] : this.selectedTelemetry = []
    this.data_graph = transformTelemetry2(this.data!.telemetry, [this.selectOptionDefault], [this.selectOptionDefault]);
    this.datas_min_max = this.data_graph.flatMap((value) => value.y)
    this.basicChart([...this.data_graph], null, this.datas_min_max);    
    this.checkBoxStatus['Fallas'] = this.data?.fails.some(item => item.type_fail.toLowerCase().includes('fail')) ?? false
    this.checkBoxStatus['Desconexiones'] = this.data?.fails.some(item => item.type_fail.toLowerCase().includes('disconnection')) ?? false
    this.checkBoxStatus['Alertas'] = this.data?.fails.filter(item => item.type_fail.toLowerCase() != 'disconnection_alert').some(item => item.type_fail.toLowerCase().includes('alert')) ?? false
    this.checkBoxStatus['Informativos'] = (this.data?.serviceOrder?.length ?? 0) > 0
  }


  basicChart(data_graph: any, safe_zone?: any, min_max?: number[], events_filter?: string[]) {
    const element = this.el().nativeElement
    const data = data_graph;
    this.resizeChart();
    const filteredData = transformFailsToAnnotations2(this.data, this.date_select_main, min_max ?? [], events_filter).filter((item: any) => {
      const sourceLower = item.source.toLowerCase();
      const isFail = sourceLower.includes('/fails/');
      const isAlert = sourceLower.includes('/alerts/');
      const isInfo = sourceLower.includes('/informativos/');
      const isDesconnection = sourceLower === "/assets/connections/desconexion.svg";
      const isReconnection = sourceLower === "/assets/connections/reconexion.svg";

      // Fails
      if (!this.drawer_options.checked_Fails && isFail) {
        return false;
      }

      // Alerts
      if (!this.drawer_options.checked_Alerts && isAlert) {
        return false;
      }
      // Desconexiones
      if (!this.drawer_options.checked_Desconections && (isDesconnection || isReconnection)) {
        return false;
      }

      return true;
    });

    Plotly.newPlot(element, data, graph_layout(safe_zone, this.selectedTelemetry, filteredData, this.date_select_main ?? []), graph_config).then((graph: any) => {
      graph.on('plotly_relayout', (eventData: any) => {
        if (eventData['xaxis.range[0]']) {
          const dateEnd = new Date(eventData['xaxis.range[1]'])
          dateEnd.setUTCHours(23, 59, 59, 999)
          this.date_select_main = [new Date(eventData['xaxis.range[0]']), dateEnd]
        }
        if (eventData['yaxis.autorange'] || eventData['xaxis.autorange']) {
          const dateInit = new Date(this.date_select_main![0])
          dateInit.setUTCHours(0, 0, 0, 0)
          const dateEnd = new Date(this.date_select_main![1])
          dateEnd.setUTCHours(23, 59, 59, 999)
          this.date_select_main = [dateInit, dateEnd]
        }
        if (eventData["xaxis.range"]) {
          const [xMin, xMax] = eventData["xaxis.range"];
          this.date_select_main = [new Date(xMin), new Date(xMax)]
        }
        const newAnnotations = transformFailsToAnnotations2(this.data, this.date_select_main, min_max ?? [], events_filter).filter((item: any) => {
          const sourceLower = item.source.toLowerCase();
          const isFail = sourceLower.includes('/fails/');
          const isAlert = sourceLower.includes('/alerts/');
          const isInfo = sourceLower.includes('/informativos/');
          const isDesconnection = sourceLower === "/assets/connections/desconexion.svg";
          const isReconnection = sourceLower === "/assets/connections/reconexion.svg";

          // Fails
          if (!this.drawer_options.checked_Fails && isFail) {
            return false;
          }

          // Alerts
          if (!this.drawer_options.checked_Alerts && isAlert) {
            return false;
          }

          // Desconexiones
          if (!this.drawer_options.checked_Desconections && (isDesconnection || isReconnection)) {
            return false;
          }

          return true;
        });
        if (newAnnotations.length) {
          Plotly.update(element, {}, { images: newAnnotations });
        }
      })      
      // Ejecutar inmediatamente al renderizar      
      hideFirstYTick(element);
            
      graph.on('plotly_relayout', () => {        
        hideFirstYTick(element);
      });
      const modebars = document.querySelectorAll('.modebar') as NodeListOf<HTMLElement>;
      modebars.forEach(modebar => {
        modebar.style.top = '-7px';
      });

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
    if (this.selectedTelemetry.length === 0) {
      this.el().nativeElement.style.display = 'none';
      this.NoData().nativeElement.style.display = 'flex'
    } else {
      this.el().nativeElement.style.display = 'block';
      this.NoData().nativeElement.style.display = 'none';
    }

    this.data_graph = transformTelemetry2(this.data!.telemetry, this.selectedTelemetry, this.selectedTelemetry);
    if (this.selectedTelemetry.includes('Aperturas') || this.selectedTelemetry.includes('Compresor')) {
      this.selectedTelemetry.includes('Aperturas') ? this.datas_min_max = [...this.datas_min_max, 0.7] : this.datas_min_max = [...this.datas_min_max, -3]
    }

    else {
      this.datas_min_max = this.data_graph.map(item => item.y).flat();
    }
    this.drawer_options.checked_safe_zone == true
      ? this.basicChart([...this.data_graph, ...transformTelemetryZoneEvents(this.data!.fails, this.datas_min_max,this.drawer_options)], transformSafeZone(this.data!.safeZone ?? []), this.datas_min_max, this.selectedTelemetry)
      : this.basicChart([...this.data_graph, ...transformTelemetryZoneEvents(this.data!.fails, this.datas_min_max,this.drawer_options)], null, this.datas_min_max, this.selectedTelemetry)
  }

  onCheckedChange(value: boolean, buttonID?: string) {
    if (buttonID) {
      const index = this.drawer_safezone_disconection.indexOf(buttonID);
      if (value) {
        if (index === -1) this.drawer_safezone_disconection.push(buttonID);
      } else {
        if (index !== -1) this.drawer_safezone_disconection.splice(index, 1);
      }

      // Manejamos los filtros para eventos
      const eventTypes = ['FAIL', 'ALERT', 'INFORMATIVES', 'DESCONECTIONS'];

      if (eventTypes.includes(buttonID)) {
        const filterIndex = this.drawer_data_filter.indexOf(buttonID);
        if (!value && filterIndex === -1) {
          // Si se desactiva, agregamos a filtros
          this.drawer_data_filter.push(buttonID);
        } else if (value && filterIndex !== -1) {
          // Si se activa, quitamos del filtro
          this.drawer_data_filter.splice(filterIndex, 1);
        }
      }

      // Si se desactiva la Zona de eventos, quitamos todos los filtros
      if (buttonID === 'events_zone' && !value) {
        this.drawer_data_filter = ['FAIL', 'ALERT', 'INFORMATIVES', 'DESCONECTIONS'];
      }

      // Si se activa la Zona de eventos, pero los filtros están todos activos, reiniciamos filtros (mostrar todo)
      if (buttonID === 'events_zone' && value) {
        this.drawer_data_filter = [];
      }
    }

    const filteredData = transformTelemetryZoneEvents(this.data!.fails, this.datas_min_max,this.drawer_options)

    const options = this.drawer_safezone_disconection;
    const data = [...this.data_graph, ...filteredData];

    const zones =
      options.includes('safe_and_disconection') || (options.includes('safeZone') && options.includes('disconection'))
        ? [
          ...transformSafeZone(this.data!.safeZone ?? []),
          ...transformDesconectionsZone(this.data!.fails ?? [], this.datas_min_max),
        ]
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
