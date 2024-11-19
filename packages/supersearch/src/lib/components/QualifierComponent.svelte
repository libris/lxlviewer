<script lang="ts">
  // import type { Qualifier } from '$lib/utils/supersearch/qualifiers';
  // import IconPerson from '~icons/mdi/person-circle';
  // import IconClose from '~icons/mdi/remove';
  import { page } from '$app/stores';
  import type { Qualifier } from '$lib/extensions/qualifier.js';

  type QualifierWidgetProps = {
    qualifier: Qualifier;
    range: { from: number; to: number };
  };

  let { qualifier, range }: QualifierWidgetProps = $props();

  let removeUrl = $derived.by(() => {
    const url = new URL($page.url);
    const _q = $page.url.searchParams.get('_q');
    if (_q) {
      url.searchParams.set('_q', _q.slice(0, range.from) + _q.slice(range.to)); // remove qualifier part
    }
    return url;
  });
</script>

<span class="qualifier">
  <span class="qualifier-key">
    {qualifier.keyLabel || qualifier.key}
  </span>
  <span class="qualifier-operator">
    {qualifier.operator}
  </span>
  <span class="qualifier-value" contenteditable="true">
    {qualifier.valueLabel || qualifier.value}
  </span>
  <a href={removeUrl.toString()} tabindex="-1">
    <!-- <IconClose style="font-size:14px;" /> -->
    X
  </a>
</span>&nbsp;

<style>
  .qualifier {
    display: inline-flex;
    align-items: stretch;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: rgba(14, 113, 128, 0.15);
    padding: 0;
    max-width: 25vw;
    overflow: hidden;
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
  }

  .qualifier-key {
    display: inline-flex;
    align-items: center;
    padding-right: var(--padding-2xs);
    padding-left: var(--padding-2xs);
    font-size: var(--font-size-2xs);
  }

  /* .type > span {
    &::first-letter {
      text-transform: capitalize;
    }
  } */

  .qualifier-value {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    overflow: hidden;
    color: #0e7180;
    font-size: var(--font-size-2xs);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* .value > span {
    align-self: center;
  } */

  .qualifier-value :global(svg) {
    color: var(--color-link);
    font-size: var(--font-size-sm);
  }

  a {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border: none;
    padding: 1px;
    min-width: 24px;
    min-height: 24px;
    color: var(--color-link);

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }
</style>