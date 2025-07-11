import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VisualizarPageRoutingModule } from './visualizar-routing.module';

import { VisualizarPage } from './visualizar.page';
import { HeaderComponent } from 'src/app/header/header.component';
import { SubheaderComponent } from 'src/app/subheader/subheader.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisualizarPageRoutingModule,
    HeaderComponent,
    SubheaderComponent,
    ReactiveFormsModule
  ],
  declarations: [VisualizarPage]
})
export class VisualizarPageModule {}
