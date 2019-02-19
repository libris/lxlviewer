<script>
import { mapGetters } from 'vuex';
import EntitySummary from '@/components/shared/entity-summary';

export default {
  name: 'post-picker',
  props: {
    items: Array,
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
    };
  },
  computed: {
    ...mapGetters([
      'settings',
    ]),
  },
  methods: {
    getPosts() {
      const searchUrl = `${this.settings.apiPath}/find.json?q=${this.items[0]}&@type=Instance`;
      fetch(searchUrl).then(response => response.json()).then((res) => {
        if (res.totalItems === 1) {
          this.fetchedItems.push(res.items[0]);
        }
      });

      console.log(searchUrl);
    },
  },
  mounted() {
    this.getPosts();
  },

};
</script>

<template>
  <div class="PostPicker">
    <div class="PostPicker-dropdownContainer">
      <div class="PostPicker-toggle" @click="expanded = !expanded">
        <span class="PostPicker-toggleLabel">{{ 'Choose' | translatePhrase }}</span>
        <span class="PostPicker-toggleIcon" :class="{ 'expanded' : expanded}">
          <i class="fa fa-fw fa-chevron-down"></i>
        </span>
      </div>
      <div class="PostPicker-dropdown" v-if="expanded">
        <input type="text" class="PostPicker-input" autofocus :placeholder="'Search favourites' | translatePhrase">
        <!-- <ul>
          <li :key="id" v-for="id in items">{{id}}</li>
        </ul> -->
        <entity-summary 
          :key="item['@id']"
          v-for="item in fetchedItems"
          :action-settings="localEntitySettings" 
          :focus-data="item" 
          :should-link="false"
          :valueDisplayLimit=1></entity-summary>
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

  &-dropdownContainer {
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
}

</style>
