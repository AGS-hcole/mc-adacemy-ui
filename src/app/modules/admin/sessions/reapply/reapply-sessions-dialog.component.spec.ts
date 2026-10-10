import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { SessionsService } from 'app/core/session/sessions.service';
import { Subject } from 'rxjs';
import { ReapplySessionsDialogComponent } from './reapply-sessions-dialog.component';

describe('ReapplySessionsDialogComponent', () => {
    let component: ReapplySessionsDialogComponent;
    let response: Subject<any>;
    let service: jasmine.SpyObj<SessionsService>;
    let dialog: { disableClose: boolean };

    beforeEach(() => {
        response = new Subject();
        service = jasmine.createSpyObj('SessionsService', [
            'reapplyParticipants',
        ]);
        service.reapplyParticipants.and.returnValue(response);
        dialog = { disableClose: false };
        TestBed.configureTestingModule({
            providers: [
                { provide: SessionsService, useValue: service },
                { provide: MatDialogRef, useValue: dialog },
            ],
        });
        component = TestBed.runInInjectionContext(
            () => new ReapplySessionsDialogComponent()
        );
    });

    it('rejects missing, impossible and reversed dates', () => {
        for (const [startDate, endDate] of [
            ['', ''],
            ['2026-02-30', '2026-03-01'],
            ['2026-10-18', '2026-10-12'],
        ]) {
            component.form.setValue({ startDate, endDate });
            component.submit();
        }
        expect(service.reapplyParticipants).not.toHaveBeenCalled();
    });

    it('sends an inclusive same-day range and prevents duplicate requests', () => {
        component.form.setValue({
            startDate: '2026-10-12',
            endDate: '2026-10-12',
        });
        component.submit();
        component.submit();
        expect(service.reapplyParticipants).toHaveBeenCalledOnceWith({
            startDate: '2026-10-12',
            endDate: '2026-10-12',
        });
        expect(dialog.disableClose).toBeTrue();
        response.next({ groups: 2, candidates: 12, created: 0 });
        expect(component.result).toEqual({
            groups: 2,
            candidates: 12,
            created: 0,
        });
        expect(component.changed).toBeTrue();
        expect(dialog.disableClose).toBeFalse();
        component.submit();
        expect(service.reapplyParticipants).toHaveBeenCalledTimes(1);
    });

    it('shows API validation errors and permits retry', () => {
        component.form.setValue({
            startDate: '2026-10-12',
            endDate: '2026-10-18',
        });
        component.submit();
        response.error(
            new HttpErrorResponse({
                status: 400,
                error: { message: ['Invalid range', 'Invalid date'] },
            })
        );
        expect(component.failed).toBeTrue();
        expect(component.errorDetails).toBe('Invalid range\nInvalid date');
        expect(component.form.enabled).toBeTrue();
        expect(component.pending).toBeFalse();
        expect(dialog.disableClose).toBeFalse();
    });
});
