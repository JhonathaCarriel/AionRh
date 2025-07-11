import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SimuladorServicoPageRoutingModule } from './simulador-servico-routing.module';

import { SimuladorServicoPage } from './simulador-servico.page';
import { HeaderComponent } from 'src/app/header/header.component';
import { SubheaderComponent } from 'src/app/subheader/subheader.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SimuladorServicoPageRoutingModule,
    HeaderComponent,
    SubheaderComponent,
    ReactiveFormsModule,
  ],
  declarations: [SimuladorServicoPage]
})
export class SimuladorServicoPageModule {}
