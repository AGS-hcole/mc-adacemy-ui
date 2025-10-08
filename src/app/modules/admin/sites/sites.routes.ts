import { Routes } from '@angular/router';
import { AdminSiteDetailsComponent } from './details/details.component';
import { AdminSitesListComponent } from './list/list.component';

export default [
    {
        path: '',
        component: AdminSitesListComponent,
    },
    {
        path: ':id',
        component: AdminSiteDetailsComponent,
    },
] as Routes;
