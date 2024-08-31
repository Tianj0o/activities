<script lang="ts">
  import Map from "./Map.svelte";
  import { useActivities } from "../hooks/useActivities.svelte";
  import Header from "./Header.svelte";
  import List from "./List.svelte";
  import HeatMap from "./HeatMap.svelte";
  import { onMount } from "svelte";
  import { decompressSync, strFromU8 } from "fflate";
  import Charts from "./Charts.svelte";
  const { data } = $props();

  const { setAllActivities, initialize } =
    $derived(useActivities());

  onMount(() => {
    initialize(data); 
    fetch(`activities.bin`)
      .then((r) => r.arrayBuffer())
      .then((buffer) => {
        setAllActivities(
          JSON.parse(strFromU8(decompressSync(new Uint8Array(buffer)))),
        );
      });
  });
</script>

<svelte:head>
  <title>Tianjia's Cycling Activities</title>
  <meta
    name="description"
    content="Interactive map and list of Tianjia's cycling activities"
  />
</svelte:head>
<section class="">
  <div class="w-screen overflow-hidden p-5 bg-b text-b">
    <Header />
    <div
      class="flex flex-col-reverse md:gap-20 md:flex-row flex-1 h-[90%] mt-4"
    >
      <div class="flex flex-col w-full md:w-[30%] justify-end md:justify-start">
        <div
          class="flex flex-col space-y-2 md:max-h-[100vh] md:overflow-y-scroll"
        >
          <List />
        </div>
      </div>
      <div class="w-full md:w-[70%] h-full flex flex-col gap-y-3">
        <Map />
        <Charts />
        <HeatMap />
      </div>
    </div>
  </div>
</section>
