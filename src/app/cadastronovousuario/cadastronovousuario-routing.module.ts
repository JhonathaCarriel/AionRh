import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CadastronovousuarioPage } from './cadastronovousuario.page';

const routes: Routes = [
  {
    path: '',
    component: CadastronovousuarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CadastronovousuarioPageRoutingModule {}
