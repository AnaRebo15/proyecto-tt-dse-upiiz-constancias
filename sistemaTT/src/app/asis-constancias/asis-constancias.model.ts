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
  export interface Constancia{
    id: number, 
    folio: number, 
    fecha_creacion: string,
    fecha_actualizacion: string,
    asistente_id_asistente: number,
    evento_id_evento: number
  }
  export interface Respuesta{
    estado:number,
    mensaje:string,
    eventos:Evento[]
  }
  export interface Respuesta2{
    estado:number,
    mensaje:string,
    constancias:number
  }
  
  export interface Respuesta3{
    estado:number,
    mensaje:string,
    constancias:Constancia[]
  }