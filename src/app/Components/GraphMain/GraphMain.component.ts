import { ChangeDetectionStrategy, Component, Input, ElementRef, viewChild, OnInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CommonModule } from '@angular/common';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFlexDirective } from 'ng-zorro-antd/flex';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { DatasResponse, DrawerOptions, ServiceOrder } from '../../Interfaces/DatasResponse';
import { getTelemetryNamesTranslated, graph_images, transformDesconectionsZone, transformFailsToAnnotations2, transformSafeZone, transformTelemetry2, transformTelemetryZoneEvents } from '../../Functions/GraphFunctions';
import { graph_config, graph_layout } from '../../Functions/GraphVar';

@Component({
  selector: 'app-graph-main',
  standalone: true,
  imports: [NzSelectModule, CommonModule, NzDrawerModule, NzFlexDirective, NzCheckboxModule, FormsModule, NzDatePickerModule, NzButtonModule],
  templateUrl: './GraphMain.component.html',
  styleUrl: './GraphMain.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphMainComponent implements OnInit, OnChanges {
  @Input() graph_view_opt: number = 0 // Tipe of visibility graph
  @Input() data: DatasResponse | null = null
  @Input() selectOptionDefault: string = '' // Default option to Multiselect ejem Temperature
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
  graph_zones: any[] | null = null;
  // Icons Select
  iconMap: { [key: string]: string } = {
    'Temperatura': '../../../assets/Select/Temperature.svg',
    'Ambiente': '../../../assets/Select/Temperature.svg',
    'Voltaje': '../../../assets/Select/Voltage.svg',
    'Voltaje Mínimo': '../../../assets/Select/Voltage_Low.svg',
    'Voltaje Máximo': '../../../assets/Select/Voltage.svg',
    'Consumo de Energia': '../../../assets/Select/Voltage_Consumo.svg',
    'Aperturas': '../../../assets/Select/Aperturas.svg',
    'Compresor': '../../../assets/Select/Compressor.svg',
    'Evaporador': '../../../assets/Select/Evaporador.svg',
    'Condensador': '../../../assets/Select/Condensador.svg',
  };
  constructor(private cdr: ChangeDetectorRef) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      // Se actualizó la data => redibuja el gráfico
      this.telemetryOptions = getTelemetryNamesTranslated(this.data);
      this.data_graph = transformTelemetry2(this.data.telemetry, [this.selectOptionDefault], [this.selectOptionDefault]);
      this.datas_min_max = this.data_graph.flatMap((v) => v.y);
      this.basicChart([...this.data_graph], null, this.datas_min_max, this.data?.serviceOrder);

      // Forzar detección de cambios
      this.cdr.detectChanges();
    }
  }

  ngOnInit() {
    this.telemetryOptions = getTelemetryNamesTranslated(this.data)
    this.telemetryOptions.includes(this.selectOptionDefault) ? this.selectedTelemetry = [this.selectOptionDefault] : this.selectedTelemetry = []
    this.data_graph = transformTelemetry2(this.data!.telemetry, [this.selectOptionDefault], [this.selectOptionDefault]);
    this.datas_min_max = this.data_graph.flatMap((value) => value.y)
    this.basicChart([...this.data_graph], null, this.datas_min_max, this.data?.serviceOrder);
    this.checkBoxStatus['Fallas'] = this.data?.fails.some(item => item.type_fail.toLowerCase().includes('fail')) ?? false
    this.checkBoxStatus['Desconexiones'] = this.data?.fails.some(item => item.type_fail.toLowerCase().includes('disconnection')) ?? false
    this.checkBoxStatus['Alertas'] = this.data?.fails.filter(item => item.type_fail.toLowerCase() != 'disconnection_alert').some(item => item.type_fail.toLowerCase().includes('alert')) ?? false
    this.checkBoxStatus['Informativos'] = (this.data?.serviceOrder?.length ?? 0) > 0
    this.checkBoxStatus['SafeZone'] = this.data?.safeZone?.[0]?.temperature?.x !== this.data?.safeZone?.[0]?.temperature?.y
  }


  basicChart(data_graph: any, safe_zone?: any, min_max?: number[], data_OS?: ServiceOrder[]) {
    const element = this.el().nativeElement
    const data = data_graph;
    this.resizeChart();

    const filteredData = graph_images(transformFailsToAnnotations2(this.data, this.date_select_main, min_max ?? [], data_OS, this.graph_view_opt), this.drawer_options)
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


        const newAnnotations = graph_images(transformFailsToAnnotations2(this.data, this.date_select_main, min_max ?? [], data_OS, this.graph_view_opt), this.drawer_options)
        if (newAnnotations.length) {
          Plotly.update(element, {}, { images: newAnnotations });
        }
      })

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
    this.drawer_status = false;
    setTimeout(() => {
      this.resizeChart();
    }, 300);
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
    this.graph_zones = this.drawer_safezone_disconection.includes('safe_and_disconection') || (this.drawer_safezone_disconection.includes('safeZone') && this.drawer_safezone_disconection.includes('disconection'))
      ? [
        ...transformSafeZone(this.data!.safeZone ?? []),
        ...transformDesconectionsZone(this.data!.fails ?? [], this.datas_min_max),
      ]
      : this.drawer_safezone_disconection.includes('safeZone')
        ? transformSafeZone(this.data!.safeZone ?? [])
        : this.drawer_safezone_disconection.includes('disconection')
          ? transformDesconectionsZone(this.data!.fails ?? [], this.datas_min_max)
          : null;
    this.basicChart([...this.data_graph, ...transformTelemetryZoneEvents(this.data!.fails, this.datas_min_max, this.drawer_options, this.data?.serviceOrder)], this.graph_zones, this.datas_min_max)
  }

  onCheckedChange(value: boolean, buttonID?: string) {
    console.log('Button ID:', buttonID, 'Value:', value);

    if (buttonID) {
      const index = this.drawer_safezone_disconection.indexOf(buttonID);

      // Control de safe/disconection options (mantén tu lógica original)
      if (buttonID === 'safe_and_disconection' || buttonID === 'safeZone' || buttonID === 'disconection') {
        if (value) {
          if (index === -1) this.drawer_safezone_disconection.push(buttonID);
        } else {
          if (index !== -1) this.drawer_safezone_disconection.splice(index, 1);
        }
      }

      // Mapeo correcto entre eventTypes y las props de drawer_options
      const eventTypes = ['FAIL', 'ALERT', 'INFORMATIVES', 'DESCONECTIONS'];
      const eventToOptionKey: Record<string, keyof typeof this.drawer_options> = {
        'FAIL': 'checked_Fails',
        'ALERT': 'checked_Alerts',
        'INFORMATIVES': 'checked_Info',
        'DESCONECTIONS': 'checked_Desconections'
      };

      // Si el botón es "events_zone"
      if (buttonID === 'events_zone') {
        if (value) {
          // Activar todos los tipos de eventos y mostrar todo
          this.drawer_data_filter = [];
          this.drawer_options.checked_events_zone = true;
          eventTypes.forEach(t => {
            const opt = eventToOptionKey[t];
            if (opt) this.drawer_options[opt] = true;
          });
        } else {
          // Desactivar todos los eventos y filtrar todo (ocultar)
          this.drawer_data_filter = [...eventTypes];
          this.drawer_options.checked_events_zone = false;
          eventTypes.forEach(t => {
            const opt = eventToOptionKey[t];
            if (opt) this.drawer_options[opt] = false;
          });
        }
      }

      // Si es un botón individual (FAIL, ALERT, INFORMATIVES, DESCONECTIONS)
      else if (eventTypes.includes(buttonID)) {
        const filterIndex = this.drawer_data_filter.indexOf(buttonID);
        const optKey = eventToOptionKey[buttonID];

        // Si se activa el checkbox del evento -> quitar del filtro y marcar la opción
        if (value) {
          if (filterIndex !== -1) this.drawer_data_filter.splice(filterIndex, 1);
          if (optKey) this.drawer_options[optKey] = true;
        }
        // Si se desactiva -> agregar al filtro y desmarcar la opción
        else {
          if (filterIndex === -1) this.drawer_data_filter.push(buttonID);
          if (optKey) this.drawer_options[optKey] = false;
        }

        // Si todos los tipos están activos (es decir, ninguno en drawer_data_filter) => marcar events_zone
        const allActive = eventTypes.every(t => this.drawer_data_filter.indexOf(t) === -1);
        this.drawer_options.checked_events_zone = allActive;
      }
    }

    // Recalcular filteredData y redibujar gráfico
    const filteredData = transformTelemetryZoneEvents(
      this.data!.fails,
      this.datas_min_max,
      this.drawer_options,
      this.data?.serviceOrder
    );

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

    this.graph_zones = zones ?? [];
    this.basicChart(data, zones, this.datas_min_max, this.data?.serviceOrder);
  }


  async search() {
    if (this.search_Main && this.date) {
      const isoDates = this.date.map((d: Date) => {
        const offset = d.getTimezoneOffset();
        const localDate = new Date(d.getTime() - offset * 60 * 1000);
        return localDate.toISOString().split('T')[0];
      });
      await this.search_Main(isoDates);
      this.close();
    }
  }

}
