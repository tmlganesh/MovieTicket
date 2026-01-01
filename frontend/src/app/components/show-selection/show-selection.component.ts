import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Show, Movie } from '../../models';

@Component({
  selector: 'app-show-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-selection.component.html',
  styleUrl: './show-selection.component.css'
})
export class ShowSelectionComponent {
  @Input() shows: Show[] = [];
  @Input() selectedMovie: Movie | null = null;
  @Input() loading: boolean = false;

  @Output() showSelected = new EventEmitter<Show>();
  @Output() goBack = new EventEmitter<void>();

  onShowClick(show: Show): void {
    this.showSelected.emit(show);
  }

  onBackClick(): void {
    this.goBack.emit();
  }

  formatDateTime(dateTimeStr: string): { date: string; time: string } {
    const dateTime = new Date(dateTimeStr);
    const date = dateTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const time = dateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return { date, time };
  }
}
