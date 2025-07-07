import { TestBed } from '@angular/core/testing';

import { FirebaseNCMService } from './firebase-ncm.service';

describe('FirebaseNCMService', () => {
  let service: FirebaseNCMService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseNCMService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
