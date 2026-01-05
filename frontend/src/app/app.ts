import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService, ShowService, SeatService, AuthService } from './services';
import { Movie, Show, Seat, User } from './models';
import { 
  LocationSelectorComponent, 
  MovieListComponent, 
  ShowSelectionComponent, 
  SeatLayoutComponent,
  AuthComponent 
} from './components';

type ViewState = 'auth' | 'location' | 'movies' | 'shows' | 'seats';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LocationSelectorComponent,
    MovieListComponent,
    ShowSelectionComponent,
    SeatLayoutComponent,
    AuthComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  // State management
  currentView: ViewState = 'auth';
  currentUser: User | null = null;

  // Data
  selectedLocation: string = '';
  movies: Movie[] = [];
  selectedMovie: Movie | null = null;
  shows: Show[] = [];
  selectedShow: Show | null = null;
  seats: Seat[] = [];

  // Loading states
  moviesLoading: boolean = false;
  showsLoading: boolean = false;
  seatsLoading: boolean = false;
  bookingInProgress: boolean = false;

  // Booking feedback
  bookingMessage: string = '';
  bookingSuccess: boolean = false;

  constructor(
    private movieService: MovieService,
    private showService: ShowService,
    private seatService: SeatService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.currentUser = this.authService.currentUser;
      this.currentView = 'location';
    }
  }

  // Auth success handler
  onAuthSuccess(user: User): void {
    this.currentUser = user;
    this.currentView = 'location';
  }

  // Logout handler
  logout(): void {
    this.authService.logout();
    this.currentUser = null;
    this.resetBooking();
    this.currentView = 'auth';
  }

  // Location selected handler
  onLocationSelected(location: string): void {
    this.selectedLocation = location;
    this.moviesLoading = true;
    this.movies = [];
    this.currentView = 'movies';

    this.movieService.getMoviesByLocation(location).subscribe({
      next: (data: Movie[]) => {
        this.movies = data;
        this.moviesLoading = false;
      },
      error: (err) => {
        console.error('Error fetching movies:', err);
        this.moviesLoading = false;
      }
    });
  }

  // Movie selected handler
  onMovieSelected(movie: Movie): void {
    this.selectedMovie = movie;
    this.showsLoading = true;
    this.shows = [];
    this.currentView = 'shows';

    this.showService.getShowsByMovie(movie.id).subscribe({
      next: (data: Show[]) => {
        console.log('Shows received:', data);
        this.shows = [...data];
        this.showsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching shows:', err);
        this.showsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Show selected handler
  onShowSelected(show: Show): void {
    this.selectedShow = show;
    this.seatsLoading = true;
    this.seats = [];
    this.bookingMessage = '';
    this.currentView = 'seats';

    this.loadSeats(show.id);
  }

  // Load seats for a show
  loadSeats(showId: number): void {
    this.seatService.getSeatsByShow(showId).subscribe({
      next: (data: Seat[]) => {
        console.log('Seats received:', data);
        this.seats = [...data];
        this.seatsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching seats:', err);
        this.seatsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Seat selected and book handler
  onSeatSelected(seat: Seat): void {
    if (seat.isBooked || this.bookingInProgress) return;

    this.bookingInProgress = true;
    this.bookingMessage = '';

    this.seatService.bookSeat(seat.id).subscribe({
      next: () => {
        this.bookingMessage = seat.seatNumber;
        this.bookingSuccess = true;
        this.bookingInProgress = false;
        
        // Refresh seats after booking
        if (this.selectedShow) {
          this.loadSeats(this.selectedShow.id);
        }
      },
      error: (err) => {
        console.error('Error booking seat:', err);
        this.bookingMessage = 'Failed to book seat. Please try again.';
        this.bookingSuccess = false;
        this.bookingInProgress = false;
      }
    });
  }

  // Navigation handlers
  goBackToMovies(): void {
    this.currentView = 'movies';
    this.selectedMovie = null;
    this.shows = [];
  }

  goBackToShows(): void {
    this.currentView = 'shows';
    this.selectedShow = null;
    this.seats = [];
    this.bookingMessage = '';
  }

  // Wrong booking handler
  onWrongBooking(seatNumber: string): void {
    this.bookingMessage = `Booking for seat ${seatNumber} reported as wrong. Please contact support.`;
    this.bookingSuccess = false;
  }

  // Reset to start
  resetBooking(): void {
    this.currentView = 'location';
    this.selectedLocation = '';
    this.movies = [];
    this.selectedMovie = null;
    this.shows = [];
    this.selectedShow = null;
    this.seats = [];
    this.bookingMessage = '';
  }
}
