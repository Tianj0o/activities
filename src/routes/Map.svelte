<script lang="ts">
  import { onMount } from "svelte";
  import Map from "ol/Map";
  import View from "ol/View";
  import TileLayer from "ol/layer/Tile";
  import XYZ from "ol/source/XYZ";
  import { LineString } from "ol/geom";
  import Feature from "ol/Feature";
  import { fromLonLat } from "ol/proj";
  import VectorLayer from "ol/layer/Vector";
  import VectorSource from "ol/source/Vector";
  import { Style, Stroke } from "ol/style";
  import { defaults as defaultControls } from "ol/control";
  import pl from "@mapbox/polyline";
  import "ol/ol.css";
  import { useActivities } from "../hooks/useActivities.svelte";
  import Tab from "./Tab.svelte";

  const {
    activeTracks: tracks,
    years,
    setYear,
    year,
    selectedActivity,
    getActivity,
  } = $derived(useActivities());

  let map: Map;

  let mapRef: HTMLElement;
  onMount(() => {
    map = new Map({
      target: mapRef,
      layers: [
        new TileLayer({
          source: new XYZ({
            // url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
            url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            attributions:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }),
        }),
      ],
      view: new View({
        center: [13523000, 3662000],
        zoom: 10,
        maxZoom:15
      }),
      controls: defaultControls({ attribution: false }),
    });
  });

  $effect(() => {
    const layers = map.getLayers().getArray();
    for (let i = layers.length - 1; i > 0; i--) {
      map.removeLayer(layers[i]);
    }
    tracks.forEach((track) => draw(track));
  });

  $effect(() => {
    if (selectedActivity) {
      const fitnessInfo = getActivity(selectedActivity);
      if (fitnessInfo) drawActiveActivity(fitnessInfo.polyline);
    }
  });

  function draw(track: string, color = "rgba(0, 60, 136, 1)") {
    const points = pl.decode(track);
    const lineStringCoords = points.map(([lat, lon]) => fromLonLat([lon, lat]));
    const lineString = new LineString(lineStringCoords);

    const feature = new Feature({
      geometry: lineString,
    });

    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [feature],
      }),
      style: new Style({
        stroke: new Stroke({
          color,
          width: 2,
        }),
      }),
    });
    map.addLayer(vectorLayer);
    return vectorLayer;
  }

  let activeLayer: VectorLayer;

  export function drawActiveActivity(track: string) {
    if (activeLayer) {
      map.removeLayer(activeLayer);
    }
    activeLayer = draw(track, "rgba(0, 100, 200, 0.8)");
  }

  const options = $derived([...years, "all"]);
</script>

<div class="flex justify-between items-center">
  <Tab options={options} activeOption={year} onSelect={setYear} />
</div>

<div class="w-full flex flex-col relative">
  <div bind:this={mapRef} class="inset-0 md:h-[400px] h-[250px]"></div>
</div>
