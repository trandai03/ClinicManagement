import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  anhhientai = 0;
  anhne =5

  ngOnInit() {
    this.autoPlay();
  }

  autoPlay() {
    setInterval(() => {
      this.nextSlide();
    },5000)
  }

  nextSlide() {
    this.anhhientai = (this.anhhientai+1) % this.anhne;
  }
}
