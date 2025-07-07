import { TestBed } from '@angular/core/testing';

import { ListaNcmService } from './lista-ncm.service';

describe('ListaNcmService', () => {
  let service: ListaNcmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListaNcmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
