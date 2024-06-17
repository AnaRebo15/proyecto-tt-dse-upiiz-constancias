import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Respuesta } from './asis-registro.model';
import { Token } from './asis-registro.model';


@Injectable({
  providedIn: 'root'
})

export class AsistentesService {
  private urlAPI = "http://localhost:3000/tt/v1/asistentes";

  constructor(private http:HttpClient) { }

  //Metodos
  //GET
  obtenerTodosAsistentes():Observable<Respuesta>{
    return this.http.get<Respuesta>(this.urlAPI);
  }

  //GET BY ID
  obtenerAsistentePorId(id:number):Observable<Respuesta>{
    return this.http.get<Respuesta>(this.urlAPI+'/'+id);
  }

  //POST
  crearAsistente(evento:object):Observable<Respuesta>{
    return this.http.post<Respuesta>(this.urlAPI, evento);
  }

  //PUT
  actualizarAsistente(id:number, asistente:object):Observable<Respuesta>{
    return this.http.put<Respuesta>(this.urlAPI+'/'+id,asistente)
  }

  // GET BY EMAIL
  obtenerAsistentePorCorreo(correo: string): Observable<Respuesta> {
    return this.http.get<Respuesta>(`${this.urlAPI}/correo/${correo}`);
  }


  //POST
  loginAsistente(datos:object):Observable<Token>{
    return this.http.post<Token>(`${this.urlAPI}/login/`, datos);
  }

  //Obtener dependencias
  obtenerDependencias(): Observable<Respuesta> {
    return this.http.get<Respuesta>(`${this.urlAPI}/dependencias/obtener`);
  }
}
