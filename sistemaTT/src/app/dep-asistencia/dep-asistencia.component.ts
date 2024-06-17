import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BrowserQRCodeReader } from '@zxing/browser';
import { EventosService } from '../dep-eventos/dep-eventos.service';
import { AsistenciaService } from './dep-asistencia.service';
import { AsistentesService } from '../asis-registro/asis-registro.service';
import { Asistente } from '../asis-registro/asis-registro.model';
import moment from 'moment-timezone';

@Component({
  selector: 'app-dep-asistencia',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule
  ],
  providers:[
    EventosService,
    AsistenciaService,
    AsistentesService
  ],
  templateUrl: './dep-asistencia.component.html',
  styleUrl: './dep-asistencia.component.css'
})
export class DepAsistenciaComponent implements OnInit{

  eventoId:any;
  nombre_evento:any;
  fecha_evento:any;
  hora_entrada:any;
  hora_salida:any;
  asistenteId:any;
  nombre_asistente:any;
  // Registro de asistencia
  registro_asistencia:any;
  horaEntrada:any;
  horaSalida:any;
  mensajeMostrado:any;
  datosRegistro:any;

  constructor(
    private router: Router,
    private servicioEventos: EventosService,
    private servicioAsistentes: AsistentesService,
    private servicioAsistencia: AsistenciaService
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario ha iniciado sesión
    const token = localStorage.getItem('token');
    const tipoU = localStorage.getItem('tipo');
    const id_evento = localStorage.getItem('eventoId');

    if (!token || tipoU !== 'MiembroDep' || !id_evento) {
      // Si no hay token o el tipo de usuario no es el esperado, redirigir a la página de inicio de sesión
      this.router.navigateByUrl('/dep-login');
    } else {
      if (id_evento !== null) {
        this.eventoId = parseInt(id_evento, 10);
        this.consultarEventoId(this.eventoId);
      }else{
        this.router.navigateByUrl('/dep-eventos');
      }
    }
  }

  // ESCANEA LOS CÓDIGOS QR
  startScan() {
    this.mensajeMostrado = '';
    this.nombre_asistente = '';
    this.horaEntrada = '';
    this.horaSalida = '';
    
    const video = document.getElementById('qr-video') as HTMLVideoElement;

    if (video) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play().catch(error => {
              console.error('Error durante la reproducción del video:', error);
            });
          };
          const codeReader = new BrowserQRCodeReader();
          codeReader.decodeOnceFromVideoDevice(undefined, 'qr-video')
            .then(result => {
              const partes = result.getText().split(':');
              const correo = partes[0];
              this.obtenerAsistentePorCorreo(correo);
            })
            .catch(error => {
              console.error('Error al decodificar el código QR:', error);
            });
        })
        .catch(error => {
          console.error('Error al acceder a la cámara:', error);
        });
    } else {
      console.error('Elemento video no encontrado');
    }
  }

  // CONSULTAR EVENTO POR ID
  consultarEventoId(id: any) {  
    this.servicioEventos.obtenerEventoPorId(id).subscribe(
      (data: any) => {
        this.nombre_evento = data.eventos[0].nombre_evento;
        this.fecha_evento = data.eventos[0].fecha_evento;
        this.hora_entrada = data.eventos[0].hora_inicio;
        this.hora_salida = data.eventos[0].hora_fin;
        //console.log("Fecha evento: "+this.fecha_evento)
      },
      (error) => {
        console.error('Error al obtener los datos del evento:', error);
      }
    );
  }

  // CONSULTAR ASISTENTE POR CORREO
  obtenerAsistentePorCorreo(correo:string){
    this.servicioAsistentes.obtenerAsistentePorCorreo(correo).subscribe(
      (data: any) => {
        if (data.asistentes && data.asistentes.length > 0) {
          const asistente = data.asistentes[0];
          this.nombre_asistente = asistente.nombre_completo
          this.asistenteId = asistente.id
          //console.log(this.asistenteId)
          this.registrarAsistencia();
        } else {
            console.log("No se encontraron asistentes.");
        }

      },
      (error) => {
        console.error('Error al obtener los datos del asistente:', error);
      }
    );
  }

  // REGISTRAR ASISTENCIA
  registrarAsistencia() {
    let datos: any = {
      evento_id_evento: this.eventoId,
      asistente_id_asistente: this.asistenteId
    };

    //console.log(datos);

    this.servicioAsistencia.obtenerRegistroAsistencia(datos).subscribe(
      (data: any) => {
        //console.log('Asistencias:', data.asistencias);
        if (data.asistencias && data.asistencias.length > 0) {
          // Registrar salida
          this.registro_asistencia = data.asistencias[0];
          //console.log('Registrar salida');

          const horaActual = moment.tz("America/Mexico_City");
          const horaRegistroEntrada = moment.tz(this.registro_asistencia.hora_entrada, "America/Mexico_City")

          const fechaEvento = moment.tz(this.fecha_evento, "YYYY-MM-DD", "America/Mexico_City");

          // Extraer la hora y minutos de this.hora_entrada y this.hora_salida
          const horaEntradaParts = this.hora_entrada.split(':');
          const horaSalidaParts = this.hora_salida.split(':');

          // Crear la fecha completa de entrada y salida combinando la fecha del evento con la hora y minutos
          const horaEntrada = fechaEvento.clone().hour(parseInt(horaEntradaParts[0])).minute(parseInt(horaEntradaParts[1]));
          const horaSalida = fechaEvento.clone().hour(parseInt(horaSalidaParts[0])).minute(parseInt(horaSalidaParts[1]));

          // Crear un rango de tiempo de 15 min antes y 15 min después de la hora de entrada
          const rangoEntradaInicio = horaEntrada.clone().subtract(15, 'minutes');
          const rangoEntradaFin = horaEntrada.clone().add(15, 'minutes');
          //console.log(rangoEntradaInicio.format() + " - " + rangoEntradaFin.format());

          // Crear un rango de tiempo de 15 min antes y 15 min después de la hora de salida
          const rangoSalidaInicio = horaSalida.clone().subtract(15, 'minutes');
          const rangoSalidaFin = horaSalida.clone().add(15, 'minutes');
          //console.log(rangoSalidaInicio.format() + " - " + rangoSalidaFin.format());

          //console.log("Hora registro entrada: " + horaRegistroEntrada.format());
          //console.log("Hora actual: " + horaActual.format());

          // Si fechaEvento es hoy y horaActual está en los rangos definidos
          if ((horaRegistroEntrada.isBetween(rangoEntradaInicio, rangoEntradaFin)) && (horaActual.isBetween(rangoSalidaInicio, rangoSalidaFin))) {
            this.datosRegistro = {
              evento_id_evento: this.eventoId,
              asistente_id_asistente: this.asistenteId,
              validacionConstancia: 1
            };
          } else if(horaRegistroEntrada.isBetween(rangoEntradaInicio, rangoEntradaFin)){
            this.datosRegistro = {
              evento_id_evento: this.eventoId,
              asistente_id_asistente: this.asistenteId,
              validacionConstancia: 0
            };
            // Pone el mensaje de "NO PODRÁ GENERAR SU CONSTANCIA SI SALE EN ESTE MOMENTO"
            this.mensajeMostrado = '¡NO PODRÁ GENERAR SU CONSTANCIA SI SALE EN ESTE MOMENTO!';
          }else {
            this.datosRegistro = {
              evento_id_evento: this.eventoId,
              asistente_id_asistente: this.asistenteId,
              validacionConstancia: 0
            };
            // Pone el mensaje de SALIDA REGISTRADA
            this.mensajeMostrado = '¡SALIDA REGISTRADA!';
          }

          this.servicioAsistencia.registrarSalida(this.datosRegistro).subscribe(
            (data: any) => {
              //console.log('SALIDA:', data.asistencias);
              this.registro_asistencia = data.asistencias[0];

              const datosNuevos: any = {
                evento_id_evento: this.eventoId,
                asistente_id_asistente: this.asistenteId
              };

              this.actualizarVistaSalida(datosNuevos, this.registro_asistencia.constancia);
            },
            (error) => {
              console.error('Error al registrar la salida:', error);
            }
          );

        } else {
          const fechaHoy = moment.tz("America/Mexico_City");
          const fechaEvento = moment.tz(this.fecha_evento, "YYYY-MM-DD", "America/Mexico_City");

          const horaEntradaParts = this.hora_entrada.split(':');
          const horaEntrada = fechaEvento.clone().hour(parseInt(horaEntradaParts[0])).minute(parseInt(horaEntradaParts[1]));
          const rangoEntradaInicio = horaEntrada.clone().subtract(15, 'minutes');
          const rangoEntradaFin = horaEntrada.clone().add(15, 'minutes');
          const horaActual = moment.tz("America/Mexico_City");

          if (fechaEvento.isSame(fechaHoy, 'day') && (horaActual.isAfter(rangoEntradaInicio))){
            // Registrar entrada
            //console.log('Registrar entrada');
            datos = {
              evento_id_evento: this.eventoId,
              asistente_id_asistente: this.asistenteId,
              hora_entrada: new Date(),
              validacionConstancia: 0
            };
            this.servicioAsistencia.registrarEntrada(datos).subscribe(
              (data: any) => {
                //console.log('Entrada registrada:', data);
                // Pone el mensaje de "¡ENTRADA REGISTRADA!"
                this.mensajeMostrado = '¡ENTRADA REGISTRADA!';
                this.horaEntrada = this.formatoHora(data.asistencias[0].hora_entrada);
                //console.log("Hora entrada: " + this.horaEntrada);
              },
              (error) => {
                console.error('Error al registrar la entrada:', error);
              }
            );
          }else{
            // Pone el mensaje de "¡TODAVÍA NO PUEDES REGISTRARTE AL EVENTO!"
            this.mensajeMostrado = '¡TODAVÍA NO PUEDES REGISTRARTE AL EVENTO!';
          }
        }
      },
      (error) => {
        console.error('Error al obtener los datos:', error);
      }
    );
  }

  actualizarVistaSalida(datos:any, mensaje:number){
    if(mensaje===1){
        // Pone el mensaje de SALIDA REGISTRADA
        this.mensajeMostrado = '¡SALIDA REGISTRADA!';
    }
    this.servicioAsistencia.obtenerRegistroAsistencia(datos).subscribe(
      (data2: any) => {
        //console.log(data2)
        this.horaEntrada = this.formatoHora(data2.asistencias[0].hora_entrada);
        //console.log("Hora entrada: " + this.horaEntrada);
        this.horaSalida = this.formatoHora(data2.asistencias[0].hora_salida);
        //console.log("Hora salida: " + this.horaSalida);
      }
    );
  }

  formatoHora(fechaHoraString: any): string {
    // Convertir la fecha y hora al formato adecuado en la zona horaria de México
    const fechaHoraLocal = moment.tz(fechaHoraString, "America/Mexico_City");
    
    // Formatear la fecha y hora a la hora local en formato de 24 horas
    fechaHoraLocal.locale('en');
    const horaFormateada = fechaHoraLocal.format('HH:mm');
    
    return horaFormateada;
  }

  //CERRAR SESIÓN
  salir(){
    localStorage.removeItem('token');           // Elimina el token de autenticación
    localStorage.removeItem('tipo');     
    this.router.navigateByUrl('/dep-login');   // Redirige a la página de inicio de sesión
  }

}