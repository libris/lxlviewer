<script>
/*
  Entity summary is presented from this component, either within Inspector 
  header or in fixed bar at top of window.
*/

import * as _ from 'lodash';
import * as StringUtil from '@/utils/string';
import EntitySummary from '@/components/shared/entity-summary';
import LensMixin from '@/components/mixins/lens-mixin';
import { mapGetters } from 'vuex';

export default {
  name: 'entity-header',
  mixins: [LensMixin],
  props: {
    full: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showCompact: false,
    };
  },
  methods: {
    handleScroll() {
      if (document.body.scrollTop > this.headerThreshold 
      || document.documentElement.scrollTop > this.headerThreshold) {
        this.showCompact = true;
      } else {
        this.showCompact = false;
      }
    },
  },
  computed: {
    ...mapGetters([
      'inspector',
      'resources',
    ]),
    state() {
      const state = this.inspector.status.level;
      if (state === 'mainEntity') {
        return 'Instance';
      } if (state === 'work') {
        return 'Work';
      }
      return 'Unknown';
    },
    focusData() {
      return this.inspector.data.mainEntity;
    },
    headerThreshold() {
      const headerContainer = document.getElementById('main-header');
      return headerContainer.offsetTop + headerContainer.offsetHeight - 20;
    },
    compactSummary() {
      let summary = [];
      _.each(this.getSummary, (summaryArray) => {
        summary = summary.concat(StringUtil.getFormattedEntries(summaryArray, this.resources.vocab, this.settings, this.resources.context));
      });
      return summary.join(' • ');
    },
  },
  beforeDestroy() {
    window.removeEventListener('scroll', _.throttle(this.handleScroll, 300));
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener('scroll', _.throttle(this.handleScroll, 300));
    });
  },
  components: {
    'entity-summary': EntitySummary,
  },
};
</script>

<template>
  <div class="EntityHeader HeaderComponent">
    <div class="EntityHeader-body HeaderComponent-body is-full">
      <entity-summary :focus-data="focusData" :should-link="false" :valueDisplayLimit=3></entity-summary>
    </div>
    <div class="EntityHeader-body HeaderComponent-body is-compact">
      <div class="compact-header" :class="{ 'show-compact': showCompact }">
      {{ compactSummary }}
      </div>
    </div>
  </div>
</template>

<style lang="less">

.HeaderComponent {
  display: flex;
  margin-bottom: 20px;
  border: 1px solid @gray-lighter;
  border-radius: 4px;
  padding: 15px 20px;

  &-body {
    &.is-full {
      flex: 8 8 100%;
      max-width: 100%;
      min-width: 0;
      .entity-summary {
        border-width: 0;
        height: 100%;
        * {
          color: @white;
        }
      }
    }

    &.is-compact {
      position: fixed;
      z-index: 2;
      top: 0;
      left: 0;
      width: 100%;
      
      @media print {
        display: none;
      }

      .compact-header {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        background: @brand-primary;
        color: @white;
        padding: 0.5em;
        box-shadow: 0 2px 5px rgba(0,0,0,.26);
        max-height: 0px;
        opacity: 0;
        transition: all 0.3s ease;
        line-height: 0;
        
        &.show-compact {
          max-height: 55px;
          opacity: 1;
          line-height: inherit;
        }
      }
    }
  }
}

</style>
