// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Decoder, Stream } from '@garmin/fitsdk'
import pl from '@mapbox/polyline'
import type { FitnessInfo } from '../types';
import {gpx2fitEncoder} from 'gpx2fit'
import dayjs from 'dayjs';


const defaultFitnessInfo: FitnessInfo = {
  timestamp: new Date().toISOString(),
  startTime: new Date().toISOString(),
  totalDistance: 0,
  totalMovingTime: 0,
  avgSpeed: 0,
  maxSpeed: 0,
  avgPower: 0,
  totalAscent: 0,
  totalDescent: 0,
  avgAltitude: 0,
  sport: "",
  avgHeartRate: 0,
  avgCadence: 0,
  polyline: "",
};
export function parseFit(buffer: ArrayBuffer):FitnessInfo{
  const result = {...defaultFitnessInfo}
  const stream = Stream.fromArrayBuffer(buffer)
  const decoder = new Decoder(stream)

  if (decoder.isFIT()) {
    const data = decoder.read()
    const polyline = [] as Array<[number, number]>
    const recordMesgs = data.messages.recordMesgs as FitRecordMesgs[]
    for (const record of recordMesgs) {
      polyline.push([record.positionLat / 11930465, record.positionLong / 11930465])
    }

    Object.keys(result).forEach((key) => {
      if (key in (data.messages.sessionMesgs?.[0] ?? {})) {
        (result as unknown)[key] = transformData(key,data.messages.sessionMesgs[0][key]);
      }
    });
    result.timestamp = result.startTime
    result.polyline = pl.encode(polyline);
  }
  return result
}

export async function parseGpx(gpxString:string){
  const encoder = await gpx2fitEncoder(gpxString)
  const blob = encoder.createBlob()
  const buffer = await blob.arrayBuffer()
  return parseFit(buffer)
}

function transformData(key:string,data:number|string){
  if(key.toLocaleLowerCase().includes('speed')){
    return Number(data) * 3.6
  }else if(key.toLocaleLowerCase().includes('distance')){
    return Number(data) / 1000
  }
  return data
}

export interface FitRecordMesgs {
  timestamp: Date
  positionLat: number
  positionLong: number
  distance: number
  absolutePressure: number
  altitude: number
  speed: number
  power: number
  grade: number
  heartRate: number
  cadence: number
  temperature: number
  gpsAccuracy: number
  enhancedAltitude: number
  enhancedSpeed: number
}


export function formatTime(time:number){
  return time > 3600 ? `${Math.floor(time / 3600)}h ${Math.floor((time % 3600) / 60)}min` : `${Math.floor(time / 60)}min`
}


export function formatTimeDifference(startDate: string, endDate: string) {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const diffDays = end.diff(start, 'day');
  
  if (diffDays < 1) {
    const hours = end.diff(start, 'hour');
    const minutes = end.diff(start, 'minute') % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes} min`;
    }
  } else {
    return `${diffDays} days`;
  }
}