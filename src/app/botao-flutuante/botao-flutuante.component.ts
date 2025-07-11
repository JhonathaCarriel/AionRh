import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,

  ],
  selector: 'app-botao-flutuante',
  templateUrl: './botao-flutuante.component.html',
  styleUrls: ['./botao-flutuante.component.scss'],
})
export class BotaoFlutuanteComponent  implements OnInit {

  @Input() showPrintContent = true;
  @Input() showExportToExcel = true;
  @Input() showSalvarDados = true;
  @Input() showPrintDRE = true;

  @Output() printContentClicked = new EventEmitter<void>();
  @Output() exportToExcelClicked = new EventEmitter<void>();
  @Output() salvarDadosSimuladorClicked = new EventEmitter<void>();
  @Output() printDREClicked = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {

  }

  printContent() {
    this.printContentClicked.emit();
  }

  exportToExcel() {
    this.exportToExcelClicked.emit();
  }

  salvarDadosSimulador() {
    this.salvarDadosSimuladorClicked.emit();
  }

  printDRE() {
    this.printDREClicked.emit();
  }
}