import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
declare var $: any;
// @ts-ignore
import Spanish from '../../assets/dist/js/Spanish.json';
import { formatDate } from '@angular/common';
import { EventosService } from '../dep-eventos/dep-eventos.service';
import { Router } from '@angular/router';
import { PonentesService } from '../dep-ponentes/dep-ponentes.service';

@Component({
  selector: 'app-asis-eventos',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule
  ],
  providers:[
    EventosService,
    PonentesService
  ],
  templateUrl: './asis-eventos.component.html',
  styleUrl: './asis-eventos.component.css'
})
export class AsisEventosComponent implements AfterViewInit, OnDestroy {

  @ViewChild('dataTable') table!: ElementRef;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private router: Router,
    private servicioEventos: EventosService,
    private servicioPonentes: PonentesService
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario ha iniciado sesión
    const token = localStorage.getItem('token');
    const tipoU = localStorage.getItem('tipo');
    if (!token || tipoU !== 'Asistente') {
      // Si no hay token o el tipo de usuario no es el esperado, redirigir a la página de inicio de sesión
      this.router.navigateByUrl('/asis-login');
    } else {
      this.consultarTodosLosEventos();
    }
  }

  ngOnDestroy() {
    // Destruir la DataTable cuando el componente se destruye
    if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
      $(this.table.nativeElement).DataTable().destroy();
    }
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }  

  eventos: any[] = [];
  mostrarCampos: boolean = false;
  eventoConsulta : any;
  ponenteConsulta: any;
  ponente: any;
  nombresPonentes: string [] = [];
  eventoVer = {id:0, nombre_evento:"", fecha_evento:"", hora_inicio:"" ,hora_fin:"", duracion:0, lugar:"", area:""};

  // CONSULTAR TODOS LOS EVENTOS
  consultarTodosLosEventos(){
    this.servicioEventos.obtenerTodosEventos().subscribe({
      next: (v) => {
        this.eventos = v.eventos;
        // Destruir la DataTable existente antes de volver a inicializarla
        if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
          $(this.table.nativeElement).DataTable().destroy();
        }
        // Inicializar la DataTable después de un pequeño retraso para permitir que Angular actualice la vista
        // Sino dará problemas después, al usar herramientas de la DataTable
        setTimeout(() => {
          this.inicializarDataTable();
        }, 100);
      },
      error: (e) => console.error("Error: ", e),
      complete: () => console.info('o')
    });
  }  

  // CONSULTAR EVENTO POR ID
  consultarEventoId(eventoSeleccionado: any) {
    this.servicioEventos.obtenerEventoPorId(eventoSeleccionado.id).subscribe(
      (data: any) => {
        this.eventoConsulta = data.eventos[0];
        this.ponenteConsulta = data.ponente;
        this.eventoVer = this.eventoConsulta;
        this.nombresPonentes = [];
  
        if (this.eventoConsulta && this.ponenteConsulta.length > 0) {
          this.ponenteConsulta.forEach((ponenteId: any) => {
            this.servicioPonentes.obtenerPonentePorId(ponenteId).subscribe(
              (ponenteData: any) => {
                this.nombresPonentes.push(ponenteData.ponentes[0].nombre);
                if (this.nombresPonentes.length === this.ponenteConsulta.length) {
                  this.ponente = this.nombresPonentes.join(', ');
                }
              },
              (error: any) => {
                this.ponente = ""
              }
            );
          });
        } else {
          this.ponente = "Sin ponente asignado"
        }
      },
      (error) => {
        console.error('Error al obtener los datos del eventoConsulta:', error);
      }
    );
  }

  // FUNCIONES DE FORMATO
  inicializarDataTable() {
    $(this.table.nativeElement).DataTable({
      language: Spanish,
      paging: true,
      lengthChange: false,
      searching: true
    });
  }

  formatoFecha(fecha: string): string {
    return formatDate(fecha, 'yyyy/MM/dd', 'en-US');    // Formatea la fecha al formato "yyyy/mm/dd"
  }

  formatoHorario(hora: string): string {
    const [horaParseada, minutos] = hora.split(':').map(Number);      // Divide la hora y los minutos  
    const sufijo = horaParseada < 12 ? 'AM' : 'PM';                   // Determina el sufijo (AM o PM)
  
    let horaF = horaParseada % 12 || 12;                             // Maneja las 12:00 PM y 12:00 AM, en lugar de 24 horas
    const horaFormateada = `${horaF}:${minutos.toString().padStart(2, '0')} ${sufijo}`;
  
    return horaFormateada;
  }

  formatoDuracion(duracion: number): string {
    const duracionEntera = Math.floor(duracion); // Obtener la parte entera de la duración
    const decimales = duracion - duracionEntera; // Obtener los decimales
  
    if (decimales === 0) {
      return `${duracionEntera} hora${duracionEntera === 1 ? '' : 's'}`;
    } else {
      return `${duracion} horas`;
    }
  }

  //CERRAR SESIÓN
  salir(){
      localStorage.removeItem('token');           // Elimina el token de autenticación
      this.router.navigateByUrl('/asis-login');   // Redirige a la página de inicio de sesión
  }
   
}
