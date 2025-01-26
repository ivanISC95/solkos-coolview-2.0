import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SelectMainComponent } from "./Main/SelectMain/SelectMain.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SelectMainComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'solkos-coolview-2.0';
}
