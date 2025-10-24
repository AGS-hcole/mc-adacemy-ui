import { Routes } from '@angular/router';
import { PublicEventsPageComponent } from './public-events-page.component';
import { publicEventsResolver } from './public-events.resolver';

export default [
    {
        path: '',
        component: PublicEventsPageComponent,
        resolve: {
            events: publicEventsResolver,
        },
    },
] as Routes;
