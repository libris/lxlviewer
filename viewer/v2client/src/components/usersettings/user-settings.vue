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
      this.$store.dispatch('pushNotification', { color: 'green', message: `${StringUtil.getUiPhraseByLang('You were logged out', this.settings.language)}!` });
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
    <h1 class="UserSettings-title">{{'Settings' | translatePhrase}}</h1>
    <div class="UserSettings-content">
      <div class="UserSettings-info UserInfo">
        <div class="UserInfo-avatar">
          <img :src="`https://www.gravatar.com/avatar/${user.emailHash}?d=mm&s=150`" class="UserInfo-img" alt="Avatar"/>
          <br/>
        </div>
        <p class="UserInfo-name">
          <strong class="UserInfo-label">{{"Name" | translatePhrase}}</strong><br/>
          <span>{{user.fullName}}</span>
        </p>
        <p class="UserInfo-email">
          <strong class="UserInfo-label">{{"E-mail" | translatePhrase}}</strong><br/>
          <span>{{user.email || '-'}}</span>
        </p>
        <div class="UserInfo-meta">
          <p>Din användarprofil är hämtad från <a href="https://login.libris.kb.se">Libris Login</a>.
          </p>
          <p>Vid frågor om rättigheter för sigel kontakta <a href="mailto:libris@kb.se">libris@kb.se</a>.
          </p>
          <p>
            Bild hämtad från <a href="https://www.gravatar.com">gravatar</a>.
          </p>
        </div>
      </div>
      <div class="UserSettings-config UserConfig">
        <form class="UserConfig-form">
          <div class="UserConfig-formGroup">
            <label class="UserConfig-label">{{"Active sigel" | translatePhrase}}</label>
            <div class="UserConfig-selectWrap">
              <select class="UserConfig-select" :value="user.settings.activeSigel" @change="updateSigel">
                <option v-for="sigel in user.collections" :key="sigel.code" :value="sigel.code">{{ getSigelLabel(sigel, 50) }}</option>
              </select>
            </div>
          </div>
          
          <div class="UserConfig-formGroup">
            <label class="UserConfig-label">{{"Language" | translatePhrase}}</label>
            <div class="UserConfig-selectWrap">
              <select class="UserConfig-select" :value="user.settings.language" @change="updateLanguage">
                <option v-for="language in settings.availableUserSettings.languages" :key="language.value" :value="language.value">{{ language.label | translatePhrase }}</option>
              </select>
            </div>
          </div>

          <div class="UserConfig-formGroup">
            <label class="UserConfig-label UserConfig-label--checkbox"> 
              <span class="UserConfig-span">{{"Show technical application details" | translatePhrase}}</span>
              <div class="UserConfig-checkboxWrap">
                <input type="checkbox" @change="updateAppTech" :checked="user.settings.appTech">
              </div>
            </label>
          </div>

        </form>
        <button class="btn btn-block btn-info UserSettings-logout" @click="logout">Logga ut</button>
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
    flex: 100% 1 1;
    margin: 0 0 20px 0;
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
  min-width: 250px;
  padding: 20px;

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
    font-size: 16px;
    font-size: 1.6rem;
  }

  &-meta {
    font-size: 12px;
    font-size: 1.2rem;
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

  &-selectWrap,
  &-checkboxWrap {
    width: 60%;
    float: right;
  }

  &-select {
    width: 100%;
  }

  &-formGroup {
    border: solid @gray-lighter;
    border-width: 0px 0px 1px 0px;
    padding: 10px 0 5px;
  }

  &-span {
    float: left;
    width: 40%;
  }
}

@sigel-selector-width: 200px;

</style>
