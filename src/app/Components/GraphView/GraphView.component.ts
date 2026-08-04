import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-graph-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './GraphView.component.html',
  styleUrl: './GraphView.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphViewComponent { 
  @Output() mensajeEvento = new EventEmitter<number>();
  @Input() URL_TELEMETRY_COPY: string = '';
  select_opt : number = 1  
  
  shareViewOption(value:number){
    this.mensajeEvento.emit(value)
    this.select_opt = value
  }
  copyURLTelemetry(): void {
    navigator.clipboard.writeText(this.URL_TELEMETRY_COPY).then(() => {
      console.log('¡Texto copiado con éxito!');            
      // Opcional: Aquí puedes mostrar una alerta visual o notificación (toast)
    }).catch(err => {
      console.error('Error al intentar copiar el texto: ', err);
    });
  }
}
