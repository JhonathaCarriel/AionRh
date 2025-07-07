import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { EditarRendimentoComponent } from './informacoes-rendimentos/editar-rendimento/editar-rendimento.component';
import { authGuard } from './shared/guard/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
    canActivate: [authGuard],
  },
  {
    path: 'colaboradores',
    loadChildren: () =>
      import('./colaboradores/colaboradores.module').then(
        (m) => m.ColaboradoresPageModule
      ),
    canActivate: [authGuard],
  },
  {
    path: 'dashboards',
    loadChildren: () =>
      import('./dashboards/dashboards.component').then(
        (m) => m.DashboardsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'departamentos',
    loadChildren: () =>
      import('./departamentos/departamentos.module').then(
        (m) => m.DepartamentosPageModule
      ),
    canActivate: [authGuard],
  },
  {
    path: 'informacoes-rendimentos',
    loadChildren: () =>
      import('./informacoes-rendimentos/informacoes-rendimentos.module').then(
        (m) => m.InformacoesRendimentosPageModule
      ),
    canActivate: [authGuard],
  },
  {
    path: 'cadastrar-colaborador',
    loadChildren: () =>
      import('./colaboradores/cadastrar/cadastrar.module').then(
        (m) => m.CadastrarPageModule
      ),
    canActivate: [authGuard],
  },
  {
    path: 'editar-colaborador/:id',
    loadChildren: () =>
      import('./colaboradores/editar/editar.module').then(
        (m) => m.EditarPageModule
      ),
    canActivate: [authGuard],
  },
  {
    path: 'criar-avaliacao',
    loadChildren: () =>
      import('./informacoes-rendimentos/cadastro/cadastro.module').then(
        (m) => m.CadastroPageModule
      ),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'editar-rendimento',
    component: EditarRendimentoComponent,
    canActivate: [authGuard],
  },
  {
    path: 'recuperasenha',
    loadChildren: () =>
      import('./reset-senha/reset-senha.module').then(
        (m) => m.ResetSenhaPageModule
      ),
  },
  {
    path: 'simulador',
    loadChildren: () => import('./menu/simulador/simulador.module').then( m => m.SimuladorPageModule)
  },
  {
    path: 'ncms',
    loadChildren: () => import('./ncms/ncms.module').then( m => m.NcmsPageModule)
  },
{
  path:'cadastro/ncm',
  loadChildren: () => import('./ncms/cadastro/cadastro.module').then(m => m.CadastroPageModule)
},
{
  path: 'editar/ncm/:id',
  loadChildren: () => import('./ncms/editar/editar.module').then(m => m.EditarPageModule)
},
{
  path: 'relatorio-pdf',
  loadChildren: () => import('./menu/simulador/relatorio-pdf/relatorio-pdf.component').then(m =>m.RelatorioPdfComponent)
},
  {
    path: 'simulador/servico',
    loadChildren: () => import('./menu/simulador-servico/simulador-servico.module').then( m => m.SimuladorServicoPageModule)
  },
  {
    path: 'simulador/servico/criar',
    loadChildren: () => import('./menu/simulador-servico/criar/criar.module').then( m => m.CriarPageModule)
  },
  {
    path: 'simulador/servico/editar/:id',
    loadChildren: () => import('./menu/simulador-servico/editar/editar.module').then( m => m.EditarPageModule)
  },
  {
    path: 'simulador/cnae',
    loadChildren: () => import('./cnae/cnae.module').then( m => m.CnaePageModule)
  },
  {
    path: 'simulador/cnae/criar',
    loadChildren: () => import('./cnae/criar/criar.module').then( m => m.CriarPageModule)
  },
  {
    path: 'simulador/cnae/editar/:id',
    loadChildren: () => import('./cnae/editar/editar.module').then( m => m.EditarPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
