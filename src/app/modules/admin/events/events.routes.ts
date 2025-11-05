import { Routes } from '@angular/router';
import {
    adminEventByIdResolver,
    adminEventsResolver,
} from './events.resolvers';
import { AdminEventFormComponent } from './form/form.component';
import { AdminEventsListComponent } from './list/list.component';

export default [
    {
        path: '',
        component: AdminEventsListComponent,
        resolve: {
            events: adminEventsResolver,
        },
    },
    {
        path: 'new',
        component: AdminEventFormComponent,
    },
    {
        path: ':id',
        component: AdminEventFormComponent,
        resolve: {
            event: adminEventByIdResolver,
        },
    },
] as Routes;
