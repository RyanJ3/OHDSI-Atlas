import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import * as UIActions from './ui.actions';

@Injectable()
export class UIEffects {
  private actions$ = inject(Actions);
  private title = inject(Title);

  setPageTitle$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UIActions.setPageTitle),
        tap((action) => {
          const pageTitle = action.title ? `${action.title} - ATLAS` : 'ATLAS';
          this.title.setTitle(pageTitle);
        })
      ),
    { dispatch: false }
  );
}
