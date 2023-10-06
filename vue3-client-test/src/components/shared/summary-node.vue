<script>
import { labelByLang, capitalize, convertResourceLink } from '@/utils/filters';
import { mapState } from 'pinia';
import { Dropdown } from 'floating-vue';
import { useSettingsStore } from '@/stores/settings';
import * as StringUtil from 'lxljs/string';
import LensMixin from '@/components/mixins/lens-mixin.vue';
import ItemMixin from '@/components/mixins/item-mixin.vue';
import OverflowMixin from '@/components/mixins/overflow-mixin.vue';
import PreviewCard from '@/components/shared/preview-card.vue';

export default {
  name: 'summary-node',
  mixins: [LensMixin, ItemMixin, OverflowMixin],
  props: {
    item: {
      type: [Object, String],
      default: null,
    },
    parentId: {
      type: String,
      default: '',
    },
    isLast: {
      type: Boolean,
      default: false,
    },
    isStatic: {
      type: Boolean,
      default: false,
    },
    handleOverflow: {
      type: Boolean,
      default: true,
    },
    fieldKey: {
      type: String,
      default: '',
    },
  },
  computed: {
    ...mapState(useSettingsStore, ['settings']),
    isLinked() {
      if (this.focusData.hasOwnProperty('@id') && this.focusData['@id'].split('#')[0] !== this.parentId.split('#')[0]) {
        return true;
      }
      return false;
    },
    isLibrisResource() {
      return StringUtil.isLibrisResourceUri(this.recordId, this.settings);
    },
    routerPath() {
      const uriParts = this.recordId.split('/');
      const fnurgel = uriParts[uriParts.length - 1];
      return `/${fnurgel}`;
    },
  },
  methods: {
    convertResourceLink, labelByLang, capitalize,
  },
  components: {
    PreviewCard,
    Dropdown,
  },
};
</script>

<template>
  <div class="SummaryNode">
    <span class="SummaryNode-label" v-if="!isLinked || isStatic" ref="ovf-label" @click.prevent.self="e => e.target.classList.toggle('expanded')">
      <span v-if="fieldKey === 'instanceOf' && item['@type'] !== 'Work'">
        {{ capitalize(labelByLang(focusData['@type'])) }} •
      </span>
      {{ typeof item === 'string' ? getStringLabel : getItemLabel }}{{ isLast ? '' : ';&nbsp;' }}
      <resize-observer v-if="handleOverflow" @notify="calculateOverflow" />
    </span>

    <Dropdown
      v-if="isLinked && !isStatic"
      :disabled="!hoverLinks"
      :triggers="['hover', 'focus']"
    >
      <span class="SummaryNode-link tooltip-target">
        <router-link v-if="isLibrisResource" :to="routerPath">
          <span v-if="fieldKey === 'instanceOf' && focusData['@type'] !== 'Work'">
            {{ capitalize(labelByLang(focusData['@type'])) }} •
          </span>
          {{getItemLabel}}
        </router-link>
        <a v-if="!isLibrisResource" :href="convertResourceLink(focusData['@id'])">{{getItemLabel}}</a>
      </span>

      <template #popper>
        <PreviewCard :focus-data="focusData" :record-id="recordId" />
      </template>
    </Dropdown>
  </div>
</template>

<style lang="scss">
.SummaryNode {
  display: inline-block;
  &-link {
    margin-right: 0.5em;
    > a {
      border-color: $brand-primary;
      color: darken($brand-primary, 10%);
      text-decoration-line: underline;
      text-decoration-style: dotted;
      &:hover {
        color: darken($brand-primary, 20%);
        border-color: darken($brand-primary, 20%);
      }
    }
  }

  &-label {
    // max 3 lines before ellipsis
    // works in all major modern browsers
    // https://stackoverflow.com/a/13924997
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-inline-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    vertical-align: bottom;
    &.expanded {
      -webkit-line-clamp: unset;
      line-clamp: unset;
    }

    &.overflown {
      &::before {
        font-family: FontAwesome;
        content: "\F054";
        font-weight: normal;
        color: $brand-primary;
        display: inline-block;
        margin-right: 5px;
        transition: transform 0.1s ease;
      }

      &.expanded {
        &::before {
          transform: rotate(90deg);
        }
      }
    }
  }
}

</style>
