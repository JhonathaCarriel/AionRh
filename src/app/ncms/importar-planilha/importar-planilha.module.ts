import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImportarPlanilhaPageRoutingModule } from './importar-planilha-routing.module';

import { ImportarPlanilhaPage } from './importar-planilha.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImportarPlanilhaPageRoutingModule
  ],
  declarations: [ImportarPlanilhaPage]
})
export class ImportarPlanilhaPageModule {}
