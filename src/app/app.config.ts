import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { es_ES, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';


registerLocaleData(es);
const customEsES = {
  ...es_ES,
  DatePicker: {
    ...es_ES.DatePicker,
    lang: {
      ...es_ES.DatePicker?.lang,
      rangeQuarterPlaceholder: ['Trimestre inicio', 'Trimestre fin'],
    }
  }
};

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(), provideNzI18n(customEsES), importProvidersFrom(FormsModule), provideAnimationsAsync(), provideHttpClient(withFetch()),provideLottieOptions({player:()=>player})]
};
