export interface MiembroDep{
    id:number,
    clave:string,
    nombre:string
  }

  export interface Token{
    estado:number,
    mensaje:string,
    token:string,
    id:number
  }
  
  export interface Respuesta{
    estado:number,
    mensaje:string,
    MiembrosDep:MiembroDep[]
  }