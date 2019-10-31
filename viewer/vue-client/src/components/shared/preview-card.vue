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
      triedFetching: false,
    };
  },
  methods: {
    ...mapActions([
      'addCardToCache',
    ]),
    populateData() {
      if (this.fetchedData === null && this.triedFetching === false) { // Only fetch if we need to
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
            self.triedFetching = true;
            resolve(res.json());
          }
        }, (error) => {
          self.fetching = false;
          self.triedFetching = true;
          reject('Error fetching card info', error);
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
    <div class="PreviewCard-spinner" :class="{ 'is-active' : fetching }">
      Laddar <i class="fa-spin fa fa-circle-o-notch"></i>
    </div>
    <entity-summary :animate="true" :focus-data="fullData" :hover-links="false" />
  </div>
</template>

<style lang="less">

.PreviewCard {
  width: 600px;
  &-spinner {
    opacity: 0;
    transition: opacity 0.5s ease;
    &.is-active {
      opacity: 1;
    }
    color: rgba(0, 0, 0, 0.5);
    position: absolute;
    right: 0.25em;
    bottom: 0.25em;
  }
}
</style>
