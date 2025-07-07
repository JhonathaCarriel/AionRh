import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({ 
  standalone: true,
  selector: 'app-subheader',
  templateUrl: './subheader.component.html',
  styleUrls: ['./subheader.component.scss'],   
  imports: [IonicModule, CommonModule, FormsModule]  
})
export class SubheaderComponent implements OnInit {
  @Input() descricaoCampoPesquisa: string = '';
  @Input() TitleSubheader: string = '';
  @Input() ViewPage: boolean = false;
  @Input() ViewPageImport: boolean = false;
  @Input() FormPage: boolean = false;

  @Output() newClicked = new EventEmitter<void>();
  @Output() saveClicked = new EventEmitter<void>();
  @Output() discardClicked = new EventEmitter<void>();
  @Output() filesSelected = new EventEmitter<FileList>();
  @Output() importFile = new EventEmitter<FileList>();
  @Output() searchClicked = new EventEmitter<string>();  

  searchTerm: string = '';  
  constructor() { }

  ngOnInit() { }

  onNewClick() {
    this.newClicked.emit();
  }

  onSaveClick() {
    this.saveClicked.emit();
  }

  onDiscardClick() {
    this.discardClicked.emit();
  }

  onImportarClick() {
    this.importFile.emit();
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.filesSelected.emit(input.files);
    }
  }

  onSearchChange() {
    this.searchClicked.emit(this.searchTerm); 
  }
}
