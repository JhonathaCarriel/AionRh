import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SimuladorServicoPage } from './simulador-servico.page';

const routes: Routes = [
  {
    path: '',
    component: SimuladorServicoPage
  },



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SimuladorServicoPageRoutingModule {}
