import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NcmsPage } from './ncms.page';

const routes: Routes = [
  {
    path: '',
    component: NcmsPage
  },
  {
    path: 'cadastro',
    loadChildren: () => import('./cadastro/cadastro.module').then( m => m.CadastroPageModule)
  },
  {
    path: 'editar/ncm/:id',
    loadChildren: () => import('./editar/editar.module').then( m => m.EditarPageModule)
  },
  {
    path: 'importar-planilha',
    loadChildren: () => import('./importar-planilha/importar-planilha.module').then( m => m.ImportarPlanilhaPageModule)
  },

  {
    path: 'visualizar',
    loadChildren: () => import('./padrao-tributacao/visualizar/visualizar.module').then( m => m.VisualizarPageModule)
  },
  {
    path: 'criar',
    loadChildren: () => import('./padrao-tributacao/criar/criar.module').then( m => m.CriarPageModule)
  },
  {
    path: 'editar',
    loadChildren: () => import('./padrao-tributacao/editar/editar.module').then( m => m.EditarPageModule)
  },



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NcmsPageRoutingModule {}
