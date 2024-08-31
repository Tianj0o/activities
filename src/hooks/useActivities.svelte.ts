import type { FitJson, FitnessInfo, Summary } from "../types";
let activities: Record<string, FitnessInfo> = $state({});
let year = $state<string | "all">("all");
let fitJson = $state<Record<string, FitJson[]>>({})
let selectedActivity = $state<string | null>(null);
let summary = $state<Record<string, Summary>>({})
function setSelectedActivity(activity: string) {
  selectedActivity = activity;
}

export function useActivities() {


  function initialize(data: {
    activities:Record<string, FitJson[]>
    summary:Record<string, Summary>
  }) {
    fitJson = data.activities
    summary = data.summary
  }

  const years = Object.keys(fitJson).sort((a, b) => Number(a) - Number(b))


  function setAllActivities(data: Record<string, FitnessInfo>) {
    activities = data
  }


  const thisYear = years[years.length - 1];

  const lastActivity = $derived(getActivity(fitJson[thisYear]?.[0].fileName))

  const showYear = $derived.by(() => {
    if (year === "all") {
      return thisYear;
    } else {
      return year;
    }
  });


  const activeActivities = $derived.by(() => {
    if (year === "all") {
      return years.reverse().flatMap((year) => fitJson[year]);
    } else {
      return fitJson[year];
    }
  });

  const selectYearActivities = $derived.by(() => {
    if (year === "all") {
      return fitJson[thisYear] ?? []
    } else {
      return fitJson[year] ?? [];
    }
  });


  let activeTracks = $state<string[]>([]);

  $effect(() => {
    activeTracks = activeActivities.map(
      (activity) => activities[activity.fileName]?.polyline,
    ).filter((i) => i !== undefined);
  });

  function setYear(v: string | "all") {
    year = v;
  }

  function getActivity(fileName: string) {
    return activities[fileName];
  }

  return {
    get year() {
      return year;
    },
    get activeTracks() {
      return activeTracks;
    },
    setYear,
    years,
    get activeActivities() {
      return activeActivities;
    },
    getActivity,
    selectYearActivities,
    setAllActivities,
    initialize,
    showYear,
    activities,
    selectedActivity,
    setSelectedActivity,
    summary,
    thisYear,
    lastActivity
  };
}