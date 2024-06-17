import { Component } from '@angular/core';
import { MiembrosDepService } from '../dep-login/dep-login.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dep-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule
  ],
  providers:[
    MiembrosDepService
  ],
  templateUrl: './dep-login.component.html',
  styleUrl: './dep-login.component.css'
})
export class DepLoginComponent {
  datosIngresados: any = { correo: '', contrasena: '' };
  error: string = '';
  formularioEnviado: boolean = false;

  constructor(
    private servicioMiembrosDep: MiembrosDepService,
    private router: Router
  ) {}

  iniciarSesion(datosIngresados: any){
    this.formularioEnviado = true;
    this.servicioMiembrosDep.loginMiembroDep(datosIngresados).subscribe({
      next: (resAPI) => {
        if (resAPI.mensaje) {
          //console.log(resAPI.mensaje);
          localStorage.setItem('token', resAPI.token);
          localStorage.setItem('id', resAPI.id.toString());
          localStorage.setItem('tipo', "MiembroDep");

          this.router.navigateByUrl('/dep-eventos');
        } else {
          //console.error("No se recibió un mensaje de la API.");
        }
      },
      error: (error: any) => {
        console.error("Error al iniciar sesión");
        this.error = error.error.mensaje;
      },       
      complete: () => {
        //console.info('Inicio de sesión completado')
      }
    });
  }
}
