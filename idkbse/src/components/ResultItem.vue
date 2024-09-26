<template>
  <div class="ResultItem" :class="{ 'hovered': hovered, 'expanded': expanded }" @mouseover="hovered = true" @mouseout="hovered = false">
    <div class="ResultItem-header" :class="{ 'cursor-pointer': !forceExpanded }" @click="toggle" @keyup.enter="toggle(true)" tabindex="0">
      <span class="ResultItem-title" :class="{'as-header': isDocumentView || isVocabIndex }">
        <template v-if="!forceExpanded">
          <i class="bi bi-chevron-right" v-if="!expanded"></i>
          <i class="bi bi-chevron-down" v-if="expanded"></i>
        </template>
        {{ getItemLabel }}<span v-if="isVocabTerm" class="ResultItem-titleTerm">{{ entityData['@id'].split('/').pop() }}</span>
      </span>
      <template v-if="entity.hasOwnProperty('inScheme')">
        <EntityNode :is-chip="true" class="d-none d-lg-block" v-if="entity.inScheme" :parent-key="'inScheme'" :entity="entity.inScheme" />
      </template>
      <template v-if="Array.isArray(entity['@type'])">
        <EntityNode :is-chip="true" class="d-none" :class="{'d-xl-block': entity.inScheme, 'd-lg-block': !entity.inScheme }" :parent-key="'@type'" :entity="entity['@id'][0]" />
      </template>
      <template v-else>
        <EntityNode :is-chip="true" :parent-key="'@type'" class="d-none" :class="{'d-xl-block': entity.inScheme, 'd-lg-block': !entity.inScheme }" :entity="entity['@type']" />
      </template>
    </div>
    <EntityTable v-if="expanded" :entity="entityData" :show-download="showDownload" :show-other-services="showOtherServices" />
  </div>
</template>

<script>
import LensMixin from '@/mixins/lens';
import EntityNode from '@/components/EntityNode';
import EntityTable from '@/components/EntityTable';

export default {
  mixins: [LensMixin],
  data() {
    return {
      hovered: false,
      userExpanded: false,
    }
  },
  methods: {
    toggle(withEnter = false) {
      if (this.userExpanded) {
        this.collapse(withEnter);
      } else {
        this.expand(withEnter);
      }
    },
    expand(withEnter) {
      this.userExpanded = true;
      if (withEnter) {
        if (this.$refs.titleLink) {
          this.$refs.titleLink.focus();
        }
      }
    },
    collapse(withEnter) {
      this.userExpanded = false;
    },
  },
  computed: {
    isDocumentView() {
      return this.$route.name == 'all' || this.$route.name == 'vocab-term';
    },
    isVocabIndex() {
      return this.$route.name == 'vocab';
    },
    isVocabTerm() {
      const type = this.entityData['@type'];
      return type === 'Property' || type === 'Class' || type === 'DatatypeProperty';
    },
    thingUrl() {
      return this.entity['@id'].replace('https://id.kb.se/', '/');
    },
    showGotoLink() {
      if (this.thingUrl == this.$route.path) {
        return false;
      }
      return true;
    },
    entityData() {
      return this.entity;
    },
    expanded() {
      return this.forceExpanded || this.userExpanded;
    },
  },
  props: {
    entity: {
      type: Object,
      default: null,
    },
    forceExpanded: {
      type: Boolean,
      default: false,
    },
    showDownload: {
      type: Boolean,
      default: true,
    },
    showOtherServices: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    EntityNode,
    EntityTable,
  },
}
</script>

<style lang="scss">
.ResultItem {
  background-color: $gray-100;
  border: solid $gray-200;
  border-width: 0px 1px 1px 1px;
  &:first-child {
    border-width: 1px 1px 1px 1px;
  }
  &-header {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 1em 0.25em 1em 0;
    gap: 1em;
    line-height: 1.2;
    &.cursor-pointer {
      cursor: pointer;
    }
    @media (min-width: 992px) {
      flex-wrap: unset;
    }
    @media (min-width: 768px) {
      line-height: auto;
      padding: 0.5em 1em 0.5em 0;
    }
    > span {
      padding: 0.1rem;
      align-items: center;
      display: flex;
      @media (min-width: 768px) {
        padding: 0.5em;
      }
      &:first-child {
        flex-grow: 1;
      }
    }
  }
  &-title {
    &.as-header {
      font-size: 2rem;
      padding: 0.5em 0.25em 0 1rem;
      @media (min-width: 768px) {
        padding: 0.5em 0.5em 0 1.5rem;
      }
    }
    display: flex;
    gap: 0.5em;
    color: $kb-secondary-turquoise;
    font-weight: 500;
    width: 100%;
    @media (min-width: 992px) {
      width: unset;
    }
    a {
      color: $kb-secondary-turquoise;
      font-weight: 500;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  &-titleTerm {
    border: solid $gray-300;
    border-width: 0px 0px 0px 2px;
    padding-left: 0.5em;
    color: $gray-600;
    font-weight: 400;
  }
  &-link {
    font-size: 85%;
    font-weight: 500;
    color: $gray-600;
    padding: 0.1em 0.25em;
    border-radius: 0.5em;
    background-color: $gray-200;
    text-decoration: none;
  }
  &-body {
    padding: 0.5em 1em 0.5em 1.5em;
  }
  &-bodyRow {
    border: solid $gray-200;
    border-width: 0px 0px 1px 0px;
    display: flex;
    padding: 0.5em 0;
    &:last-child {
      border-width: 0px;
    }
  }
  &-bodyKey {
    color: $gray-700;
    flex-basis: 15em;
  }
  &-bodyValue {
    flex-grow: 0;
    flex-basis: 100%;
    a {
      color: $kb-secondary-turquoise;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  &.expanded, &.hovered {
    background-color: $white;
    position:relative;
    z-index: 500;
    background-color: $white;
    @media (min-width: 768px) {
      box-shadow: 0 0.15em 0.25em 0 rgba(0, 0, 0, 0.25);
    }
    .chip {
      border-color: $gray-500;
      color: $black;
      background-color: $white;
    }
  }
  &.expanded {

  }
  &.hovered {

  }
  .chip {
    transition: 0.25s ease all;
    border: 1px solid $gray-100;
    background-color: $gray-100;
    border-radius: 2em;
    color: $gray-600;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.25rem 0.4rem;
    @media (min-width: 768px) {
      padding: 0.5em 0.75em;
    }
    font-size: 1rem;
  }

}

</style>
