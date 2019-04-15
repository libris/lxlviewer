<script>
/* 

  HOW TO USE:
  This component can show a tablist and emit an event on tab click.

  Props:
    * Tabs    - Expects an array of tab-objects
    * Active  - Expects a string that it will match against the id on the tab-object and put as active.
    * Link    - If true, component expects tab-objects to have a link prop. 
                It will then render a <router-link> instead of emitting an event.

  Tab-Objects:
    A tab object needs two things.
      * id   -  Just an identifier, it is used when emitting the go-event and to match against the "active" prop.
      * text -  A fancy text for your tab, which should be in english. The component will automatically try to
                translate this text to the users language, based on the i18n file.
      * html -  (Optional) Raw html for the item, will replace 'text'

    Example tab-object:
      {'id': 'MyTab1', 'text': 'My tab text' }
      {'id': 'MyTab1', 'html': 'My <strong>tab</strong> text' }

  The go-event:
    If a tab is clicked, it will emit an event with the id on the tab.
    It's up to you to add a handler to this. See example below.

  Example use:
      <tab-menu @go="myHandler" :tabs="[
        {'id': 'MyTab1', 'text': 'My tab text' },
        {'id': 'MyOtherTab', 'text': 'My other text' }
      ]" :active="myActivePageVariable"></tab-menu>

*/

export default {
  name: 'tab-menu',
  props: {
    tabs: {
      default: () => [],
      type: Array,
    },
    active: {
      type: String,
      default: '',
    },
    link: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
    };
  },
  methods: {
    go(name) {
      this.$emit('go', name);
    },
    moveUnderline() {
      this.$nextTick(() => {
        const $activeTab = this.$el.querySelector('.is-active');
        const $tabList = this.$refs.tablist;
        if ($activeTab && $tabList) {
          const $underline = this.$refs.underline;
          const listElements = $tabList.getElementsByTagName('li');
          let listWidth = 0;
          for (let i = 0; i < listElements.length; i++) {
            listWidth += listElements[i].clientWidth;
          }
          const padding = parseInt(window.getComputedStyle($activeTab).paddingLeft.replace('px', ''));
          const left = `${parseInt((listWidth * -1) + $activeTab.offsetLeft + (padding * 2) - 4)}px`;
          const width = `${parseInt($activeTab.clientWidth - (padding * 2))}px`;
          $underline.style.width = width;
          $underline.style.left = left;
        }
      });
    },
  },
  computed: {
    hasActive() {
      return this.tabs.some(el => el.id === this.active);
    },
  },
  components: {
  },
  watch: {
    '$route.fullPath'(value, oldValue) {
      if (value !== oldValue) {
        this.$nextTick(() => {
          this.moveUnderline();
        });
      }
    },
    tabs() {
      this.moveUnderline();
    },
    active(value, oldValue) {
      if (value !== oldValue) {
        this.$nextTick(() => {
          this.moveUnderline();
        });
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.moveUnderline();
      setTimeout(() => {
        this.moveUnderline(); // fallback to catch weird underline positions
      }, 300);
    });
  },
};
</script>

<template>
  <div class="TabMenu">
    <ul v-if="!link" class="TabMenu-tabList" role="tablist" ref="tablist">
      <li class="TabMenu-tab"
        v-for="item in tabs" 
        tabindex="0"
        :key="item.id" 
        @click="go(item.id)" 
        @keyup.enter="go(item.id)"
        :class="{'is-active': active === item.id }"
        role="tab">
          <span v-if="item.html" v-html="item.html"></span>
          <span v-else>{{item.text | translatePhrase}}</span>
      </li>
      <hr v-show="hasActive" class="TabMenu-underline" ref="underline">
    </ul>
    <ul v-else class="TabMenu-tabList" ref="tablist">
      <li v-for="item in tabs" 
        class="TabMenu-linkContainer"
        :key="item.id">
        <router-link class="TabMenu-tab" 
          :class="{'is-active': active === item.id }" 
          :to="item.link">
          <span v-if="item.html" v-html="item.html"></span>
          <span v-else>{{item.text | translatePhrase}}</span>
        </router-link>
      </li>
      <hr v-show="hasActive" class="TabMenu-underline" ref="underline">
    </ul>
  </div>
</template>

<style lang="less">
@tabPadding: 10px;

.TabMenu {
  display: inline-block;
  opacity: 1;
  transition: opacity 0.25s ease;
  position: relative;

  &-tabList {
    margin: 10px 0 10px -10px;
    padding: 0;
    white-space: nowrap;
  }
  &-underline {
    display: inline-block;
    transition: all 0.25s ease .025s;
    position: relative;
    height: 3px;
    top: 0.5em;
    margin: 0px;
    min-width: 5px;
    border: none;
    background-color: @brand-primary;
  }

  &-linkContainer {
    display: inline-block;
  }

  &-tab {
    cursor: pointer;
    text-decoration: none;
    position: relative;
    display: inline-block;
    padding: 5px @tabPadding;
    color: @grey;
    font-weight: 600;
    font-size: 16px;
    font-size: 1.6rem;
    margin: 5px 0px;
    text-transform: uppercase;
    transition: color 0.2s ease;
    border: dashed transparent;
    border-width: 1px 0px 1px 0px;
    white-space: nowrap;

    @media (min-width: 768px) {
      font-size: 18px;
      font-size: 1.8rem;
    }

    &:hover,
    &:focus {
      color: @brand-primary;
      text-decoration: none;
    }
    &.is-active {
      color: @black;
      text-decoration: none;
    }
  }
}
</style>
