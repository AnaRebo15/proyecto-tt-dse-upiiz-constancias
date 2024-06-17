import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AsistentesService } from './asis-registro.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asis-registro',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule
  ],
  providers:[
    AsistentesService
  ],
  templateUrl: './asis-registro.component.html',
  styleUrl: './asis-registro.component.css'
})

export class AsisRegistroComponent {
  constructor(private servicioAsistentes:AsistentesService,
    private router: Router){}

  ngOnInit(): void{
    //this.consultarDependencias()
  }

  asistente = {id:0, correo:"", contrasena1:"", contrasena2:"", nombre_completo:"" ,edad:0, sexo:"", tipo:"", boletaUpiiz:"", programa_academico:"", boletaCecyt:"", numero_empleado:"", cargo:"", dependencia:""}
  error: string = "";
  formularioEnviado: boolean = false;
  contrasenas: boolean = false;

  mostrarCampos() {
    //console.log("La función mostrarCampos se está ejecutando");
    var tipoUsuarioElement = document.getElementById("tipoUsuario");
    var grupoBoletaUpiiz = document.getElementById("grupoBoletaUpiiz");
    var grupoProgramaAcademico = document.getElementById("grupoProgramaAcademico");
    var grupoBoletaCecyt = document.getElementById("grupoBoletaCecyt");
    var grupoNumeroEmpleado = document.getElementById("grupoNumeroEmpleado");
    var grupoCargoEmpleado = document.getElementById("grupoCargoEmpleado");
    var grupoDependenciaExterno = document.getElementById("grupoDependenciaExterno");

    if (tipoUsuarioElement instanceof HTMLSelectElement && grupoBoletaUpiiz && grupoProgramaAcademico && grupoBoletaCecyt && grupoNumeroEmpleado && grupoCargoEmpleado && grupoDependenciaExterno) {
      var tipoUsuario = tipoUsuarioElement.value;

      // Ocultar todos los grupos al principio
      grupoBoletaUpiiz.style.display = "none";
      grupoProgramaAcademico.style.display = "none";
      grupoBoletaCecyt.style.display = "none";
      grupoNumeroEmpleado.style.display = "none";
      grupoCargoEmpleado.style.display = "none";
      grupoDependenciaExterno.style.display = "none";

      // Mostrar u ocultar según la opción seleccionada
      if (tipoUsuario === "alumnoUpiiz") {
        grupoBoletaUpiiz.style.display = "block";
        grupoProgramaAcademico.style.display = "block";
      } else if (tipoUsuario === "alumnoCecyt") {
        grupoBoletaCecyt.style.display = "block";
      } else if (tipoUsuario === "empleado") {
        grupoNumeroEmpleado.style.display = "block";
        grupoCargoEmpleado.style.display = "block";
      } else if (tipoUsuario === "externo") {
        grupoDependenciaExterno.style.display = "block";
      }
    }
  }

  // CREAR UN NUEVO ASISTENTE
  crearAsistente(formularioAsistente: NgForm) {    
    if (formularioAsistente.valid && this.asistente.tipo != "" && this.asistente.contrasena1==this.asistente.contrasena2) {
      interface AsistenteSinVincular {
        id: number;
        correo: string;
        contrasena: string;
        nombre_completo: string;
        edad: number;
        sexo: string;
        tipo: string;
        boleta?: string;
        programa_academico?: string;
        numero_empleado?: string;
        cargo?: string;
        dependencia?: string;
      }

        const asistenteSinVincular: AsistenteSinVincular ={
          id:this.asistente.id,
          correo:this.asistente.correo,
          contrasena:this.asistente.contrasena1,
          nombre_completo:this.asistente.nombre_completo,
          edad:this.asistente.edad,
          sexo:this.asistente.sexo,
          tipo:this.asistente.tipo
        }

        console.log(asistenteSinVincular)
        switch (this.asistente.tipo) {
          case 'alumnoUpiiz':
            if (!this.asistente.boletaUpiiz || !this.asistente.programa_academico) {
              this.error = "Verifica tus datos";
              this.formularioEnviado = true;
              this.contrasenas = false;
              return;
            }else if(this.asistente.boletaUpiiz.length != 10){
              this.error = "Número de boleta no válido";
              this.formularioEnviado = true;
              this.contrasenas = false;
              return;
            }else{
              asistenteSinVincular.boleta = this.asistente.boletaUpiiz;
              asistenteSinVincular.programa_academico = this.asistente.programa_academico;
            }
            break;
          case 'alumnoCecyt':
            if (!this.asistente.boletaCecyt) {
              this.error = "Verifica tus datos";
              this.formularioEnviado = true;
              this.contrasenas = false;
              return;
            }else if(this.asistente.boletaCecyt.length != 10){
              this.error = "Número de boleta no válido";
              this.formularioEnviado = true;
              this.contrasenas = false;
              return;
            }else{
              asistenteSinVincular.boleta = this.asistente.boletaCecyt;
            }
            break;
          case 'empleado':
            if (!this.asistente.numero_empleado || !this.asistente.cargo) {
              this.error = "Verifica tus datos";
              this.formularioEnviado = true;
              this.contrasenas = false;
              return;
            }else if(this.asistente.numero_empleado.length > 6){
              this.error = "Número de empleado no válido";
              this.formularioEnviado = true;
              this.contrasenas = false;
              return;
            }else{
              asistenteSinVincular.numero_empleado = this.asistente.numero_empleado;
              asistenteSinVincular.cargo = this.asistente.cargo;
            }
            break;
          case 'externo':
            if (!this.asistente.dependencia) {
              this.error = "Verifica tus datos";
              this.formularioEnviado = true;
              this.contrasenas = false;
              return;
            }else{
              asistenteSinVincular.dependencia = this.asistente.dependencia;
            }
            break;
        }

        this.servicioAsistentes.crearAsistente(asistenteSinVincular).subscribe({
          next: (resAPI) => {
            if (resAPI.asistentes && resAPI.asistentes.length > 0) {
              this.error = "";
              this.formularioEnviado = false;
              this.contrasenas = false;
              asistenteSinVincular.id = resAPI.asistentes[0].id;
              this.asistente.id = resAPI.asistentes[0].id;
              this.router.navigateByUrl('/asis-login');
            }
          },
          error: (error) => {
            //console.error("Ha ocurrido un error");
            this.error = "Verifica tus datos";
            this.formularioEnviado = true;
            this.contrasenas = false;
          },
          complete: () => {
            //console.info('Solicitud completada')
          }
        })
    }else {
      if (!this.asistente.correo) {
        this.error = "Verifica tus datos";
        this.formularioEnviado = true;
        this.contrasenas = false;
      } else if (this.asistente.contrasena1 != this.asistente.contrasena2) {
        this.error = "Las contraseñas no coinciden";
        this.formularioEnviado = true;
        this.contrasenas = true;
      } else {
        this.error = "Verifica tus datos";
        this.formularioEnviado = true;
        this.contrasenas = false;
      }
    }
  } 
}