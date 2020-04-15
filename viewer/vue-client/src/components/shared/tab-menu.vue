<script>
/* 

  HOW TO USE:
  This component can show a tablist and emit an event on tab click.

  Props:
    * tabs      - Expects an array of tab-objects
    * active    - Expects a string that it will match against the id on the tab-object and put as active.
    * link      - If true, component expects tab-objects to have a link prop. 
                  It will then render a <router-link> instead of emitting an event.
    * lookStyle - Expects a string which will be used to "theme" the component (dark/light).    

  Tab-Objects:
    A tab object needs two things.
      * id          -  Just an identifier, it is used when emitting the go-event and to match against the "active" prop.
      * text        -  A fancy text for your tab, which should be in english. The component will automatically try to
                        translate this text to the users language, based on the i18n file.
      * icon        -  (Optional) The tab icon                        
      * html        -  (Optional) Raw html for the item, will replace 'text'
      * disabled    -  (Optional) Boolean - disables the tab
      * tooltipText -  (Optional) Display given text on tab hover or focus
      * badge       -  (Optional) An object containing badge parameters to be displayed next to a tab

    Example tab-object:
      {'id': 'MyTab1', 'text': 'My tab text' }
      {'id': 'MyTab1', 'html': 'My <strong>tab</strong> text' }
      {'id': 'MyTab1', 'text': 'My tab text', 'disabled': true, 'tooltipText': 'Access denied' }
      {'id': 'MyTab1', 'text': 'My tab text', 'badge': {
        value: 2,
        type: 'accent'
      } }

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
      default: 'light',
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
          const paddingLeft = parseInt(window.getComputedStyle($activeTab).paddingLeft.replace('px', ''));
          const paddingRight = parseInt(window.getComputedStyle($activeTab).paddingRight.replace('px', ''));
          const left = `${parseInt((listWidth * -1) + $activeTab.offsetLeft + paddingLeft + 5)}px`;
          const width = `${parseInt($activeTab.clientWidth - (paddingLeft + paddingRight))}px`;
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
    hasIcons() {
      return this.tabs.some(el => el.icon);
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
  <div class="TabMenu" :class="[`style-${lookStyle}`, {'has-icons': hasIcons }]">
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
      <hr v-show="hasActive" class="TabMenu-underline" ref="underline">
    </ul>
    <ul v-else class="TabMenu-tabList" ref="tablist">
      <li class="TabMenu-tab" 
        v-for="item in tabs"
        :class="{'is-active': active === item.id, 'is-disabled': item.disabled, 'has-badge': item.badge && item.badge.value }"
        :key="item.id">
          <router-link class="TabMenu-link"
            :event="item.disabled ? null : 'click'"            
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
          <span v-if="item.badge" class="badge UserCare-badge" :class="'badge-' + item.badge.type">{{ item.badge.value }}</span>
      </li>
      <hr v-show="hasActive" class="TabMenu-underline hidden-xs" ref="underline">
    </ul>
  </div>
</template>

<style lang="less">

.TabMenu {
  display: inline-block;
  opacity: 1;
  transition: opacity 0.25s ease;
  position: relative;

  &-link,
  &-tabText {
    color: @grey-dark;
    
    .style-dark & {
      color: @grey-light;
    }

    .TabMenu-tab:not(.is-disabled) & {
      &:hover,
      &:focus {
        color: @brand-primary;
        .style-dark & {
          color: @white;
        }
      }
    }
    .is-active & {
      color: @black;
      .style-dark & {
        color: @white;
      }
    }

    .TabMenu-tab.is-disabled & {
      color: @grey-light;
      cursor: not-allowed;      
      .style-dark & {
        color: @grey-darker;
      }
      
    }
  }

  &-link {    
    display: inline-block;
    text-decoration: none;
    font-size: unset;
    position: relative;

    &:hover,
    &:focus {
      text-decoration: none;
    }
    
    @media screen and (min-width: @screen-sm) {
      font-size: 15px;
      font-size: 1.5rem;
    }    
  }

  &-tab {
    cursor: pointer;
    user-select: none;
    text-decoration: none;
    position: relative;
    display: inline-block;
    height: 100%;    
    text-transform: uppercase;
    transition: color 0.2s ease;
    white-space: nowrap;
    margin: 5px 0;
    padding: 0 10px;

    .has-icons & {
      padding: 0 5px;
      &.is-active {
        background-color: @brand-primary;
        border-radius: 4px;
      }
    }
    
    @media screen and (min-width: @screen-sm) {
      .has-icons & {
        padding: 0 10px;        
        &.is-active {        
          background-color: transparent;
          border-radius: 0;
        }
      }
      &.has-badge {
        padding-right: 30px;
      }
    }

    .badge {
      position: absolute;
      top: 1px;
      right: 1px;

      @media screen and (min-width: @screen-sm) {
        top: calc(50% - 15px);
        right: 6px;
      }
    }
  }

  &-tabText {
    display: inline-block;
    margin: 5px 0;
    font-weight: 600;
    font-size: 18px;
    font-size: 1.6rem;
  }

  &-tabList {
    margin: 10px 0 10px -10px;    
    height: 100%;
    padding: 0;
    white-space: nowrap;

    @media screen and (max-width: @screen-sm) {
      .has-icons & {
        margin-left: -15px;
      }
    }
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
    .style-dark & {
      background-color: #f7a07b;
    }    
  }

  &-linkContainer {
    display: inline-block;
  }
}
</style>
