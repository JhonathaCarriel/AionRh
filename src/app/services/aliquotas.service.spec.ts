import { TestBed } from '@angular/core/testing';

import { AliquotasService } from './aliquotas.service';

describe('AliquotasService', () => {
  let service: AliquotasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AliquotasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
