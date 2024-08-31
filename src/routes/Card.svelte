<script lang="ts">
  import type { ChartType, FitnessInfo } from "../types";
  const { data }: { data: FitnessInfo } = $props();
  import { formatTime } from "../lib/parser";
  const showKeys: ChartType[] = [
    "totalDistance",
    "avgSpeed", 
    "avgHeartRate",
    "avgCadence",
    "totalMovingTime",
  ] as const;

  const unitMap: Record<string, string> = {
    totalDistance: "km",
    avgSpeed: "km/h",
    avgHeartRate: "bpm",
    avgCadence: "rpm",
    totalMovingTime: "",
  };

  function transformData(key: string, data: number | string) {
    if(key.toLocaleLowerCase().includes('time')){
      const time = Number(data)
      return formatTime(time)
    }
    return `${parseFloat(Number(data).toFixed(1))}`
  }
</script>

<div class="w-full px-4 bg-gray-800 rounded-lg shadow-lg">
  {#each showKeys as key}
    <div class="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
      <div class="flex items-center text-gray-300">
        {#if key === 'totalDistance'}
          <svg class="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
        {:else if key === 'avgSpeed'}
          <svg class="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        {:else if key === 'avgHeartRate'}
          <svg class="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
        {:else if key === 'avgCadence'}
          <svg class="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7l4-4m0 0l4 4m-4-4v18"></path></svg>
        {:else if key === 'totalMovingTime'}
          <svg class="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        {/if}
        <span class="text-base capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
      </div>
      <div class="font-semibold text-white text-lg">
        {transformData(key, data?.[key])}
        <span class="text-sm">{unitMap[key]}</span>
      </div>
    </div>
  {/each}
</div>
