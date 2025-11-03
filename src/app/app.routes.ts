// import { Routes } from '@angular/router';
// import { ConsoleMainComponent } from './Main/ConsoleMain/ConsoleMain.component';
// import { SelectMainComponent } from './Main/SelectMain/SelectMain.component';

// export const routes: Routes = [    
//     { path: 'coolview/:id', component: ConsoleMainComponent }, // primero
//     // { path: '**', component: SelectMainComponent }, 
// ];

import { Routes } from '@angular/router';
import { UrlSegment, UrlMatchResult } from '@angular/router';
import { ConsoleMainComponent } from './Main/ConsoleMain/ConsoleMain.component';
import { SelectMainComponent } from './Main/SelectMain/SelectMain.component';

export function caseInsensitiveMatcher(url: UrlSegment[]): UrlMatchResult | null {
  if (url.length === 2 && url[0].path.toLowerCase() === 'coolview') {
    return { consumed: url, posParams: { id: url[1] } };
  }
  return null;
}

export const routes: Routes = [
  { matcher: caseInsensitiveMatcher, component: ConsoleMainComponent },
  { path: '**', component: SelectMainComponent },
];
