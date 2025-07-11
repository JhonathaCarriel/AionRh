import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CadastronovousuarioPageRoutingModule } from './cadastronovousuario-routing.module';

import { CadastronovousuarioPage } from './cadastronovousuario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    CadastronovousuarioPageRoutingModule
  ],
  declarations: [CadastronovousuarioPage]
})
export class CadastronovousuarioPageModule {}
