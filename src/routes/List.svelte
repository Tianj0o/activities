<script lang="ts">
  import dayjs from "dayjs";
  import { useActivities } from "../hooks/useActivities.svelte";
  import Card from "./Card.svelte";
  import { slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { formatTime } from "$lib";
  const {
    activeActivities,
    setSelectedActivity,
    selectedActivity,
    getActivity,
    summary,
    year
  } = $derived(useActivities());


  $effect(() => {
    if (activeActivities?.length > 0 && selectedActivity === null) {
      setSelectedActivity(activeActivities[0].fileName);
    }
  });

  const activityInfo = $derived.by(() => {
    if (selectedActivity) {
      return getActivity(selectedActivity);
    } else {
      return null;
    }
  });
</script>

<div class="font-extralight">
    <div class="flex gap-4 p-4 bg-gray-800 rounded-lg shadow-md">
      <div>
        <p class="text-sm text-gray-400">Total Distance</p>
        <p class="text-xl font-semibold">{summary[year]?.totalDistance.toFixed(1)} km</p>
      </div>
      <div>
        <p class="text-sm text-gray-400">Avg Speed</p>
        <p class="text-xl font-semibold">{summary[year]?.avgSpeed.toFixed(1)} km/h</p>
      </div>
      <div>
        <p class="text-sm text-gray-400">Total Time</p>
        <p class="text-xl font-semibold">{formatTime(summary[year]?.totalMovingTime)}</p>
      </div>
    </div>
  {#each activeActivities as activity (activity.fileName)}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
      class="p-2 flex justify-between items-center cursor-pointer transition-colors duration-200 bg-gray-800 rounded-lg hover:bg-gray-700"
      role="button"
      tabindex="0"
      onclick={() => setSelectedActivity(activity.fileName)}
    >
      <div class="flex flex-col">
        <span class="text-p font-semibold">{dayjs(activity.timestamp).format("MMMM D, YYYY")}</span>
        <span class="text-gray-400 text-sm">{dayjs(activity.timestamp).format("HH:mm")}</span>
      </div>
      {#if selectedActivity === activity.fileName}
        <svg class="w-6 h-6 text-gray-400 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      {:else}
        <svg class="w-6 h-6 text-gray-400 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      {/if}
    </div>
    {#if selectedActivity === activity.fileName}
      <div transition:slide={{ delay: 50, duration: 300, easing: cubicOut }} class="shadow-lgoverflow-hidden">
        <Card data={activityInfo!} />
      </div>
    {/if}
  {/each}
</div>
