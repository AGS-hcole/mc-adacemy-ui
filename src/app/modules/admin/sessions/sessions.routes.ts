import { Routes } from '@angular/router';
import { AdminSessionDetailsComponent } from './details/details.component';
import { AdminSessionsListComponent } from './list/list.component';

export default [
    {
        path: '',
        component: AdminSessionsListComponent,
    },
    {
        path: ':id',
        component: AdminSessionDetailsComponent,
    },
] as Routes;
