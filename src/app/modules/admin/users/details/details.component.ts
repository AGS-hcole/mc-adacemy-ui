import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TextFieldModule } from '@angular/cdk/text-field';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@jsverse/transloco';
import { UserService } from 'app/core/user/user.service';
import { FormulaType, Role, User } from 'app/core/user/user.types';
import { LocalizedDatePipe } from 'app/shared/pipes/localized-date.pipe';
import { Subject, takeUntil } from 'rxjs';
import { UsersListComponent } from '../list/list.component';
import { UsersService } from '../users.service';

@Component({
    selector: 'users-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatButtonModule,
        MatTooltipModule,
        RouterLink,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        MatRippleModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatSelectModule,
        MatOptionModule,
        MatDatepickerModule,
        TextFieldModule,
        TranslocoModule,
        MatSlideToggleModule,
        LocalizedDatePipe,
    ],
})
export class UsersDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('rolesPanel') private _rolesPanel: TemplateRef<any>;
    @ViewChild('rolesPanelOrigin') private _rolesPanelOrigin: ElementRef;

    editMode: boolean = false;
    user: User;
    currentUser: User;
    userForm: UntypedFormGroup;
    users: User[];
    roles: Role[] = Object.values(Role);
    formulaTypes: FormulaType[] = Object.values(FormulaType);
    private _rolesPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // -----------------------------------------------------------------------------------------------------
    // @ Getters
    // -----------------------------------------------------------------------------------------------------

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _usersListComponent: UsersListComponent,
        private _usersService: UsersService,
        private _userService: UserService,
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Open the drawer
        this._usersListComponent.matDrawer.open();

        // Create the user form
        this.userForm = this._formBuilder.group({
            id: [{ value: '', disabled: true }],
            background: [null],
            avatar: [null],
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: [''],
            birthDate: [null],
            fftLicenseNumber: [''],
            role: [Role.user, Validators.required],
            formula: [null],
            privacyConsent: [false],
            photoConsent: [false],
            marketingConsent: [false],
            notifyEmail: [true],
            notifySMS: [false],
            notifyWhatsApp: [false],
        });

        // Get the users
        this._usersService.users$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((users: User[]) => {
                this.users = users;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the user
        this._usersService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                // Open the drawer in case it is closed
                this._usersListComponent.matDrawer.open();

                if (user) {
                    // Get the user
                    this.user = user;

                    // Patch values to the form with proper mapping for consent fields
                    const formData = {
                        ...user,
                        privacyConsent: !!user.privacyConsentAt,
                        photoConsent: !!user.photoConsentAt,
                        marketingConsent: !!user.marketingConsentAt,
                    };
                    this.userForm.patchValue(formData);

                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                } else {
                    this.editMode = true;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the current user
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((currentUser: User) => {
                this.currentUser = currentUser;
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        // Dispose the overlays if they are still on the DOM
        if (this._rolesPanelOverlayRef) {
            this._rolesPanelOverlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._usersListComponent.matDrawer.close();
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        } else {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Update the user
     */
    updateUser(): void {
        // Get the user object
        const user = this.userForm.getRawValue();

        const userRequest = {
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone || null,
            birthDate: user.birthDate || null,
            fftLicenseNumber: user.fftLicenseNumber || null,
            role: user.role,
            formula: user.formula || null,
        };

        // Update the user on the server
        this._usersService.updateUser(user.id, userRequest).subscribe(() => {
            // Toggle the edit mode off
            this.toggleEditMode(false);
        });
    }

    /**
     * Create the user
     */
    createUser(): void {
        // Get the user object
        const user = this.userForm.getRawValue();

        const userRequest = {
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone || null,
            birthDate: user.birthDate || null,
            fftLicenseNumber: user.fftLicenseNumber || null,
            role: user.role,
            formula: user.formula || null,
        };

        // Create the user on the server
        this._usersService.createUser(userRequest).subscribe((createdUser) => {
            // Navigate to the newly created user's details
            this._router.navigate(['../', createdUser.id], {
                relativeTo: this._activatedRoute,
            });

            // Toggle the edit mode off
            this.toggleEditMode(false);
        });
    }

    /**
     * Delete the user
     */
    deleteUser(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete user',
            message:
                'Are you sure you want to delete this user? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete',
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                // Get the current user's id
                const id = this.user.id;

                // Delete the user
                this._usersService.deleteUser(id).subscribe((isDeleted) => {
                    // Return if the user wasn't deleted...
                    if (!isDeleted) {
                        return;
                    }

                    // Navigate to the parent
                    else {
                        this._router.navigate(['../'], {
                            relativeTo: this._activatedRoute,
                        });
                    }

                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    /**
     * Upload avatar
     *
     * @param fileList
     */
    uploadAvatar(fileList: FileList): void {
        // Return if canceled
        if (!fileList.length) {
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png'];
        const file = fileList[0];

        // Return if the file is not allowed
        if (!allowedTypes.includes(file.type)) {
            return;
        }

        // Upload the avatar
        this._usersService.uploadAvatar(this.user, file).subscribe();
    }

    /**
     * Remove the avatar
     */
    removeAvatar(): void {
        // Get the form control for 'avatar'
        const avatarFormControl = this.userForm.get('avatar');

        // Set the avatar as null
        avatarFormControl.setValue(null);

        // Set the file input value as null
        this._avatarFileInput.nativeElement.value = null;

        // Update the user
        this.user.avatarData = null;
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
