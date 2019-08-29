<script>
import * as StringUtil from '@/utils/string';
import UserAvatar from '@/components/shared/user-avatar';
import { mapGetters } from 'vuex';

export default {
  name: 'user-settings',
  props: {
    compact: {
      type: Boolean,
      default: false,
    },
  },
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
      return label.length > len ? `${label.substr(0, len - 2)}...` : label;
    },
    updateSigel(e) {
      const doUpdate = () => {
        const userObj = this.user;
        userObj.settings.activeSigel = e.target.value;
        this.setUser(userObj);
      }
      if (this.inspector.data.mainEntity && this.inspector.data.mainEntity['@type'] === 'Item') {
        // If editing a holding, the user must accept a cancel dialog before sigel can be changed
        this.$store.dispatch('pushInspectorEvent', { 
          name: 'post-control',
          value: 'cancel',
          callback: () => {
            doUpdate();
          },
        });
      } else {
        doUpdate();
      }
    },
    updateLanguage(e) {
      const userObj = this.user;
      userObj.settings.language = e.target.value;
      this.setUser(userObj);
    },
    updateAppTech(e) {
      const userObj = this.user;
      userObj.settings.appTech = e.target.checked;
      this.setUser(userObj);
    },
    logout() {
      this.$store.dispatch('logoutUser');
      this.$store.dispatch('pushNotification', { type: 'success', message: `${StringUtil.getUiPhraseByLang('You were logged out', this.settings.language)}!` });
      this.$router.push({ path: '/' });
    },
    purgeTagged() {
      this.$store.dispatch('purgeUserTagged');
    },
  },
  computed: {
    ...mapGetters([
      'inspector',
      'user',
      'userStorage',
      'settings',
    ]),
    userHasTaggedPosts() {
      return Object.keys(this.userStorage.list).length > 0;
    },
  },
  components: {
    'user-avatar': UserAvatar,
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
  <section class="UserSettings" :class="{'in-menu' : compact}">
    <div class="UserSettings-content" v-if="!compact">
      <div class="UserSettings-info UserInfo">
        <div class="UserInfo-avatar">
          <user-avatar :size="150" />
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
            <br>Profilbild sätts via <a href="https://www.gravatar.com">gravatar</a>.
          </p>
        </div>
      </div>
      <div class="UserSettings-config UserConfig">
        <h4>{{'User settings' | translatePhrase}}</h4>
        <form class="UserConfig-form">
          <table class="UserSettings-configTable table table-striped">
            <tr>
              <td class="key">
                <label for="UserConfig-sigel">{{"Active sigel" | translatePhrase}}</label>
              </td>
              <td class="value">
                  <select id="UserConfig-sigel" 
                    class="UserConfig-select customSelect" 
                    :value="user.settings.activeSigel" 
                    @change="updateSigel">
                    <option v-for="sigel in user.collections" 
                      :key="sigel.code" 
                      :value="sigel.code">{{ getSigelLabel(sigel, 50) }} {{ sigel.global_registrant == true ? '👑' : '' }}</option>
                  </select>
              </td>
            </tr>
            <tr>
              <td class="key">
                <label for="UserConfig-lang">{{"Language" | translatePhrase}}</label>
              </td>
              <td class="value">
                  <select id="UserConfig-lang" class="UserConfig-select customSelect" 
                    :value="user.settings.language" 
                    @change="updateLanguage">
                    <option v-for="language in settings.availableUserSettings.languages" 
                      :key="language.value" 
                      :value="language.value">{{ language.label | translatePhrase }}</option>
                  </select>
              </td>
            </tr>
            <tr>
              <td class="key">
                <label for="detailsCheckbox">{{"Activate debug mode" | translatePhrase}}</label>
              </td>
              <td class="value">
                <input id="detailsCheckbox" class="customCheckbox-input" type="checkbox" @change="updateAppTech" :checked="user.settings.appTech">
                <div class="customCheckbox-icon"></div>
              </td>
            </tr>
            <tr>
              <td class="key">
                <label for="clearFlagged"> 
                  {{ "Clear my flagged posts" | translatePhrase}}
                </label>
              </td>
              <td class="value">
                <button name="clearFlagged" v-if="userHasTaggedPosts" class="btn btn--sm btn-danger" @click.prevent="purgeTagged" @keyup.enter.prevent="purgeTagged">{{ 'Clear' | translatePhrase }}</button>
                <span v-if="!userHasTaggedPosts" class="disabled">{{ 'Nothing flagged' | translatePhrase }}</span>
              </td>
            </tr>
          </table>

        </form>
        <button class="btn btn-primary btn--lg UserSettings-logout" @click="logout">{{"Log out" | translatePhrase}}</button>
      </div>
    </div>
    <div v-else class="UserSettings-content">
      <ul>
        <li>
          <label class="uppercaseHeading">Sigel</label>
          <select id="UserConfig-sigel"
            class="UserConfig-select customSelect" 
            :value="user.settings.activeSigel" 
            @change="updateSigel">
            <option v-for="sigel in user.collections" 
              :key="sigel.code" 
              :value="sigel.code">{{ getSigelLabel(sigel, 50) }}</option>
          </select>
        </li>
        <li>
          <router-link to="/user">{{"Settings" | translatePhrase}}</router-link>
          <span v-if="userHasTaggedPosts" @click.prevent="purgeTagged">{{ ['Clear', 'Flags'] | translatePhrase | lowercase | capitalize}}</span>
        </li>
        <li>
          <!-- <span>Växla användare</span> -->
          <span @click="logout">{{"Log out" | translatePhrase}}</span>
        </li>
      </ul>
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

    .in-menu & {
      padding: 0 10px;
      border-radius: 0;
      font-size: 14px;
      font-size: 1.4rem;
      box-shadow: none;
      border: 1px solid @grey-lighter;

      & select {
        font-size: 14px;
        font-size: 1.4rem;
      }
    }

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

  &-configTable {
    td {
      padding: 0.5em;
    }
    tr {
      border: solid @gray-lighter;
      border-width: 0px 0px 1px 0px;
    }
    .key {
      label {
        font-weight: normal;
      }
      width: 50%;
    }
    .value {
      width: 50%;
      select {
        width: 100%;
      }
    }
  }

  &.in-menu {
    cursor: initial;
    top: 3em;
    position: absolute;
    right: 0;
    left: auto;
    z-index: @dropdown-z;
    padding-top: 0.25em;
    padding-left: 0;

    @media (min-width: @screen-sm) {
      top: 2em;
    }

    & ul {
      padding: 0;
      width: 25rem;
      list-style-type: none;
    }

    & li {
      padding: 10px 0;
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid @grey-lighter;

      &:last-of-type {
        border: 0px;
      }

      & span, 
      & a {
        color: @black;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }

    }

  @media (max-width: @screen-sm) {
    left: auto;
    right: 0;
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

  &-img {
    border: 1px solid @gray;
    border-radius: 50%;
    width: 150px;
    height: 150px;
  }

  &-avatar {
    text-align: center;
  }

  &-label {
  }

  &-meta {
    margin-top: 20px;
    line-height: 1.8;

  }
}

.UserConfig {
  &-label {
    font-weight: 500;
    width: 50%;

    &--checkbox {
      width: 100%;
    }
  }

  &-selectWrap {
    width: 50%;
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
