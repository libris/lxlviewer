<script>
import * as StringUtil from '@/utils/string';
import * as _ from 'lodash';

export default {
  name: 'user-settings',
  methods: {
    setUser(userObj) {
      this.$store.dispatch('setUser', userObj);
    },
    getSigelLabel(sigel, len) {
      let label = '';
      label += sigel.code;
      if (sigel.friendly_name) {
        label += ` - ${sigel.friendly_name}`;
      }
      return label.length > len ? `${label.substr(0,len-2)}...` : label;
    },
    updateSigel (e) {
      const userObj = this.user;
      userObj.settings.activeSigel = e.target.value;
      this.setUser(userObj);
    },
    updateLanguage (e) {
      const userObj = this.user;
      userObj.settings.language = e.target.value;
      this.setUser(userObj);
    },
    updateAppTech (e) {
      const userObj = this.user;
      userObj.settings.appTech = e.target.checked;
      this.setUser(userObj);
    },
    logout() {
      this.$store.dispatch('logoutUser');
      this.$store.dispatch('pushNotification', { type: 'success', message: `${StringUtil.getUiPhraseByLang('You were logged out', this.settings.language)}!` });
      this.$router.push({ path: '/' });
    },
  },
  computed: {
    user() {
      return this.$store.getters.user;
    },
    settings() {
      return this.$store.getters.settings;
    },
  },
  components: {
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
    });
  },
};
</script>

<template>
  <section class="UserSettings">
    <h1 class="UserSettings-title mainTitle">{{'Settings' | translatePhrase}}</h1>
    <div class="UserSettings-content">
      <div class="UserSettings-info UserInfo">
        <div class="UserInfo-avatar">
          <img :src="`https://www.gravatar.com/avatar/${user.emailHash}?d=mm&s=150`" class="UserInfo-img" alt="Avatar"/>
          <br/>
        </div>
        <p class="UserInfo-name">
          <strong class="UserInfo-label uppercaseHeading--bold">{{"Name" | translatePhrase}}</strong><br/>
          <span>{{user.fullName}}</span>
        </p>
        <p class="UserInfo-email">
          <strong class="UserInfo-label uppercaseHeading--bold">{{"E-mail" | translatePhrase}}</strong><br/>
          <span>{{user.email || '-'}}</span>
        </p>
        <div class="UserInfo-meta">
          <p>Din användarprofil är hämtad från <a href="https://login.libris.kb.se">Libris Login</a>.
            <br>Vid frågor om rättigheter för sigel kontakta <a href="mailto:libris@kb.se">libris@kb.se</a>.
            <br>Bild hämtad från <a href="https://www.gravatar.com">gravatar</a>.
          </p>
        </div>
      </div>
      <div class="UserSettings-config UserConfig">
        <form class="UserConfig-form">
          <div class="UserConfig-formGroup">
            <label class="UserConfig-label">{{"Active sigel" | translatePhrase}}</label>
            <div class="UserConfig-selectWrap">
              <select class="UserConfig-select customSelect" :value="user.settings.activeSigel" @change="updateSigel">
                <option v-for="sigel in user.collections" :key="sigel.code" :value="sigel.code">{{ getSigelLabel(sigel, 50) }}</option>
              </select>
            </div>
          </div>
          
          <div class="UserConfig-formGroup">
            <label class="UserConfig-label">{{"Language" | translatePhrase}}</label>
            <div class="UserConfig-selectWrap">
              <select class="UserConfig-select customSelect" :value="user.settings.language" @change="updateLanguage">
                <option v-for="language in settings.availableUserSettings.languages" :key="language.value" :value="language.value">{{ language.label | translatePhrase }}</option>
              </select>
            </div>
          </div>

          <div class="UserConfig-formGroup">
            <label for="detailsCheckbox" class="UserConfig-label UserConfig-label--checkbox"> 
              <span class="UserConfig-span">{{"Show debug information" | translatePhrase}}</span>
              <div class="UserConfig-checkboxWrap">
                <input id="detailsCheckbox" class="customCheckbox-input" type="checkbox" @change="updateAppTech" :checked="user.settings.appTech">
                <div class="customCheckbox-icon"></div>
              </div>
            </label>
          </div>

        </form>
        <button class="btn btn-primary btn--lg UserSettings-logout" @click="logout">Logga ut</button>
      </div>
    </div>
  </section>
</template>

<style lang="less">

.UserSettings {
  padding: 0;

  @media (min-width: @screen-sm) {
    padding: 1em 0 1em 1em;
  }

  &-title {
    flex: 1 1 100%;
  }

  &-content {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px;
    background-color: @white;
    border-radius: 4px;
    box-shadow: @shadow-panel;

    @media (min-width: @screen-sm) {
      flex-direction: row;
    }
  }

  &-config {
    display: flex;
    flex-grow: 1;
    flex-basis: 50%;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px;

    & form {
      width: 100%;
    }
  }
}

.UserInfo {
  flex-grow: 1;
  flex-basis: 50%;
  min-width: 250px;
  padding: 20px;

  @media (min-width: @screen-sm) {
      border-right: 1px solid @gray-lighter;
    }

  &-avatar {
    padding: 20px;
    text-align: center;
  }

  &-img {
    border: 1px solid @gray;
    border-radius: 50%;
    width: 150px;
    height: 150px;
  }

  &-label {
  }

  &-meta {
    margin-top: 20px;
    line-height: 1.8;

  }
}

.UserConfig {
  &-label {
    font-weight: 500;
    width: 40%;

    &--checkbox {
      width: 100%;
    }
  }

  &-selectWrap {
    width: 60%;
    float: right;
  }

  &-checkboxWrap {
    width: auto;
    float: right;
  }

  &-select {
    width: 100%;
  }

  &-formGroup {
    padding: 10px 0 5px;
  }

  &-span {
    float: left;
  }
}

@sigel-selector-width: 200px;

</style>
