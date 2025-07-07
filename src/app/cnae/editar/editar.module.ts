import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarPageRoutingModule } from './editar-routing.module';

import { EditarPage } from './editar.page';
import { HeaderComponent } from 'src/app/header/header.component';
import { SubheaderComponent } from 'src/app/subheader/subheader.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarPageRoutingModule,
    HeaderComponent,
    SubheaderComponent,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  declarations: [EditarPage]
})
export class EditarPageModule {}
