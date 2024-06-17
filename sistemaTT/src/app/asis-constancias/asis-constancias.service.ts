import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Respuesta } from './asis-constancias.model';
import { Respuesta2 } from './asis-constancias.model';
import { Respuesta3 } from './asis-constancias.model';


@Injectable({
  providedIn: 'root'
})

export class ConstanciasService {
  private urlAPI = "http://localhost:3000/tt/v1/constancias";

  constructor(private http:HttpClient) { }

  //Metodos
  //GET BY ID
  obtenerConstanciaPorId(id:number):Observable<Respuesta3>{
    return this.http.get<Respuesta3>(this.urlAPI+'/'+id);
  }
  //POST
  crearConstancia(constancia:object):Observable<Respuesta3>{
    return this.http.post<Respuesta3>(this.urlAPI, constancia);
  }
  //PUT3
  actualizarConstancia(id:number, constancia:object):Observable<Respuesta3>{
    return this.http.put<Respuesta3>(this.urlAPI+'/'+id,constancia)
  }
  //Filtrar eventos por ponente
  filtrarEventosPorAsistente(id:number):Observable<Respuesta>{
    return this.http.get<Respuesta>(this.urlAPI+'/relacion/'+id);
  }
  //Consultar relación eventi_asistente
  obtenerEventoAsistentePorId(id:number):Observable<Respuesta>{
    return this.http.get<Respuesta>(this.urlAPI+'/consulta/'+id);
  }
  //Consultar folio de la constancia
  obtenerFolio():Observable<Respuesta2>{
    return this.http.get<Respuesta2>(this.urlAPI+'/');
  }
  obtenerConstanciaPorEventoAsistente(constancia:object):Observable<Respuesta3>{
    return this.http.post<Respuesta3>(this.urlAPI+'/consulta/', constancia);
  }
}
