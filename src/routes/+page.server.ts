import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseFit,parseGpx } from '../lib';
import { compressSync, decompressSync, strToU8, strFromU8 } from 'fflate/node';
import type { FitJson, FitnessInfo, Summary } from '../types';

const jsonName = 'fitness.json'

const activitiesFolder = 'activities'
const staticDir = 'static';

const activitiesJsonName = 'activities.bin'



/** @type {import('./$types').PageLoad} */
export async function load() {
  const filePath = join(staticDir, jsonName);
  const fitnessJson: FitJson[] = getFileContent<FitJson[]>(filePath, [])


  const files = readdirSync(activitiesFolder)

  const activitiesJsonPath = join(staticDir, activitiesJsonName)
  const activitiesJson: Record<string, FitnessInfo> = getFileContent<Record<string, FitnessInfo>>(activitiesJsonPath, {})

  let needUpdate = false
  for (const file of files) {
    if (file.endsWith('.fit') || file.endsWith('.gpx')) {
      const exist = fitnessJson.findIndex(i => i.fileName === file)

      if (exist === -1) {
        const fitfile = readFileSync(join(activitiesFolder, file))
        let json:FitnessInfo
        if(file.endsWith('.gpx')){
          json = await parseGpx(fitfile.toString())
        }else{
          json = parseFit(fitfile.buffer)
        }
        if (json.totalMovingTime < 5 * 60) {
          continue
        }
        activitiesJson[file] = json
        fitnessJson.push({ fileName: file, timestamp: json.timestamp })
        needUpdate = true
      }
    }
  }

  if (needUpdate) {
    writeFileSync(activitiesJsonPath, compressSync(strToU8(JSON.stringify(activitiesJson))))
    writeFileSync(filePath, JSON.stringify(fitnessJson, null, 2));
  }

  const activities = fitnessJson.reduce<Record<string, FitJson[]>>((acc, cur) => {
    const year = new Date(cur.timestamp).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(cur);
    return acc;
  }, {});

  Object.keys(activities).forEach(year => {
    activities[year].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  const summary:Record<string,Summary> = {
    all:{
      totalDistance:0,
      totalMovingTime:0,
      avgSpeed:0,
    }
  }

  Object.keys(activities).forEach(year => {
    const fits = activities[year]

    let totalDistance = 0
    let totalMovingTime = 0
    fits.map(fit=>{
      const info = activitiesJson[fit.fileName]
      if(info){
        totalDistance += info.totalDistance
        totalMovingTime += info.totalMovingTime
      }
    })

    summary[year] = {
      totalDistance,
      totalMovingTime,
      avgSpeed: totalDistance / (totalMovingTime / 3600),
    }
    summary['all'].totalDistance += totalDistance
    summary['all'].totalMovingTime += totalMovingTime
  })

  summary['all'].avgSpeed = summary['all'].totalDistance / (summary['all'].totalMovingTime / 3600)
  return {
    activities,
    summary
  }
}


function getFileContent<T>(path: string, defaultContent: T): T {
  if (existsSync(path)) {
    if (path.endsWith('.bin')) {
      const value = strFromU8(decompressSync(readFileSync(path)))
      if (typeof value !== typeof defaultContent) {
        return defaultContent
      }
    } else {
      const value = readFileSync(path).toString()
      if (typeof value !== typeof defaultContent) {
        return defaultContent
      }
      return JSON.parse(value)
    }
  }
  return defaultContent
}