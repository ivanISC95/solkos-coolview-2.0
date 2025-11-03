import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
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
  select_opt : number = 1  
  
  shareViewOption(value:number){
    this.mensajeEvento.emit(value)
    this.select_opt = value
  }
}
