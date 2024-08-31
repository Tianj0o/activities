<script lang="ts">
  import type { ChartType } from "../types";
  import { useActivities } from "../hooks/useActivities.svelte";
  import * as Plot from "@observablehq/plot";
  import Tab from "./Tab.svelte";
  import { onMount } from "svelte";

  let containerRef: HTMLElement;

  const chartsTypes: ChartType[] = [
    "totalDistance",
    "avgSpeed",
    "avgHeartRate",
    "avgCadence",
  ];

  let containerWidth: number = $state(0);
  onMount(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        containerWidth = entry.contentRect.width;
      }
    });

    resizeObserver.observe(containerRef);

    return () => {
      resizeObserver.disconnect();
    };
  });

  let chartType = $state<ChartType>(chartsTypes[0]);

  const { activeActivities, activities,summary,year } = $derived(useActivities());

  const chartsData: Array<{date:Date,data:number|string}> = $derived(
    activeActivities
      .map((activity) => {
        return {
          date:new Date(activity.timestamp),
          data:activities[activity.fileName]?.[chartType]
        };
      })
      .filter(({data}) => data !== undefined && data !== 0),
  ); 
  $effect(() => {
    if (chartsData.length === 0) return;
    
    let plot:(SVGSVGElement | HTMLElement) & Plot.Plot 

    if(chartType==='avgSpeed'){
      plot = Plot.plot({
        width: containerWidth,
        marks: [
          Plot.lineY(chartsData.map(({date}) => ({date, data: summary[year].avgSpeed})), {x: 'date', y: 'data', stroke: "white", curve: "step"}),
          Plot.lineY(chartsData, {x: 'date', y: 'data', stroke: "#f87171", curve: "step",sort:"date"}),
        ],
        y: {
          grid: true,
          domain:[5,30],
        },
        x: {
          type: "time",
          tickFormat: "%y/%m/%d",
          ticks:10,
        },
      });
    }else{
      plot = Plot.plot({
        width:containerWidth,
        x: {
          type: "time",
          tickFormat: "%y/%m/%d",
          ticks:10
        },
        marks: [
          Plot.lineY(chartsData, {x: 'date', y: 'data', stroke: "#f87171",curve:"step",sort:"date" }),
        ],
        y:{
          grid:true,
        }
      });
    }
    
    containerRef.append(plot);
    return () => plot.remove();
  });
</script>

<div class="w-full">
  <div class="flex text-sm mb-3">
   <Tab width={120} options={chartsTypes} activeOption={chartType} onSelect={(type: string) => chartType = type as ChartType}></Tab>
  </div>
  <div class="w-full" bind:this={containerRef}></div>
</div>
