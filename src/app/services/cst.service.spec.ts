import { TestBed } from '@angular/core/testing';

import { CstService } from './cst.service';

describe('CstService', () => {
  let service: CstService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CstService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
