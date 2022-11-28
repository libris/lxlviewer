<script>
import PreviewCard from '@/components/shared/preview-card';
import * as HttpUtil from "../../utils/http";
import {mapGetters} from "vuex";
import * as DisplayUtil from "lxljs/display";

export default {
  name: 'language-entry',
  props: {
    tag: {
      type: String,
      default: '',
    },
    isRomanizable: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: true,
    },
    removeIsAllowed: {
      type: Boolean,
      default: false,
    },
    uri: {
      type: String,
      default: '',
    }
  },
  data() {
    return {
      data: null,
    };
    },
  computed: {
    ...mapGetters([
      'inspector',
      'settings',
      'resources'
    ]),
    isLinked() {
      return this.data !== null;
    },
    focusData() {
      const graph = this.data || null;
      return graph ? graph[1] : {};
    },
    label() {
      if (this.data) {
        let graph = this.data;

        if (graph[1]['langTag'] !== this.tag) {
          this.setDocument();
        }

        return DisplayUtil.getItemLabel(graph[1],
          this.resources,
          this.inspector.data.quoted,
          this.settings);
      } else {
        return this.tag;
      }
    },
    recordId() {
      return this.isLinked ? this.focusData['@id'] : {};
    }
  },
  methods: {
    async setDocument() {
      const document = await HttpUtil.getDocument(this.uri, undefined, false);
      const data = document ? document.data : null;
      this.data = data ? data['@graph'] : null;
    },
  },
  components: {
    PreviewCard
  },
  mounted() {
    //If this is properly in embellished (be the backend) we can use:
    // return DataUtil.getEmbellished(
    //   this.uri,
    //   this.inspector.data.quoted,
    // );
    // in a computed instead.
    this.setDocument();
  }
}
</script>

<template>
<span class="LanguageEntry-pill">
  <v-popover v-if="this.isLinked" class="LanguageEntry-popover" placement="bottom-start"
             @show="$refs.previewCard.populateData()">
    <span class="LanguageEntry-pill-label LanguageEntry-pill-link">
      <a :href="this.uri | convertResourceLink">
        {{ this.label }}
      </a>
    </span>
    <template slot="popover">
      <PreviewCard ref="previewCard" :focus-data="focusData" :record-id="this.recordId"/>
    </template>
  </v-popover>
  <span class="LanguageEntry-pill-removeButton" v-if="!isLocked">
            <i class="fa fa-times-circle icon icon--sm chip-icon"
               v-if="!isLocked && removeIsAllowed"
               role="button"
               tabindex="0"
               @click="$emit('remove')"
               @keyup.enter="$emit('remove')"
               :aria-label="'Remove' | translatePhrase"
               v-tooltip.top="translate('Remove')">
            </i>
            <i class="fa fa-times-circle icon icon--sm chip-icon is-disabled"
               v-if="!isLocked && !removeIsAllowed"></i>
          </span>
  <span v-if="!this.isLinked" class="LanguageEntry-pill-label">
    {{ this.label }}
  </span>
</span>

</template>

<style lang="less">
.LanguageEntry{
  &-pill {
    display: grid;
    justify-items: start;
    align-items: center;
    grid-area: pill;
    grid-template-columns: 1fr auto;
    grid-template-areas:
    "label remove";
    border-radius: 2em;
    min-width: 20px;
    height: 22px;
    color: #196f25;
    background-color: #D9EBDC;
    font-size: 13px;

    &-label {
      font-weight: 600;
      cursor: default;
      white-space: nowrap;
      text-overflow: ellipsis;
      grid-area: label;
      padding: 0 8px 0 8px
    }
    &-link {
      a:link {
        color: #196f25;
      }
      a:visited {
        color: #196f25;
      }
      cursor: pointer;
    }

    &-removeButton {
      width: 1.2em;
      height: 1.2em;
      line-height: 1.2em;
      grid-area: remove;
      padding-right: 20px;
    }
  }
  &-popover > .trigger {
    max-width: 100%;
  }


}

</style>
