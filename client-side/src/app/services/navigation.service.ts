import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { config } from '../components/addon.config';

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private history: string[] = []

    private _addonUUID = '';
    get addonUUID(): string {
        return this._addonUUID;
    }

    private _devServer = false;
    get devServer(): boolean {
        return this._devServer;
    }

    constructor(
        private router: Router,
        public route: ActivatedRoute
    ) {
        // Get the addonUUID from the root config.
        this._addonUUID = config.AddonUUID;
        this._devServer = this.route.snapshot.queryParamMap.get('devServer') === 'true';
        
        this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
            this.history.push(event.urlAfterRedirects);
        });
    }

    back(route: ActivatedRoute): void {
        this.history.pop();
        
        if (this.history.length > 0) {
            this.history.pop();
        }
        
        const extra = { state: { showSidebar: true} };
        this.router.navigate(['../'], {
            relativeTo: route,
            queryParamsHandling: 'merge',
            state: extra.state
        });
    }

    navigateToSurvey(route: ActivatedRoute, surveyKey: string) {
        // this.router.navigate([`${surveyKey}`], {breadcrumbs: 'New Event'})
        // this.route.snapshot.children
        // this.activatedRoute.firstChild.snapshot.data
        this.router.navigate([`${surveyKey}`], {
            relativeTo: route,
            queryParamsHandling: 'merge',
            state: { showSidebar: false, addPadding: false}
        });
    }
}
