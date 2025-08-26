import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DatasResponse } from '../../Interfaces/DatasResponse';
import { getDateRange_dateFunctions, getDateRangeFromEndDate_dateFunctions } from '../../Functions/DateFunctions';
import { GraphViewComponent } from '../../Components/GraphView/GraphView.component';
import { GraphMainComponent } from '../../Components/GraphMain/GraphMain.component';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { NzAlertModule } from 'ng-zorro-antd/alert';


@Component({
  selector: 'app-console-main',
  standalone: true,
  imports: [GraphViewComponent,GraphMainComponent,LottieComponent,NzAlertModule],
  templateUrl: './ConsoleMain.component.html',
  styleUrl: './ConsoleMain.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsoleMainComponent {
  id: string | null = null;
  isLoading = false;
  data_dates: any; // Dates from API
  date: null | Date[] | any = null; // Dates to graph
  data_error: any;
  data_Cooler: DatasResponse | null = null;
  view_grap_opt: null | number = 1;

  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef, private apiService: ApiService) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.searchDate();           
  }
  async searchDate() {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.apiService.fetchDates(`https://coolview-api-v2-545989770214.us-central1.run.app/coolview-api/dates/?serie=${this.id}`)
      .subscribe({
        next: (data) => {
          this.data_dates = data;
          this.date = getDateRange_dateFunctions(this.data_dates); 
          this.searchCooler(getDateRangeFromEndDate_dateFunctions(this.data_dates,1));
        },
        error: (error) => {
          this.isLoading = false;
          this.data_error = error;
          console.error(error)
          this.cdr.markForCheck();
        },
        complete: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      })
  }
  async searchCooler(dates: string[] | Date[]): Promise<void> {    
    this.isLoading = true;
    const stringDates = dates.map(d => {
      if (d instanceof Date) {        
        this.date = dates;
        return d.toISOString().split('T')[0];
      }
      return d;
    });    
    this.cdr.markForCheck();            
    this.apiService.fetchData(`https://coolview-api-v2-545989770214.us-central1.run.app/coolview-api/v2/telemetryOs/?id=${this.id}&start_date=${stringDates[0]}&end_date=${stringDates[1]}&is_mac=false`)
      .subscribe({
        next: (data) => {
          this.data_Cooler = data
        },
        error: (error) => {
          this.isLoading = false;
          this.data_error = error;
          this.cdr.markForCheck(); 
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
  options: AnimationOptions = {
      path: '/assets/Loader/loader.json',
    };
}
