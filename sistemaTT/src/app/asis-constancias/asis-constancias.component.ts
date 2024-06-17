import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
declare var $: any;
// @ts-ignore
import Spanish from '../../assets/dist/js/Spanish.json';
import { CommonModule, formatDate } from '@angular/common';
import { EventosService } from '../dep-eventos/dep-eventos.service';
import { AsistentesService } from '../asis-registro/asis-registro.service';
import { ConstanciasService } from './asis-constancias.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import jsPDF from 'jspdf';
import { int } from '@zxing/library/esm/customTypings';

@Component({
  selector: 'app-asis-constancias',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule
  ],
  providers:[
    EventosService,
    ConstanciasService,
    AsistentesService
  ],
  templateUrl: './asis-constancias.component.html',
  styleUrl: './asis-constancias.component.css'
})

export class AsisConstanciasComponent implements AfterViewInit, OnDestroy {
  
  //Configuración del DataTable
  @ViewChild('dataTable') table!: ElementRef;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private router: Router,
    private servicioEventos: EventosService,
    private servicioConstancias: ConstanciasService,
    private servicioAsistentes: AsistentesService
  ) {}

  ngAfterViewInit() {
    this.cdr.detectChanges();
  
    $(this.table.nativeElement).DataTable({
      language: Spanish,
      paging: true,
      lengthChange: false,
      searching: true
    });
  }

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

  eventos: any[] = [];
  asistente: any = {nombre_completo: "", edad: 0, sexo: ""};
  idAsistente: int = 0;
  idEvento: int = 0;
  tipoUsuario: number = 1; 
  horasTotales: number = 0;
  folio: string = "0000";
  id_evento: string = "00";

  // CONSULTAR TODOS LOS EVENTOS Y HORAS TOTALES
  consultarTodosLosEventos() {
    const idString = localStorage.getItem('id');
    if (idString !== null) {
      this.idAsistente = parseInt(idString, 10);
    }
    this.servicioConstancias.filtrarEventosPorAsistente(this.idAsistente).subscribe({
      next: (v) => {
        this.eventos = v.eventos;
  
        // Calcular horas totales
        let horasTotales = 0;
        if (this.eventos && Array.isArray(this.eventos)) {
          this.eventos.forEach((evento: any) => {
            horasTotales += parseFloat(evento.duracion);
          });
        }
        this.horasTotales = horasTotales;
        //console.log(this.horasTotales)
  
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

  // OBTENER CONSTANCIA
  obtenerConstancia(eventoSeleccionado: any) {
    //console.log(eventoSeleccionado);
  
    const duracion = this.formatoDuracion(eventoSeleccionado.duracion);
    const fecha = this.obtenerFechaActual();
    this.idEvento = eventoSeleccionado.id;
  
    const datos: any = {
      asistente_id_asistente: this.idAsistente,
      evento_id_evento: this.idEvento
    };
  
    this.servicioConstancias.obtenerConstanciaPorEventoAsistente(datos).subscribe(
      (data: any) => {
        //console.log("Datos recibidos:", data);
        if (data.estado == 1) {
          if (data.constancias && data.constancias.length > 0) { // Verificar que data.constancias existe y tiene elementos
            // Actualizar constancia existente
            //console.log("PARA ACTUALIZAR: ", data);
            const folioStr = data.constancias[0].folio.toString().padStart(4, '0'); // Asegura que el folio tenga 4 dígitos
            this.folio = `${folioStr}/${new Date().getFullYear()}`;
            const id = data.constancias[0].id
            const datos2: any = {
              asistente_id_asistente: this.idAsistente,
              evento_id_evento: this.idEvento
            };
            this.actualizarConstancia(id, datos2);
            this.obtenerAsistenteYDescargar(fecha, eventoSeleccionado, duracion);
          } else {
            // Obtener folio y luego crear constancia
            this.obtenerFolioYCrearConstancia(fecha, eventoSeleccionado, duracion);
          }
        }
      },
      (error) => {
        console.error('Error al obtener constancia');
      }
    );
  }

  obtenerFolioYCrearConstancia(fecha: string, eventoSeleccionado: any, duracion: string) {
    this.servicioConstancias.obtenerFolio().subscribe(
      (data: any) => {
        //console.log('Datos del folio:', data);
        const folio = data.constancias;
        const folioStr = folio.toString().padStart(4, '0'); // Asegura que el folio tenga 4 dígitos
        this.folio = `${folioStr}/${new Date().getFullYear()}`;
        //console.log(this.folio);
  
        const datos: any = {
          folio: folio,
          asistente_id_asistente: this.idAsistente,
          evento_id_evento: this.idEvento
        }
    
        this.servicioConstancias.crearConstancia(datos).subscribe(
          (data: any) => {
            //console.log(data);
        });

        this.obtenerAsistenteYDescargar(fecha, eventoSeleccionado, duracion);
        
      },
      (error) => {
        console.error('Error al obtener el folio');
      }
    );
  }

  actualizarConstancia(id: number, datos:any){
    this.servicioConstancias.actualizarConstancia(id,datos).subscribe(
      (data: any) => {
        //console.log(data);
    });
  }

  obtenerAsistenteYDescargar(fecha: string, eventoSeleccionado: any, duracion: string) {
    this.servicioAsistentes.obtenerAsistentePorId(this.idAsistente).subscribe(
      (data: any) => {
        this.asistente = data.asistentes[0];
        switch (this.asistente.tipo) {
          case "alumnoUpiiz":
            this.tipoUsuario = 1;
            this.asistente.boleta = this.asistente.tipoAsistente.boleta;
            this.download(fecha, this.asistente.nombre_completo, this.asistente.boleta, eventoSeleccionado.nombre_evento, duracion, this.folio, eventoSeleccionado.id, this.asistente.id);
            break;
          case "alumnoCecyt":
            this.tipoUsuario = 2;
            this.asistente.boleta = this.asistente.tipoAsistente.boleta;
            this.download(fecha, this.asistente.nombre_completo, this.asistente.boleta, eventoSeleccionado.nombre_evento, duracion, this.folio, eventoSeleccionado.id, this.asistente.id);
            break;
          case "empleado":
            this.tipoUsuario = 3;
            this.asistente.numero_empleado = this.asistente.tipoAsistente.numero_empleado;
            this.asistente.cargo = this.asistente.tipoAsistente.cargo;
            this.download1(fecha, this.asistente.nombre_completo, this.asistente.numero_empleado, eventoSeleccionado.nombre_evento, duracion, this.folio, eventoSeleccionado.id, this.asistente.id);
            break;
          case "externo":
            this.tipoUsuario = 4;
            this.asistente.dependencia = this.asistente.tipoAsistente.dependencia;
            this.download2(fecha, this.asistente.nombre_completo, this.asistente.dependencia, eventoSeleccionado.nombre_evento, duracion, this.folio, eventoSeleccionado.id, this.asistente.id);
            break;
          default:
            console.error('Tipo de asistente no reconocido');
        }
      },
      (error) => {
        console.error('Error al obtener los datos del asistente');
      }
    );
  }

  download(fecha:string, nombreAsistente:string, numBoleta:string, nombreEvento:string, numHoras:string, folio:string, id_evento:number, id_asistente: string) {
    var doc = new jsPDF('p', 'pt', 'letter'); // Configura el tamaño de la página aquí
    
    // Logo de la upiiz, logo del área y nombre de la escuela
    var imgEncabezado = new Image();
    imgEncabezado.src = "../../assets/dist/img/todo.jpg";
    imgEncabezado.onload = function() {
        //Encabezado
        var imgWidth = imgEncabezado.width;
        var imgHeight = imgEncabezado.height;
        var maxWidth = doc.internal.pageSize.getWidth() - 10; // Ajusta el margen
        var maxHeight = doc.internal.pageSize.getHeight() - 10; // Ajusta el margen
        var widthRatio = maxWidth / imgWidth;
        var heightRatio = maxHeight / imgHeight;
        var ratio = Math.min(widthRatio, heightRatio);
        
        var newWidth = imgWidth * ratio;
        var newHeight = imgHeight * ratio;
        doc.addImage(imgEncabezado.src, "JPEG", 5, 50, newWidth, newHeight);
        
        // Folio
        doc.setFontSize(11);
        doc.setLineHeightFactor(1.15);
        doc.setFont("helvetica", "bold");
        doc.text('Folio', 60, 240);
        doc.setFont("helvetica", "normal");
        doc.text('UPIIZ/SSEIS/DSE/'+folio, 60, 255);  

        // Asunto
        doc.setFont("helvetica", "bold");
        doc.text('Asunto', 60, 295);
        doc.setFont("helvetica", "normal");
        doc.text('CONSTANCIA', 60, 310); 

        // Fecha
        //fecha = "8 de junio de 2024";
        doc.text('Zacatecas, Zacatecas, ' + fecha, doc.internal.pageSize.getWidth() - 60, 340, { align: "right" });

        // Destinatario
        doc.setFont("helvetica", "bold");
        doc.text('A QUIEN CORRESPONDA', 60, 380);
        doc.text('PRESENTE', 60, 395);

        // Mensaje
        doc.setFont("helvetica", "normal");

        var texto = 'Por medio de la presente se hace constar que ' + nombreAsistente +
            " con número de boleta " + numBoleta + " participó en " + nombreEvento +
            ", acumulando un total de " + numHoras + ".";

        var lineas = doc.splitTextToSize(texto, 500);
        doc.text(lineas, 60, 430);

        doc.text('Sin más por el momento me despido y reciba un cordial saludo.', 60, 500);

        // Remitente
        doc.setFont("helvetica", "bold");
        doc.text('ATENTAMENTE', 60, 570);
        doc.text('"La Técnica al Servicio de la Patria"', 60, 585);

        doc.text('LIC. EN PS. GABRIELA DEL CARMEN OROZCO ORTEGA', 60, 640);
        doc.text('JEFA DEL DEPARTAMENTO DE SERVICIOS ESTUDIANTILES', 60, 655);

        //Sello
        var imgSello = new Image();
        imgSello.src = "../../assets/dist/img/sello.png";
        imgSello.onload = function() {
            var imgWidthSello = imgSello.width;
            var imgHeightSello = imgSello.height;
            var maxWidth = doc.internal.pageSize.getWidth() - 10; // Ajusta el margen
            var maxHeight = 100; // Altura fija del pie de página
            var widthRatio = maxWidth / imgWidthSello;
            var heightRatio = maxHeight / imgHeightSello;
            var ratio = Math.min(widthRatio, heightRatio);
            
            var newWidthSello = imgWidthSello * ratio;
            var newHeightSello = imgHeightSello * ratio;
            
            doc.addImage(imgSello.src, "PNG", 170, 515, newWidthSello, newHeightSello);
        };
        // Firma
        //Sello
        var imgFirma = new Image();
        imgFirma.src = "../../assets/dist/img/firma.png";
        doc.addImage(imgFirma.src, "PNG", 60, 590, 120, 50);

        // Pie de página
        var imgPie = new Image();
        imgPie.src = "../../assets/dist/img/pie.jpg";
        imgPie.onload = function() {
            var imgWidthPie = imgPie.width;
            var imgHeightPie = imgPie.height;
            var maxWidthPie = doc.internal.pageSize.getWidth() - 10; // Ajusta el margen
            var maxHeightPie = 100; // Altura fija del pie de página
            var widthRatioPie = maxWidthPie / imgWidthPie;
            var heightRatioPie = maxHeightPie / imgHeightPie;
            var ratioPie = Math.min(widthRatioPie, heightRatioPie);
            
            var newWidthPie = imgWidthPie * ratioPie;
            var newHeightPie = imgHeightPie * ratioPie;
            var yPosPie = doc.internal.pageSize.getHeight() - newHeightPie - 10; // Ajusta el margen inferior
            
            doc.addImage(imgPie.src, "JPEG", 5, yPosPie, newWidthPie, newHeightPie);
            
            doc.save('constancia_'+id_asistente+'_'+id_evento+'.pdf');
        };
    };
  }

  download1(fecha:string, nombreAsistente:string, numEmpleado:string, nombreEvento:string, numHoras:string, folio:string, id_evento:number, id_asistente: string) {
    var doc = new jsPDF('p', 'pt', 'letter'); // Configura el tamaño de la página aquí
    
    // Logo de la upiiz, logo del área y nombre de la escuela
    var imgEncabezado = new Image();
    imgEncabezado.src = "../../assets/dist/img/todo.jpg";
    imgEncabezado.onload = function() {
        //Encabezado
        var imgWidth = imgEncabezado.width;
        var imgHeight = imgEncabezado.height;
        var maxWidth = doc.internal.pageSize.getWidth() - 10; // Ajusta el margen
        var maxHeight = doc.internal.pageSize.getHeight() - 10; // Ajusta el margen
        var widthRatio = maxWidth / imgWidth;
        var heightRatio = maxHeight / imgHeight;
        var ratio = Math.min(widthRatio, heightRatio);
        
        var newWidth = imgWidth * ratio;
        var newHeight = imgHeight * ratio;
        doc.addImage(imgEncabezado.src, "JPEG", 5, 50, newWidth, newHeight);
        
        // Folio
        doc.setFontSize(11);
        doc.setLineHeightFactor(1.15);
        doc.setFont("helvetica", "bold");
        doc.text('Folio', 60, 240);
        doc.setFont("helvetica", "normal");
        doc.text('UPIIZ/SSEIS/DSE/'+folio, 60, 255); 

        // Asunto
        doc.setFont("helvetica", "bold");
        doc.text('Asunto', 60, 295);
        doc.setFont("helvetica", "normal");
        doc.text('CONSTANCIA', 60, 310); 

        // Fecha
        //fecha = "8 de junio de 2024";
        doc.text('Zacatecas, Zacatecas, ' + fecha, doc.internal.pageSize.getWidth() - 60, 340, { align: "right" });

        // Destinatario
        doc.setFont("helvetica", "bold");
        doc.text('A QUIEN CORRESPONDA', 60, 380);
        doc.text('PRESENTE', 60, 395);

        // Mensaje
        doc.setFont("helvetica", "normal");

        var texto = 'Por medio de la presente se hace constar que ' + nombreAsistente +
            " con número de empleado " + numEmpleado + " participó en " + nombreEvento +
            ", acumulando un total de " + numHoras + ".";

        var lineas = doc.splitTextToSize(texto, 500);
        doc.text(lineas, 60, 430);

        doc.text('Sin más por el momento me despido y reciba un cordial saludo.', 60, 500);

        // Remitente
        doc.setFont("helvetica", "bold");
        doc.text('ATENTAMENTE', 60, 570);
        doc.text('"La Técnica al Servicio de la Patria"', 60, 585);

        doc.text('LIC. EN PS. GABRIELA DEL CARMEN OROZCO ORTEGA', 60, 640);
        doc.text('JEFA DEL DEPARTAMENTO DE SERVICIOS ESTUDIANTILES', 60, 655);

        //Sello
        var imgSello = new Image();
        imgSello.src = "../../assets/dist/img/sello.png";
        imgSello.onload = function() {
            var imgWidthSello = imgSello.width;
            var imgHeightSello = imgSello.height;
            var maxWidth = doc.internal.pageSize.getWidth() - 10; // Ajusta el margen
            var maxHeight = 100; // Altura fija del pie de página
            var widthRatio = maxWidth / imgWidthSello;
            var heightRatio = maxHeight / imgHeightSello;
            var ratio = Math.min(widthRatio, heightRatio);
            
            var newWidthSello = imgWidthSello * ratio;
            var newHeightSello = imgHeightSello * ratio;
            
            doc.addImage(imgSello.src, "PNG", 170, 515, newWidthSello, newHeightSello);
        };
        // Firma
        //Sello
        var imgFirma = new Image();
        imgFirma.src = "../../assets/dist/img/firma.png";
        doc.addImage(imgFirma.src, "PNG", 60, 590, 120, 50);

        // Pie de página
        var imgPie = new Image();
        imgPie.src = "../../assets/dist/img/pie.jpg";
        imgPie.onload = function() {
            var imgWidthPie = imgPie.width;
            var imgHeightPie = imgPie.height;
            var maxWidthPie = doc.internal.pageSize.getWidth() - 10; // Ajusta el margen
            var maxHeightPie = 100; // Altura fija del pie de página
            var widthRatioPie = maxWidthPie / imgWidthPie;
            var heightRatioPie = maxHeightPie / imgHeightPie;
            var ratioPie = Math.min(widthRatioPie, heightRatioPie);
            
            var newWidthPie = imgWidthPie * ratioPie;
            var newHeightPie = imgHeightPie * ratioPie;
            var yPosPie = doc.internal.pageSize.getHeight() - newHeightPie - 10; // Ajusta el margen inferior
            
            doc.addImage(imgPie.src, "JPEG", 5, yPosPie, newWidthPie, newHeightPie);
            
            doc.save('constancia_'+id_asistente+'_'+id_evento+'.pdf');
        };
    };
  }

  download2(fecha:string, nombreAsistente:string, dependencia:string, nombreEvento:string, numHoras:string, folio:string, id_evento:number, id_asistente: string) {
    var doc = new jsPDF('p', 'pt', 'letter'); // Configura el tamaño de la página aquí
    
    // Logo de la upiiz, logo del área y nombre de la escuela
    var imgEncabezado = new Image();
    imgEncabezado.src = "../../assets/dist/img/todo.jpg";
    imgEncabezado.onload = function() {
        //Encabezado
        var imgWidth = imgEncabezado.width;
        var imgHeight = imgEncabezado.height;
        var maxWidth = doc.internal.pageSize.getWidth() - 10; // Ajusta el margen
        var maxHeight = doc.internal.pageSize.getHeight() - 10; // Ajusta el margen
        var widthRatio = maxWidth / imgWidth;
        var heightRatio = maxHeight / imgHeight;
        var ratio = Math.min(widthRatio, heightRatio);
        
        var newWidth = imgWidth * ratio;
        var newHeight = imgHeight * ratio;
        doc.addImage(imgEncabezado.src, "JPEG", 5, 50, newWidth, newHeight);
        
        // Folio
        doc.setFontSize(11);
        doc.setLineHeightFactor(1.15);
        doc.setFont("helvetica", "bold");
        doc.text('Folio', 60, 240);
        doc.setFont("helvetica", "normal");
        doc.text('UPIIZ/SSEIS/DSE/'+folio, 60, 255); 

        // Asunto
        doc.setFont("helvetica", "bold");
        doc.text('Asunto', 60, 295);
        doc.setFont("helvetica", "normal");
        doc.text('CONSTANCIA', 60, 310); 

        // Fecha
        //fecha = "8 de junio de 2024";
        doc.text('Zacatecas, Zacatecas, ' + fecha, doc.internal.pageSize.getWidth() - 60, 340, { align: "right" });

        // Destinatario
        doc.setFont("helvetica", "bold");
        doc.text('A QUIEN CORRESPONDA', 60, 380);
        doc.text('PRESENTE', 60, 395);

        // Mensaje
        doc.setFont("helvetica", "normal");

        var texto = 'Por medio de la presente se hace constar que ' + nombreAsistente +
            " proveniente de " + dependencia + " participó en " + nombreEvento +
            ", acumulando un total de " + numHoras + ".";

        var lineas = doc.splitTextToSize(texto, 500);
        doc.text(lineas, 60, 430);

        doc.text('Sin más por el momento me despido y reciba un cordial saludo.', 60, 500);

        // Remitente
        doc.setFont("helvetica", "bold");
        doc.text('ATENTAMENTE', 60, 570);
        doc.text('"La Técnica al Servicio de la Patria"', 60, 585);

        doc.text('LIC. EN PS. GABRIELA DEL CARMEN OROZCO ORTEGA', 60, 640);
        doc.text('JEFA DEL DEPARTAMENTO DE SERVICIOS ESTUDIANTILES', 60, 655);

        //Sello
        var imgSello = new Image();
        imgSello.src = "../../assets/dist/img/sello.png";
        imgSello.onload = function() {
            var imgWidthSello = imgSello.width;
            var imgHeightSello = imgSello.height;
            var maxWidth = doc.internal.pageSize.getWidth() - 10; // Ajusta el margen
            var maxHeight = 100; // Altura fija del pie de página
            var widthRatio = maxWidth / imgWidthSello;
            var heightRatio = maxHeight / imgHeightSello;
            var ratio = Math.min(widthRatio, heightRatio);
            
            var newWidthSello = imgWidthSello * ratio;
            var newHeightSello = imgHeightSello * ratio;
            
            doc.addImage(imgSello.src, "PNG", 170, 515, newWidthSello, newHeightSello);
        };
        // Firma
        //Sello
        var imgFirma = new Image();
        imgFirma.src = "../../assets/dist/img/firma.png";
        doc.addImage(imgFirma.src, "PNG", 60, 590, 120, 50);

        // Pie de página
        var imgPie = new Image();
        imgPie.src = "../../assets/dist/img/pie.jpg";
        imgPie.onload = function() {
            var imgWidthPie = imgPie.width;
            var imgHeightPie = imgPie.height;
            var maxWidthPie = doc.internal.pageSize.getWidth() - 10; // Ajusta el margen
            var maxHeightPie = 100; // Altura fija del pie de página
            var widthRatioPie = maxWidthPie / imgWidthPie;
            var heightRatioPie = maxHeightPie / imgHeightPie;
            var ratioPie = Math.min(widthRatioPie, heightRatioPie);
            
            var newWidthPie = imgWidthPie * ratioPie;
            var newHeightPie = imgHeightPie * ratioPie;
            var yPosPie = doc.internal.pageSize.getHeight() - newHeightPie - 10; // Ajusta el margen inferior
            
            doc.addImage(imgPie.src, "JPEG", 5, yPosPie, newWidthPie, newHeightPie);
            
            doc.save('constancia_'+id_asistente+'_'+id_evento+'.pdf');
        };
    };
  }

  // FORMATOS
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

  formatoDuracion(duracion: number): string {
    const duracionEntera = Math.floor(duracion); // Obtener la parte entera de la duración
    const decimales = duracion - duracionEntera; // Obtener los decimales
  
    if (decimales === 0) {
      return `${duracionEntera} hora${duracionEntera === 1 ? '' : 's'}`;
    } else {
      return `${duracion} horas`;
    }
  }

  obtenerFechaActual() {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const fechaActual = new Date();
    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();
    return `${dia} de ${mes} de ${anio}`;
  }
  
  //CERRAR SESIÓN
  salir(){
    localStorage.removeItem('token');           // Elimina el token de autenticación
    this.router.navigateByUrl('/asis-login');   // Redirige a la página de inicio de sesión
  }
}