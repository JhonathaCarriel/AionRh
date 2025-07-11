import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CriarPageRoutingModule } from './criar-routing.module';

import { CriarPage } from './criar.page';
import { HeaderComponent } from 'src/app/header/header.component';
import { SubheaderComponent } from 'src/app/subheader/subheader.component';
import { BotaoFlutuanteComponent } from 'src/app/botao-flutuante/botao-flutuante.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CriarPageRoutingModule,
    HeaderComponent,
    SubheaderComponent,
    ReactiveFormsModule,
    BotaoFlutuanteComponent,

  ],
  declarations: [CriarPage]
})
export class CriarPageModule {}
