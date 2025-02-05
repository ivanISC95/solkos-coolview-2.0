import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Hace que el servicio esté disponible en toda la aplicación
})
export class ApiService {
  constructor(private http: HttpClient) {}

  fetchData(url: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'token ad618f1bbd77837b067dc9280baed987ac01da40',
      'X-CSRFTOKEN': 'eQ4gX1bbDtOvK9F1Ik679Wi7uTAJCHB4t6AhqN1abIl5tH4bpYLmbbs1fVnyvIou',
      'Accept': 'application/json' ,
      'Content-Type': 'application/json' ,
      // 'Origin': '0.0.0.0'
    });
    return this.http.get<any>(url,{headers}); // Retorna un Observable con los datos de la API
  }
}
