import { importProvidersFrom, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AliquotasService } from 'src/app/services/aliquotas.service';

@Injectable({
  providedIn: 'root',
})
export class AtualizarCamposService {
  constructor(private aliquotasService: AliquotasService) {}

  // Verifica se o produto é importado
  private isProdutoImportado(simuladorForm: FormGroup): boolean {
    return simuladorForm.get('produtoImportado')?.value === 'Sim';
  }

  // Seta o valor de um campo se ele estiver definido, senão limpa e exibe erro
  private setValueIfDefined(form: FormGroup, field: string, value: any): void {
    if (value != null) {
      form.get(field)?.setValue(value);
    } else {
      form.get(field)?.setValue('');
      console.error(`Valor indefinido para o campo "${field}".`);
    }
  }

// Atualiza alíquotas do Fornecedor
atualizarAliquotaFornecedor(form: FormGroup): void {
  const ufFornecedor = form.get('ufFornecedor')?.value;
    const ufDistribuidor = form.get('ufDistribuidor')?.value;
    const ufVarejista = form.get('ufVarejista')?.value;
    const produtoImportado = form.get('produtoImportado')?.value;

  const aliquotaInterna = this.aliquotasService.getAliquotaInternaFornecedor(ufFornecedor);
  this.setValueIfDefined(form, 'aliquotaInternaFornecedor', aliquotaInterna);

  const aliquotaInterestadual = this.aliquotasService.getAliquotaInterestadualFornecedor(ufFornecedor);
  this.setValueIfDefined(form, 'aliquotaInterestadualFornecedor', aliquotaInterestadual);

  if(ufDistribuidor === ufFornecedor) {
    this.setValueIfDefined(form, 'aliquotaInterestadualFornecedor', aliquotaInterestadual);
  }

  if(produtoImportado ==='Sim' && ufDistribuidor !== ufFornecedor) {
   const getAliquotaInterestadualFornecedorImportado = this.aliquotasService.getAliquotaInterestadualFornecedorImportado(ufFornecedor);
    this.setValueIfDefined(form, 'aliquotaInterestadualFornecedor', getAliquotaInterestadualFornecedorImportado);
  }

}

  // Atualiza alíquotas do Distribuidor
  atualizarAliquotaDistribuidor(form: FormGroup): void {
    const ufFornecedor = form.get('ufFornecedor')?.value;
    const ufDistribuidor = form.get('ufDistribuidor')?.value;
    const ufVarejista = form.get('ufVarejista')?.value;
    const produtoImportado = form.get('produtoImportado')?.value;

    if (!ufDistribuidor) {
      console.error('UF do Distribuidor ausente.');
      return;
    }

    // Alíquota interna do distribuidor
    const aliquotaInternaDistribuidor = this.aliquotasService.getAliquotaInternaDistribuidor(ufDistribuidor);
    this.setValueIfDefined(form, 'aliquotaInternaDistribuidor', aliquotaInternaDistribuidor);

    // Alíquota interestadual do distribuidor
    const aliquotaInterestadualDistribuidor = this.aliquotasService.getAliquotaInterestadualDistribuidor(ufDistribuidor);
    this.setValueIfDefined(form, 'aliquotaInterestadualDistribuidor', aliquotaInterestadualDistribuidor);

    // Caso UF do distribuidor seja igual à do fornecedor, usa a alíquota interna do fornecedor
    if (ufDistribuidor === ufFornecedor) {
      const aliquotaInternaFornecedor = this.aliquotasService.getAliquotaInternaFornecedor(ufFornecedor);
      this.setValueIfDefined(form, 'aliquotaInterestadualFornecedor', aliquotaInternaFornecedor);
    }

    // Se o produto for importado e o distribuidor for de outro estado, aplica alíquota interestadual de 4%
    if (produtoImportado === 'Sim' && ufDistribuidor !== ufVarejista ) {
      this.setValueIfDefined(form, 'aliquotaInterestadualDistribuidor', 4);
    }

    if(ufDistribuidor !== ufFornecedor) {
      const aliquotaInterestadual = this.aliquotasService.getAliquotaInterestadualFornecedor(ufFornecedor);
      this.setValueIfDefined(form, 'aliquotaInterestadualFornecedor', aliquotaInterestadual);
    }

  }


  // Atualiza alíquota interna do Varejista
  atualizarAliquotaVarejista(form: FormGroup): void {
    const ufFornecedor = form.get('ufFornecedor')?.value;
    const ufDistribuidor = form.get('ufDistribuidor')?.value;
    const ufVarejista = form.get('ufVarejista')?.value;
    const produtoImportado = form.get('produtoImportado')?.value;

    const aliquota = this.aliquotasService.getAliquotaInternaVarejista(ufVarejista);
    this.setValueIfDefined(form, 'aliquotaInternaVarejista', aliquota);

    if(ufDistribuidor !== ufVarejista) {
      const aliquotaInterestadualDistribuidor = this.aliquotasService.getAliquotaInterestadualDistribuidor(ufDistribuidor);
      this.setValueIfDefined(form, 'aliquotaInterestadualDistribuidor', aliquotaInterestadualDistribuidor);
    }
    if (ufVarejista === ufDistribuidor) {
      const aliquotaInternaDistribuidor = this.aliquotasService.getAliquotaInternaDistribuidor(ufDistribuidor);
      this.setValueIfDefined(form, 'aliquotaInterestadualDistribuidor', aliquotaInternaDistribuidor);
    }

  }

  // Atualiza alíquota interna do Cliente final
  atualizarAliquotaCliente(form: FormGroup): void {
    const ufCliente = form.get('ufCliente')?.value;

    if (!ufCliente) {
      console.error('UF do Cliente ausente.');
      return;
    }

    const aliquota = this.aliquotasService.getAliquotaInternaCliente(ufCliente);
    this.setValueIfDefined(form, 'aliquotaInternaCliente', aliquota);
  }
}
