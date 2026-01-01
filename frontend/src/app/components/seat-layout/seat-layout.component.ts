import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Seat, Show, Movie } from '../../models';

interface SeatRow {
  row: string;
  seats: Seat[];
}

@Component({
  selector: 'app-seat-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-layout.component.html',
  styleUrl: './seat-layout.component.css'
})
export class SeatLayoutComponent implements OnChanges {
  @Input() seats: Seat[] = [];
  @Input() selectedShow: Show | null = null;
  @Input() selectedMovie: Movie | null = null;
  @Input() loading: boolean = false;
  @Input() bookingInProgress: boolean = false;
  @Input() bookingMessage: string = '';
  @Input() bookingSuccess: boolean = false;

  @Output() seatSelected = new EventEmitter<Seat>();
  @Output() goBack = new EventEmitter<void>();

  selectedSeat: Seat | null = null;
  seatRows: SeatRow[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seats'] && this.seats.length > 0) {
      this.organizeSeatsByRow();
    }
  }

  organizeSeatsByRow(): void {
    // Group seats by their row letter (first character)
    const rowMap = new Map<string, Seat[]>();
    
    // Only include seats with valid format (letter + number)
    const validSeats = this.seats.filter(seat => /^[A-D]\d+$/i.test(seat.seatNumber));
    
    // If no valid A-D seats, show all seats in a grid
    if (validSeats.length === 0) {
      // Organize all seats into rows of 10
      const allSeats = [...this.seats].sort((a, b) => a.id - b.id);
      const rows = ['A', 'B', 'C', 'D'];
      let seatIndex = 0;
      
      for (const row of rows) {
        const rowSeats: Seat[] = [];
        for (let i = 0; i < 10 && seatIndex < allSeats.length; i++, seatIndex++) {
          rowSeats.push({
            ...allSeats[seatIndex],
            seatNumber: `${row}${i + 1}` // Reassign friendly seat numbers for display
          });
        }
        if (rowSeats.length > 0) {
          rowMap.set(row, rowSeats);
        }
      }
    } else {
      // Use proper seat numbers
      for (const seat of validSeats) {
        const row = seat.seatNumber.charAt(0).toUpperCase();
        if (!rowMap.has(row)) {
          rowMap.set(row, []);
        }
        rowMap.get(row)!.push(seat);
      }
    }

    // Sort rows and seats within rows
    this.seatRows = Array.from(rowMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([row, seats]) => ({
        row,
        seats: seats.sort((a, b) => {
          const numA = parseInt(a.seatNumber.slice(1)) || 0;
          const numB = parseInt(b.seatNumber.slice(1)) || 0;
          return numA - numB;
        })
      }));
  }

  onSeatClick(seat: Seat): void {
    if (seat.isBooked || this.bookingInProgress) return;
    
    this.selectedSeat = seat;
    this.seatSelected.emit(seat);
  }

  onBackClick(): void {
    this.selectedSeat = null;
    this.goBack.emit();
  }

  getSeatClass(seat: Seat): string {
    if (seat.isBooked) return 'seat booked';
    if (this.selectedSeat && this.selectedSeat.id === seat.id) return 'seat selected';
    return 'seat available';
  }

  isSeatClickable(seat: Seat): boolean {
    return !seat.isBooked && !this.bookingInProgress;
  }

  getSeatDisplayNumber(seat: Seat): string {
    // Extract just the number part for display
    const match = seat.seatNumber.match(/\d+/);
    return match ? match[0] : seat.seatNumber;
  }

  formatDateTime(dateTimeStr: string): string {
    const dateTime = new Date(dateTimeStr);
    return dateTime.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}
