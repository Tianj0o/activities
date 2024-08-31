<script lang="ts">
  import { formatTimeDifference } from "$lib/parser";
  import dayjs from "dayjs";
  import { useActivities } from "../hooks/useActivities.svelte";
  const { lastActivity } = $derived(useActivities());
</script>

<div class="flex justify-between items-center">
  <div class="flex items-center h-full">
    <img
      class="md:w-[80px] md:h-[80px] w-[50px] h-[50px] rounded-full"
      src="/avatar.png"
      alt=""
    />
  </div>
  <div>
    <span>Last Activity: </span>
    {formatTimeDifference(
      lastActivity?.startTime,
      dayjs(Date.now()).format("YYYY-MM-DD"),
    )} ago
  </div>
</div>
