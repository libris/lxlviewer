<template>
  <div class="VocabTermlist">
    <div class="VocabTermlist-termListControllers">
      <button class="btn" :class="{'btn-dark': listShown == 'Classes', 'btn-kb-primary-grey': listShown != 'Classes' }" @click="listShown = 'Classes'">{{ translateUi('Classes') }}</button>
      <button class="btn" :class="{'btn-dark': listShown == 'Properties', 'btn-kb-primary-grey': listShown != 'Properties' }" @click="listShown = 'Properties'">{{ translateUi('Properties') }}</button>
    </div>
    <!-- <div class="VocabTermlist-termListControllers">
      <input type="checkbox" id="showMarc" v-model="showMarc" /> <label for="showMarc">Visa marc-termer</label>
    </div> -->
    <div class="VocabTermlist-termList" v-if="vocab && listShown == 'Classes'">
      <ul>
        <li is="VocabMenuItem" v-for="item in classes" :item="item[1]" :key="item[1]['@id']" />
      </ul>
    </div>
    <div class="VocabTermlist-termList" v-if="vocab && listShown == 'Properties'">
      <ul>
        <li is="VocabMenuItem" v-for="item in properties" :item="item[1]" :key="item[1]['@id']" />
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import VocabMenuItem from '@/components/VocabMenuItem';

export default {
  data() {
    return {
      defaultList: 'Classes',
      showMarc: false,
    }
  },
  computed: {
    ...mapGetters(['vocab', 'vocabClasses', 'vocabProperties', 'vocabContext']),
    // chosenList() {
    //   if (this.listShown === 'Classes') {
    //     return this.classes;
    //   } else {
    //     return this.properties;
    //   }
    // },
    listShown() {
      if (this.currentTerm != null) {
        return 'Classes';
      }
      return this.defaultList;
    },
    classKeys() {
      return Array.from(this.classes.keys());
    },
    classes() {
      return this.vocabClasses;
    },
    propertyKeys() {
      return Array.from(this.properties.keys());
    },
    properties() {
      return this.vocabProperties;
    },
  },
  props: {
    currentTerm: {
      type: String,
      default: null,
    },
  },
  components: {
    VocabMenuItem,
  },
}
</script>

<style lang="scss">
.VocabTermlist {
    display: flex;
    flex-direction: column;
    height: 100%;  

  &-termListControllers {
    border: solid $gray-500;
    border-width: 0px 0px 1px 0px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    padding: 0.5em 0;
  }
  &-termList {
    flex-grow: 1;
    border: solid $gray-300;
    border-width: 0px 0px 1px 0px;
    height: 25vh;
    overflow-y: auto;
    overflow-x: hidden;
    @media (min-width: 768px) {
      height: 100%;
    }
    ul {
      padding: 1em 0em;
      li {
        list-style: none;
        a {
          text-decoration: none;
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
}
</style>
