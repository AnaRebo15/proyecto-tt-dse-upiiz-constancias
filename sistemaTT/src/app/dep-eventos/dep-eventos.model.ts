export interface Evento{
  id:number,
  nombre_evento:string,
  fecha_evento:string,
  hora_inicio:string,
  hora_fin: string,
  duracion: number,
  lugar: string,
  area: string,
  miembroDep_num_empleado: number
}

export interface Relacion{
  ponente_id_ponente:number,
  evento_id_evento:number
}

export interface Respuesta{
  estado:number,
  mensaje:string,
  eventos:Evento[]
}

export interface Respuesta2{
  estado:number,
  mensaje:string,
  eventos:Evento[],
  ponente: any
}
export interface Respuesta3{
  estado:number,
  mensaje:string,
  eventos:Relacion[]
}