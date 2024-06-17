import { Routes } from '@angular/router';
import { AsisLoginComponent } from './asis-login/asis-login.component';
import { DepLoginComponent } from './dep-login/dep-login.component';
import { DepEventosComponent } from './dep-eventos/dep-eventos.component';
import { AsisEventosComponent } from './asis-eventos/asis-eventos.component';
import { AsisRegistroComponent } from './asis-registro/asis-registro.component';
import { AsisInfoUsuarioComponent } from './asis-info-usuario/asis-info-usuario.component';
import { DepPonentesComponent } from './dep-ponentes/dep-ponentes.component';
import { AsisConstanciasComponent } from './asis-constancias/asis-constancias.component';
import { DepReportesComponent } from './dep-reportes/dep-reportes.component';
import { DepAsistenciaComponent } from './dep-asistencia/dep-asistencia.component';

export const routes: Routes = [
  { path: '', redirectTo: '/asis-login', pathMatch: 'full' },
  { path: 'asis-login', component: AsisLoginComponent },
  { path: 'dep-login', component: DepLoginComponent },
  { path: 'asis-eventos', component: AsisEventosComponent },
  { path: 'dep-eventos', component: DepEventosComponent },
  { path: 'asis-registro', component: AsisRegistroComponent },
  { path: 'asis-info-usuario', component: AsisInfoUsuarioComponent },
  { path: 'dep-ponentes', component: DepPonentesComponent },
  { path: 'asis-constancias', component: AsisConstanciasComponent },
  { path: 'dep-reportes', component: DepReportesComponent },
  { path: 'dep-asistencia', component: DepAsistenciaComponent }

];
