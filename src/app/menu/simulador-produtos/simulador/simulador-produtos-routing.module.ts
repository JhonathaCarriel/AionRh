import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SimuladorProdutosPage } from './simulador-produtos.page';

const routes: Routes = [
  {
    path: '',
    component: SimuladorProdutosPage
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SimuladorProdutosPageRoutingModule {}
