<script lang="ts">
  const {
    options,
    activeOption,
    onSelect,
    width = 60,
  }: {
    options: string[];
    activeOption: string;
    onSelect: (option: string) => void;
    width?: number;
  } = $props();

  const activeIndex = $derived(options.indexOf(activeOption));
  let tabRefs: HTMLElement[] = [];
  let transitionMask:HTMLElement
  $effect(() => {
    const el = tabRefs[activeIndex];
    if (el) {
        transitionMask.style.left = `${el.offsetLeft}px`;
        transitionMask.style.top = `${el.offsetTop}px`;
        transitionMask.style.width = `${el.offsetWidth}px`;
        transitionMask.style.height = `${el.offsetHeight}px`;
    }
  });
</script>

<div class="relative flex flex-wrap w-full">
    {#each (options) as option,index}
      <button
        bind:this={tabRefs[index]}
        class="transition-all text-center {activeOption === option ? 'text-[#f87171]' : ''} tab-{index} rounded"
        onclick={() => onSelect(option)}
        style={`width: ${width}px;`}
      >
        {option}
      </button>
    {/each}
  <div bind:this={transitionMask} class="text-center transition-mask bg-[#abdac3] text-[#f87171] transition-all ease-out shrink-0 rounded">{activeOption}</div>
</div>

<style>
  .transition-mask {
    position: absolute;
    top:0;
    left: 0;
    transition: all 0.3s ease-out;
  }
</style>
