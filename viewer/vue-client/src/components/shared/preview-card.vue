<script>
import LodashProxiesMixin from '../mixins/lodash-proxies-mixin';
import { mapGetters, mapActions } from 'vuex';
import * as LayoutUtil from '@/utils/layout';

export default {
  name: 'preview-card',
  mixins: [LodashProxiesMixin],
  props: {
    fieldKey: {
      type: String,
      default: '',
    },
    shouldShow: {
      type: Boolean,
      default: false,
    },
    uri: {
      type: String,
      default: '',
    },
    floating: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    isLocal: {
      type: Boolean,
      default: false,
    },
    isExtractable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      keyword: '',
      active: false,
      toBeActive: false,
      positionStyles: null,
      fetching: false,
      fetchedData: null,
      lastElement: null,
      hoverActive: false,
    };
  },
  methods: {
    ...mapActions([
      'setPreviewCard',
      'addCardToCache',
    ]),
    reportMouseOver() {
      const previewCard = this.previewCard;
      previewCard.cardHoverActive = true;
      this.hoverActive = true;
      this.setPreviewCard(previewCard);
    },
    reportMouseOut() {
      const previewCard = this.previewCard;
      previewCard.cardHoverActive = false;
      this.hoverActive = false;
      this.setPreviewCard(previewCard);
    },
    setPositionStyles() {
      const posStyles = {};
      posStyles.position = 'fixed';
      const triggerElem = this.previewCard.triggerElem;
      if (triggerElem) {
        const triggerPos = triggerElem.getBoundingClientRect();
        // const currentPos = LayoutUtil.getPosition(this.previewCard.triggerElem);
        const cardSize = 600;
        let xPos = triggerPos.x;
        const viewPortWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        if (xPos + cardSize > viewPortWidth) {
          xPos += viewPortWidth - (xPos + cardSize);
        }
        posStyles.left = `${xPos}px`;
        posStyles.top = `${triggerPos.bottom}px`;
        this.positionStyles = posStyles;
      }
    },
    fetchMore(id) {
      const self = this;
      self.fetching = true;
      return new Promise((resolve, reject) => {
        const url = `${id}/data.json`;
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
      'previewCard',
      'resources',
    ]),
    isTriggered() {
      return this.previewCard.triggerElem !== null || this.previewCard.cardHoverActive;
    },
    fullData() {
      if (this.fetchedData) {
        return this.fetchedData.mainEntity;
      } else {
        return this.previewCard.data;
      }
    },
    hasUri() {
      if (typeof this.uri !== 'undefined' && this.uri.length > 0) {
        return true;
      }
      return false;
    },
  },
  watch: {
    '$route.fullPath'() {
      this.active = false;
    },
    isTriggered(v) {
      const self = this;
      if (v) {
        const fnurgel = self.previewCard.data['@id'].split('#')[0];
        if (this.resources.cachedCards.hasOwnProperty(fnurgel)) {
          self.fetchedData = this.resources.cachedCards[fnurgel];
        } else {
          self.fetchMore(fnurgel).then((result) => {
            self.fetchedData = result;
            self.addCardToCache({ id: fnurgel, data: result });
          });
        }
        self.setPositionStyles();
        self.toBeActive = true;
        self.lastElement = self.previewCard.triggerElem;
        setTimeout(() => {
          if (self.toBeActive) {
            self.active = true;
            self.toBeActive = false;
          }
        }, 200);
      } else {
        setTimeout(() => {
          if (self.hoverActive === false && (self.previewCard.triggerElem !== self.lastElement || self.lastElement === null)) {
            self.toBeActive = false;
            self.active = false;
          }
        }, 100);
      }
    },
  },
  mounted() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <div class="CardHoverTrigger" @mouseover="reportMouseOver" @mouseout="reportMouseOut" :style="positionStyles" :class="{ 'is-active': active, 'to-be-active': toBeActive }">
    <div class="Card" :class="{ 'is-active': active, 'to-be-active': toBeActive }">
      <entity-summary v-if="fullData !== null"
        :focus-data="fullData" 
        :is-extractable="isExtractable" 
        :add-link="hasUri" 
        :actions="false" 
        :is-local="isLocal"
        :hover-links="false"
        :valueDisplayLimit=3></entity-summary>
    </div>
  </div>
</template>

<style lang="less">

.CardHoverTrigger {
  z-index: @previewcard-z;
  width: 600px;
  max-width: 80vw;
  display: none;
  padding: 0;
  &.to-be-active {
    display: block;
  }
  &.is-active {
    display: block;
  }
}

.Card {
  width: 100%;
  background-color: @white;
  padding: 0.5em;
  transition: opacity 0.4s ease, transform 0.4s ease;
  width: 100%;
  border-radius: 0.5em;
  box-shadow: @shadow-panel;
  border: 1px solid @gray-lighter;
  &.to-be-active {
    pointer-events: none;
    display: block;
    opacity: 0;
    // transform: translate(0, 1em);
  }

  &.is-active {
    display: block;
    opacity: 1;
    // transform: translate(0, 0em);
  }
}
</style>
