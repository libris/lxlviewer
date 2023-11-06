<!-- eslint-disable vue/max-len -->
<script>
import { translatePhrase } from '../../utils/filters';

export default {
  name: 'EnvironmentBanner',
  data() {
    return {
      closedByUser: false,
    };
  },
  methods: {
    translatePhrase,
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    settings() {
      return this.$store.getters.settings;
    },
    message() {
      if (this.settings.environment.startsWith('dev')) { // Matches dev2, dev3 etc...
        return 'Du befinner dig nu i vår utvecklingsmiljö. Använd <a href="https://libris-qa.kb.se/katalogisering">libris-qa.kb.se/katalogisering</a> om du vill testa funktionalitet i en stabilare miljö';
      }
      if (this.settings.environment === 'stg') {
        return 'OBS! Du befinner dig nu i vår testmiljö.<br> För att komma till den skarpa katalogiseringstjänsten <strong> Libris katalogisering</strong> <a href="https://libris.kb.se/katalogisering">klickar du här</a>.';
      }
      if (this.settings.environment === 'edu') {
        return 'OBS! Du befinner dig nu i vår utbildningsmiljö.<br> För att komma till den skarpa katalogiseringstjänsten <strong> Libris katalogisering</strong> <a href="https://libris.kb.se/katalogisering">klickar du här</a>.';
      }
      return '';
    },
  },
};
</script>

<template>
  <div class="EnvironmentBanner" id="EnvironmentBanner">
    <div
      class="EnvironmentBanner-banner"
      v-bind:class="{ warning: this.settings.environment === 'stg' }"
      v-if="!closedByUser && message && message.length > 0">
      <button
        @click="closedByUser = true"
        @keyup.enter="closedByUser = true"
        class="btn btn-default">{{ translatePhrase('Close') }}</button>
      <div v-html="message" />
    </div>

    <div class="EnvironmentBanner-corner" v-if="closedByUser">
      {{ settings.environment }}
    </div>
  </div>
</template>

<style lang="less">
.EnvironmentBanner {
  &-corner {
    pointer-events: none;
    position: fixed;
    bottom: 0;
    right: .7em;
    font-size: 4rem;
    text-shadow: 0.05em 0 #ffffff, 0 0.05em #ffffff, -0.05em 0 #ffffff, 0 -0.05em #ffffff;
    z-index: 9999;
  }
  &-banner {
    text-align: center;
    color: white;
    position: fixed;
    width: 100%;
    z-index: 9999;
    bottom: 0;
    text-shadow: 0px 1px 1px #00000054;
    font-weight: bold;
    background-color: darken(@brand-primary, 5%);
    border: 1px solid darken(@brand-primary, 10%);
    border-width: 1px 0px 0px 0px;
    a {
      color: white;
    }
    button {
      float: right;
    }

    & .warning {
      background-color: @brand-warning;
      border: @brand-warning;
      font-size: 20px;
      font-size: 2.0rem;
      font-weight: normal;
      padding: 10px 5px;
      color: @black;
      text-shadow: none;

      a {
        color: @black;
        text-decoration: underline;
      }
    }
  }
}
</style>
