import { Component } from '@angular/core';
import { AsistentesService } from '../asis-registro/asis-registro.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asis-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule
  ],
  providers:[
    AsistentesService
  ],
  templateUrl: './asis-login.component.html',
  styleUrl: './asis-login.component.css'
})
export class AsisLoginComponent {
  datosIngresados: any = { correo: '', contrasena: '' };
  error: string = '';
  formularioEnviado: boolean = false;

  constructor(
    private servicioAsistentes: AsistentesService,
    private router: Router
  ) {}

  iniciarSesion(datosIngresados: any){
    this.formularioEnviado = true;
    this.servicioAsistentes.loginAsistente(datosIngresados).subscribe({
      next: (resAPI) => {
        if (resAPI.mensaje) {
          //console.log(resAPI.mensaje);
          localStorage.setItem('token', resAPI.token);
          localStorage.setItem('id', resAPI.id.toString());
          localStorage.setItem('tipo', "Asistente");
          
          this.router.navigateByUrl('/asis-eventos');
        } else {
          console.error("No se recibió un mensaje de la API.");
        }
      },
      error: (error: any) => {
        console.error("Error al iniciar sesión ", error);
        this.error = error.error.mensaje;
      },       
      complete: () => console.info('Inicio de sesión completado')
    });
  }
  
}

