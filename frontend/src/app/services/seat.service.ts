import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Seat } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SeatService {
  private apiUrl = 'http://localhost:5199/api/seats';

  constructor(private http: HttpClient) {}

  getSeatsByShow(showId: number): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${this.apiUrl}/show/${showId}`);
  }

  bookSeat(seatId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/book/${seatId}`, {});
  }
}
