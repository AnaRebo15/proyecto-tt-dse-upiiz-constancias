import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
declare var $: any;
// @ts-ignore
import Spanish from '../../assets/dist/js/Spanish.json';
import { formatDate } from '@angular/common';
import { EventosService } from './dep-eventos.service';
import { PonentesService } from '../dep-ponentes/dep-ponentes.service';
import { Router } from '@angular/router';
import { event } from 'jquery';

@Component({
  selector: 'app-dep-eventos',
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
  templateUrl: './dep-eventos.component.html',
  styleUrl: './dep-eventos.component.css'
})

export class DepEventosComponent implements AfterViewInit, OnDestroy {

  @ViewChild('dataTable') table!: ElementRef;
  @ViewChild('search-input') searchInput!: ElementRef<HTMLInputElement>;

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
    if (!token || tipoU !== 'MiembroDep') {
      // Si no hay token o el tipo de usuario no es el esperado, redirigir a la página de inicio de sesión
      this.router.navigateByUrl('/dep-login');
    } else {
      this.consultarTodosLosEventos();
      this.consultarTodosLosPonentes();
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
  
    // Manejo de eventos para el primer input
    this.input = document.getElementById("input") as HTMLInputElement;
    this.suggestion = document.getElementById("suggestion");
    if (this.input && this.suggestion) {
      this.input.value = "";
      this.clearSuggestion();
      this.input.addEventListener("input", this.handleInput.bind(this));
      this.input.addEventListener("keydown", this.handleKeydown.bind(this));
      this.input.addEventListener("keyup", this.handleKeyUp.bind(this));
    }
  
    // Manejo de eventos para el segundo input
    this.input2 = document.getElementById("input2") as HTMLInputElement;
    this.suggestion2 = document.getElementById("suggestion2");
    if (this.input2 && this.suggestion2) {
      this.input2.value = "";
      this.clearSuggestion();
      this.input2.addEventListener("input", this.handleInput2.bind(this));
      this.input2.addEventListener("keydown", this.handleKeydown2.bind(this));
      this.input2.addEventListener("keyup", this.handleKeyUp2.bind(this));
    }

    $('#modalCrearEvento').on('hidden.bs.modal', () => {
      this.clearChipsAndArray();
    });
  
    $('#modalEditar').on('hidden.bs.modal', () => {
      this.clearChipsAndArray();
    });
  }

  eventos: any[] = []; // Inicializa eventos como un arreglo vacío
  mostrarCampos: boolean = false;

  // Referencias a los elementos de los campos de nombre de ponente en ambos modales
  @ViewChild('nomPonente') nomPonenteCrear!: ElementRef<HTMLInputElement>;
  @ViewChild('dependencia') dependenciaCrear!: ElementRef<HTMLInputElement>;
  @ViewChild('nomPonenteAct') nomPonenteEditar!: ElementRef<HTMLInputElement>;
  @ViewChild('dependenciaAct') dependenciaEditar!: ElementRef<HTMLInputElement>;

  toggleCampos(tipo: string) {
    //console.log("La función toggleCampos se está ejecutando");
    if (tipo === 'crear') {
      this.mostrarCampos = !this.mostrarCampos;
    } else if (tipo === 'editar') {
      // Aquí puedes agregar lógica adicional si es necesario para el modo editar
      this.mostrarCampos = !this.mostrarCampos;
    }
  }

  ponenteCrear = {id:0, nombre:"", dependencia:""}
  ponentes: any[] = [];  
  eventoCrear = {id:0, nombre_evento:"", fecha_evento:"", hora_inicio:"" ,hora_fin:"", duracion:0, lugar:"", area:""}
  eventoVer = {id:0, nombre_evento:"", fecha_evento:"", hora_inicio:"" ,hora_fin:"", duracion:0, lugar:"", area:""}
  eventoConsulta: any
  ponenteConsulta: any
  ponente_ver: any
  nombresPonentes: string [] = []
  ponentesMap: { [nombre: string]: number } = {};
  //Necesarios para las sugerencias
  input: HTMLInputElement | null = null;
  suggestion: HTMLElement | null = null;
  input2: HTMLInputElement | null = null;
  suggestion2: HTMLElement | null = null;
  enterKey = 13;
  arregloPonentesSeleccionados: string[] = [];

  crearEditarPonente(tipo: string) {
    //console.log("La función crearEditarPonente se está ejecutando en modo " + tipo);
    if (tipo === 'crear' && this.nomPonenteCrear.nativeElement.value.trim() !== '') {
      // Lógica para crear
      const nombrePonente = this.nomPonenteCrear.nativeElement.value.trim();
      const dependenciaPonente = this.dependenciaCrear.nativeElement.value.trim();

      const ponenteSinVincular = {
        id:this.ponenteCrear.id,
        nombre: nombrePonente,
        dependencia: dependenciaPonente
      }

      this.servicioPonentes.crearPonente(ponenteSinVincular).subscribe({
        next: (resAPI) => {
          if (resAPI.ponentes && resAPI.ponentes.length > 0) {
            ponenteSinVincular.id = resAPI.ponentes[0].id;
            this.ponenteCrear.id = resAPI.ponentes[0].id;
            this.ponentes.push(ponenteSinVincular);
            //alert(resAPI.mensaje);
            this.consultarTodosLosPonentes();

            //Agregar el ponente automaticamente al chip y al arregloPonentesSeleccionados
            this.handleSuggestionClick(nombrePonente)

          } else {
            //alert("No se encontraron eventos en la respuesta de la API.");
          }
        },
        error: (error) => console.error("Error: ",error),
        complete: () => {
          //console.info('Solicitud completada')
        }
      })

      // Resetear el valores
      this.mostrarCampos = false;
      this.nomPonenteCrear.nativeElement.value = '';
      this.dependenciaCrear.nativeElement.value = '';
      
    } else if (tipo === 'editar' && this.nomPonenteEditar.nativeElement.value.trim() !== '') {
      // Lógica para editar
      const nombrePonente = this.nomPonenteEditar.nativeElement.value.trim();
      const dependenciaPonente = this.dependenciaEditar.nativeElement.value.trim();

      const ponenteSinVincular = {
        id:this.ponenteCrear.id,
        nombre: nombrePonente,
        dependencia: dependenciaPonente
      }

      this.servicioPonentes.crearPonente(ponenteSinVincular).subscribe({
        next: (resAPI) => {
          if (resAPI.ponentes && resAPI.ponentes.length > 0) {
            ponenteSinVincular.id = resAPI.ponentes[0].id;
            this.ponenteCrear.id = resAPI.ponentes[0].id;
            this.ponentes.push(ponenteSinVincular);
            this.consultarTodosLosPonentes();
            //alert(resAPI.mensaje);
            //Agregar el ponente automaticamente al chip y al arregloPonentesSeleccionados
            this.handleSuggestionClick2(nombrePonente)
            
          } else {
            //alert("No se encontraron eventos en la respuesta de la API.");
          }
        },
        error: (error) => console.error("Error: ",error),
        complete: () => {
          //console.info('Solicitud completada')
        }
      })

      // Resetear el valores
      this.mostrarCampos = !this.mostrarCampos;
      this.nomPonenteEditar.nativeElement.value = '';
      this.dependenciaEditar.nativeElement.value = '';
    }
  }

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
      complete: () => {
        //console.info('o')
      }
    });
  }  

  // CREAR UN NUEVO EVENTO
  agregarEvento(formularioEvento: NgForm) {
    const idFromLocalStorage = localStorage.getItem('id');
    const miembroDep_num_empleado = idFromLocalStorage !== null ? +idFromLocalStorage : null;
    //console.log(miembroDep_num_empleado)

    if (formularioEvento.valid && this.eventoCrear.area != "") {
      const eventoSinVincular={
        id:this.eventoCrear.id,
        nombre_evento:this.eventoCrear.nombre_evento,
        fecha_evento:this.eventoCrear.fecha_evento,
        hora_inicio:this.eventoCrear.hora_inicio,
        hora_fin:this.eventoCrear.hora_fin,
        duracion:this.eventoCrear.duracion,
        lugar:this.eventoCrear.lugar,
        area:this.eventoCrear.area,
        miembroDep_num_empleado: miembroDep_num_empleado
      }
      this.servicioEventos.crearEvento(eventoSinVincular).subscribe({
        next: (resAPI) => {
          if (resAPI.eventos && resAPI.eventos.length > 0) {
            eventoSinVincular.id = resAPI.eventos[0].id;
            this.eventoCrear.id = resAPI.eventos[0].id;
            this.eventos.push(eventoSinVincular);

            if(this.arregloPonentesSeleccionados){
              //console.log("Ponentes seleccionados: "+this.arregloPonentesSeleccionados)
              this.crearRelacionesPonentes(eventoSinVincular.id, this.arregloPonentesSeleccionados);
            }else{
              //Eliminar el evento creado
              this.servicioEventos.eliminarEvento(eventoSinVincular.id).subscribe({
                next: (resAPI) => {
                  if (resAPI.estado === 1) {
                    // Evento eliminado correctamente
                  }
                },
                error: (error) => console.error("Ocurrió un error desconocido", error),
                complete: () => {
                  //console.info('Evento eliminado')
                }
              });
            }
          } else {
            //alert("No se encontraron eventos en la respuesta de la API.");
          }
        },
        error: (error) => console.error("Error: ",error),
        complete: () => {
          //console.info('Solicitud completada')
        }
      })
    }else{
      //NO SE PUDO CREAR EL EVENTO
      //alert("Datos faltantes, vuelve a intentarlo")
    }
  }

  // Crea la relación entre ponentes y evento
  crearRelacionesPonentes(eventoId: number, ponentes: string[]) {
    ponentes.forEach((ponente) => {
      this.servicioPonentes.obtenerPonentePorNombre(ponente).subscribe({
        next: (data: any) => {
          if (data.ponentes && data.ponentes.length > 0) {
            const relacionDatos = {
              evento_id_evento: eventoId,
              ponente_id_ponente: data.ponentes[0].id
            };
            this.servicioEventos.crearRelacionPonente(relacionDatos).subscribe({
              next: (data2) => {
                //console.info('Relación ponente-evento creada', data2);
              },
              error: (error) => console.error("Error al crear relación ponente-evento: ", error)
            });
          }
        },
        error: (error) => console.error("Error al obtener ponente: ", error)
      });
    });
    this.consultarTodosLosEventos();
  }
  
  // CONSULTAR EVENTO POR ID
  consultarEventoId(eventoSeleccionado: any) {
    // Restablecer el array nombresPonentes antes de realizar una nueva consulta de evento
    this.clearChipsAndArray();
    this.nombresPonentes = [];
  
    this.servicioEventos.obtenerEventoPorId(eventoSeleccionado.id).subscribe(
      (data: any) => {
        this.eventoConsulta = data.eventos[0];
        this.ponenteConsulta = data.ponente;
        this.eventoVer = this.eventoConsulta;
  
        if (this.eventoConsulta && this.ponenteConsulta.length > 0) {
          this.ponenteConsulta.forEach((ponenteId: any) => {
            this.servicioPonentes.obtenerPonentePorId(ponenteId).subscribe(
              (ponenteData: any) => {
                this.nombresPonentes.push(ponenteData.ponentes[0].nombre);
                this.arregloPonentesSeleccionados.push(ponenteData.ponentes[0].nombre);
                if (this.nombresPonentes.length === this.ponenteConsulta.length) {
                  this.ponente_ver = this.nombresPonentes.join(', ');
                }
              },
              (error: any) => {
                this.ponente_ver = ""
              }
            );
          });
        } else {
          this.ponente_ver = "Sin ponente asignado"
        }
      },
      (error) => {
        console.error('Error al obtener los datos del eventoConsulta:', error);
      }
    );
  }
  
  // ACTUALIZAR EVENTO
  actualizarEvento(eventoActualizado: any) {
    const idEmpleado = localStorage.getItem('id');
    //console.log("Id empleado", idEmpleado)
    let eventoActualizadoDatos: any;

    if (!idEmpleado) {
      eventoActualizadoDatos = eventoActualizado;
    }else{
      eventoActualizadoDatos ={
        ...eventoActualizado,
        miembroDep_num_empleado: idEmpleado
      }
    }
    this.servicioEventos.actualizarEvento(eventoActualizado.id, eventoActualizadoDatos).subscribe({
      next: (resAPI) => {
        if (resAPI.mensaje) {
          //console.log(resAPI.mensaje);

          this.servicioEventos.eliminarRelacionPonente(eventoActualizado.id).subscribe({
            next: (resAPI) => {
              //console.log(resAPI)
            }
          });

          if (this.arregloPonentesSeleccionados && this.arregloPonentesSeleccionados.length > 0) {
            //console.log("Ponentes seleccionados para actualizar: " + this.arregloPonentesSeleccionados);
            this.crearRelacionesPonentes(eventoActualizado.id, this.arregloPonentesSeleccionados);
          }
        } else {
          console.error("No se recibió un mensaje de la API.");
        }
      },
      error: (error) => console.error("Error al actualizar el evento"),
      complete: () => {
        //console.info('Actualización del evento completada')
      }
    });
  }
  
  // FUNCIONES DE FORMATO
  inicializarDataTable() {
    $(this.table.nativeElement).DataTable({
      language: Spanish,
      paging: true,
      lengthChange: false,
      searching: true,
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

  // FUNCIONES DEL CAMPO DEL PONENTE
  clearSuggestion() {
    if (this.suggestion) {
      this.suggestion.innerHTML = "";
    }
    if (this.suggestion2) {
      this.suggestion2.innerHTML = "";
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
  
    const inputLowerCase = this.input.value.toLowerCase().trim(); // Eliminar espacios en blanco al inicio y al final
    const regex = new RegExp("^" + inputLowerCase, "i");
    const matchingWords = [];
  
    for (let i in this.ponentes) {
      const ponenteString = this.ponentes[i].toString().trim().toLowerCase(); // Eliminar espacios en blanco al inicio y al final, y convertir a minúsculas
      // Excluir los ponentes que ya están seleccionados
      if (!this.arregloPonentesSeleccionados.map(p => p.trim().toLowerCase()).includes(ponenteString) && regex.test(ponenteString) && inputLowerCase != "") {
        matchingWords.push(this.ponentes[i]);
      }
    }
  
    if (matchingWords.length > 0) {
      matchingWords.forEach(word => {
        const suggestionElement = document.createElement("li");
        suggestionElement.textContent = word;
        suggestionElement.addEventListener("click", () => {
          this.handleSuggestionClick(word);
        });
        this.suggestion!.appendChild(suggestionElement);
      });
    }
  
    // Limpiar la entrada solo si no hay ponentes seleccionados y el campo de entrada no está vacío
    if (matchingWords.length === 0 && inputLowerCase !== "") {
      this.input.value = ''; // Limpiar el campo de entrada
    }
  }
     
  handleInput2() {
    this.clearSuggestion();
    if (!this.input2 || !this.suggestion2) return;
  
    const inputLowerCase = this.input2.value.toLowerCase().trim(); // Eliminar espacios en blanco al inicio y al final
    const regex = new RegExp("^" + inputLowerCase, "i");
    const matchingWords = [];
  
    for (let i in this.ponentes) {
      const ponenteString = this.ponentes[i].toString().trim().toLowerCase(); // Eliminar espacios en blanco al inicio y al final, y convertir a minúsculas
      // Excluir los ponentes que ya están seleccionados
      if (!this.arregloPonentesSeleccionados.map(p => p.trim().toLowerCase()).includes(ponenteString) && regex.test(ponenteString) && inputLowerCase != "") {
        matchingWords.push(this.ponentes[i]);
      }
    }
  
    if (matchingWords.length > 0) {
      matchingWords.forEach(word => {
        const suggestionElement = document.createElement("li");
        suggestionElement.textContent = word;
        suggestionElement.addEventListener("click", () => {
          this.handleSuggestionClick2(word);
        });
        this.suggestion2!.appendChild(suggestionElement);
      });
    }
  
    // Limpiar la entrada solo si no hay ponentes seleccionados y el campo de entrada no está vacío
    if (matchingWords.length === 0 && inputLowerCase !== "") {
      this.input2.value = ''; // Limpiar el campo de entrada
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

  handleKeydown2(e: KeyboardEvent) {
    if (!this.input2 || !this.suggestion2) return;

    const suggestionList = this.suggestion2.querySelectorAll("li");

    switch (e.key) {
        case "Enter": // Si se presiona Enter, inserta la sugerencia seleccionada en el input2
            e.preventDefault();
            this.input2.value = this.selectSuggestion2() ?? this.input2.value; // Corregir esta línea
            this.clearSuggestion();
            break;
        case "ArrowUp": // Si se presiona la flecha hacia arriba, selecciona la sugerencia anterior
            e.preventDefault();
            this.selectSuggestion2(-1);
            break;
        case "ArrowDown": // Si se presiona la flecha hacia abajo, selecciona la siguiente sugerencia
            e.preventDefault();
            this.selectSuggestion2(1);
            break;
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      const selectedPonente = this.input?.value.trim();
      if (selectedPonente) {
        // Llamar a la función para obtener los datos del ponente seleccionado
        //this.consultarPonenteId(selectedPonente);
        this.clearSuggestion();
      }
    }
  }

  handleKeyUp2(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      const selectedPonente = this.input2?.value.trim();
      if (selectedPonente) {
        // Llamar a la función para obtener los datos del ponente seleccionado
        //this.consultarPonenteId(selectedPonente);
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

  selectSuggestion2(delta: number = 0): string | null { // Establecer el valor predeterminado de delta
    if (!this.input2 || !this.suggestion2) return null; // Retornar null si input2 o suggestion2 es nulo

    const suggestionList = this.suggestion2.querySelectorAll("li");
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
      const currentValue = this.input.value;
      const lastCommaIndex = currentValue.lastIndexOf(', ');
      const newValue = lastCommaIndex !== -1 ? currentValue.substring(0, lastCommaIndex + 2) + suggestion + ', ' : suggestion;
      this.arregloPonentesSeleccionados.push(suggestion); // Agregar el ponente seleccionado al arreglo
      this.input.value = newValue; // Actualizar el valor del input con el nuevo valor
      this.handleInput(); // Generar nuevas sugerencias basadas en el nuevo valor del campo de entrada
  
      if (currentValue.trim() !== '') {
        this.input.value = ''; // Limpiar la entrada solo si no está vacía
        this.input.focus(); // Dar foco al input para ingresar otro ponente
      }
      
      //console.log(this.arregloPonentesSeleccionados);
    }
  }

  handleSuggestionClick2(suggestion2: string) {
    if (this.input2) {
      const currentValue = this.input2.value;
      const lastCommaIndex = currentValue.lastIndexOf(', ');
      const newValue = lastCommaIndex !== -1 ? currentValue.substring(0, lastCommaIndex + 2) + suggestion2 + ', ' : suggestion2;
      this.arregloPonentesSeleccionados.push(suggestion2); // Agregar el ponente seleccionado al arreglo
      this.input2.value = newValue; // Actualizar el valor del input con el nuevo valor
      this.handleInput2(); // Generar nuevas sugerencias basadas en el nuevo valor del campo de entrada
  
      if (currentValue.trim() !== '') {
        this.input2.value = ''; // Limpiar la entrada solo si no está vacía
        this.input2.focus(); // Dar foco al input para ingresar otro ponente
      }
      
      //console.log(this.arregloPonentesSeleccionados);
    }
  }  

  eliminarPonente(ponente: string) {
    const index = this.arregloPonentesSeleccionados.indexOf(ponente);
    if (index !== -1) {
      this.arregloPonentesSeleccionados.splice(index, 1);
    }
    //console.log(this.arregloPonentesSeleccionados)
  }

  clearChipsAndArray() {
    this.arregloPonentesSeleccionados = []; // Vacía el arreglo
    $('.chip').remove(); // Elimina todos los chips de la vista
    this.clearSuggestion();
  }
  
  //Redirigir a dep-asistencia
  registrarAsistencia(id: number) {
    //console.log('Evento a registrar:', id);
    localStorage.setItem('eventoId', id.toString());
    this.router.navigateByUrl('/dep-asistencia');
  }

  //CERRAR SESIÓN
  salir(){
    localStorage.removeItem('token');           // Elimina el token de autenticación
    localStorage.removeItem('tipo');     

    this.router.navigateByUrl('/dep-login');   // Redirige a la página de inicio de sesión
  }
}
