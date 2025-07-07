import { TestBed } from '@angular/core/testing';

import { CestService } from './cest.service';

describe('CestService', () => {
  let service: CestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
