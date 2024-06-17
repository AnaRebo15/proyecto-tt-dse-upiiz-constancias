import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Respuesta, Respuesta2 } from './dep-asistencia.model';


@Injectable({
  providedIn: 'root'
})

export class AsistenciaService {
  private urlAPI = "http://localhost:3000/tt/v1/qrCode";

  constructor(private http:HttpClient) { }

  //Metodos
  //GET BY ID
  filtrarAsistentesPorEvento(id:number):Observable<Respuesta>{
    return this.http.get<Respuesta>(this.urlAPI+'/'+id);
  }
  registrarEntrada(datos:object):Observable<Respuesta2>{
    return this.http.post<Respuesta2>(this.urlAPI+'/', datos);
  }
  registrarSalida(datos:object):Observable<Respuesta2>{
    return this.http.put<Respuesta2>(this.urlAPI+'/', datos);
  }
  obtenerRegistroAsistencia(datos:object):Observable<Respuesta2>{
    return this.http.post<Respuesta2>(this.urlAPI+'/relacion/', datos);
  }
}
