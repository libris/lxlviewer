<script>

export default {
  name: 'global-message',
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
      return '';
    },
  },
};
</script>

<template>
  <div class="GlobalMessage" id="GlobalMessage"
    v-html="message" 
    v-bind:class="{'GlobalMessage--warning':this.settings.environment === 'stg'}"
    v-if="message && message.length > 0">
  </div>
</template>


<style lang="less">
.GlobalMessage {
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

  &--warning {
    background-color: @warning;
    border: @warning-alter;
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
</style>
