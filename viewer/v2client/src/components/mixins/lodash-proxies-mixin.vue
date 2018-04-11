<script>
import * as _ from 'lodash';

export default {
  methods: {
    isObject(value) {
      return _.isObject(value);
    },
    isArray(o) {
      return _.isArray(o);
    },
    isPlainObject(o) {
      return _.isPlainObject(o);
    },
  },
};
</script>
