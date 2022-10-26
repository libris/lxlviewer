<script>
/*
  Presentation of type label and changed/created text nodes.
*/

import { mixin as clickaway } from 'vue-clickaway';
import { mapGetters } from 'vuex';
import SummaryNode from '@/components/shared/summary-node.vue';
import LensMixin from '@/components/mixins/lens-mixin.vue';
import Button from '@/components/shared/button';

export default {
  name: 'entity-changelog',
  mixins: [clickaway, LensMixin],
  data() {
    return {
      showFull: false,
    };
  },
  methods: {
  },
  computed: {
    focusData() {
      return this.inspector.data.record;
    },
    ...mapGetters([
      'inspector',
    ]),
  },
  components: {
    SummaryNode,
    'button-component': Button,
  },
  watch: {
  },
  ready() {
  },
};
</script>

<template>
  <div class="EntityChangelog">
    <div class="EntityChangelog-item">
      <span class="EntityChangelog-key uppercaseHeading--bold">{{ 'Created' | translatePhrase}}:</span> 
      <span class="EntityChangelog-value">
        {{ $moment(getCard.created).format('lll') }} {{ 'by' | translatePhrase}} 
        <SummaryNode :hover-links="true" v-if="inspector.data.record.descriptionCreator" :item="inspector.data.record.descriptionCreator" :is-last="true" :field-key="'descriptionCreator'"/>
        <span class="EntityChangelog-unknown" v-else>{{ "Unknown" | translatePhrase | lowercase }}</span>
      </span>
    </div>
    <div class="EntityChangelog-item">
      <span class="EntityChangelog-key uppercaseHeading--bold">{{ 'Changed' | translatePhrase}}:</span> 
      <span class="EntityChangelog-value">
        {{ $moment(getCard.modified).format('lll') }} {{ 'by' | translatePhrase}}
        <SummaryNode :hover-links="true" v-if="inspector.data.record.descriptionLastModifier" :item="inspector.data.record.descriptionLastModifier" :is-last="true" :field-key="'descriptionLastModifier'"/>
        <span class="EntityChangelog-unknown" v-else>{{ "Unknown" | translatePhrase | lowercase }}</span>
      </span>
    </div>
    <router-link :to="{ path: `${this.$route.path}/history` }"><button-component :inverted="true" class="Button-default" :label="'View version history' | translatePhrase" icon="clock" size="medium" /></router-link>
  </div>
</template>

<style lang="less">

.EntityChangelog {
  display: flex;
  line-height: 1;
  font-size: 1.4rem;
  flex-direction: column;
  @media (min-width: @screen-md-min) {
    flex-direction: row;
    align-items: baseline;
    flex-wrap: wrap;
  }
  &-unknown {
    @media (min-width: @screen-md-min) {
      margin-right: 0.5em;
    }
  }
  &-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.5em;
    @media (min-width: @screen-sm-min) {
      margin-bottom: 0.25em;
      flex-direction: row;
    }
  }
  &-key {
    margin-right: 0.5em;
  }
  &-value {
    word-break: break-word;
    @media (min-width: @screen-sm-min) {
      word-break: unset;
    }
  }
}

</style>
