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
    
    // 过滤异常点
    const filteredRecords = filterAnomalousPoints(recordMesgs)
    
    for (const record of filteredRecords) {
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


export function formatTimeDifference(startDate: number, endDate: number) {
  const start = dayjs.unix(startDate);
  const end = dayjs.unix(endDate);
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

// 添加过滤异常点的函数
function filterAnomalousPoints(records: FitRecordMesgs[]): FitRecordMesgs[] {
  if (records.length <= 1) return records;
  
  const filteredRecords: FitRecordMesgs[] = [records[0]];
  const maxDistanceThreshold = 1000; // 最大距离阈值（米），超过这个值认为是异常点
  
  for (let i = 1; i < records.length; i++) {
    const prevPoint = filteredRecords[filteredRecords.length - 1];
    const currentPoint = records[i];
    
    // 计算两点之间的距离（使用简化的哈弗辛公式计算地理距离）
    const distance = calculateDistance(
      prevPoint.positionLat / 11930465, 
      prevPoint.positionLong / 11930465,
      currentPoint.positionLat / 11930465, 
      currentPoint.positionLong / 11930465
    );
    
    // 如果距离小于阈值，则保留该点
    if (distance < maxDistanceThreshold) {
      filteredRecords.push(currentPoint);
    }else{
      console.log('filter-------')
    }
  }
  
  return filteredRecords;
}

// 计算两个地理坐标点之间的距离（米）
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // 地球半径（米）
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}