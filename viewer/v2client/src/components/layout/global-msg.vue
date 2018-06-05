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
      let message = '';
      switch(this.settings.environment) {
        case 'dev':
          message = 'Du befinner dig nu i vår utvecklingsmiljö. Använd <a href="https://libris-qa.kb.se/katalogisering">libris-qa.kb.se/katalogisering</a> om du vill testa funktionalitet i en stabilare miljö';
        break;
        case '':
        break;
        case 'stg':
          message = 'OBS! Du befinner dig nu i vår testmiljö.<br> För att komma till den skarpa katalogiseringstjänsten <strong> Libris katalogisering</strong> <a href="https://libris.kb.se/katalogisering">klickar du här</a>.';
        break;
        case 'qa':
        break;
        case 'local':
        break;
      }
      return message;
    },
  }
}
</script>

<template>
  <div class="GlobalMessage" 
    v-html="message" 
    v-bind:class="{'GlobalMessage--warning':this.settings.environment === 'local'}"
    v-if="message && message.length > 0">
  </div>
</template>


<style lang="less">
.GlobalMessage {
  text-align: center;
  color: white;
  text-shadow: 0px 1px 1px #00000054;
  font-weight: bold;
  background-color: @bib-color;
  border: 1px solid darken(@bib-color, 5%);
  border-width: 0px 0px 1px 0px;
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
    color: #000000;
    text-shadow: none;

    a {
      color: #000;
      text-decoration: underline;
    }
  }
}
</style>
