export interface Asistente{
    id:number,
    correo:string,
    contrasena:string,
    nombre_completo: string,
    edad: number,
    sexo: string,
    codigo_qr?:Blob,
    tipo:string,
    boleta?: string,
    programa_academico?:string,
    numero_empleado?:string,
    cargo?:string,
    dependencia?:string
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
    asistentes:Asistente[]
  }