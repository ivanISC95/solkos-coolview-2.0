import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-graph-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './GraphView.component.html',
  styleUrl: './GraphView.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphViewComponent {  
  private cdr = inject(ChangeDetectorRef);
  private notification = inject(NzNotificationService);
  @Output() mensajeEvento = new EventEmitter<number>();
  @Input() URL_TELEMETRY_COPY: string = '';
  @Input() data_Cooler: true | false = false;
  select_opt: number = 1;
  URL_COOLVIEW_PROD = 'https://solkos-coolview-root.firebaseapp.com/'
  NEW_URL_COOLVIEW = ''
  isTooltipVisible = false;

  shareViewOption(value: number) {
    this.mensajeEvento.emit(value);
    this.select_opt = value;
    this.cdr.markForCheck(); // Por si acaso también lo requiere
  }

  copyURLTelemetry(): void {
    if (this.URL_TELEMETRY_COPY != 'NA') {
      const urlObj = new URL(this.URL_TELEMETRY_COPY);
      const mac = urlObj.searchParams.get('MAC');
      const dateInit = urlObj.searchParams.get('date_Init');
      const dateEnd = urlObj.searchParams.get('date_end');

      this.NEW_URL_COOLVIEW = `${this.URL_COOLVIEW_PROD}coolview/${mac}?date_init=${dateInit}&date_end=${dateEnd}`;
      window.open(this.NEW_URL_COOLVIEW, '_blank');

      navigator.clipboard.writeText(this.NEW_URL_COOLVIEW).then(() => {
        if (this.NEW_URL_COOLVIEW !== '') {
          this.isTooltipVisible = true;
          this.cdr.markForCheck(); // <- ¡Forzamos a Angular a detectar el cambio a TRUE!
          // Lanzamos la notificación en la posición 'top'
          this.notification.success(
            '¡Enlace copiado!',
            'La URL de telemetría se ha copiado al portapapeles exitosamente.',
            { nzPlacement: 'top', nzDuration: 10000 }
          );
          setTimeout(() => {
            this.isTooltipVisible = false;
            this.cdr.markForCheck(); // <- ¡Forzamos a Angular a detectar el cambio a FALSE!
          }, 5000);
        }
      }).catch(err => {
        this.notification.error(
          'Error',
          'No se pudo copiar el enlace al portapapeles.',
          { nzPlacement: 'top' }
        );
        console.error('Error al intentar copiar el texto: ', err);
      });
    }
  }
}