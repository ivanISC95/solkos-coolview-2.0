import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { GraphMainComponent } from "../../Components/GraphMain/GraphMain.component";
import { GraphViewComponent } from "../../Components/GraphView/GraphView.component";
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-select-main',
  standalone: true,
  imports: [NzSelectModule, NzIconModule, GraphViewComponent, FormsModule, NzDatePickerModule, NzButtonModule, NzInputModule, GraphMainComponent],
  templateUrl: './SelectMain.component.html',
  styleUrl: './SelectMain.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectMainComponent {
  date: null | Date[] = null;
  dateFormatted: string[] = [];
  value = '';
  view_grap_opt: null | number = 1;
  isLoading = false; // Estado de carga

  constructor(private apiService: ApiService) {
    const today = new Date();
    const pastMonth = new Date();
    pastMonth.setMonth(today.getMonth() - 1); // Resta 1 mes
    this.date = [pastMonth, today];
  }

  onChange(result: Date[]): void {
    this.date = result;
  }



  async searchCooler(): Promise<void> {
    if (this.date) {
      this.dateFormatted = this.date.map(d => d.toISOString().split('T')[0]);
    }
    console.log(this.dateFormatted);
    console.log(this.date)
    console.log(this.value);
    // this.apiService.fetchData("https://coolview-api-v2-545989770214.us-central1.run.app/coolview-api/v2/telemetryOs/?id=E22181202280&start_date=2024-12-01&end_date=2024-12-30")
    //   .subscribe({
    //     next: (data) => {
    //       console.log("Datos recibidos:", data);
    //     },
    //     error: (error) => {
    //       console.error("Error en la petición:", error);
    //     },
    //     complete: () => {
    //       this.isLoading = false;
    //     }
    //   });
  }

  recibirMensaje(mensaje: number) {
    this.view_grap_opt = mensaje;
    console.log(this.view_grap_opt);
  }
}
