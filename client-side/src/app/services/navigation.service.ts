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
        private route: ActivatedRoute
    ) {
        // Get the addonUUID from the root config.
        this._addonUUID = config.AddonUUID;
        this._devServer = this.route.snapshot.queryParamMap.get('devServer') === 'true';
        
        this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
            this.history.push(event.urlAfterRedirects);
        });
    }

    back(): void {
        this.history.pop();
        if (this.history.length > 0) {
            this.router.navigateByUrl(this.history.pop());
        } else {
            this.router.navigate([`./settings_block/Surveys`], {
                relativeTo: this.route,
                queryParamsHandling: 'merge'
            });
        }
    }

    navigateToSurvey(surveyKey: string){
        this.router.navigate([`./block/Surveys/${surveyKey}`], {
            relativeTo: this.route,
            queryParamsHandling: 'merge'
        });
    }
}
