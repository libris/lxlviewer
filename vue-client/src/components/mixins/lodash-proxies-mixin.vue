<script>
import { isObject, isArray, isPlainObject } from 'lodash-es';

export default {
  methods: {
    isObject(value) {
      return isObject(value);
    },
    isArray(o) {
      return isArray(o);
    },
    isPlainObject(o) {
      return isPlainObject(o);
    },
  },
};
</script>
