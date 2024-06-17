import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Respuesta } from './dep-eventos.model';
import { Respuesta2 } from './dep-eventos.model';
import { Respuesta3 } from './dep-eventos.model';


@Injectable({
  providedIn: 'root'
})

export class EventosService {
  private urlAPI = "http://localhost:3000/tt/v1/eventos";

  constructor(private http:HttpClient) { }

  //Metodos
  //GET
  obtenerTodosEventos():Observable<Respuesta>{
    return this.http.get<Respuesta>(this.urlAPI);
  }
  //GET BY ID
  obtenerEventoPorId(id:number):Observable<Respuesta2>{
    return this.http.get<Respuesta2>(this.urlAPI+'/'+id);
  }
  //POST
  crearEvento(evento:object):Observable<Respuesta>{
    return this.http.post<Respuesta>(this.urlAPI, evento);
  }
  //PUT
  actualizarEvento(id:number, evento:object):Observable<Respuesta>{
    return this.http.put<Respuesta>(this.urlAPI+'/'+id,evento)
  }
  //DELETE
  eliminarEvento(id:number):Observable<Respuesta>{
    return this.http.delete<Respuesta>(this.urlAPI+'/'+id);
  }
  //DELETE
  eliminarEventos():Observable<Respuesta>{
    return this.http.delete<Respuesta>(this.urlAPI+'/');
  }
  //Filtrar eventos por ponente
  filtrarEventosPorPonente(id:number):Observable<Respuesta>{
    return this.http.get<Respuesta>(this.urlAPI+'/relacion/'+id);
  }
  //Crear relacion evento-ponente
  crearRelacionPonente(relacion:object):Observable<Respuesta3>{
    return this.http.post<Respuesta3>(this.urlAPI+'/relacion/', relacion);
  }
  //Filtrar eventos por ponente
  filtrarEventosPorCompletado():Observable<Respuesta>{
    return this.http.get<Respuesta>(this.urlAPI+'/lista/completados/');
  }
  //DELETE
  eliminarRelacionPonente(id_evento:number):Observable<Respuesta>{
    return this.http.delete<Respuesta>(this.urlAPI+'/relacion/'+id_evento);
  }
}
