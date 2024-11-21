<script lang="ts">
  const {key, operator} = $props();
</script>

<span class="qualifier-key">
  {key}
</span>
<span class="qualifier-operator">
  {operator}
</span>

<style>
  .qualifier-key, .qualifier-operator {
    background: rgba(14, 113, 128, 0.15);
  }
</style>