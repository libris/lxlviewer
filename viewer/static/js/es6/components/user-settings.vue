<script>
import * as UserUtil from '../utils/user';
import * as StringUtil from '../utils/string';
import * as _ from 'lodash';
import { getSettings } from '../vuex/getters';
import { changeSettings } from '../vuex/actions';

export default {
  name: 'user-settings',
  vuex: {
    actions: {
      changeSettings,
    },
    getters: {
      settings: getSettings,
    },
  },
  data() {
    return {
      currentSigel: this.settings.userSettings.currentSigel,
      currentLanguage: this.settings.userSettings.language || this.settings.language,
      currentAppTech: this.settings.userSettings.appTech,
    }
  },
  methods: {
    getPermissions(auth) {
      const permissions = [];
      _.each(auth, (active, permission) => {
        if (active === true) { // Strict equality to avoid non-empty strings
          permissions.push(permission);
        }
      });
      return permissions.join(', ')
    },
  },
  computed: {
    currentUser() {
      return window.userInfo;
    },
  },
  components: {
  },
  watch: {
    currentSigel(newSigel) {
      this.$dispatch('track-event', 'change_sigel', newSigel);
      this.settings.userSettings.currentSigel = newSigel;
      UserUtil.saveUserSettings(this.settings.userSettings);
    },
    currentLanguage(newLanguage) {
      this.$dispatch('track-event', 'change_language', newLanguage);
      this.settings.userSettings.language = newLanguage;
      UserUtil.saveUserSettings(this.settings.userSettings);
    },
    currentAppTech(newAppTech) {
      this.settings.userSettings.appTech = newAppTech;
      UserUtil.saveUserSettings(this.settings.userSettings);
    },
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
    });
  },
};
</script>

<template>
  <div class="panel-body container-fluid settings-container">
    <div class="col-md-4 info-box">
      <div class="user-gravatar">
        <img v-bind:src="`https://www.gravatar.com/avatar/${currentUser.email_hash}?d=mm&s=150`" /><br/>
      </div>
      <h3><span>{{"Name" | translatePhrase}}</span></h3>
      <div>{{currentUser.username}}</div>
      <h3><span>{{"E-post" | translatePhrase}}</span></h3>
      <div>{{currentUser.email || '-'}}</div>
      <hr>
      <p>Din användarprofil är hämtad från <a href="https://login.libris.kb.se">Libris Login</a>.
      </p>
      <p>Vid frågor om rättigheter för sigel kontakta <a href="mailto:libris@kb.se">libris@kb.se</a>.
      </p>
      <p>
        Bild hämtad från <a href="https://www.gravatar.com">gravatar</a>.
      </p>
    </div>
    <div class="col-md-8">
      <table>
        <tr>
          <td class="settings-label">{{"Active sigel" | translatePhrase}}</td>
          <td class="settings-value">
            <select v-model="currentSigel">
              <option v-for="auth in currentUser.authorization" value="{{auth.sigel}}">{{ auth.sigel }}</option>
            </select>
          </td>
        </tr>
          <tr>
            <td class="settings-label">{{"Language" | translatePhrase}}</td>
            <td class="settings-value">
              <select v-model="currentLanguage">
                <option v-for="language in settings.availableUserSettings.languages" value="{{language.value}}">{{ language.label | translatePhrase }}</option>
              </select>
            </td>
          </tr>
            <tr>
              <td class="settings-label">{{"Show technical application details" | translatePhrase}}</td>
              <td class="settings-value">
                <input type="checkbox" v-model="currentAppTech"></input>
              </td>
            </tr>
      </table>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

@sigel-selector-width: 200px;

.settings-container {
  padding: 1em;
  margin: 0px;

  .info-box {
    background-color: #f9f9f9;
    padding: 1em;
    box-shadow: @shadow-panel;
    p {
      font-size: 12px;
    }
  }

  table {
    width: 100%;
    tr {
      border: solid @gray-lighter;
      border-width: 0px 0px 1px 0px;
    }
    td {
      padding: 0.5em;
    }
    td.settings-label {
      width: 50%;
      vertical-align: middle;
    }
    td.settings-value {
      width: auto;
    }
  }

  h2 {
    padding-top:15px;
  }
  ul {
    list-style-type: none;
    padding: 30px;
    li:before {
      content: "■";
      margin-right: 10px;
    }
  }
  .user-gravatar {
    text-align: center;
    img {
      border: 1px solid @gray;
      border-radius: 50%;
      width: 150px;
      height: 150px;
    }
  }
}

</style>
