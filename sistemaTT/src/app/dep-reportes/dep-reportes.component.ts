import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { EventosService } from '../dep-eventos/dep-eventos.service';
import { AsistentesService } from '../asis-registro/asis-registro.service';
import { AsistenciaService } from '../dep-asistencia/dep-asistencia.service';
import { Router } from '@angular/router';
declare var $: any;
// @ts-ignore
import Spanish from '../../assets/dist/js/Spanish.json';

import { Workbook } from 'exceljs'
import * as fs2 from 'file-saver'
import { LOGO_UPIIZ, LOGO_RG, LOGO_DSE, LOGO_COSECOVI} from './imagenes';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { int } from '@zxing/library/esm/customTypings';

@Component({
  selector: 'app-dep-reportes',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule
  ],
  providers:[
    EventosService,
    AsistentesService,
    AsistenciaService
  ],
  templateUrl: './dep-reportes.component.html',
  styleUrl: './dep-reportes.component.css'
})

export class DepReportesComponent implements AfterViewInit {

 //Configuración del DataTable
 @ViewChild('dataTable') table!: ElementRef;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private router: Router,
    private http: HttpClientModule,
    private servicioEventos: EventosService,
    private servicioAsistentes: AsistentesService,
    private servicioAsistencia: AsistenciaService
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario ha iniciado sesión
    const token = localStorage.getItem('token');
    const tipoU = localStorage.getItem('tipo');
    if (!token || tipoU !== 'MiembroDep') {
      // Si no hay token o el tipo de usuario no es el esperado, redirigir a la página de inicio de sesión
      this.router.navigateByUrl('/dep-login');
    } else {
      this.calcularHorasPorPeriodo();
    }
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  
    $(this.table.nativeElement).DataTable({
      language: Spanish,
      paging: true,
      lengthChange: false,
      searching: true
    });
  }

  error: string = '';
  eventos: any[] = []; // Inicializa eventos como un arreglo vacío
  fechaInicio: any
  fechaFin: any
  horasTotales: number = 0
  numEventos: number = 0
  numeroConsulta: number = 0
  areaSeleccionada: string = ""

  eventoConsulta: any
  asistentesConsulta: any
  listaAsistentes: any[] = [];
  _workbook!: Workbook

  columnTotal = {
    G: 0,
    H: 0,
    I: 0,
    J: 0,
    K: 0,
    L: 0,
    M: 0,
    N: 0,
    O: 0,
    P: 0,
    Q: 0,
    R: 0,
    S: 0
  };  

  //CONSULTAR DATOS PARA GENERAR EL PDF
  crearPdfYDescargar(eventoSeleccionado: any) {
    this.servicioEventos.obtenerEventoPorId(eventoSeleccionado.id_evento).subscribe(
      (data: any) => {
        this.eventoConsulta = data.eventos[0];
        if (this.eventoConsulta) {
          this.servicioAsistencia.filtrarAsistentesPorEvento(eventoSeleccionado.id_evento).subscribe(
            (asistentesData: any) => {
              //console.log(asistentesData)
              this.asistentesConsulta = asistentesData.asistentes;
              if (this.asistentesConsulta && asistentesData.estado === 1) {
                this.error = "";
                this.obtenerDetallesAsistentes(this.asistentesConsulta).subscribe(() => {
                  this.crearPlantillaPDF();
                });
              } else {
                //console.log("Evento sin asistentes");
                this.error = "No podrás generar reportes de este evento, debido a que no hubo asistentes.";
              }
            },
            (error: any) => {
              //console.log("Error al obtener asistentes");
            }
          );
        } else {
          console.log("Evento no encontrado");
        }
      },
      (error: any) => {
        console.error('Error al obtener el evento', error);
      }
    );
  }

  crearPlantillaPDF() {
    const doc = new jsPDF('p', 'mm', 'letter'); 

    // Logo de la upiiz, logo del área y nombre de la escuela
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    doc.addImage("../../assets/dist/img/logo-upiiz.png", "JPEG", 5, 5, 30, 30);
    
    // Calcular la posición correcta para alinear a la derecha
    const pageWidth = doc.internal.pageSize.getWidth();
    const imgWidth = 25; // Ancho de la imagen
    const xPosition = pageWidth - imgWidth - 10; // Margen de 5 unidades desde el borde derecho
    const xPositionDSE = pageWidth - 40 - 10; // Margen de 5 unidades desde el borde derecho

    //Logos de cada una de las áreas
    if(this.eventoConsulta.area == "Red de Género"){
      doc.addImage("../../assets/dist/img/LOGO_RG.png", "JPEG", xPosition, 5, 25, 30);
    } else if(this.eventoConsulta.area == "COSECOVI"){
      doc.addImage("../../assets/dist/img/COSECOVI.png", "JPEG", xPosition, 5, 25, 30);
    } else {
      doc.addImage("../../assets/dist/img/DSE.png", "JPEG", xPositionDSE, 10, 40, 25);
    }

    doc.setLineHeightFactor(1);
    doc.text('INSTITUTO POLITÉCNICO NACIONAL', doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });  // Arial Narrow - Interlineado 1
    doc.text('CAMPUS ZACATECAS.', doc.internal.pageSize.getWidth() / 2, 25, { align: "center" });  // Arial Narrow - Interlineado 1

    // Área del evento
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setLineHeightFactor(1.5);
    doc.setLineHeightFactor(1.15); // Interlineado 1.15
    const area = this.eventoConsulta.area;
    const areaEnMayusculas = area.toUpperCase();
    doc.text(areaEnMayusculas, doc.internal.pageSize.getWidth() / 2, 35, { align: "center" });   // Arial Rounded MT Bold - Interlineado 1.15

    // Nombre y fecha del evento
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setLineHeightFactor(1.15);

    const nombre_evento = this.eventoConsulta.nombre_evento
    const actividadText = 'Actividad: '+nombre_evento;
    const fecha_evento = this.eventoConsulta.fecha_evento
    const fechaFormateada = this.formatearFechaExcel(fecha_evento);
    const fechaText = 'Fecha: '+fechaFormateada;

    // Posición y alineación
    const marginRight = 10;
    const fechaWidth = doc.getTextWidth(fechaText); // Ancho del texto de la fecha
    const fechaXPosition = pageWidth - fechaWidth - marginRight; // Posición x para alinear a la derecha

    // Imprimir la actividad
    doc.text(actividadText, 10, 45);

    // Imprimir la fecha alineada a la derecha
    doc.text(fechaText, fechaXPosition, 45);

    // Establecer el tipo de letra y tamaño antes de agregar este texto
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setLineHeightFactor(1.15);
    doc.text('REGISTRO DE ASISTENCIA', doc.internal.pageSize.getWidth() / 2, 55, { align: "center" });

    // ############################################################## TABLA #######################################################################
    // Inicializar el encabezado con espacios vacíos
    const head = [
        ['', 'Nombre', 'No. Boleta /\nEmpleado', 'Edad', '', '', '', '', '', '', '', '', '', '', '', 'Sexo']
    ];
    // Nombres de las columnas verticales
    const verticalHeaders = ['AM', 'LM', 'CM', 'MM', 'EM', 'IA', 'DOCENTES', 'PAAE', 'FUNCIONARIOS', 'CECYT 18', 'OTROS'];
    let verticalHeadersDrawn = false;

    const totalRows = this.listaAsistentes.length;  // Número de asistentes del evento
    // Inicializar los contadores para cada columna
    const totals = Array(verticalHeaders.length).fill(0);
    let totalMale = 0;
    let totalFemale = 0;

    const data = this.listaAsistentes.map((asistente, index) => {
      const row = [
        index + 1,
        asistente.nombre,
        (asistente.tipo === "alumnoUpiiz" || asistente.tipo === "alumnoCecyt") ? asistente.tipoAsistente.boleta : (asistente.tipo === "empleado") ? asistente.tipoAsistente.numero_empleado : '',
        asistente.edad,
        (asistente.tipo === "alumnoUpiiz" && asistente.tipoAsistente.programa_academico === "Ingeniería Ambiental") ? 'X': '',
        (asistente.tipo === "alumnoUpiiz" && asistente.tipoAsistente.programa_academico === "Ingeniería en Alimentos") ? 'X': '',
        (asistente.tipo === "alumnoUpiiz" && asistente.tipoAsistente.programa_academico === "Ingeniería en Sistemas Computacionales") ? 'X': '',
        (asistente.tipo === "alumnoUpiiz" && asistente.tipoAsistente.programa_academico === "Ingeniería Mecatrónica") ? 'X': '',
        (asistente.tipo === "alumnoUpiiz" && asistente.tipoAsistente.programa_academico === "Ingeniería Metalúrgica") ? 'X': '',
        (asistente.tipo === "alumnoUpiiz" && asistente.tipoAsistente.programa_academico === "Ingeniería en Inteligencia Artificial") ? 'X': '',
        (asistente.tipo === "empleado" && asistente.tipoAsistente.cargo === "Docente") ? 'X': '',
        (asistente.tipo === "empleado" && asistente.tipoAsistente.cargo === "PAAE") ? 'X': '',
        (asistente.tipo === "empleado" && asistente.tipoAsistente.cargo === "Funcionario") ? 'X': '',
        (asistente.tipo === "alumnoCecyt") ? 'X': '',
        (asistente.tipo === "externo") ? 'X': '',
        (asistente.sexo === "Hombre") ? 'H' : (asistente.sexo === "Mujer") ? 'M': '',
      ];

      // Actualizar los contadores de las columnas
      for (let i = 4; i <= 14; i++) {
        if (row[i] === 'X') {
          totals[i - 4]++;
        }
      }

      // Actualizar los contadores de hombres y mujeres
      if (asistente.sexo === 'Hombre') {
        totalMale++;
      } else if (asistente.sexo === 'Mujer') {
        totalFemale++;
      }

      return row;
    });

    // Agregar la fila de totales al final de la tabla
    const totalRow = ['', '', '', '', ...totals.map(total => total.toString()), ''];
    data.push(totalRow);

    let finalY = 0; // Inicializar la variable finalY con un valor predeterminado

    autoTable(doc, {
        startY: 60, // Ajusta la posición de inicio de la tabla
        head: head,
        body: data,
        headStyles: {
            cellWidth: 'wrap', // Ajusta la celda al contenido
            minCellHeight: 26, // Aumenta la altura mínima de la celda
            fontStyle: 'normal', // Elimina la negrita
            fontSize: 8,
            textColor: [0, 0, 0], // Color del texto (negro)
            halign: 'center',
            valign: 'middle',
            fillColor: [255, 255, 255] // Color de fondo de las celdas (blanco)
        },
        styles: {
            lineColor: [0, 0, 0], // Color de los bordes de las celdas
            lineWidth: 0.01, // Grosor de los bordes de las celdas
        },
        bodyStyles: {
            cellWidth: 'wrap', // Ajusta la celda al contenido
            minCellHeight: 6, // Aumenta la altura mínima de la celda
            fontStyle: 'normal', // Elimina la negrita
            fontSize: 8,
            textColor: [0, 0, 0], // Color del texto (negro)
            fillColor: [255, 255, 255], // Color de fondo de las celdas (blanco)
        },
        columnStyles: {
            0: { halign: 'center' }, // Id
            3: { halign: 'center' }, // Edad
            4: { cellWidth: 6, halign: 'center' }, // AM
            5: { cellWidth: 6, halign: 'center' }, // LM
            6: { cellWidth: 6, halign: 'center' }, // CM
            7: { cellWidth: 6, halign: 'center' }, // MM
            8: { cellWidth: 6, halign: 'center' }, // EM
            9: { cellWidth: 6, halign: 'center' }, // IA
            10: { cellWidth: 6, halign: 'center' }, // DOCENTES
            11: { cellWidth: 6, halign: 'center' }, // PAAE
            12: { cellWidth: 6, halign: 'center' }, // FUNCIONARIOS
            13: { cellWidth: 6, halign: 'center' }, // CECYT 18
            14: { cellWidth: 6, halign: 'center' }, // OTROS
            15: { halign: 'center' }, // Sexo
        },
        didDrawCell: function(data) {    
          // Dibuja los encabezados verticales solo si no se han dibujado ya
          if (!verticalHeadersDrawn && data.section === 'head' && data.column.index >= 4 && data.column.index <= 14) {
            const cell = data.cell; // Obtiene la información de la celda actual
            const textPosX = cell.x + cell.width - 2; // Calcula la posición X del texto
            const textPosY = cell.y + cell.height - 2; // Calcula la posición Y del texto
    
            // Dibuja el texto del encabezado vertical
            doc.text(verticalHeaders[data.column.index - 4], textPosX, textPosY, {
                angle: 90, // Rota el texto 90 grados para que sea vertical
            });
          }
          // Poner la palabra "TOTAL" en negritas y centrada
          if (data.row.index === totalRows && data.column.index === 2) {
            const cell = data.cell;
            doc.setFont('helvetica', 'bold');
            doc.text('TOTAL', cell.x + cell.width / 2, cell.y + cell.height / 2 + 1, {
                align: 'center'
            });
          }
        },
        didDrawPage: function (data) {
          if (data.cursor) { // Verificar si data.cursor no es null
            finalY = data.cursor.y; // Guardar la posición Y final
          }
        }
    });

    // Espacio adicional después de la tabla
    finalY += 5;

    // Añadir el rectángulo para el total de asistentes con color de fondo gris
    const rectWidth = 18;
    const rectHeight = 6;
    const rectX = pageWidth - rectWidth - 14; // Margen de 10 unidades desde el borde derecho
    const rectY = finalY + 2;

    doc.setFillColor(245, 245, 245); // Establecer el color de fondo gris (#f5f5f5)
    doc.setDrawColor(0, 0, 0); // Establecer el color del borde a negro
    doc.rect(rectX, rectY, rectWidth, rectHeight, 'FD'); // Dibuja el rectángulo con fondo relleno y borde

    // Añadir total de asistentes dentro del rectángulo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("TOTAL", rectX + rectWidth / 2, rectY + rectHeight / 2 + 1, { align: 'center' });

    // Calcula las dimensiones y posiciones para los rectángulos de hombres y mujeres
    const rectMargin = 0; // Margen entre los rectángulos

    // Rectángulo para el total de mujeres
    const maleRectX = rectX - (rectWidth - 8) - rectMargin;
    doc.setFillColor(245, 245, 245); // Establecer el color de fondo gris (#f5f5f5)
    doc.setDrawColor(0, 0, 0); // Establecer el color del borde a negro
    doc.rect(maleRectX, rectY, rectWidth - 8, rectHeight, 'FD'); // Dibuja el rectángulo con fondo relleno y borde
    doc.text("M", maleRectX + (rectWidth - 8) / 2, rectY + rectHeight / 2 + 1, { align: 'center' }); // Añade el texto

    // Rectángulo para el total de hombres
    const femaleRectX = maleRectX - (rectWidth - 8) - rectMargin;
    doc.setFillColor(245, 245, 245); // Establecer el color de fondo gris (#f5f5f5)
    doc.setDrawColor(0, 0, 0); // Establecer el color del borde a negro
    doc.rect(femaleRectX, rectY, rectWidth - 8, rectHeight, 'FD'); // Dibuja el rectángulo con fondo relleno y borde
    doc.text("H", femaleRectX + (rectWidth - 8) / 2, rectY + rectHeight / 2 + 1, { align: 'center' }); // Añade el texto

    // Ajusta finalY para las nuevas coordenadas de los rectángulos
    finalY += rectHeight +2;

    // Agrega tres rectángulos adicionales debajo de los ya existentes
    const newRectY = finalY;

    // Rectángulo 1
    doc.setFillColor(255, 255, 255); // Establecer el color de fondo blanco
    doc.setDrawColor(0, 0, 0); // Establecer el color del borde a negro
    doc.rect(rectX, newRectY, rectWidth, rectHeight, 'FD');
    doc.text(totalRows.toString(), rectX + rectWidth / 2, newRectY + rectHeight / 2 + 1, { align: 'center' });

    // Rectángulo 2
    const rect2X = rectX - (rectWidth - 8) - rectMargin;
    doc.setFont("helvetica", "normal");
    doc.setFillColor(255, 255, 255); // Establecer el color de fondo blanco
    doc.setDrawColor(0, 0, 0); // Establecer el color del borde a negro
    doc.rect(rect2X, newRectY, rectWidth - 8, rectHeight, 'FD');
    doc.text(totalFemale.toString(), rect2X + (rectWidth - 8) / 2, newRectY + rectHeight / 2 + 1, { align: 'center' });

    // Rectángulo 3
    const rect3X = rect2X - (rectWidth - 8) - rectMargin;
    doc.setFillColor(255, 255, 255); // Establecer el color de fondo blanco
    doc.setDrawColor(0, 0, 0); // Establecer el color del borde a negro
    doc.rect(rect3X, newRectY, rectWidth - 8, rectHeight, 'FD');
    doc.text(totalMale.toString(), rect3X + (rectWidth - 8) / 2, newRectY + rectHeight / 2 + 1, { align: 'center' });
    
    const fechaNombreArchivo = this.formatoFecha2(this.eventoConsulta.fecha_evento);
    doc.save('reporte_'+fechaNombreArchivo+'_'+this.eventoConsulta.id+'.pdf');
    this.listaAsistentes = [];
  }

  //CONSULTAR DATOS PARA GENERAR EL EXCEL
  downloadExcel(eventoSeleccionado: any) {
    this.servicioEventos.obtenerEventoPorId(eventoSeleccionado.id_evento).subscribe(
      (data: any) => {
        this.eventoConsulta = data.eventos[0];
        if (this.eventoConsulta) {
          this.servicioAsistencia.filtrarAsistentesPorEvento(eventoSeleccionado.id_evento).subscribe(
            (asistentesData: any) => {
              //console.log(asistentesData)
              this.asistentesConsulta = asistentesData.asistentes;
              if (this.asistentesConsulta && asistentesData.estado === 1) {
                this.error = "";
                this.obtenerDetallesAsistentes(this.asistentesConsulta).subscribe(() => {
                  this.crearExcelYDescargar();
                });
              } else {
                //console.log("Evento sin asistentes");
                this.error = "No podrás generar reportes de este evento, debido a que no hubo asistentes.";
              }
            },
            (error: any) => {
              //console.log("Error al obtener asistentes");
            }
          );
        } else {
          console.log("Evento no encontrado");
        }
      },
      (error: any) => {
        console.error('Error al obtener el evento', error);
      }
    );
  }

  obtenerDetallesAsistentes(asistentes: any[]) {
    const requests = asistentes.map(asistente => this.servicioAsistentes.obtenerAsistentePorId(asistente.id));
    return forkJoin(requests).pipe(
      tap((responses: any[]) => {
        responses.forEach(asistenteData => {
          const asistenteEncontrado = asistenteData.asistentes[0];
          this.listaAsistentes.push({
            nombre: asistenteEncontrado.nombre_completo,
            edad: asistenteEncontrado.edad,
            sexo: asistenteEncontrado.sexo,
            tipo: asistenteEncontrado.tipo,
            tipoAsistente: asistenteEncontrado.tipoAsistente
          });
        });
      })
    );
  }

  crearExcelYDescargar() {
    this._workbook = new Workbook();
    this._workbook.creator = 'DSE';
    this.crearPlantillaExcel();
    const fechaNombreArchivo = this.formatoFecha2(this.eventoConsulta.fecha_evento);
  
    this._workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data]);
      fs2.saveAs(blob, 'reporte_'+fechaNombreArchivo+'_'+this.eventoConsulta.id+'.xlsx');
    });
  
    this.listaAsistentes = [];
  }

  crearPlantillaExcel(){
    const sheet = this._workbook.addWorksheet('Registro de asistencia');

    //Establecer el ancho de las columnas
    sheet.getColumn('B').width = 5;
    sheet.getColumn('C').width = 8;
    sheet.getColumn('D').width = 25;
    sheet.getColumn('E').width = 14;
    sheet.getColumn('F').width = 6;
    sheet.getColumn('G').width = 3;
    sheet.getColumn('H').width = 3;
    sheet.getColumn('I').width = 3;
    sheet.getColumn('J').width = 3;
    sheet.getColumn('K').width = 3;
    sheet.getColumn('L').width = 3;
    sheet.getColumn('M').width = 3;
    sheet.getColumn('N').width = 3;
    sheet.getColumn('O').width = 3;
    sheet.getColumn('P').width = 3;
    sheet.getColumn('Q').width = 3;
    sheet.getColumn('R').width = 5;
    sheet.getColumn('S').width = 5;

    sheet.columns.forEach((column) => {
      column.alignment = {vertical: 'middle', wrapText: true};
    });

    // Insertar imágenes del excel
    const logoId = this._workbook.addImage({
      base64: LOGO_UPIIZ,
      extension: 'png'
    });

    let logoId2:any
    //Logos de cada una de las áreas
    if(this.eventoConsulta.area == "Red de Género"){
      logoId2 = this._workbook.addImage({
        base64: LOGO_RG,
        extension: 'png'
      });
      sheet.addImage(logoId2, 'Q2:S6')
    }else if(this.eventoConsulta.area == "COSECOVI"){
      logoId2 = this._workbook.addImage({
        base64: LOGO_COSECOVI,
        extension: 'png'
      });
      sheet.addImage(logoId2, 'Q2:S6')
    }else{
      logoId2 = this._workbook.addImage({
        base64: LOGO_DSE,
        extension: 'png'
      });
      sheet.addImage(logoId2, 'O2:S5')
    }
      
    sheet.addImage(logoId, 'B2:C6')
    
    // Combinar celdas necesarias
    sheet.mergeCells('B2:S2');
    sheet.mergeCells('B3:S3');
    sheet.mergeCells('B5:S5');
    sheet.mergeCells('B7:K7');
    sheet.mergeCells('M7:S7');
    sheet.mergeCells('B9:S9');
    sheet.mergeCells('R11:S11');

    // Establecer la altura de las filas
    sheet.getRow(4).height = 7;
    sheet.getRow(10).height = 7;
    sheet.getRow(11).height = 70;

    // ENCABEZADO --------------------------------------------------------------------------------------------------------------------------------
    // --- INSTITUTO POLITÉCNICO NACIONAL
    const encabezado1 = sheet.getCell('B2');
    encabezado1.value = 'INSTITUTO POLITÉCNICO NACIONAL';
    encabezado1.style = {
        font: { bold: true, size: 11},
        alignment: { horizontal: 'center', vertical: 'middle' }
    };
    // --- CAMPUS ZACATECAS
    const encabezado2 = sheet.getCell('B3');
    encabezado2.value = 'CAMPUS ZACATECAS';
    encabezado2.style = {
        font: { bold: true, size: 11},
        alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // --- ÁREA DEL EVENTO ----------------------------------------
    const area = this.eventoConsulta.area;
    const areaEnMayusculas = area.toUpperCase(); // Convertir a mayúsculas
    const encabezado3 = sheet.getCell('B5');
    encabezado3.value = areaEnMayusculas; // Usar el texto en mayúsculas
    encabezado3.style = {
        font: { bold: true, size: 20 },
        alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // --- NOMBRE DEL EVENTO ----------------------------------------
    const nombre_evento = this.eventoConsulta.nombre_evento
    const encabezado4 = sheet.getCell('B7');
    encabezado4.value = 'Actividad: ' + nombre_evento;
    encabezado4.style = {
        font: { bold: false, size: 11},
        alignment: { horizontal: 'left', vertical: 'middle' }
    };

    // --- FECHA DEL EVENTO ----------------------------------------
    const fecha_evento = this.eventoConsulta.fecha_evento
    const fechaFormateada = this.formatearFechaExcel(fecha_evento);
    const encabezado5 = sheet.getCell('M7');
    encabezado5.value = 'Fecha: ' + fechaFormateada;
    encabezado5.style = {
        font: { bold: false, size: 11 },
        alignment: { horizontal: 'right', vertical: 'middle' }
    };

    // --- REGISTRO DE ASISTENCIA
    const encabezado6 = sheet.getCell('B9');
    encabezado6.value = 'REGISTRO DE ASISTENCIA';
    encabezado6.style = {
        font: { bold: true, size: 12},
        alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Combinar columnas C y D a partir de la fila 11
    for (let i = 11; i <= sheet.rowCount; i++) {
      sheet.mergeCells(`C${i}:D${i}`);
    }
    
    // TABLA ------------------------------------------------------------------------------------------------------------------------------------
    // Encabezado de la tabla
    const headers = [
      { col: 'B', text: '' },
      { col: 'C', text: 'Nombre' },
      { col: 'E', text: 'No. de Boleta / Empleado' },
      { col: 'F', text: 'Edad', rotation: 90 },
      { col: 'G', text: 'AM', rotation: 90 },
      { col: 'H', text: 'LM', rotation: 90 },
      { col: 'I', text: 'CM', rotation: 90 },
      { col: 'J', text: 'MM', rotation: 90 },
      { col: 'K', text: 'EM', rotation: 90 },
      { col: 'L', text: 'IA', rotation: 90 },
      { col: 'M', text: 'DOCENTES', rotation: 90 },
      { col: 'N', text: 'PAAE', rotation: 90 },
      { col: 'O', text: 'FUNCIONARIOS', rotation: 90 },
      { col: 'P', text: 'CECYT 18', rotation: 90 },
      { col: 'Q', text: 'OTROS', rotation: 90 },
      { col: 'R', text: 'Sexo', rotation: 90 }
    ];

    headers.forEach(header => {
      const cell = sheet.getCell(`${header.col}11`);
      cell.value = header.text;
      cell.style = {
        font: { size: 8 },
        alignment: { horizontal: 'center', vertical: 'middle', textRotation: header.rotation || 0, wrapText: true},
        border: {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      };
    });

    const header1 = sheet.getCell('D11');
    header1.style = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
      }
    };

    const header2 = sheet.getCell('S11');
    header2.style = {
      border: {
        top: { style: 'thin' },
        right: { style: 'thin' },
        bottom: { style: 'thin' },
      }
    };

    // Función para convertir letra de columna a índice
    function columnToIndex(column: string): number {
      return column.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    }

    // Cuerpo de la tabla
    const startRow = 12;
    const endColumn = 'S';
    const endColumnIndex = columnToIndex(endColumn);
    const totalRows = this.listaAsistentes.length; // Limite de filas - Limitarlo al número de asistentes al evento ----------------------------------------------------------
    //console.log(totalRows)
    let currentRow = startRow;

    for (let i = 1; i <= totalRows + 1; i++) { // Añade 1 a totalRows para incluir la fila adicional
      const cellAddress = `B${currentRow}`;
      const cell = sheet.getCell(cellAddress);
      if (i <= totalRows) { // Si i está dentro del rango de totalRows, se coloca el número
        cell.value = i;
        cell.style = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          },
          alignment: { horizontal: 'center', vertical: 'middle' } // Para centrar el número en la celda
        };

        // NOMBRE ################################################
        const nameCellAddress = `C${currentRow}`;
        const nameCell = sheet.getCell(nameCellAddress);
        nameCell.value = this.listaAsistentes[i - 1].nombre;
        nameCell.style = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          },
          alignment: { horizontal: 'left', vertical: 'middle' }
        };

        // NO. BOLETA / NO.EMPLEADO ##############################
        const eCellAddress = `E${currentRow}`;
        const eCell = sheet.getCell(eCellAddress);
        if(this.listaAsistentes[i - 1].tipo == "alumnoUpiiz" || this.listaAsistentes[i - 1].tipo == "alumnoCecyt"){
          eCell.value = this.listaAsistentes[i - 1].tipoAsistente.boleta;
        }else if(this.listaAsistentes[i - 1].tipo == "empleado"){
          eCell.value = this.listaAsistentes[i - 1].tipoAsistente.numero_empleado;
        }else{
          eCell.value = "";
        }
        eCell.style = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          },
          alignment: { horizontal: 'left', vertical: 'middle' }
        };

        // EDAD ##################################################
        const fCellAddress = `F${currentRow}`;
        const fCell = sheet.getCell(fCellAddress);
        fCell.value = this.listaAsistentes[i - 1].edad;
        fCell.style = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          },
          alignment: { horizontal: 'center', vertical: 'middle' }
        };

        // PROGRAMA ACADÉMICO #####################################
        if (this.listaAsistentes[i - 1].tipo == "alumnoUpiiz") {
          let programCellAddress = '';
    
          switch (this.listaAsistentes[i - 1].tipoAsistente.programa_academico) {
            case "Ingeniería Ambiental":
              programCellAddress = `G${currentRow}`;
              this.columnTotal.G++;
              break;
            case "Ingeniería en Alimentos":
              programCellAddress = `H${currentRow}`;
              this.columnTotal.H++;
              break;
            case "Ingeniería en Sistemas Computacionales":
              programCellAddress = `I${currentRow}`;
              this.columnTotal.I++;
              break;
            case "Ingeniería Mecatrónica":
              programCellAddress = `J${currentRow}`;
              this.columnTotal.J++;
              break;
            case "Ingeniería Metalúrgica":
              programCellAddress = `K${currentRow}`;
              this.columnTotal.K++;
              break;
            default:
              programCellAddress = `L${currentRow}`;
              this.columnTotal.L++;
          }
    
          const programCell = sheet.getCell(programCellAddress);
          programCell.value = "X";
          programCell.style = {
            border: {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            },
            alignment: { horizontal: 'center', vertical: 'middle' }
          };
        }

        // CARGO ##################################################
        if (this.listaAsistentes[i - 1].tipo == "empleado") {
          let cargoCellAddress = '';
    
          switch (this.listaAsistentes[i - 1].tipoAsistente.cargo) {
            case "Funcionario":
              cargoCellAddress = `O${currentRow}`;
              this.columnTotal.O++;
              break;
            case "Docente":
              cargoCellAddress = `M${currentRow}`;
              this.columnTotal.M++;
              break;
            default:
              cargoCellAddress = `N${currentRow}`;
              this.columnTotal.N++;
          }
    
          const cargoCell = sheet.getCell(cargoCellAddress);
          cargoCell.value = "X";
          cargoCell.style = {
            border: {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            },
            alignment: { horizontal: 'center', vertical: 'middle' }
          };
        }

        // OTROS ##################################################
        let otrosCellAddress = '';

        if(this.listaAsistentes[i - 1].tipo == "alumnoCecyt"){
          otrosCellAddress = `P${currentRow}`;
          this.columnTotal.P++;
        }else if(this.listaAsistentes[i - 1].tipo == "externo"){
          otrosCellAddress = `Q${currentRow}`;
          this.columnTotal.Q++;
        }
        if (otrosCellAddress) {
          const otrosCell = sheet.getCell(otrosCellAddress);
          otrosCell.value = "X";
          otrosCell.style = {
            border: {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            },
            alignment: { horizontal: 'center', vertical: 'middle' }
          };
        }

        // SEXO ##################################################
        let sexoCellAddress = '';

        if(this.listaAsistentes[i - 1].sexo == "Hombre"){
          sexoCellAddress = `R${currentRow}`;
          this.columnTotal.R++;
        }else{
          sexoCellAddress = `S${currentRow}`;
          this.columnTotal.S++;
        }
        const sexoCell = sheet.getCell(sexoCellAddress);
        sexoCell.style = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          },
          alignment: { horizontal: 'center', vertical: 'middle' },
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF948A54' }
          }
        };

      } else { // Si i excede totalRows, no se coloca el número
        cell.style = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
      }

      // Aplicar bordes a las celdas desde la columna C hasta la S
      for (let colIndex = columnToIndex('C'); colIndex <= endColumnIndex; colIndex++) {
        const cellAddress = String.fromCharCode('A'.charCodeAt(0) + colIndex - 1) + currentRow;
        const cell = sheet.getCell(cellAddress);
        cell.style.font = { size: 8 };
        cell.style.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Establecer 'H' en la columna R y 'M' en la columna S
        if (colIndex === columnToIndex('R') && i <= totalRows) {
          cell.value = 'H';
          cell.style.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (colIndex === columnToIndex('S') && i <= totalRows) {
          cell.value = 'M';
          cell.style.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      }
      currentRow++;
    }

    // TOTAL ######################################################################################################
    const totalCellAddress = `E${currentRow - 1}`;
    const totalCell = sheet.getCell(totalCellAddress);
    totalCell.value = 'TOTAL';
    totalCell.style = {
      font: { bold: true },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' } // Para centrar la palabra "TOTAL" en la celda
    };

    // Total G
    const totalGCellAddress = `G${currentRow - 1}`;
    const totalGCell = sheet.getCell(totalGCellAddress);
    totalGCell.value = this.columnTotal.G;
    totalGCell.style = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Total H
    const totalHCellAddress = `H${currentRow - 1}`;
    const totalHCell = sheet.getCell(totalHCellAddress);
    totalHCell.value = this.columnTotal.H;
    totalHCell.style = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Total I
    const totalICellAddress = `I${currentRow - 1}`;
    const totalICell = sheet.getCell(totalICellAddress);
    totalICell.value = this.columnTotal.I;
    totalICell.style = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Total J
    const totalJCellAddress = `J${currentRow - 1}`;
    const totalJCell = sheet.getCell(totalJCellAddress);
    totalJCell.value = this.columnTotal.J;
    totalJCell.style = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Total K
    const totalKCellAddress = `K${currentRow - 1}`;
    const totalKCell = sheet.getCell(totalKCellAddress);
    totalKCell.value = this.columnTotal.K;
    totalKCell.style = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Total L
    const totalLCellAddress = `L${currentRow - 1}`;
    const totalLCell = sheet.getCell(totalLCellAddress);
    totalLCell.value = this.columnTotal.L;
    totalLCell.style = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Total M
    const totalMCellAddress = `M${currentRow - 1}`;
    const totalMCell = sheet.getCell(totalMCellAddress);
    totalMCell.value = this.columnTotal.M;
    totalMCell.style = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Total N
    const totalNCellAddress = `N${currentRow - 1}`;
    const totalNCell = sheet.getCell(totalNCellAddress);
    totalNCell.value = this.columnTotal.N;
    totalNCell.style = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Total O
    const totalOCellAddress = `O${currentRow - 1}`;
    const totalOCell = sheet.getCell(totalOCellAddress);
    totalOCell.value = this.columnTotal.O;
    totalOCell.style = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Total P
    const totalPCellAddress = `P${currentRow - 1}`;
    const totalPCell = sheet.getCell(totalPCellAddress);
    totalPCell.value = this.columnTotal.P;
    totalPCell.style = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Total Q
    const totalQCellAddress = `Q${currentRow - 1}`;
    const totalQCell = sheet.getCell(totalQCellAddress);
    totalQCell.value = this.columnTotal.Q;
    totalQCell.style = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Total R
    const totalRCellAddress = `R${currentRow - 1}`;
    const totalRCell = sheet.getCell(totalRCellAddress);
    totalRCell.value = this.columnTotal.R;
    totalRCell.style = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Total S
    const totalSCellAddress = `S${currentRow - 1}`;
    const totalSCell = sheet.getCell(totalSCellAddress);
    totalSCell.value = this.columnTotal.S;
    totalSCell.style = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Combinar columnas C y D a partir de la fila 12
    for (let i = 12; i <= sheet.rowCount; i++) {
      sheet.mergeCells(`C${i}:D${i}`);
    }

    this.columnTotal = {
      G: 0,
      H: 0,
      I: 0,
      J: 0,
      K: 0,
      L: 0,
      M: 0,
      N: 0,
      O: 0,
      P: 0,
      Q: 0,
      R: 0,
      S: 0
    };

    // Agregar celda combinada al final de la tabla para mostrar el número total de asistentes
    const totalAsistentesRow = currentRow; // Fila actual después del bucle
    sheet.mergeCells(`R${totalAsistentesRow}:S${totalAsistentesRow}`);
    const totalAsistentesCell = sheet.getCell(`R${totalAsistentesRow}`);
    totalAsistentesCell.value = `${totalRows}`;
    totalAsistentesCell.style = {
      font: { bold: true, size: 12 },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Aplicar estilo de borde a cada celda individualmente en el rango combinado
    const totalAsistentesBorderCells = [`R${totalAsistentesRow}`, `S${totalAsistentesRow}`];
    totalAsistentesBorderCells.forEach(cellAddress => {
      const cell = sheet.getCell(cellAddress);
      cell.style.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Ajustar la altura de la fila de total de asistentes si es necesario
    sheet.getRow(totalAsistentesRow).height = 20;

  }

  // Función para formatear la fecha
  formatDate(dateString: string) {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  }

  // Función para obtener el número de boleta o empleado
  getNoBoletaEmpleado(asistente: any) {
      if (asistente.tipo === "alumnoUpiiz" || asistente.tipo === "alumnoCecyt") {
          return asistente.tipoAsistente.boleta;
      } else if (asistente.tipo === "empleado") {
          return asistente.tipoAsistente.numero_empleado;
      } else {
          return "";
      }
  }

  // CALCULAR HORAS POR PERIODO Y NÚMERO DE EVENTOS
  calcularHorasPorPeriodo(fechaInicio: string = "", fechaFin: string = "", area: string = "") {
    //console.log("Id: ", id, " Fecha inicio: ", fechaInicio, " Fecha fin: ", fechaFin)
    // Obtener los eventos completados
    this.servicioEventos.filtrarEventosPorCompletado().subscribe({
      next: (eventos: any) => {
        let horasTotales = 0;
        let numEventos = 0

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

          // Filtrar eventos por área
          if (area) {
            eventosFiltrados = eventosFiltrados.filter((evento: any) => evento.area === area);
          }

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
            numEventos += 1;
          });

          //console.log('Horas totales:', horasTotales);
          this.horasTotales = horasTotales;
          this.numEventos = numEventos;

        } else {
          console.error('No se encontraron eventos');
        }
      },
      error: (error) => {
        console.error('Error desconocido', error);
      }
    });
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

  formatoFecha2(fecha: string): string {
    return formatDate(fecha, 'dd_MM_yyyy', 'en-US');
  }

  formatearFechaExcel(fecha: string): string {
    const partesFecha = fecha.split('-');
    const dia = partesFecha[2];
    const mes = partesFecha[1];
    const anio = partesFecha[0];
    return `${dia}/${mes}/${anio}`;
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
    localStorage.removeItem('tipo');     

    this.router.navigateByUrl('/dep-login');   // Redirige a la página de inicio de sesión
  }
}