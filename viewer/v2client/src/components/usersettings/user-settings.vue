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
    }
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
  <div class="panel-body container-fluid settings-container">
    <h1>{{'Settings' | translatePhrase}}</h1>
    <div class="info-box">
      <div class="user-gravatar">
        <img :src="`https://www.gravatar.com/avatar/${user.emailHash}?d=mm&s=150`" /><br/>
      </div>
      <h3><span>{{"Name" | translatePhrase}}</span></h3>
      <div>{{user.fullName}}</div>
      <h3><span>{{"E-mail" | translatePhrase}}</span></h3>
      <div>{{user.email || '-'}}</div>
      <hr>
      <p>Din användarprofil är hämtad från <a href="https://login.libris.kb.se">Libris Login</a>.
      </p>
      <p>Vid frågor om rättigheter för sigel kontakta <a href="mailto:libris@kb.se">libris@kb.se</a>.
      </p>
      <p>
        Bild hämtad från <a href="https://www.gravatar.com">gravatar</a>.
      </p>
    </div>
    <div class="settings-content">
      <table>
        <tr>
          <td class="settings-label">{{"Active sigel" | translatePhrase}}</td>
          <td class="settings-value">
            <select :value="user.settings.activeSigel" @change="updateSigel">
              <option v-for="sigel in user.collections" :key="sigel.code" :value="sigel.code">{{ getSigelLabel(sigel, 50) }}</option>
            </select>
          </td>
        </tr>
          <tr>
            <td class="settings-label">{{"Language" | translatePhrase}}</td>
            <td class="settings-value">
              <select :value="user.settings.language" @change="updateLanguage">
                <option v-for="language in settings.availableUserSettings.languages" :key="language.value" :value="language.value">{{ language.label | translatePhrase }}</option>
              </select>
            </td>
          </tr>
            <tr>
              <td class="settings-label">{{"Show technical application details" | translatePhrase}}</td>
              <td class="settings-value">
                <input type="checkbox" @change="updateAppTech" :checked="user.settings.appTech">
              </td>
            </tr>
      </table>
      <a class="btn btn-block btn-info" href="/logout">
        Logga ut
      </a>
    </div>
  </div>
</template>

<style lang="less">

@sigel-selector-width: 200px;

.settings-container {
  padding: 1em;
  margin: 0px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
  h1 {
    flex: 100% 1 1;
    font-weight: 400;
    font-size: 30px;
    margin-top: 0;
  }
  h3 {
    font-size: 16px;
  }
  .info-box {
    flex-grow: 1;
    min-width: 250px;
    background-color: #f9f9f9;
    padding: 1em;
    box-shadow: @shadow-panel;
    p {
      font-size: 12px;
    }
  }
  .settings-content {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    justify-content: space-between;
    padding: 0em 1em;
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
        width: 40%;
        vertical-align: middle;
      }
      td.settings-value {
        width: 60%;
        select {
          width: 100%;
        }
      }
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
