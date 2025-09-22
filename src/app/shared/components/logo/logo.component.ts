import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SvgService } from 'app/shared/services/svg.service';

@Component({
    selector: 'app-logo',
    template: `<div
        [innerHTML]="safeSvgContent"
        [ngClass]="customClass"
    ></div>`,
    imports: [NgClass],
})
export class LogoComponent implements OnInit {
    @Input() customClass: string = 'text-primary';
    @Input() svgUrl: string = 'assets/logo.svg';
    safeSvgContent: SafeHtml | null = null;

    constructor(
        private svgService: SvgService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _domSanitizer: DomSanitizer
    ) {}

    ngOnInit(): void {
        const currentHost = window.location.origin;
        const fullSvgUrl = `${currentHost}/${this.svgUrl}`;
        this.svgService.loadSvg(fullSvgUrl).subscribe((content) => {
            this.safeSvgContent =
                this._domSanitizer.bypassSecurityTrustHtml(content);

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }
}
