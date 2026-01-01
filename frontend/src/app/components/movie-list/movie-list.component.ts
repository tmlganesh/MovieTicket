import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movie } from '../../models';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.css'
})
export class MovieListComponent {
  @Input() movies: Movie[] = [];
  @Input() selectedLocation: string = '';
  @Input() loading: boolean = false;

  @Output() movieSelected = new EventEmitter<Movie>();

  onMovieClick(movie: Movie): void {
    this.movieSelected.emit(movie);
  }
}
