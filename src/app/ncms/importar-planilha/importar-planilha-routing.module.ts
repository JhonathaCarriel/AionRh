import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImportarPlanilhaPage } from './importar-planilha.page';

const routes: Routes = [
  {
    path: '',
    component: ImportarPlanilhaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImportarPlanilhaPageRoutingModule {}
