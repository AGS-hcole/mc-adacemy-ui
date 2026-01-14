import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'environments/environment';
import { ResidenceApi } from './residence.api';
import { ManorDto, ResidenceStayDto } from '../models/residence.models';

describe('ResidenceApi', () => {
    let service: ResidenceApi;
    let httpMock: HttpTestingController;
    const apiUrl = environment.apiUrl;

    const mockManor: ManorDto = {
        id: '1',
        name: 'Test Manor',
        address: '123 Test St',
        city: 'Paris',
        capacity: 10,
        enforceCapacity: true,
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
    };

    const mockStay: ResidenceStayDto = {
        id: '1',
        date: '2025-01-15',
        status: 'PLANNED',
        overCapacity: false,
        manor: {
            id: '1',
            name: 'Test Manor',
            capacity: 10,
            enforceCapacity: true,
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ResidenceApi],
        });

        service = TestBed.inject(ResidenceApi);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('listManors', () => {
        it('should get manors with activeOnly=true', () => {
            service.listManors(true).subscribe((manors) => {
                expect(manors).toEqual([mockManor]);
                expect(manors.length).toBe(1);
            });

            const req = httpMock.expectOne(
                (request) =>
                    request.url === `${apiUrl}/residence/manors` &&
                    request.params.get('activeOnly') === 'true'
            );
            expect(req.request.method).toBe('GET');
            req.flush([mockManor]);
        });

        it('should get manors with activeOnly=false', () => {
            service.listManors(false).subscribe((manors) => {
                expect(manors).toEqual([mockManor]);
            });

            const req = httpMock.expectOne(
                (request) =>
                    request.url === `${apiUrl}/residence/manors` &&
                    request.params.get('activeOnly') === 'false'
            );
            expect(req.request.method).toBe('GET');
            req.flush([mockManor]);
        });
    });

    describe('createManor', () => {
        it('should create manor', () => {
            const dto: Partial<ManorDto> = {
                name: 'New Manor',
                capacity: 5,
                enforceCapacity: true,
                isActive: true,
            };

            service.createManor(dto).subscribe((manor) => {
                expect(manor).toEqual(mockManor);
            });

            const req = httpMock.expectOne(`${apiUrl}/residence/manors`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(dto);
            req.flush(mockManor);
        });
    });

    describe('updateManor', () => {
        it('should update manor', () => {
            const id = '1';
            const dto: Partial<ManorDto> = {
                name: 'Updated Manor',
            };

            service.updateManor(id, dto).subscribe((manor) => {
                expect(manor).toEqual(mockManor);
            });

            const req = httpMock.expectOne(`${apiUrl}/residence/manors/${id}`);
            expect(req.request.method).toBe('PATCH');
            expect(req.request.body).toEqual(dto);
            req.flush(mockManor);
        });
    });

    describe('deleteManor', () => {
        it('should delete manor', () => {
            const id = '1';

            service.deleteManor(id).subscribe();

            const req = httpMock.expectOne(`${apiUrl}/residence/manors/${id}`);
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    describe('getMyStays', () => {
        it('should get stays with date range', () => {
            const from = '2025-01-01';
            const to = '2025-01-31';

            service.getMyStays(from, to).subscribe((stays) => {
                expect(stays).toEqual([mockStay]);
            });

            const req = httpMock.expectOne(
                (request) =>
                    request.url === `${apiUrl}/residence/stays/me` &&
                    request.params.get('from') === from &&
                    request.params.get('to') === to
            );
            expect(req.request.method).toBe('GET');
            req.flush([mockStay]);
        });
    });

    describe('createStay', () => {
        it('should create stay', () => {
            const payload = { manorId: '1', date: '2025-01-15' };

            service.createStay(payload).subscribe();

            const req = httpMock.expectOne(`${apiUrl}/residence/stays`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(payload);
            req.flush(null);
        });
    });

    describe('cancelStay', () => {
        it('should cancel stay', () => {
            const payload = { manorId: '1', date: '2025-01-15' };

            service.cancelStay(payload).subscribe();

            const req = httpMock.expectOne(
                `${apiUrl}/residence/stays/cancel`
            );
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(payload);
            req.flush(null);
        });
    });
});
