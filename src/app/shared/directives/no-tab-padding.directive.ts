import {
    AfterViewInit,
    Directive,
    ElementRef,
    inject,
    Renderer2,
} from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';

@Directive({
    selector: '[no-tab-padding]',
    standalone: true,
})
export class NoTabPaddingDirective implements AfterViewInit {
    private el = inject(ElementRef);
    private renderer = inject(Renderer2);
    private tabGroup = inject(MatTabGroup);

    ngAfterViewInit(): void {
        // Initial padding removal
        this.removePadding();

        // Re-remove padding every time a tab changes
        this.tabGroup.selectedIndexChange.subscribe(() => {
            setTimeout(() => this.removePadding(), 0);
        });
    }

    private removePadding(): void {
        const containers = this.el.nativeElement.querySelectorAll(
            '.mat-mdc-tab-body-content'
        );

        containers.forEach((container: HTMLElement) => {
            this.renderer.setStyle(container, 'padding', '0px');
        });
    }
}
