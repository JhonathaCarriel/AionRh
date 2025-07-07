import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SimuladorPage } from './simulador.page';

const routes: Routes = [
  {
    path: '',
    component: SimuladorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SimuladorPageRoutingModule {}
