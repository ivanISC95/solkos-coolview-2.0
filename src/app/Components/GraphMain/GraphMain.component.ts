import { ChangeDetectionStrategy, Component, Input, ElementRef, viewChild, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CommonModule } from '@angular/common';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFlexDirective } from 'ng-zorro-antd/flex';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { DatasResponse, Telemetry } from '../../DatasResponse';
import { getTelemetryNamesTranslated, TELEMETRI_DATA, transformTelemetry } from '../../Functions/GraphFunctions';

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
  checked = true;
  date: null | Date[] = null;
  telemetryOptions: string[] = []; // Multiselect options
  selectedTelemetry: string[] = []; // MultiSelect value
  
  ngOnInit() {
    this.basicChart();
    this.telemetryOptions = getTelemetryNamesTranslated(this.data)
    this.telemetryOptions.includes(this.selectOptionDefault) ? this.selectedTelemetry = [this.selectOptionDefault] : this.selectedTelemetry = []    
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.resizeChart();
  }
  basicChart() {
    const element = this.el().nativeElement
    const data = [TELEMETRI_DATA];
    const layout = {
      title: 'Simple Plotly Chart',
      autosize: true,
      showlegend: true,
      plot_bgcolor: '#f8f9fa',
      paper_bgcolor: '#f8f9fa',
      hovermode: 'x',
      font: {
        family: 'DM Mono',
        size: 12,
        color: '#868E96',
      },
      legend: {
        x: 0.95, // Mueve la leyenda más hacia la izquierda
        xanchor: 'right',
        yanchor: 'bottom',
        y: 0.95,
        orientation: 'h',
        font: {
          family: 'DM Sans, monospace',
          color: '#495057',
        },
        traceorder: 'normal',
      },
      xaxis: {
        tickformat: '%d-%b',
        showgrid: false,
        type: 'date'
        // range: rangos.length > 0 ? [rangos[0], rangos[1]] : undefined
      },
      yaxis: {
        autorange: true,
        tickformat: '~s',
        // ticksuffix: LayoutInforTelemetry(value)[1],
        zeroline: false,
        showgrid: true,
        tickfont: {
          family: 'DM Mono',
          size: 12,
          color: '#868E96'
        },
      },
      margin: {
        t: 10,
        b: 30,
        l: 30,
        r: 30
      }
    };
    const config = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d', 'autoScale2d'], displaylogo: false
    };

    Plotly.newPlot(element, data, layout, config);
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
    // aqui meter logica de la data
    console.log("Opciones seleccionadas:", this.selectedTelemetry);
  }
}
