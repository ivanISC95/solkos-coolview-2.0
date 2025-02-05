import { ChangeDetectionStrategy, Component, Input, ElementRef, viewChild, OnInit, AfterViewInit, HostListener } from '@angular/core';
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
export class GraphMainComponent implements OnInit{  
  readonly el = viewChild.required<ElementRef>('chart');
  drawer_status : boolean = false; 
  checked = true;
  date : null | Date[] = null;

  ngOnInit() {
    this.basicChart();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
    this.resizeChart();
  }
  basicChart(){
    const element = this.el().nativeElement
    const data = [
      {
        x: [1, 2, 3, 4, 5],
        y: [1, 2, 4, 8, 16],
        type: 'scatter',
      },
    ];
    const layout = {
      title: 'Simple Plotly Chart',
      autosize: true, // Asegura que el gráfico se ajuste al tamaño del contenedor
    };
    const config = {
      responsive: true, // Hace que el gráfico sea sensible al tamaño de su contenedor
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
 }
