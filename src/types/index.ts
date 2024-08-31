
export interface FitJson {
  fileName: string,
  timestamp: string
}

export interface FitnessInfo {
  polyline: string,
  timestamp: string;
  startTime: string;
  totalDistance: number;
  totalMovingTime: number;
  avgSpeed: number;
  maxSpeed: number;
  avgPower: number;
  totalAscent: number;
  totalDescent: number;
  avgAltitude: number;
  sport: string;
  avgHeartRate: number;
  avgCadence: number;
}


export type ChartType = keyof FitnessInfo;


export type Summary = Pick<FitnessInfo, 'totalDistance' | 'totalMovingTime' | 'avgSpeed'>