import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { GraphMainComponent } from "../../Components/GraphMain/GraphMain.component";
import { GraphViewComponent } from "../../Components/GraphView/GraphView.component";
import { ApiService } from '../../services/api.service';
import { DatasResponse } from '../../Interfaces/DatasResponse';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-select-main',
  standalone: true,
  imports: [NzSelectModule, NzIconModule, GraphViewComponent, FormsModule, NzDatePickerModule, NzButtonModule, NzInputModule, GraphMainComponent, LottieComponent],
  templateUrl: './SelectMain.component.html',
  styleUrl: './SelectMain.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectMainComponent {
  data_Cooler: DatasResponse | null = null
  date: null | Date[] = null;
  dateFormatted: string[] = [];
  value = '';
  view_grap_opt: null | number = 1;
  isLoading = false; // Estado de carga
  errorMessage: string | null = null;
  URL_TELEMETRY_COPY : string = 'NA'

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {
    const today = new Date();
    const pastMonth = new Date();
    pastMonth.setMonth(today.getMonth() - 1); // Resta 1 mes
    this.date = [pastMonth, today];    
  }

  onChange(result: Date[]): void {
    this.date = result;
  }
  options: AnimationOptions = {
    path: '/assets/Loader/loader.json',
  };

  async searchCooler(date_child?: any): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();
    if (this.date || date_child) {
      date_child ? this.dateFormatted = date_child.map((d: any) => d.toISOString().split('T')[0]) : this.dateFormatted = this.date!.map(d => d.toISOString().split('T')[0])
    }
    // this.apiService.fetchData(`https://coolview-api-v2-545989770214.us-central1.run.app/coolview-api/v2/telemetryOs/?id=${this.value}&start_date=${this.dateFormatted[0]}&end_date=${this.dateFormatted[1]}&is_mac=true`)
    this.apiService.fetchData(`https://solkos-tools-545989770214.us-central1.run.app/telemetry/telemetryByMAC?MAC=${this.value}&date_Init=${this.dateFormatted[0]}&date_end=${this.dateFormatted[1]}&current_UM=false`)
      .subscribe({
        next: (data) => {
          this.data_Cooler = data
          this.errorMessage = null;
        },
        error: (error) => {
          this.isLoading = false;
          this.data_Cooler = null; 
          console.error("Error en la petición:", error);
          this.cdr.markForCheck();          
          if (error.status === 404) {                        
            const detalle = error.error?.detail;

            if (detalle?.sugerencia && detalle?.datos) {
              const fechaInicio = detalle.datos.fechainicio;
              const fechaFin = detalle.datos.fechafin;
              this.errorMessage = `No se encontraron datos para el rango seleccionado. Sin embargo, hay telemetría disponible desde el ${fechaInicio} hasta el ${fechaFin}.`;
            } else {
              this.errorMessage = "Cooler no encontrado o no se encontraron datos en el sistema.";
            }

            return;
          }
          this.errorMessage = "Ocurrió un error al obtener los datos. Por favor, verifica con un administrador.";
        },
        complete: () => {
          this.isLoading = false;
          this.URL_TELEMETRY_COPY = `https://solkos-tools-545989770214.us-central1.run.app/telemetry/telemetryByMAC?MAC=${this.value}&date_Init=${this.dateFormatted[0]}&date_end=${this.dateFormatted[1]}&current_UM=false`;
          this.cdr.markForCheck();
        }
      });
  }

  recibirMensaje(mensaje: number) {
    this.view_grap_opt = mensaje;
  }
}
