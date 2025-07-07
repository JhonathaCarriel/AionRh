import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AliquotasService } from 'src/app/services/aliquotas.service';
import { CnaeService } from 'src/app/services/cnae.service';
import { CstService } from 'src/app/services/cst.service';

export interface CNAEs {
  id: string;
  crt: string;
  uf: string;
  cidade: string;
  cnae: string;
  descricao: string;
  aliquotapisSaida: number;
  aliquotacofinsSaida: number;
  aliquotaISS: number;
  csllRetido: number;
  irpj: number;
  csll: number;
}

export interface EstadoAliquota {
  sigla: string;
  nome: string;
}

export interface Cidades {
  nome: string;
}

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
})
export class EditarPage implements OnInit {
  pageTitle: string = 'Editar CNAE';
  cnaeForm: FormGroup;
  cnaeID: string = '';
  descricao: string | null = null;
  estados: EstadoAliquota[] = [];
  cidades: Cidades[] = [];

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private cnaeService: CnaeService,
    private aliquotasService: AliquotasService,
    private firestore: AngularFirestore,
    private cstService: CstService,
    private http: HttpClient,
    private alertController: AlertController
  ) {
    this.cnaeForm = this.createForm();
  }

  ngOnInit() {
    this.cnaeID = this.route.snapshot.paramMap.get('id')!;
    this.loadCnae();
  }

  createForm(): FormGroup {
    return this.formBuilder.group({
      crt: [''],
      uf: [''],
      cidade: [''],
      cnae: [''],
      descricao: [''],
      aliquotapisSaida: [null],
      aliquotacofinsSaida: [null],
      aliquotaISS: [''],
      csllRetido: [null],
      irpj: [null],
      csll: [null],
    });
  }

  loadCnae() {
    this.firestore.doc<CNAEs>(`cnae/${this.cnaeID}`).valueChanges().subscribe(data => {
      if (data) {
        this.setFormValues(data);
        if (!this.descricao && data.cnae) {
          this.updateDescricao(data);
        }
      }
    });

    this.loadEstados();
  }

  setFormValues(data: CNAEs) {
    this.cnaeForm.patchValue(data);
  }

  updateDescricao(data: CNAEs) {
    const cnae = this.cnaeForm.get('cnae')?.value;
    this.descricao = cnae ? this.cnaeService.buscarDescricaoPorCnae(cnae) || null : 'Descrição não encontrada';
    this.cnaeForm.get('descricao')?.setValue(this.descricao);
  }

  loadEstados() {
    this.estados = this.aliquotasService.getAllEstados();
    this.onEstadoChange();
  }

  onEstadoChange() {
    const uf = this.cnaeForm.get('uf')?.value;
    if (!uf) {
      this.clearCities();
      return;
    }

    const apiUrl = `https://brasilapi.com.br/api/ibge/municipios/v1/${uf}?providers=dados-abertos-br,gov,wikipedia`;
    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => this.processCities(data),
      error: () => this.clearCities(),
    });
  }

  processCities(data: any[]) {
    this.cidades = data.length ? data.map((cidade) => ({ nome: cidade.nome || 'Nome não disponível' })) : [];
    const cidadeAtual = this.cnaeForm.get('cidade')?.value;
    if (!this.cidades.some(c => c.nome === cidadeAtual)) {
      this.cnaeForm.get('cidade')?.setValue('');
    }
  }

  onCnaeChange() {
    const cnae = this.cnaeForm.get('cnae')?.value;
    if (cnae) {
      this.descricao = this.cnaeService.buscarDescricaoPorCnae(cnae) || 'Descrição não encontrada';
      this.cnaeForm.get('descricao')?.setValue(this.descricao);
    } else {
      this.descricao = '';
      this.cnaeForm.get('descricao')?.setValue('');
    }
  }


  clearCities() {
    this.cidades = [];
    this.cnaeForm.get('cidade')?.setValue('');
  }

  onCRTChange() {
    this.cnaeForm.get('crt')?.valueChanges.subscribe((crtValue) => {
      const values = this.getAliquotasByCRT(crtValue);
      this.cnaeForm.patchValue(values);
    });
  }

  getAliquotasByCRT(crt: string) {
    const aliquotas: Record<string, { aliquotapisSaida: number; aliquotacofinsSaida: number; aliquotaISS: number; csllRetido: number; irpj: number; csll: number; }> = {
      '1 – Simples Nacional': { aliquotapisSaida: 0, aliquotacofinsSaida: 0, aliquotaISS: 2.1, csllRetido: 0, irpj: 0, csll: 0 },
      '2 – Regime Normal: Lucro Presumido': { aliquotapisSaida: 0.65, aliquotacofinsSaida: 3.00, aliquotaISS: 5.00, csllRetido: 1.00, irpj: 4.80, csll: 1.88 },
      '3 – Regime Normal: Lucro Real': { aliquotapisSaida: 1.65, aliquotacofinsSaida: 7.6, aliquotaISS: 5.00, csllRetido: 1.00, irpj: 4.80, csll: 1.88 },
    };

    return aliquotas[crt] || { aliquotapisSaida: null, aliquotacofinsSaida: null, aliquotaISS: null, csllRetido: null, irpj: null, csll: null };
  }

  async descartar() {
    this.location.back();
  }

 async updateCNAE() {
    if (this.cnaeForm.valid) {
      try {
        await this.firestore.doc(`cnae/${this.cnaeID}`).update(this.cnaeForm.value);
        const alert = await this.alertController.create({
          header: 'Sucesso',
          message: 'CNAE atualizado com sucesso!',
          buttons: ['OK']
        });
        await alert.present();
        this.location.back();
      } catch (error) {
        const alert = await this.alertController.create({
          header: 'Erro',
          message: 'Ocorreu um erro ao atualizar os dados. Por favor, tente novamente.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } else {
      const alert = await this.alertController.create({
        header: 'Erro',
        message: 'Por favor, preencha todos os campos obrigatórios.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}
