<script>
import { mapGetters } from 'vuex';
import EntitySummary from '@/components/shared/entity-summary';
import * as RecordUtil from '@/utils/record';

export default {
  name: 'post-picker',
  props: {
    name: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
    },
    info: {
      type: String,
      default: '',
    },
  },
  components: {
    'entity-summary': EntitySummary,
  },
  data() {
    return {
      expanded: true,
      fetchedItems: [],
      selected: null,
      error: '',
      loading: false,
    };
  },
  computed: {
    ...mapGetters([
      'settings',
      'directoryCare',
    ]),
  },
  methods: {
    getAllPosts() {
      this.loading = true;
      const promiseArray = [];
      this.items.forEach((item) => {
        promiseArray.push(this.getOnePost(item));
      });
      Promise.all(promiseArray).then((result) => {
        this.transformPosts(result);
      }, (error) => {
        this.loading = false;
        this.error = error;
        console.log(error);
      }); 
    },
    getOnePost(id) {
      const searchUrl = `${this.settings.apiPath}/find.json?q=${id}&@type=Instance`; // Noooo!
      return new Promise((resolve, reject) => {
        fetch(searchUrl).then((response) => {
          resolve(response.json());
        }, (error) => {
          reject(error);
        });
      });
    },
    transformPosts(data) {
      this.fetchedItems = data.map(item => item.items[0]);
    },
    selectThis(item) {
      this.selected = item;
      const changeObj = { [this.name]: RecordUtil.extractFnurgel(item['@id']) };
      this.$store.dispatch('setDirectoryCare', { ...this.directoryCare, ...changeObj });
    },
    unselectThis() {
      this.selected = null;
      const changeObj = { [this.name]: null };
      this.$store.dispatch('setDirectoryCare', { ...this.directoryCare, ...changeObj });
    },
  },
  mounted() {
    this.getAllPosts();
  },

};
</script>

<template>
  <div class="PostPicker">
    <div class="PostPicker-dropdownContainer" v-if="!selected">
      <div class="PostPicker-toggle" @click="expanded = !expanded">
        <span class="PostPicker-toggleLabel">{{ 'Choose' | translatePhrase }}</span>
        <span class="PostPicker-toggleIcon" :class="{ 'expanded' : expanded}">
          <i class="fa fa-fw fa-chevron-down"></i>
        </span>
      </div>
      <div class="PostPicker-dropdown" v-if="expanded">
        <input type="text" class="PostPicker-input" autofocus :placeholder="'Search favourites' | translatePhrase">
        <div class="PostPicker-itemWrapper"
          :key="item['@id']"
          v-for="item in fetchedItems"
          @click="selectThis(item)">
          <entity-summary 
            :focus-data="item" 
            :should-link="false"
            :valueDisplayLimit=1></entity-summary>
        </div>
      </div>
    </div>
    <div class="PostPicker-selectedContainer" v-if="selected">
      <entity-summary 
        :focus-data="selected" 
        :should-link="false"
        :valueDisplayLimit=1></entity-summary>
      <div>
        <button @click="unselectThis">x</button>
      </div>
    </div>
    <p>{{info}}</p>
  </div>
</template>

<style lang="less">

.PostPicker  {
  height: 100%;
  background-color: @white;
  border: 1px solid @grey-lighter;
  padding: 20px;

  &-dropdownContainer,
  &-selectedContainer {
    border: 1px solid @gray-lighter;
    box-shadow: @shadow-panel;
    padding: 10px 15px;
    margin-bottom: 10px;
  }

  &-toggle {

    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }

  &-toggleLabel {
    color: @brand-darker;
    font-weight: 600;
  }

  &-toggleIcon {
    font-size: 14px;
    font-size: 1.4rem;
    transition: transform 0.2s ease;

    &.expanded {
      transform: rotate(180deg);
    }
  }

  &-dropdown {
    margin-top: 10px;
  }

  &-input {
    width: 100%;
    border: 1px solid @grey-lighter;
    border-radius: 4px;
    padding: 5px;
  }

  &-itemWrapper {
    cursor: pointer;
    border-top: 1px solid @grey-lighter;

    &:first-of-type {
      border-top: none;
    }

    &:hover {
      background-color: rgba(0, 128, 127, 0.1);
    }
  }

  & .EntitySummary {
    padding: 15px 5px;
  }

  & .EntitySummary-title {
    color: @brand-darker;
  }
}

</style>
