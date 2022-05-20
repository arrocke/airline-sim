export interface CityDemand {
  demand: number;
  id: number;
}

export interface City {
  maxPassengers: number;
  destinations: CityDemand[];
  name: string;
  lat: number;
  long: number;
  country: string;
  population: number;
  id: number;
}

export interface Route {
  source: number
  dest: number
}