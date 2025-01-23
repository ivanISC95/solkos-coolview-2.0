import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent } from "../../Components/Select/Select.component";
import { GraphViewComponent } from "../../Components/GraphView/GraphView.component";

@Component({
  selector: 'app-select-main',
  standalone: true,
  imports: [SelectComponent, GraphViewComponent],
  templateUrl: './SelectMain.component.html',
  styleUrl: './SelectMain.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectMainComponent { }
