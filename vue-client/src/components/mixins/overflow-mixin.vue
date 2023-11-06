<script>
import { ResizeObserver } from 'vue-resize';
import { isArray, map, pickBy, startsWith, values } from 'lodash-es';

export default {
  name: 'overflow-mixin',
  components: {
    ResizeObserver,
  },
  methods: {
    calculateOverflow() {
      // Display expander button on property values that don't fit
      const refs = pickBy(this.$refs, (v, k) => startsWith(k, 'ovf-'));
      const elements = map(values(refs), (r) => (isArray(r) ? r[0] : r)).filter((e) => e);
      elements.forEach((e) => (this.isOverflown(e) || e.classList.contains('expanded')
        ? e.classList.add('overflown')
        : e.classList.remove('overflown')));
    },
    isOverflown(element) {
      return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
    },
  },
  mounted() {
    this.calculateOverflow();
  },
};
</script>
