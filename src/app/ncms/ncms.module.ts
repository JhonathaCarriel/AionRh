import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NcmsPageRoutingModule } from './ncms-routing.module';

import { NcmsPage } from './ncms.page';
import { HeaderComponent } from '../header/header.component';
import { SubheaderComponent } from '../subheader/subheader.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    SubheaderComponent,
    IonicModule,
    NcmsPageRoutingModule
  ],
  declarations: [NcmsPage]
})
export class NcmsPageModule {}
