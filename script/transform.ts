// Fix the timestamp error in GPX files 
// No need to modify when the timestamp is already correct

import { readdirSync,readFileSync, writeFileSync } from "fs"
import { resolve } from "path"

const activitiesDir = '../activities'
const offset = '+0800'

const files = readdirSync(activitiesDir)

files.forEach(file=>{
  if(file.endsWith('.gpx')){
    const path = resolve(activitiesDir,file)
    correctGpxTimestamps(path)
  }
})

function correctGpxTimestamps(filePath: string): void {
  let gpxString = readFileSync(filePath, "utf-8");

  const timeRegex = /<time>(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})Z<\/time>/g;

  let corrected = false;

  gpxString = gpxString.replace(timeRegex, (match, timestamp) => {
    const correctedTimestamp = timestamp + offset;
    corrected = true;
    return `<time>${correctedTimestamp}</time>`;
  });

  if (corrected) {
    writeFileSync(filePath, gpxString);
    console.log(`File corrected: ${filePath}`);
  } else {
    console.log(`No corrections needed for: ${filePath}`);
  }
}