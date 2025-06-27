import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  anhhientai = 0;
  anhne =5

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.autoPlay();
    
    // Check for fragment to scroll to booking section
    this.activatedRoute.fragment.subscribe(fragment => {
      if (fragment === 'booking-section') {
        setTimeout(() => {
          this.scrollToBookingSection();
        }, 500); // Wait a bit for component to load
      }
    });
  }

  autoPlay() {
    setInterval(() => {
      this.nextSlide();
    },5000)
  }

  nextSlide() {
    this.anhhientai = (this.anhhientai+1) % this.anhne;
  }

  scrollToBookingSection() {
    const element = document.getElementById('booking-section');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }
}
