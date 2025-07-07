import { TestBed } from '@angular/core/testing';

import { CnaeService } from './cnae.service';

describe('CnaeService', () => {
  let service: CnaeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CnaeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
