import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
declare var $: any;
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// @ts-ignore
import Spanish from '../../assets/dist/js/Spanish.json';

import { EventosService } from '../dep-eventos/dep-eventos.service'
import { PonentesService } from './dep-ponentes.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dep-ponentes',
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
  templateUrl: './dep-ponentes.component.html',
  styleUrl: './dep-ponentes.component.css'
})
export class DepPonentesComponent implements AfterViewInit, OnDestroy {

  //Configuración del DataTable
  @ViewChild('dataTable') table!: ElementRef;
  @ViewChild('search-input') searchInput!: ElementRef<HTMLInputElement>;

  eventos: any[] = [];
  ponentes: string[] = [];
  ponenteVer = {id:0, nombrePonente:"", dependencia:""}
  ponenteEditar = {id:0, nombre:"", dependencia:""}
  ponentesMap: { [nombre: string]: number } = {};
  ponenteConsultado: boolean = false;
  fechaInicio: any
  fechaFin: any
  horasTotales: number = 0
  numeroConsulta: number = 0

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private router: Router,
    private servicioEventos: EventosService,
    private servicioPonentes: PonentesService) {}

  ngOnInit(): void {
    // Verificar si el usuario ha iniciado sesión
    const token = localStorage.getItem('token');
    const tipoU = localStorage.getItem('tipo');
    if (!token || tipoU !== 'MiembroDep') {
      // Si no hay token o el tipo de usuario no es el esperado, redirigir a la página de inicio de sesión
      this.router.navigateByUrl('/dep-login');
    } else {
      this.consultarTodosLosPonentes();
    }
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();

    $(this.table.nativeElement).DataTable({
      language: Spanish,
      paging: true,
      lengthChange: false,
      searching: false
    });
  
    this.input = document.getElementById("input") as HTMLInputElement;
    this.suggestion = document.getElementById("suggestion");
    if (this.input && this.suggestion) {
      this.input.value = "";
      this.clearSuggestion();
      this.input.addEventListener("input", this.handleInput.bind(this));
      this.input.addEventListener("keydown", this.handleKeydown.bind(this));
      // Agregar evento de escucha para detectar cuando se presiona Enter
      this.input.addEventListener("keyup", this.handleKeyUp.bind(this));
    }
  } 

  ngOnDestroy() {
    // Destruir la DataTable cuando el componente se destruye
    if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
      $(this.table.nativeElement).DataTable().destroy();
    }
  }

  // CONSULTAR LOS EVENTOS POR PONENTE
  consultarTodosLosEventos(id:number){
    this.servicioEventos.filtrarEventosPorPonente(id).subscribe({
      next: (v) => {
        this.eventos = v.eventos;
        // Destruir la DataTable existente antes de volver a inicializarla
        if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
          $(this.table.nativeElement).DataTable().destroy();
        }
        // Inicializar la DataTable después de un pequeño retraso para permitir que Angular actualice la vista
        setTimeout(() => {
          this.inicializarDataTable();
        }, 100);
      },
      error: (e) => {
        //console.error("Error: ", e)
        // Limpiar la DataTable en caso de error
        if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
          $(this.table.nativeElement).DataTable().clear().destroy();
        }
        setTimeout(() => {
          this.inicializarDataTable();
        }, 100);
      },
      complete: () => {
        //console.info('Completada')
      }
    });
  }  

  // CONSULTAR NOMBRES DE LOS PONENTES
  consultarTodosLosPonentes() {
    this.servicioPonentes.obtenerTodosPonentes().subscribe({
      next: (v) => {
        // Llenar el mapeo de nombres de ponentes a IDs
        v.ponentes.forEach(ponente => {
          this.ponentesMap[ponente.nombre] = ponente.id;
        });
        // Asignar los nombres de ponentes al arreglo de ponentes
        this.ponentes = v.ponentes.map(ponente => ponente.nombre);
      },
      error: (e) => console.error("Error: ", e),
      complete: () => {
        //console.info('Consultar todos los ponentes completada')
      }
    });
  } 

  // CONSULTAR PONENTE POR ID
  consultarPonenteId(ponenteSeleccionado: string) {
    // Obtener el ID del ponente seleccionado desde el mapeo
    const ponenteId = this.ponentesMap[ponenteSeleccionado];
    if (ponenteId) {
      // Llamar al servicio para obtener los datos del ponente por su ID
      this.servicioPonentes.obtenerPonentePorId(ponenteId).subscribe(
        (ponenteData: any) => {
          //console.log('Datos del ponente:', ponenteData);
          this.numeroConsulta = 1;
          this.ponenteConsultado = true;
          this.ponenteVer.id = ponenteId; 
          this.ponenteVer.nombrePonente = ponenteData.ponentes[0].nombre;
          this.ponenteVer.dependencia = ponenteData.ponentes[0].dependencia;
          this.ponenteEditar.id = ponenteId; 
          this.ponenteEditar.nombre = ponenteData.ponentes[0].nombre;
          this.ponenteEditar.dependencia = ponenteData.ponentes[0].dependencia;
          this.consultarTodosLosEventos(ponenteId);
          this.consultarTodosLosPonentes();
          this.calcularHorasPorPonente(ponenteId, "", "");
        },
        (error) => {
          console.error('Error al obtener los datos del ponente:', error);
        }
      );
    } else {
      console.error('Ponente no encontrado.');
    }
  }

  // EDITAR PONENTE
  editarPonente(datosPonente: any) {
    //console.log(datosPonente)
    if (!datosPonente.nombre) {
      console.error("El nombre del ponente es obligatorio.");
      return;
    }

    this.servicioPonentes.actualizarPonente(datosPonente.id, datosPonente).subscribe({
      next: (resAPI) => {
        if (resAPI.mensaje) {
          //console.log(resAPI.mensaje);
          this.consultarTodosLosPonentes();
          this.ponenteVer.nombrePonente = datosPonente.nombre;
          this.ponenteVer.dependencia = datosPonente.dependencia;
          this.ponenteEditar.nombre = datosPonente.nombre;
          this.ponenteEditar.dependencia = datosPonente.dependencia;

        } else {
          console.error("No se recibió un mensaje de la API.");
        }
      },
      error: (error) => console.error("Error al actualizar el ponente: ", error),
      complete: () => {
        //console.info('Actualización del ponente completada')
      }
    });
  }

  // CALCULAR HORAS DEL PONENTE
  calcularHorasPorPonente(id: number, fechaInicio: string = "", fechaFin: string = "") {
    //console.log("Id: ", id, " Fecha inicio: ", fechaInicio, " Fecha fin: ", fechaFin)

    // Obtener los eventos del ponente
    this.servicioEventos.filtrarEventosPorPonente(id).subscribe({
      next: (eventos: any) => {
        let horasTotales = 0;

        // Verificar si eventos.eventos es un array y calcular la suma de duraciones
        if (eventos && eventos.eventos && Array.isArray(eventos.eventos)) {
          let eventosFiltrados = eventos.eventos.slice();

          // Filtrar eventos por período
          eventosFiltrados = eventosFiltrados.filter((evento: any) => {
            const fechaEvento = formatDate(evento.fecha_evento, 'yyyy-MM-dd', 'en-US');

            // Periodo de fechaInicio a fechaFin
            if (fechaInicio && fechaFin) {
              return fechaEvento >= fechaInicio && fechaEvento <= fechaFin;
            }
            // Periodo de fechaInicio en adelante
            if (fechaInicio && !fechaFin) {
              return fechaEvento >= fechaInicio;
            }
            // Periodo de fechaFin hacia atrás
            if (!fechaInicio && fechaFin) {
              return fechaEvento <= fechaFin;
            }
            // Si no se proporciona ningún periodo, incluir todos los eventos
            return true;
          });

          if ((fechaInicio !== "" && fechaFin !== "") || (fechaInicio === "" && fechaFin !== "") || (fechaInicio !== "" && fechaFin === "")) {
            this.eventos = eventosFiltrados;

            // Destruir la DataTable existente antes de volver a inicializarla
            if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
              $(this.table.nativeElement).DataTable().clear().destroy();
            }
            setTimeout(() => {
              this.inicializarDataTable();
            }, 100);
          }

          if ((fechaInicio === "" && fechaFin === "" && this.numeroConsulta===0)){
            this.eventos = eventosFiltrados;

            // Destruir la DataTable existente antes de volver a inicializarla
            if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
              $(this.table.nativeElement).DataTable().clear().destroy();
            }
            setTimeout(() => {
              this.inicializarDataTable();
            }, 100);
          }

          this.numeroConsulta = 0
          // Calcular la suma de las duraciones de los eventos filtrados
          eventosFiltrados.forEach((evento: any) => {
            horasTotales += parseFloat(evento.duracion);
          });

          //console.log('Horas totales del ponente:', horasTotales);
          this.horasTotales = horasTotales;

        } else {
          console.error('La respuesta del servicio no contiene un array de eventos o eventos está vacío.');
        }
      },
      error: (error) => {
        console.error('Error al obtener los eventos del ponente:', error);
      }
    });
  }

  datosPonente(){
    this.ponenteEditar.id = this.ponenteVer.id;
    this.ponenteEditar.nombre = this.ponenteVer.nombrePonente;
    this.ponenteEditar.dependencia = this.ponenteVer.dependencia;
  }
  
  // FUNCIONES DEL BUSCADOR DEL PONENTE Y DE ELEMENTOS DEL HTML
  input: HTMLInputElement | null = null;
  suggestion: HTMLElement | null = null;
  enterKey = 13;

  clearSuggestion() {
    if (this.suggestion) {
      this.suggestion.innerHTML = "";
    }
  }

  caseCheck(word: string) {
    const inp = this.input?.value ?? "";
    const wordArray = word.split(""); // Convertir la cadena en un array de caracteres
    for (let i = 0; i < inp.length; i++) { // Usar un bucle for...of para iterar sobre la cadena
      if (inp[i] == wordArray[i]) {
        continue;
      } else if (inp[i].toUpperCase() == wordArray[i]) {
        wordArray[i] = wordArray[i].toLowerCase(); // Convertir a minúsculas
      } else {
        wordArray[i] = wordArray[i].toUpperCase(); // Convertir a mayúsculas
      }
    }
    return wordArray.join(""); // Convertir el array de caracteres de vuelta a una cadena
  }

  handleInput() {
    this.clearSuggestion();
    if (!this.input || !this.suggestion) return;
    const inputLowerCase = this.input.value.toLowerCase(); // Convertir la entrada del usuario a minúsculas
    const regex = new RegExp("^" + inputLowerCase, "i"); // Utilizar la entrada del usuario en minúsculas para la expresión regular
    const matchingWords = [];
    for (let i in this.ponentes) {
      if (regex.test(this.ponentes[i].toLowerCase()) && inputLowerCase != "") { // Convertir el nombre del ponente a minúsculas antes de comparar
        matchingWords.push(this.ponentes[i]); // Agregar el nombre del ponente original a la lista de sugerencias
      }
    }
    if (matchingWords.length > 0) {
      matchingWords.forEach(word => {
        const suggestionElement = document.createElement("li");
        suggestionElement.textContent = word;
        suggestionElement.addEventListener("click", () => {
          this.handleSuggestionClick(word);
        });
        this.suggestion!.appendChild(suggestionElement); // Utiliza ! para indicar que sabes que suggestion no es null
      });
    }
  }  

  handleKeydown(e: KeyboardEvent) {
    if (!this.input || !this.suggestion) return;

    const suggestionList = this.suggestion.querySelectorAll("li");

    switch (e.key) {
        case "Enter": // Si se presiona Enter, inserta la sugerencia seleccionada en el input
            e.preventDefault();
            this.input.value = this.selectSuggestion() ?? this.input.value; // Corregir esta línea
            this.clearSuggestion();
            break;
        case "ArrowUp": // Si se presiona la flecha hacia arriba, selecciona la sugerencia anterior
            e.preventDefault();
            this.selectSuggestion(-1);
            break;
        case "ArrowDown": // Si se presiona la flecha hacia abajo, selecciona la siguiente sugerencia
            e.preventDefault();
            this.selectSuggestion(1);
            break;
    }
  }

  handleKeyUp(e: KeyboardEvent) {
  if (e.key === "Enter") {
    e.preventDefault();
    const selectedPonente = this.input?.value.trim();
    if (selectedPonente) {
      // Llamar a la función para obtener los datos del ponente seleccionado
      this.consultarPonenteId(selectedPonente);
      this.clearSuggestion();
    }
  }
}

  selectSuggestion(delta: number = 0): string | null { // Establecer el valor predeterminado de delta
    if (!this.input || !this.suggestion) return null; // Retornar null si input o suggestion es nulo

    const suggestionList = this.suggestion.querySelectorAll("li");
    let index = Array.from(suggestionList).findIndex(li => li.classList.contains("selected"));

    if (index === -1) {
        index = delta > 0 ? -1 : suggestionList.length;
    }

    index = (index + delta + suggestionList.length) % suggestionList.length;

    Array.from(suggestionList).forEach(li => li.classList.remove("selected"));
    if (index >= 0) {
        suggestionList[index].classList.add("selected");
        return suggestionList[index].textContent ?? ''; // Retornar el valor
    } else {
        return ''; // Retornar una cadena vacía si no hay sugerencia seleccionada
    }
  }

  handleSuggestionClick(suggestion: string) {
    if (this.input) {
        this.input.value = suggestion;
        const selectedPonente = this.input?.value.trim();
        this.consultarPonenteId(selectedPonente);
        this.clearSuggestion();
    }
    //this.clearSuggestion();
  }

  inicializarDataTable() {
    $(this.table.nativeElement).DataTable({
      language: Spanish,
      paging: true,
      lengthChange: false,
      searching: false
    });
  }

  formatoFecha(fecha: string): string {
    return formatDate(fecha, 'yyyy/MM/dd', 'en-US');    // Formatea la fecha al formato "yyyy/mm/dd"
  }
  
  //CERRAR SESIÓN
  salir(){
    localStorage.removeItem('token');           // Elimina el token de autenticación
    localStorage.removeItem('tipo');     

    this.router.navigateByUrl('/dep-login');   // Redirige a la página de inicio de sesión
  }
}