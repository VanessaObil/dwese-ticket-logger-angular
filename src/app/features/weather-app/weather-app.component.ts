import { Component, OnInit } from '@angular/core';

import { WeatherService } from '../../services/weather.service';

@Component({

selector: 'app-weather',

templateUrl: './weather-app.component.html',

styleUrls: ['./weather-app.component.css']

})

export class WeatherComponent implements OnInit {

weatherInformation: any;

constructor(private weatherService: WeatherService) {}

ngOnInit(): void {

this.weatherService.loadWeather().subscribe(data => {

this.weatherInformation = data;

});

}

}
