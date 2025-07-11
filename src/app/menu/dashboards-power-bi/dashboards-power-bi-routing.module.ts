import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardsPowerBiPage } from './dashboards-power-bi.page';

const routes: Routes = [
  {
    path: '',
    component: DashboardsPowerBiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardsPowerBiPageRoutingModule {}
