<script>
/* 

  HOW TO USE:
  This component can show a tablist and emit an event on tab click.

  Props:
    * tabs      - Expects an array of tab-objects
    * active    - Expects a string that it will match against the id on the tab-object and put as active.
    * link      - If true, component expects tab-objects to have a link prop. 
                  It will then render a <router-link> instead of emitting an event.
    * lookStyle - Expects a string which will be used to "theme" the component.

  Tab-Objects:
    A tab object needs two things.
      * id          -  Just an identifier, it is used when emitting the go-event and to match against the "active" prop.
      * text        -  A fancy text for your tab, which should be in english. The component will automatically try to
                        translate this text to the users language, based on the i18n file.
      * icon        -  (Optional) The tab icon                        
      * html        -  (Optional) Raw html for the item, will replace 'text'
      * disabled    -  (Optional) Boolean - disables the tab
      * tooltipText -  (Optional) Display given text on tab hover or focus

    Example tab-object:
      {'id': 'MyTab1', 'text': 'My tab text' }
      {'id': 'MyTab1', 'html': 'My <strong>tab</strong> text' }
      {'id': 'MyTab1', 'text': 'My tab text', 'disabled': true, 'tooltipText': 'Access denied' }

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
    lookStyle: {
      type: String,
      default: 'underline',
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
      if (this.lookStyle !== 'underline') {
        return;
      }
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
  <div class="TabMenu" :class="`style-${lookStyle}`">
    <ul v-if="!link" class="TabMenu-tabList" role="tablist" ref="tablist">
      <li class="TabMenu-tab"
        v-for="item in tabs" 
        tabindex="0"
        :key="item.id" 
        @click="item.disabled ? null : go(item.id)" 
        @keyup.enter="item.disabled ? null : go(item.id)"
        v-tooltip="{
          trigger: 'hover focus',
          content: item.tooltipText
        }"
        :class="{'is-active': active === item.id, 'is-disabled': item.disabled }"
        role="tab">
          <i v-if="item.icon" class="TabMenu-tabIcon visible-xs-block" :class="`fa fa-fw fa-${item.icon}`"></i>
          <span class="TabMenu-tabText" :class="{'hidden-xs': item.icon }" v-if="item.html" v-html="item.html"></span>
          <span class="TabMenu-tabText" :class="{'hidden-xs': item.icon }" v-else>{{item.text | translatePhrase}}</span>
      </li>
      <hr v-show="hasActive" v-if="lookStyle === 'underline'" class="TabMenu-underline" ref="underline">
    </ul>
    <ul v-else class="TabMenu-tabList" ref="tablist">
      <li class="TabMenu-tab" 
        v-for="item in tabs" 
        :key="item.id">
          <router-link class="TabMenu-link"
            :event="item.disabled ? null : 'click'"
            :class="{'is-active': active === item.id, 'is-disabled': item.disabled }" 
            :to="item.link"
            tabindex="0"
            v-tooltip="{
              trigger: 'hover focus',
              content: item.tooltipText
            }">        
            <i v-if="item.icon" class="TabMenu-tabIcon visible-xs-block" :class="`fa fa-fw fa-${item.icon}`"></i>
            <span class="TabMenu-tabText" :class="{'hidden-xs': item.icon }" v-if="item.html" v-html="item.html"></span>
            <span class="TabMenu-tabText" :class="{'hidden-xs': item.icon }" v-else>{{item.text | translatePhrase}}</span>
          </router-link>
      </li>
      <hr v-show="hasActive" v-if="lookStyle === 'underline'" class="TabMenu-underline" ref="underline">
    </ul>
  </div>
</template>

<style lang="less">

.TabMenu {
  display: inline-block;
  opacity: 1;
  transition: opacity 0.25s ease;
  position: relative;

  &-link {
    .style-background & {
      color: @white;
      text-decoration: none;
      font-size: unset;
      text-align: center;
      width: 100%;
      @media screen and (min-width: @screen-sm) {
        font-size: 15px;
        font-size: 1.5rem;
        padding: 8px 1em;
      }

      &:not(.is-disabled) {
        &:hover {
          background-color: darken(@brand-primary, 15%);
        }
      }
      &.is-active {
        background-color: @brand-primary !important;
      }

      &.is-disabled {
        color: @grey;
        cursor: not-allowed;
      }
    }
  }

  &-tab {
    cursor: pointer;
    user-select: none;
    text-decoration: none;
    position: relative;
    display: inline-block;
    height: 100%;
    font-weight: 600;
    margin: 5px 0px;
    text-transform: uppercase;
    transition: color 0.2s ease;
    white-space: nowrap;

    .style-background & {
      display: flex;
      align-items: center;
      justify-content: center;      
      flex-grow: 1;
      padding: 0;      
      margin: 0;
      transition: background-color 0.25s ease;
    }
    .style-underline & {
      padding: 5px 10px;
      color: @grey;
      font-size: 18px;
      font-size: 1.6rem;
  
      &.is-active {
        color: @black;
        text-decoration: none;
      }

      &:not(.is-disabled) {
        &:hover,
        &:focus {
          color: @brand-primary;
          text-decoration: none;
        }
      }

      &.is-disabled {
        color: @grey-light;
        cursor: not-allowed;
      }
    }
  }

  &.style-background {
    width: 100%;
    height: 100%;
  }

  &-tabList {
    .style-underline & {
      margin: 10px 0 10px -10px;
    }
    .style-background & {
      display: flex;
      justify-content: space-around;
      align-items: center;
    }
    height: 100%;
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
}
</style>
