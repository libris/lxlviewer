<script>
/* 

  HOW TO USE:
  This component can show a tablist and emit an event on tab click.

  Props:
    * Tabs    - Expects an array of tab-objects
    * Active  - Expects a string that it will match against the id on the tab-object and put as active.

  Tab-Objects:
    A tab object needs two things.
      * id   -  Just an identifier, it is used when emitting the go-event and to match against the "active" prop.
      * text -  A fancy text for your tab, which should be in english. The component will automatically try to
                translate this text to the users language, based on the i18n file.

    Example tab-object:
      {'id': 'MyTab1', 'text': 'My tab text' }

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
    active: '',
  },
  data() {
    return {
      loading: true,
      tabPadding: 10
    };
  },
  methods: {
    go(name) {
      this.$emit('go', name);
    },
    moveUnderline() {
      const $activeTab = this.$el.querySelector('.is-active');
      const boundingRect = $activeTab.getBoundingClientRect();
      const left = `${parseInt($activeTab.offsetLeft)}px`;
      const top = `${parseInt($activeTab.offsetTop+boundingRect.height)-5}px`;
      const width = `${parseInt(boundingRect.width) - (this.tabPadding * 2)}px`;
      const $underline = this.$refs.underline;
      $underline.style.width = width;
      $underline.style.left = left;
      $underline.style.top = top;
    },
  },
  computed: {
  },
  components: {
  },
  watch: {
    active(value, oldValue) {
      this.$nextTick(() => {
        this.moveUnderline();
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.moveUnderline();
        this.loading = false;
      }, 500);
    });
  },
};
</script>

<template>
  <div class="TabMenu" :class="{'loading': loading}">
    <ul class="TabMenu-tabList" role="tablist">
      <li class="TabMenu-tab"
        v-for="item in tabs" 
        tabindex="0"
        :key="item.id" 
        @click="go(item.id)" 
        @keyup.enter="go(item.id)"
        :class="{'is-active': active === item.id }"
        role="tab">
          {{item.text | translatePhrase}}
      </li>
      <hr class="TabMenu-underline" ref="underline">
    </ul>
  </div>
</template>

<style lang="less">
@tabPadding: 10px;

.TabMenu {
  display: inline-block;
  opacity: 1;
  transition: opacity 0.25s ease;

  &-tabList {
    display: flex;
    margin: 10px 0;
    padding: 0;
  }
  &.loading {
    opacity: 0;
  }

  &-underline {
    display: inline-block;
    transition: all 0.25s ease .025s;
    position: absolute;
    height: 3px;
    min-width: 5px;
    margin: 0 0 0 @tabPadding;
    border: none;
    background-color: @brand-primary;
  }

  &-tab {
    cursor: pointer;
    text-decoration: none;
    position: relative;
    display: inline-block;
    padding: 5px @tabPadding;
    display: inline-block;
    color: @grey;
    font-weight: 600;
    font-size: 16px;
    font-size: 1.6rem;
    margin: 5px 0px;
    text-transform: uppercase;
    transition: color 0.2s ease;
    border: dashed transparent;
    border-width: 1px 0px 1px 0px;
    @media (min-width: 768px) {
      font-size: 18px;
      font-size: 1.8rem;
    }
    &:hover {
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
