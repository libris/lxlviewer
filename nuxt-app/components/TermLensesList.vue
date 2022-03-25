<template>      
  <div class="TermLensesList">
    <span class="TermLensesList-completed">{{ level }}</span> <i class="bi-chevron-left"></i>
    <ul class="TermLensesList-list">
      <li v-for="(property, index) in listWithIds" :key="index">
        <span class="TermLensesList-listBullet"><i class="bi-arrow-left"></i></span>
        <template v-if="property.hasOwnProperty('alternateProperties')">
          <span class="TermLensesList-alternatePropertiesLabel">
            Select first available <i class="bi-chevron-left"></i>
          </span>
          <ul class="TermLensesList-alternateProperties">
            <li v-for="(alternateProperty, index) in property.alternateProperties" :key="index">
              <EntityNode :entity="alternateProperty" />
            </li>
          </ul>
        </template>
        <template v-else>
          <EntityNode :entity="property" />
        </template>
      </li>
    </ul>
  </div>
</template>

<script>
import { isObject } from 'lodash-es';
import { mapGetters } from 'vuex';
import * as VocabUtil from 'lxljs/vocab';
import EntityNode from '@/components/EntityNode';

export default {
  data() {
    return {

    }
  },
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    level: {
      type: String,
      default: '',
    },
  },
  computed: {
    ...mapGetters(['vocab', 'vocabContext', 'resources', 'settings', 'appState']),
    listWithIds() {
      const originalList = this.list;
      const withIds = [];
      for (let i = 0; i < originalList.length; i++) {
        if (originalList[i].hasOwnProperty('alternateProperties')) {
          const alternateWithIds = [];
          const propertyNode = originalList[i];
          for (let x = 0; x < propertyNode.alternateProperties.length; x++) {
            alternateWithIds.push(this.termIntoId(propertyNode.alternateProperties[x]));
          }
          withIds.push({ 'alternateProperties': alternateWithIds });
        } else {
          withIds.push(this.termIntoId(originalList[i]));
        }
      }
      return withIds;
    },
  },
  methods: {
    isObject(property) {
      return isObject(property);
    },
    termIntoId(termString) {
      if (termString.includes('@reverse')) {
        return this.translateReverse(termString);
      }
      return { '@id': `https://id.kb.se/vocab/${termString}` };
    },
    translateReverse(reverseString) {
      const reverseLabel = reverseString.split('/').pop();
      const reverseItem = VocabUtil.getTermObject(reverseLabel, this.vocab, this.vocabContext);
      if (reverseItem.hasOwnProperty('inverseOf') && reverseItem.inverseOf.hasOwnProperty('@id')) {
        return reverseItem.inverseOf;
      } else {
        return null;
      }
    },
  },
  components: {
    EntityNode,
  },
}
</script>

<style lang="scss">

.TermLensesList {
  padding: 0.5em 0 0 1.5rem;
  display: flex;
  align-items: center;
  li {
    padding: 0 0 0 0.5em;
  }
  ul {
    margin-bottom: 0;
  }
  &-completed {
    border: 1px solid;
    padding: 0.25em;
    border-radius: 0.25em;
  }
  &-listBullet {
    margin-right: 0.5em;
  }
  a {
    color: $kb-secondary-turquoise;
    text-decoration: none;
    word-break: break-all;
    &:hover {
      text-decoration: underline;
    }
  }
  &-list {
    border-radius: 0.5em;
    border: 1px solid $gray-600;
    border-width: 0px 0px 0px 2px;
    padding-left: 1em;
    > li {
      display: flex;
      margin: 0px 0px 0.2em 0;
      align-items: center;
    }
  }
  &-alternatePropertiesLabel {
    font-variant: all-small-caps;
  }
  &-alternateProperties {
    list-style: none;
    border-radius: 0.5em;
    border: 1px solid $gray-600;
    border-width: 0px 0px 0px 2px;
    padding: 0px;
  }
}

</style>