export interface Ponente{
    id:number,
    nombre:string,
    dependencia:string
  }
  
  export interface Respuesta{
    estado:number,
    mensaje:string,
    ponentes:Ponente[]
  }