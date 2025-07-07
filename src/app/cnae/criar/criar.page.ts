import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http'; // Adicione esta importação
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { AliquotasService } from 'src/app/services/aliquotas.service';
import { CnaeService } from 'src/app/services/cnae.service';
import { CstService } from 'src/app/services/cst.service';
export interface EstadoAliquota {
  sigla: string;
  nome: string;
}
export interface Cidades {
  nome: string;
}

@Component({
  selector: 'app-criar',
  templateUrl: './criar.page.html',
  styleUrls: ['./criar.page.scss'],
})
export class CriarPage implements OnInit {
pageTitle: string = 'Cadastro de CNAE';

cestsDisponiveis: string[] = [];
descricao: string | null = null;
estados: EstadoAliquota[] = [];
cidades: Cidades[] = [];
cnaeForm: FormGroup;

  constructor(
    public location: Location,
    public cstService: CstService,
    public alertController: AlertController,
    private formBuilder: FormBuilder,
    private CnaeService: CnaeService,
    private http: HttpClient,
    private firestore: AngularFirestore,
    private aliquotasService: AliquotasService,
  ) {
    this.cnaeForm = this.formBuilder.group({
      crt: ['2 – Regime Normal: Lucro Presumido'], // Valor inicial vazio
      uf: [''], // Valor inicial vazio
      cidade: [''], // Valor inicial vazio
      cnae: [''], // Valor inicial vazio
      descricao: [''], // Valor inicial vazio
      aliquotapisSaida: [null], // Para números, usa-se null como inicial
      aliquotacofinsSaida: [null], // Para números, usa-se null como inicial
      aliquotaISS: [''], // Valor inicial vazio
      csllRetido: [null], // Para números, usa-se null como inicial
      irpj: [null], // Para números, usa-se null como inicial
      csll: [null], // Para números, usa-se null como inicial
    });

  }
  ngOnInit() {
    this.carregarEstados();
    this.onEstadoChange();
    this.onCRTChange();
  }


async salvarCNAE(){
  console.log('Tentando enviar dados do formulário...');
  await this.cnaeForm.markAllAsTouched()
  if (this.cnaeForm.valid) {
    console.log('Formulário válido, enviando dados...');
    const formData = this.cnaeForm.value;
    try {
      await this.firestore.collection('cnae').add(formData);
      console.log('Dados salvos com sucesso!');
      const alert = await this.alertController.create({
        header: 'Sucesso',
        message: 'CNAE cadastrado com sucesso!',
        buttons: ['OK']
      });
      await alert.present();
      this.location.back();
    } catch (error) {
      console.error('Erro ao salvar os dados:', error);
      const alert = await this.alertController.create({
        header: 'Erro',
        message: 'Ocorreu um erro ao salvar os dados. Por favor, tente novamente.',
        buttons: ['OK']
      });

      await alert.present();
    }
  } else {
    console.log('Formulário inválido, não é possível enviar dados.');
    const alert = await this.alertController.create({
      header: 'Erro',
      message: 'Por favor, preencha todos os campos obrigatórios.',
      buttons: ['OK']
    });
    await alert.present();
  }
}

async descartar() {
  this.location.back()
}


async presentSuccessAlert() {
  const alert = await this.alertController.create({
    header: 'Sucesso!',
    message: 'CNAE cadastrado com sucesso.',
    buttons: ['OK']
  });
  await alert.present();
}

async presentErrorAlert(message: string) {
  const alert = await this.alertController.create({
    header: 'Erro!',
    message: message,
    buttons: ['OK']
  });
  await alert.present();
}

  onCnaeChange() {
    const cnae = this.cnaeForm.get('cnae')?.value;
    if (cnae) {
      const descricao = this.CnaeService.buscarDescricaoPorCnae(cnae);
      this.descricao = descricao || 'Descrição não encontrada';
      this.cnaeForm.get('descricao')?.setValue(this.descricao);
    } else {
      this.descricao = '';
      this.cnaeForm.get('descricao')?.setValue('');
    }
  }

  carregarEstados() {
    this.estados = this.aliquotasService.getAllEstados();
  }

  onEstadoChange() {
    const uf = this.cnaeForm.get('uf')?.value;
    if (!uf) {
      this.cidades = [];
      return;
    }

    const apiUrl = `https://brasilapi.com.br/api/ibge/municipios/v1/${uf}?providers=dados-abertos-br,gov,wikipedia`;

    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Verifica se a resposta contém dados válidos
          this.cidades = data.map((cidade) => ({ nome: cidade.nome || 'Nome não disponível' }));
        } else {
          console.warn('Nenhuma cidade encontrada ou estrutura inválida:', data);
          this.cidades = [];
        }
      },
      error: (error) => {
        console.error('Erro ao buscar cidades:', error);
        this.cidades = [];
      }
    });
  }
  onCRTChange() {
    this.cnaeForm.get('crt')?.valueChanges.subscribe((crtValue) => {
      switch (crtValue) {
        case '1 – Simples Nacional':
          this.cnaeForm.patchValue({
            aliquotapisSaida: 0,
            aliquotacofinsSaida: 0,
            aliquotaISS: 2.1,
            csllRetido: 0,
            irpj: 0,
            csll: 0,
          });
          break;

        case '2 – Regime Normal: Lucro Presumido':
          this.cnaeForm.patchValue({
            aliquotapisSaida: 0.65,
            aliquotacofinsSaida: 3.00,
            aliquotaISS: 5.00,
            csllRetido: 1.00,
            irpj: 4.80,
            csll: 1.88,
          });
          break;

        case '3 – Regime Normal: Lucro Real':
          this.cnaeForm.patchValue({
            aliquotapisSaida: 1.65,
            aliquotacofinsSaida: 7.6,
            aliquotaISS: 5.00,
            csllRetido: 1.00,
            irpj: 4.80,
            csll: 1.88,
          });
          break;

        default:
          // Caso o valor não seja reconhecido, opcionalmente, limpar os valores do formulário
          this.cnaeForm.patchValue({
            aliquotapisSaida: null,
            aliquotacofinsSaida: null,
            aliquotaISS: null,
            csllRetido: null,
            irpj: null,
            csll: null,
          });
          break;
      }
    });
  }


}
