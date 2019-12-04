<script>
import LodashProxiesMixin from '../mixins/lodash-proxies-mixin';
import { mapGetters, mapActions } from 'vuex';
import * as HttpUtil from '@/utils/http';

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
        const url = `${id}/data.jsonld?lens=card`;
        self.fetchStatus = 'loading';

        HttpUtil.getDocument(url).then((res) => {
          if (res.status === 200) {
            self.fetchStatus = null;
            let simplifiedResult = res.data;
            if (simplifiedResult.hasOwnProperty('mainEntity')) {
              simplifiedResult = res.mainEntity;
            }
            this.fetchedData = simplifiedResult;
          } else {
            self.fetchStatus = 'error';
          }
        }, (error) => {
          self.fetchStatus = 'error';
          console.log(error);
        });
      }
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
