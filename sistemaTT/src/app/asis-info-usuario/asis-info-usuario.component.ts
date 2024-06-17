import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AsistentesService } from '../asis-registro/asis-registro.service';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asis-info-usuario',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule
  ],
  providers:[
    AsistentesService
  ],
  templateUrl: './asis-info-usuario.component.html',
  styleUrl: './asis-info-usuario.component.css'
})

export class AsisInfoUsuarioComponent implements OnInit{
  tipoUsuario: number = 1; 
  editando: boolean = false;
  asistente: any = {nombre_completo: "", edad: 0, sexo: ""};
  qrText: string = '';
  qrImageUrl: string = '';
  id: number = 0;
  formularioEnviado: boolean = false;

  constructor(
    private servicioAsistentes: AsistentesService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(){
    // Verificar si el usuario ha iniciado sesión
    const token = localStorage.getItem('token');
    const tipoU = localStorage.getItem('tipo');
    const idString = localStorage.getItem('id');
    
    if (!token || tipoU !== 'Asistente') {
        // Si no hay token o el tipo de usuario no es el esperado, redirigir a la página de inicio de sesión
        this.router.navigateByUrl('/asis-login');
    } else {
        if (idString !== null) {
            this.id = parseInt(idString, 10);
            this.consultarAsistenteId(this.id);
        } else {
            // Manejar el caso en el que 'id' es null, según las necesidades de tu aplicación
            //console.error("El ID de asistente es nulo.");
        }
    }
  }

  toggleEditar() {
    this.editando = !this.editando;
    this.consultarAsistenteId(this.id);
  }

  // CONSULTAR DATOS DEL ASISTENTE
  consultarAsistenteId(idAsistente: number) {
    // Llama al servicio para obtener los datos del asistente
    this.servicioAsistentes.obtenerAsistentePorId(idAsistente).subscribe(
      (data: any) => {
        //console.log('Datos del asistente:', data);
        this.asistente = data.asistentes[0];
        if(this.asistente.tipo == "alumnoUpiiz"){
          this.tipoUsuario = 1;
          this.asistente.boleta = this.asistente.tipoAsistente.boleta;
          this.asistente.programa_academico = this.asistente.tipoAsistente.programa_academico;
        }else if(this.asistente.tipo == "alumnoCecyt"){
          this.tipoUsuario = 2;
          this.asistente.boleta = this.asistente.tipoAsistente.boleta;
        }else if(this.asistente.tipo == "empleado"){
          this.tipoUsuario = 3;
          this.asistente.numero_empleado = this.asistente.tipoAsistente.numero_empleado;
          this.asistente.cargo = this.asistente.tipoAsistente.cargo;
        }else if(this.asistente.tipo == "externo"){
          this.tipoUsuario = 4;
          this.asistente.dependencia = this.asistente.tipoAsistente.dependencia;
        }
        
        // Decodifica el BLOB para obtener el texto del código QR
        const codigoQRData = this.asistente.codigo_qr.data;
        this.qrText = this.decodeBlobData(codigoQRData);
        //console.log("Lo que va a guardar: " + this.qrText);
        this.generateQRCode(); // Genera el código QR
      },
      (error) => {
        console.error('Error al obtener los datos del asistente');
      }
    );
  }

  // EDITAR ASISTENTE
  editarAsistente(datosActualizar:any){
    //console.log('Datos a actualizar:', datosActualizar);
    if(!this.asistente.nombre_completo || !this.asistente.edad || !this.asistente.sexo){
      this.formularioEnviado = true;
    }else if(this.asistente.tipo == "alumnoUpiiz" && (!this.asistente.boleta || !this.asistente.programa_academico || this.asistente.boleta.length !== 10)){
      this.formularioEnviado = true;
    }else if(this.asistente.tipo == "alumnoCecyt" && (!this.asistente.boleta || this.asistente.boleta.length !== 10)){
      this.formularioEnviado = true;
    }else if(this.asistente.tipo == "empleado" && (!this.asistente.numero_empleado || !this.asistente.cargo)){
      this.formularioEnviado = true;
    }else if(this.asistente.tipo == "externo" && !this.asistente.dependencia){
      this.formularioEnviado = true;
    }else{
      this.servicioAsistentes.actualizarAsistente(datosActualizar.id, datosActualizar).subscribe({
        next: (resAPI) => {
          if (resAPI.mensaje) {
            //console.log(resAPI.mensaje);
            this.formularioEnviado = false;
            this.consultarAsistenteId(this.id);
          } else {
            //console.error("No se recibió un mensaje de la API.");
          }
        },
        error: (error) => console.error("Error al actualizar el asistente"),
        complete: () => {
          //console.info('Actualización del asistente completada')
        }
      });
    }
  }

  //Decodifica el archivo BLOB
  decodeBlobData(data: number[]): string {
    // Decodifica el array de bytes en una cadena de texto
    return String.fromCharCode.apply(null, data);
  }

  // Genera la imagen del código QR
  generateQRCode() {
    // Base URL de la API de QR Code Generator
    const apiUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=';
    //console.log(apiUrl)

    // Concatena el texto del código QR con la URL de la API
    const qrApiUrl = apiUrl + encodeURIComponent(this.qrText);
    //console.log(qrApiUrl)

    // Asigna la URL al atributo qrImageUrl para mostrar la imagen del código QR en la interfaz de usuario
    this.qrImageUrl = qrApiUrl;
    //console.log(this.qrImageUrl)
  }
  
  // Método para descargar el código QR
  descargarQR() {
    // Realiza una solicitud GET para obtener la imagen del código QR
    this.http.get(this.qrImageUrl, { responseType: 'blob' }).subscribe((blob: Blob) => {
      // Crea una URL del objeto Blob
      const blobUrl = URL.createObjectURL(blob);

      // Crea un enlace <a> para iniciar la descarga
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'codigo_qr.png'; // Nombre del archivo de descarga
      document.body.appendChild(link);
      link.click();

      // Limpia la URL del objeto Blob después de la descarga
      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(link);
    });
  }

  //CERRAR SESIÓN
  salir(){
    localStorage.removeItem('token');           // Elimina el token de autenticación
    this.router.navigateByUrl('/asis-login');   // Redirige a la página de inicio de sesión
  }
}