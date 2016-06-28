<script>

export default {
  name: 'result-item',
  props: {
    item: {},
  },
  computed: {
  },
  methods: {

  },
  components: {
  },
};
</script>

<template>
  <li class="resultItem">
    {{ item.data['@graph'][1] | json }}
  </li>
</template>
