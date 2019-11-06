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
      fetchStatus: null,
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
        const id = self.focusData['@id'].split('#')[0];
        self.fetchMore(id).then((result) => {
          let simplifiedResult = result;
          if (result.hasOwnProperty('mainEntity')) {
            simplifiedResult = result.mainEntity;
          }
          self.fetchedData = simplifiedResult;
        }).catch((e) => {
          console.log(`Couldn't fetch data for: ${id}`);
        });
      }
    },
    fetchMore(id) {
      const self = this;
      self.fetchStatus = 'loading';
      return new Promise((resolve, reject) => {
        const url = `${id}/data.json?lens=card`;
        fetch(url).then((res) => {
          if (res.status === 200) {
            self.fetchStatus = null;
            resolve(res.json());
          } else {
            self.fetchStatus = 'error';
            reject('Error fetching card info', error);
          }
        }, (error) => {
          self.fetchStatus = 'error';
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
    <div class="PreviewCard-spinner" :class="{ 'is-active' : fetchStatus !== null }">
      <span v-if="fetchStatus === 'loading'">Laddar <i class="fa-spin fa fa-circle-o-notch"></i></span>
      <span v-if="fetchStatus === 'error'" class="fetchError">Laddningsfel <i class="fa fa-times"></i></span>
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
    .fetchError i {
      color: @brand-danger;
    }
  }
}
</style>
