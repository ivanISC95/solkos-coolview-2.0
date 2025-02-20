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
import { AnimationItem } from 'lottie-web';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-select-main',
  standalone: true,
  imports: [NzSelectModule, NzIconModule, GraphViewComponent, FormsModule, NzDatePickerModule, NzButtonModule, NzInputModule, GraphMainComponent,LottieComponent],
  templateUrl: './SelectMain.component.html',
  styleUrl: './SelectMain.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectMainComponent {
  data_Cooler : DatasResponse | null = null
  date: null | Date[] = null;
  dateFormatted: string[] = [];
  value = '';
  view_grap_opt: null | number = 1;
  isLoading = false; // Estado de carga

  constructor(private apiService: ApiService,private cdr: ChangeDetectorRef) {
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
  animationCreated(animationItem: AnimationItem): void {
    // console.log(animationItem);
  }

  async searchCooler(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck(); 
    if (this.date) {
      this.dateFormatted = this.date.map(d => d.toISOString().split('T')[0]);
    }   
    // this.apiService.fetchData("https://coolview-api-v2-545989770214.us-central1.run.app/coolview-api/v2/telemetryOs/?id=G06231010425&start_date=2025-01-30&end_date=2025-02-08&is_mac=false")
    this.apiService.fetchData(`https://coolview-api-v2-545989770214.us-central1.run.app/coolview-api/v2/telemetryOs/?id=${this.value}&start_date=${this.dateFormatted[0]}&end_date=${this.dateFormatted[1]}&is_mac=false`)
      .subscribe({
        next: (data) => {
          this.data_Cooler = data
        },
        error: (error) => {
          console.error("Error en la petición:", error);
        },
        complete: () => {
          this.isLoading = false;
          this.cdr.markForCheck(); 
        }
      });
  }

  recibirMensaje(mensaje: number) {
    this.view_grap_opt = mensaje;
  }
}
