import { decompressSync, strFromU8 } from "fflate"
import { readFileSync, writeFileSync } from "fs";


writeFileSync('./1.json', strFromU8(decompressSync(readFileSync('../build/activities.bin'))))