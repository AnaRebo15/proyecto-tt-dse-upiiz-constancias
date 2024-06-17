import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Respuesta } from './dep-ponentes.model';


@Injectable({
  providedIn: 'root'
})

export class PonentesService {
  private urlAPI = "http://localhost:3000/tt/v1/ponentes";

  constructor(private http:HttpClient) { }

  //Metodos
  //GET
  obtenerTodosPonentes():Observable<Respuesta>{
    return this.http.get<Respuesta>(this.urlAPI);
  }
  //GET BY ID
  obtenerPonentePorId(id:number):Observable<Respuesta>{
    return this.http.get<Respuesta>(this.urlAPI+'/'+id);
  }
  //POST
  crearPonente(ponente:object):Observable<Respuesta>{
    return this.http.post<Respuesta>(this.urlAPI, ponente);
  }
  //PUT
  actualizarPonente(id:number, ponente:object):Observable<Respuesta>{
    return this.http.put<Respuesta>(this.urlAPI+'/'+id,ponente)
  }
  //GET BY NOMBRE
  obtenerPonentePorNombre(nombre:string):Observable<Respuesta>{
    return this.http.get<Respuesta>(this.urlAPI+'/consulta/'+nombre);
  }
}
