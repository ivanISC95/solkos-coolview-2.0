import { Routes } from '@angular/router';
import { ConsoleMainComponent } from './Main/ConsoleMain/ConsoleMain.component';
import { SelectMainComponent } from './Main/SelectMain/SelectMain.component';

export const routes: Routes = [
    {path:'Console',component:ConsoleMainComponent},
    {path:'Select',component:SelectMainComponent}
];
