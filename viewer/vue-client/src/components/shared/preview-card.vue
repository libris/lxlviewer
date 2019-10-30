<script>
import LodashProxiesMixin from '../mixins/lodash-proxies-mixin';
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'preview-card',
  mixins: [LodashProxiesMixin],
  props: {
    focusData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      fetching: false,
      fetchedData: null,
    };
  },
  methods: {
    ...mapActions([
      'addCardToCache',
    ]),
    populateData() {
      if (this.fetchedData === null) { // Only fetch if we need to
        const self = this;
        const fnurgel = self.focusData['@id'].split('#')[0];
        self.fetchMore(fnurgel).then((result) => {
          let simplifiedResult = result;
          if (result.hasOwnProperty('mainEntity')) {
            simplifiedResult = result.mainEntity;
          }
          self.fetchedData = simplifiedResult;
        });
      }
    },
    fetchMore(id) {
      const self = this;
      self.fetching = true;
      return new Promise((resolve, reject) => {
        const url = `${id}/data.json?lens=card`;
        fetch(url).then((res) => {
          if (res.status === 200) {
            self.fetching = false;
            resolve(res.json());
          }
        }, (error) => {
          self.fetching = false;
          reject('Error fetching breadcrumb data', error);
        });
      });
    },
  },
  computed: {
    ...mapGetters([
      'resources',
    ]),
    fullData() {
      if (this.fetchedData !== null) {
        return this.fetchedData;
      }
      return this.focusData;
    },
  },
  watch: {
  },
  mounted() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
    });
  },
};
</script>

<template>
  <div class="PreviewCard">
    <entity-summary :focus-data="fullData" :hover-links="false" />
  </div>
</template>

<style lang="less">

.PreviewCard {
  width: 600px;
}
</style>
