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
  methods: {
    go(name) {
      this.$emit('go', name);
    },
  },
  computed: {
  },
  components: {
  },
  watch: {
  },
  mounted() {
    this.$nextTick(() => {
      
    });
  },
};
</script>

<template>
  <div class="TabMenu">
    <ul class="TabMenu-tabList" role="tablist">
      <li class="TabMenu-tab"
        v-for="item in tabs" 
        tabindex="0"
        :key="item.id" 
        @click="go(item.id)" 
        :class="{'is-active': active === item.id }"
        role="tab">
          {{item.text | translatePhrase}}
      </li>
    </ul>
  </div>
</template>

<style lang="less">

.TabMenu {
  display: inline-block;

  &-tabList {
    display: flex;
    margin: 10px 0;
    padding: 0;
  }


  &-tab {
    cursor: pointer;
    text-decoration: none;
    position: relative;
    display: inline-block;
    padding: 5px 10px;
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

  &-tab::after {
    content: "";
    background: @brand-primary;
    height: 3px;
    position: absolute;
    bottom: 0;
    transition: 0.25s all 0.025s;
  }

  &-tab::after {
    left: 100%;
    right: 0;
  }

  &-tab.is-active ~ &-tab::after {
    left: 0;
    right: 100%;
  }

  &-tab.is-active::after {
    left: 0;
    right: 0;
  }
}
</style>
