import { TestBed } from '@angular/core/testing';

import { BuscarNcmService } from './buscar-ncm.service';

describe('BuscarNcmService', () => {
  let service: BuscarNcmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuscarNcmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
