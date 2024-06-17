import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Respuesta } from './dep-login.model';
import { Token } from './dep-login.model';


@Injectable({
  providedIn: 'root'
})

export class MiembrosDepService {
  private urlAPI = "http://localhost:3000/tt/v1/miembrosDep";

  constructor(private http:HttpClient) { }

  //Metodos
  //GET
  obtenerTodosMiembrosDep():Observable<Respuesta>{
    return this.http.get<Respuesta>(this.urlAPI);
  }

  //POST
  loginMiembroDep(datos:object):Observable<Token>{
    return this.http.post<Token>(`${this.urlAPI}/login/`, datos);
  }

}
