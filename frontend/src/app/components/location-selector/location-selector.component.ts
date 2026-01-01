import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-location-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location-selector.component.html',
  styleUrl: './location-selector.component.css'
})
export class LocationSelectorComponent {
  locations: string[] = ['Hyderabad', 'Bangalore', 'Chennai', 'Delhi', 'Mumbai'];
  
  @Input() selectedLocation: string = '';
  @Output() locationSelected = new EventEmitter<string>();

  onLocationChange(): void {
    if (this.selectedLocation) {
      this.locationSelected.emit(this.selectedLocation);
    }
  }
}
