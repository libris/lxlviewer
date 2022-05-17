<template>
  <div class="VocabTermlist">
    <div class="VocabTermlist-termListControllers">
      <button class="btn" :class="{'btn-dark': listShown == 'Classes', 'btn-kb-primary-grey': listShown != 'Classes' }" @click="listChosen = 'Classes'">{{ translateUi('Classes') }}</button>
      <button class="btn" :class="{'btn-dark': listShown == 'Properties', 'btn-kb-primary-grey': listShown != 'Properties' }" @click="listChosen = 'Properties'">{{ translateUi('Properties') }}</button>
    </div>
    <div class="VocabTermlist-filterControllers">
      <div class="VocabTermlist-filter"><label>{{ translateUi('Filter') }}</label> <input type="text" id="termListFilter" v-model="termListFilter" /></div>
      <div class="VocabTermlist-filter"><label for="showMarc">{{ translateUi('Show marc') }}</label> <input type="checkbox" id="showMarc" v-model="showMarc" /></div>
    </div>
    <div class="VocabTermlist-termList" v-if="vocab">
      <ul>
        <li is="VocabMenuItem" v-for="(item, index) in filteredList" :item="item" :key="index" />
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import * as StringUtil from 'lxljs/string';
import VocabMenuItem from '@/components/VocabMenuItem';

export default {
  data() {
    return {
      defaultList: 'Classes',
      showMarc: false,
      termListFilter: '',
      listChosen: null,
    }
  },
  methods: {
    filterList(list, keyword) {
      const lowerCaseKeyword = keyword.toLowerCase();
      return list.filter((item) => {
        const itemLabel = StringUtil.getLabelByLang(item['@id'], this.settings.language, this.resources);
        console.log(item['@id']);
        return item['@id'].toLowerCase().includes(lowerCaseKeyword) || itemLabel.toLowerCase().includes(lowerCaseKeyword);
      });
    },
    sortList(list) {
      return list.sort((a, b) => {
        return a['@id'].localeCompare(b['@id'])
      });
    },
  },
  computed: {
    ...mapGetters(['vocab', 'vocabClasses', 'vocabProperties', 'resources', 'settings', 'vocabContext']),
    chosenList() {
      if (this.listShown === 'Classes') {
        return this.classes;
      } else {
        return this.properties;
      }
    },
    listShown() {
      if (this.listChosen != null) {
        return this.listChosen;
      }
      if (this.currentTerm != null) {
        return 'Classes';
      }
      return this.defaultList;
    },
    kbvList() {
      let list = this.chosenList;
      list = this.chosenList.filter((item) => {
        return item.hasOwnProperty('isDefinedBy') && item.isDefinedBy['@id'] === this.vocabContext[0]['@vocab'];
      })
      return list;
    },
    marcList() {
      let list = this.chosenList;
      list = this.chosenList.filter((item) => {
        return item['@id'].includes(this.vocabContext[0]['marc']);
      })
      return list;
    },
    filteredList() {
      let list = this.kbvList;
      if (this.showMarc) {
        list = list.concat(this.marcList);
      }
      return this.filterList(list, this.termListFilter);
    },
    classes() {
      return this.sortList([...this.vocabClasses]);
    },
    properties() {
      return this.sortList([...this.vocabProperties]);
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
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-items: center;
    padding: 0.5em 0;
    button {
      flex-grow: 1;
      margin-right: 0.5em;
    }
  }
  &-filterControllers {
    border: solid $gray-500;
    border-width: 0px 0px 1px 0px;
    display: flex;
    flex-direction: column;
    padding: 0.5em 0;
    input {
      border-radius: 0.25rem;
      border: 1px solid $gray-500;
    }
  }
  &-filter {
    display: grid;
    margin-right: 0.5em;
    grid-template-columns: 1fr 3fr;
    label {
      white-space: nowrap;
      padding-right: 0.5em;
    }
    input {
      align-self: center;
      min-width: 1em;
    }
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
