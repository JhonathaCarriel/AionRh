import { TestBed } from '@angular/core/testing';

import { AtualizarCamposService } from './atualizar-campos.service';

describe('AtualizarCamposService', () => {
  let service: AtualizarCamposService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AtualizarCamposService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
