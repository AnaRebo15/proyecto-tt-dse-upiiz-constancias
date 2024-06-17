import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AsisEventosComponent } from './asis-eventos/asis-eventos.component';
import { DepEventosComponent } from './dep-eventos/dep-eventos.component';
import { AsisRegistroComponent } from './asis-registro/asis-registro.component';
import { AsisLoginComponent } from './asis-login/asis-login.component';
import { AsisInfoUsuarioComponent } from './asis-info-usuario/asis-info-usuario.component';
import { DepPonentesComponent } from './dep-ponentes/dep-ponentes.component';
import { DepLoginComponent } from './dep-login/dep-login.component';
import { AsisConstanciasComponent } from './asis-constancias/asis-constancias.component';
import { DepReportesComponent } from './dep-reportes/dep-reportes.component';
import { DepAsistenciaComponent } from './dep-asistencia/dep-asistencia.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet,
    AsisEventosComponent, AsisRegistroComponent, AsisLoginComponent, AsisInfoUsuarioComponent, AsisConstanciasComponent,
    DepEventosComponent, DepPonentesComponent, DepLoginComponent, DepReportesComponent, DepAsistenciaComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})

export class AppComponent {
  title = 'DSE UPIIZ - CONSTANCIAS';
}
