import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(private http: HttpClient) {}

  loadWeather(): Observable<any> {

  return this.http.get("https://api.openweathermap.org/data/2.5/weather?lat=27.9506&lon=-82.4572&appid=8e35404ab06e60f786d9a93e2c9a3877");

  }

  }
