<script lang="ts">
  import { useActivities } from "../hooks/useActivities.svelte";
  import dayjs from "dayjs";

  const { selectYearActivities, getActivity, showYear } =
    $derived(useActivities());

  const dailyDistances = new Map<string, number>();

  let daysWithActivity: Array<{
    date: string;
    distance: number;
    color: string;
  }> = $state([]);

  $effect(() => {
    const startDate = dayjs(`${showYear}-01-01`);
    const endDate = dayjs(`${showYear}-12-31`);
    const daysInYear = endDate.diff(startDate, "day") + 1;

    const days = Array.from({ length: daysInYear }, (_, i) =>
      startDate.add(i, "day"),
    );
    dailyDistances.clear();
    selectYearActivities.forEach((activity) => {
      const activityDate = dayjs(activity.timestamp).format("YYYY-MM-DD");
      const distance = getActivity(activity.fileName)?.totalDistance || 0;

      if (dailyDistances.has(activityDate)) {
        dailyDistances.set(
          activityDate,
          dailyDistances.get(activityDate) ?? 0 + distance,
        );
      } else {
        dailyDistances.set(activityDate, distance);
      }
    });
    daysWithActivity = days.map((day) => {
      const dateString = day.format("YYYY-MM-DD");
      const distance = dailyDistances.get(dateString);
      return {
        date: day.format("YYYY-MM-DD"),
        distance: distance || 0,
        color: getColor(distance || 0),
      };
    });
  });

  function getColor(distance: number): string {
    if (distance === 0) return "rgb(248, 113, 113,0.1)";
    const maxDistance = Math.max(...dailyDistances.values());
    const intensity = Math.pow(distance / maxDistance, 0.5); 
    return `rgba(248, 113, 113, ${intensity})`; 
  }
</script>

<div>{showYear}</div>
<div class="heatmap-container">
  {#each daysWithActivity as dayAct}
    <div
      class="heatmap-cell"
      title={dayAct.date}
      style={`background-color: ${dayAct.color}`}
    ></div>
  {/each}
</div>

<style>
  .heatmap-container {
    display: grid;
    grid-template-rows: repeat(7, 1fr);
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: 2px;
    width: fit-content;
    max-width: 100%;
    overflow-x: scroll;
  }

  .heatmap-cell {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    background-color: #eee;
  }
</style>