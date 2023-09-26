<script>
/*
  Presentation of type label and changed/created text nodes.
*/

import { mapState } from 'pinia';
import { useInspectorStore } from '@/stores/inspector';
import { translatePhrase, lowercase } from '@/utils/filters';
import moment from 'moment';
import SummaryNode from '@/components/shared/summary-node.vue';
import LensMixin from '@/components/mixins/lens-mixin.vue';
import Button from '@/components/shared/button.vue';

export default {
  name: 'entity-changelog',
  mixins: [LensMixin],
  data() {
    return {
      showFull: false,
    };
  },
  methods: {
    translatePhrase,
    lowercase,
  },
  computed: {
    ...mapState(useInspectorStore, ['inspector']),
    focusData() {
      return this.inspector.data.record;
    },
    createdFormatted() {
      return moment(this.getCard.created).format('lll')
    },
    modifiedFormatted() {
      return moment(this.getCard.modified).format('lll')
    }
  },
  components: {
    SummaryNode,
    'button-component': Button,
  },
};
</script>

<template>
  <div class="EntityChangelog">
    <div class="EntityChangelog-item">
      <span class="EntityChangelog-key uppercaseHeading--bold">{{ translatePhrase('Created') }}:</span> 
      <span class="EntityChangelog-value">
        {{ createdFormatted }} {{ translatePhrase('by') }} 
        <SummaryNode :hover-links="true" v-if="inspector.data.record.descriptionCreator" :item="inspector.data.record.descriptionCreator" :is-last="true" :field-key="'descriptionCreator'"/>
        <span class="EntityChangelog-unknown" v-else>{{ lowercase(translatePhrase("Unknown")) }}</span>
      </span>
    </div>

    <div class="EntityChangelog-item">
      <span class="EntityChangelog-key uppercaseHeading--bold">{{ translatePhrase('Changed') }}:</span> 
      <span class="EntityChangelog-value">
        {{ modifiedFormatted }} {{ translatePhrase('by') }}
        <SummaryNode :hover-links="true" v-if="inspector.data.record.descriptionLastModifier" :item="inspector.data.record.descriptionLastModifier" :is-last="true" :field-key="'descriptionLastModifier'"/>
        <span class="EntityChangelog-unknown" v-else>{{ lowercase(translatePhrase("Unknown")) }}</span>
      </span>
    </div>

    <router-link :to="{ path: `${this.$route.path}/history` }">
      <button-component :inverted="true" class="Button-default" :label="translatePhrase('View version history')" icon="clock" size="medium" />
    </router-link>
  </div>
</template>

<style lang="scss">

.EntityChangelog {
  display: flex;
  line-height: 1;
  font-size: 1.4rem;
  flex-direction: column;
  @include media-breakpoint-up(min) {
    flex-direction: row;
    align-items: baseline;
    flex-wrap: wrap;
  }
  &-unknown {
    @include media-breakpoint-up(md) {
      margin-right: 0.5em;
    }
  }
  &-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.5em;
    @include media-breakpoint-up(sm) {
      margin-bottom: 0.25em;
      flex-direction: row;
    }
  }
  &-key {
    margin-right: 0.5em;
  }
  &-value {
    word-break: break-word;
    @include media-breakpoint-up(sm) {
      word-break: unset;
    }
  }
}

</style>
