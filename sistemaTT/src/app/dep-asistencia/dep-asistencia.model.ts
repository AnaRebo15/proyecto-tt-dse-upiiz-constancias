export interface Asistencia{
    asistente_id_asistente:number,
    evento_id_evento:number,
    hora_entrada:Date,
    hora_salida:Date,
    constancia: number
}

export interface Asistente{
    id:number,
    nombre_completo: string,
    edad: number,
    sexo: string
}

export interface Respuesta{
    estado:number,
    mensaje:string,
    asistentes:Asistente[]
}

export interface Respuesta2{
    estado:number,
    mensaje:string,
    asistencias:Asistencia[]
}