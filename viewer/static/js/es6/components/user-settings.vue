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
  props: {
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
  <div class="col-lg-7 col-lg-offset-1">
    <span class="circle"><i class="icon fa fa-cogs" aria-hidden="true"></i></span>
    <h3><span>{{"User name" | translatePhrase}}</span></h3>
    <div>{{currentUser.username}}</div>
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
</template>

<style lang="less">
@import './_variables.less';

</style>
