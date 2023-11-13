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

import { translatePhrase } from '@/utils/filters';

export default {
  name: 'switch-toggle',
  props: {
    options: {
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
  emits: ['go'],
  methods: {
    translatePhrase,
    go(name) {
      this.$emit('go', name);
    },
  },
  computed: {
    hasActive() {
      return this.options.some((el) => el.id === this.active);
    },
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
  <div class="SwitchToggle" v-if="options">
    <ul v-if="!link" class="SwitchToggle-tabList" role="tablist" ref="tablist">
      <li
        class="SwitchToggle-tab"
        tabindex="0"
        :key="options[0].id"
        @click="go(options[0].id)"
        @keyup.enter="go(options[0].id)"
        :class="{ 'is-active': active === options[0].id }"
        role="tab">
        <span v-if="options[0].html" v-html="options[0].html" />
        <span v-else>{{ translatePhrase(options[0].text) }}</span>
      </li>
      <i class="fa fa-toggle-on fa-fw SwitchToggle-icon" :class="{ 'fa-rotate-180': active === options[0].id }" />
      <li
        class="SwitchToggle-tab"
        tabindex="0"
        :key="options[1].id"
        @click="go(options[1].id)"
        @keyup.enter="go(options[1].id)"
        :class="{ 'is-active': active === options[1].id }"
        role="tab">
        <span v-if="options[1].html" v-html="options[1].html" />
        <span v-else>{{ translatePhrase(options[1].text) }}</span>
      </li>
    </ul>
    <ul v-else class="SwitchToggle-tabList" ref="tablist">
      <li
        class="SwitchToggle-linkContainer"
        :key="options[0].id">
        <router-link
          class="SwitchToggle-tab"
          :class="{ 'is-active': active === options[0].id }"
          :to="options[0].link">
          <span v-if="options[0].html" v-html="options[0].html" />
          <span v-else>{{ translatePhrase(options[0].text) }}</span>
        </router-link>
      </li>
      <i class="fa fa-toggle-on fa-fw SwitchToggle-icon" :class="{ 'is-flipped': active === options[0].id }" />
      <li
        class="SwitchToggle-linkContainer"
        :key="options[1].id">
        <router-link
          class="SwitchToggle-tab"
          :class="{ 'is-active': active === options[1].id }"
          :to="options[1].link">
          <span v-if="options[1].html" v-html="options[1].html" />
          <span v-else>{{ translatePhrase(options[1].text) }}</span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<style lang="less">
@tabPadding: 10px;

.SwitchToggle {
  display: inline-block;
  opacity: 1;
  transition: opacity 0.25s ease;
  position: relative;

  &-tabList {
    padding: 0;
    margin: 0;
    white-space: nowrap;
  }
  &-linkContainer {
    display: inline-block;
  }

  &-icon {
    transform: scaleX(1);
    color: @brand-primary;
    &.is-flipped {
      transform: scaleX(-1);
    }
  }

  &-tab {
    cursor: pointer;
    text-decoration: none;
    position: relative;
    display: inline-block;
    padding: 5px @tabPadding;
    color: @grey;
    font-weight: 600;
    font-size: 14px;
    font-size: 1.4rem;
    margin: 5px 0px;
    transition: color 0.2s ease;
    border: dashed transparent;
    border-width: 1px 0px 1px 0px;
    white-space: nowrap;

    @media (min-width: 768px) {
      font-size: 14px;
      font-size: 1.4rem;
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
