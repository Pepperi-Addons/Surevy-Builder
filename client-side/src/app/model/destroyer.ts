import { Directive, OnDestroy } from '@angular/core';
import { MonoTypeOperatorFunction, Subject, takeUntil } from 'rxjs';


@Directive({})
export abstract class DestoyerDirective implements OnDestroy {
    private readonly _destroy$: Subject<void> = new Subject();

    protected get destroy$(): MonoTypeOperatorFunction<any> {
        return takeUntil(this._destroy$);
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}