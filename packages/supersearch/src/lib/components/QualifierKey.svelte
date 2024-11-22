<script lang="ts">
  const {key, operator} = $props();
</script>

<span class="qualifier-key-container">
  <span class="qualifier-key">
    {key}
  </span>
  <span class="qualifier-operator">
    {operator}
  </span>
</span>

<style>
  .qualifier-key-container {
    display: inline-flex;
  }
</style>