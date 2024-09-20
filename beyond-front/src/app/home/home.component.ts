import { Component, OnInit } from '@angular/core';
import { CountryDetails } from '../types/details.type';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  countries: CountryDetails[] = [
    {
      name: 'UAE',
      ind: 0,
      subInd: [7, 8],
    },
    {
      name: 'KSA',
      ind: 1,
    },
    {
      name: 'Oman',
      ind: 2,
    },
    {
      name: 'KUW',
      ind: 3,
    },
    {
      name: 'Columbia',
      ind: 4,
    },
    { name: 'Mexico', ind: 5 },
    {
      name: 'Chile',
      ind: 6,
    },
  ];

  constructor() {}

  ngOnInit(): void {  }
}
