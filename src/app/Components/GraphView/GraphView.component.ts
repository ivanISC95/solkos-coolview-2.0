import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-graph-view',
  standalone: true,
  imports: [],
  templateUrl: './GraphView.component.html',
  styleUrl: './GraphView.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphViewComponent { 
  @Output() mensajeEvento = new EventEmitter<number>();
  
  shareViewOption(value:number){
    this.mensajeEvento.emit(value)
  }
}
