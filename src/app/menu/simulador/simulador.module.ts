import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SimuladorPageRoutingModule } from './simulador-routing.module';

import { SimuladorPage } from './simulador.page';
import { HeaderComponent } from 'src/app/header/header.component';
import { TabelaComponent } from './tabela/tabela.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabelaComponent,
    ReactiveFormsModule, 
    HeaderComponent,
    SimuladorPageRoutingModule
  ],
  declarations: [SimuladorPage]
})
export class SimuladorPageModule {}
