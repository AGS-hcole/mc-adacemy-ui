import { AsyncPipe, DatePipe, NgForOf, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@jsverse/transloco';
import { Session } from 'app/core/session/session.types';
import { SessionsService } from 'app/core/session/sessions.service';
import { User } from 'app/core/user/user.types';
import { UsersService } from 'app/modules/admin/users/users.service';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'session-attendees',
    templateUrl: './attendees.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        AsyncPipe,
        DatePipe,
        NgIf,
        NgForOf,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        MatOptionModule,
        MatTooltipModule,
        TranslocoModule,
    ],
})
export class SessionAttendeesComponent implements OnInit, OnDestroy {
    session: Session;
    users$: Observable<User[]>;
    selectedUserId: string | null = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { session: Session },
        private _dialogRef: MatDialogRef<SessionAttendeesComponent>,
        private _sessionsService: SessionsService,
        private _usersService: UsersService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService
    ) {
        this.session = data.session;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get users
        this.users$ = this._usersService.users$;

        // Load users
        this._usersService.getUsers().subscribe();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close dialog
     */
    close(): void {
        this._dialogRef.close();
    }

    /**
     * Add participant
     */
    addParticipant(): void {
        if (!this.selectedUserId) {
            return;
        }

        this._sessionsService
            .adminRegisterUser({
                sessionId: this.session.id,
                userId: this.selectedUserId,
            })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((updatedSession) => {
                this.session = updatedSession;
                this.selectedUserId = null;
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Remove participant
     */
    removeParticipant(attendanceId: string): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Retirer le participant',
            message: 'Êtes-vous sûr de vouloir retirer ce participant ?',
            actions: {
                confirm: {
                    label: 'Retirer',
                },
            },
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._sessionsService
                    .adminRemoveAttendee(this.session.id, attendanceId)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((updatedSession) => {
                        this.session = updatedSession;
                        this._changeDetectorRef.markForCheck();
                    });
            }
        });
    }

    /**
     * Check if user is already registered
     */
    isUserRegistered(userId: string): boolean {
        if (!this.session.attendances) {
            return false;
        }
        return this.session.attendances.some(
            (attendance) => attendance.userId === userId
        );
    }

    /**
     * Get available users (not yet registered)
     */
    getAvailableUsers(users: User[]): User[] {
        if (!users) {
            return [];
        }
        return users.filter((user) => !this.isUserRegistered(user.id));
    }
}
