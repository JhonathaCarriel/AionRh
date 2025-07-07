import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CnaePageRoutingModule } from './cnae-routing.module';

import { CnaePage } from './cnae.page';
import { HeaderComponent } from '../header/header.component';
import { SubheaderComponent } from '../subheader/subheader.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CnaePageRoutingModule,
    HeaderComponent,
    SubheaderComponent,
    ReactiveFormsModule
  ],
  declarations: [CnaePage]
})
export class CnaePageModule {}
