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
      this.settings.userSettings.currentSigel = newSigel;
      UserUtil.saveUserSettings(this.settings.userSettings);
    },
    currentLanguage(newLanguage) {
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
  <div class="panel-body container-fluid settings-container dash orange">
    <div class="col-lg-4 info-box">
      <span class="circle"><i class="icon fa fa-info" aria-hidden="true"></i></span>
      <h2></h2>
      <div class="user-gravatar">
        <img src="{{ `https://www.gravatar.com/avatar/${currentUser.email_hash}?d=mm&s=150` }}" /><br/>
        <span class="gravatar-text">(bild från <a href="https://www.gravatar.com">gravatar</a>)</span>
      </div>
      <h3><span>{{"User name" | translatePhrase}}</span></h3>
      <div>{{currentUser.username}}</div>
      <h3><span>{{"E-post" | translatePhrase}}</span></h3>
      <div>{{currentUser.email || '-'}}</div>
      <hr>
      <p>Användarnamn, e-post etc. ändrar du i <a href="https://biblioteksdatabasen.libris.kb.se">biblioteksdatabasen</a>.
      </p>
      <p>Vid frågor om rättigheter för sigel kontakta <a href="mailto:libris@kb.se">libris@kb.se</a>.
      </p>
    </div>
    <div class="col-lg-7 col-lg-offset-1">
      <span class="circle"><i class="icon fa fa-cogs" aria-hidden="true"></i></span>
      <div class="form-group">
        <h3><span>{{"Active sigel" | translatePhrase}}</span></h3>
        <label v-for="auth in currentUser.authorization" class="option" :class="{'active': currentSigel === auth.sigel}">
          <input type="radio" v-model="currentSigel" value="{{auth.sigel}}">{{auth.sigel}}</input>
          <span class="permissions">{{getPermissions(auth)}}</span>
        </label>
      </div>
      <div class="form-group">
        <h3><span>{{"Language" | translatePhrase}}</span></h3>
          Experimentell inställning, svenska rekommenderas.
        <label v-for="language in settings.availableUserSettings.languages" class="option" :class="{'active': currentLanguage === language.value}">
          <input type="radio" v-model="currentLanguage" value="{{language.value}}">{{language.label | translatePhrase}}</input>
        </label>
      </div>
      <div class="form-group">
        <h3><span>{{"Show technical application details" | translatePhrase}}</span></h3>
        Hjälpmedel för utvecklare av tjänsten.
        <label v-for="appTech in settings.availableUserSettings.appTechs" class="option" :class="{'active': currentAppTech === appTech.value }">
          <input type="radio" v-model="currentAppTech" value="{{appTech.value}}">{{appTech.label | translatePhrase}}</input>
        </label>
      </div>
    </div>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.settings-container {
  .user-gravatar {
    text-align: center;
    img {
      border: 1px solid @gray-light;
      border-radius: 50%;
    }
    .gravatar-text {
      color: @gray;
      font-size: 12px;
      font-style: italic;
    }
  }
}

</style>
