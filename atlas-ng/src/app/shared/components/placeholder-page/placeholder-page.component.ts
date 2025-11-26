import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { setPageTitle } from '../../../core/store';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './placeholder-page.component.html',
  styleUrl: './placeholder-page.component.scss',
})
export class PlaceholderPageComponent implements OnInit {
  title = 'Page';
  icon = 'fa-cog';

  private store = inject(Store);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const data = this.route.snapshot.data;
    this.title = data['title'] || 'Page';
    this.icon = data['icon'] || 'fa-cog';
    this.store.dispatch(setPageTitle({ title: this.title }));
  }
}
