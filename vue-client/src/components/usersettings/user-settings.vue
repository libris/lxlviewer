<script>
import { mapGetters } from 'vuex';
import * as StringUtil from 'lxljs/string';
import { translatePhrase, capitalize } from '@/utils/filters';
import UserAvatar from '@/components/shared/user-avatar.vue';
import ChangeCategories from './change-categories.vue';
import SelectSigel from './select-sigel.vue';

export default {
  name: 'user-settings',
  props: {
    compact: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    translatePhrase,
    capitalize,
    setUser(userObj) {
      this.$store.dispatch('setUser', userObj);
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
    updateFullSiteWidth(e) {
      const userObj = this.user;
      userObj.settings.fullSiteWidth = e.target.checked;
      this.setUser(userObj);
    },
    logout() {
      this.$store.dispatch('logoutUser');
      this.$store.dispatch(
        'pushNotification',
        { type: 'success',
          message: `${StringUtil.getUiPhraseByLang('You were logged out', this.user.settings.language, this.resources.i18n)}!` },
      );
      this.$router.push({ path: '/' });
    },
    purgeFlagged() {
      this.$store.dispatch('purgeUserTagged', 'Flagged');
    },
    purgeBookmarks() {
      this.$store.dispatch('purgeUserTagged', 'Bookmark');
    },
    purgeChangeNoteCategories() {
      this.$store.dispatch('purgeChangeCategories');
    },
  },
  computed: {
    ...mapGetters([
      'inspector',
      'user',
      'userStorage',
      'settings',
      'resources',
      'userFlagged',
      'userBookmarks',
      'userChangeCategories',
      'userChangeCollections',
    ]),
    userHasTaggedRecords() {
      return Object.keys(this.userStorage.list).length > 0;
    },
    sortedSigels() {
      return [...this.user.collections].sort((a, b) => StringUtil.getSigelLabel(a).localeCompare(StringUtil.getSigelLabel(b)));
    },
  },
  components: {
    'change-categories': ChangeCategories,
    'user-avatar': UserAvatar,
    'select-sigel': SelectSigel,
  },
  watch: {
  },
  mounted() {
    this.$nextTick(() => {
      this.$store.dispatch('loadUserDatabase');
    });
  },
};
</script>

<template>
  <section class="UserSettings" :class="{ 'in-menu': compact }">
    <div class="UserSettings-content" v-if="!compact">
      <div class="UserSettings-info UserInfo">
        <div class="UserInfo-avatar">
          <user-avatar :size="150" :appearance="'dark'" />
        </div>
        <p class="UserInfo-name">
          <strong class="UserInfo-label uppercaseHeading--bold">{{ translatePhrase("Name") }}</strong><br />
          <span>{{user.fullName}}</span>
        </p>
        <p class="UserInfo-email">
          <strong class="UserInfo-label uppercaseHeading--bold">{{ translatePhrase("E-mail") }}</strong><br />
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
        <h4>{{ translatePhrase('User settings') }}</h4>
        <form class="UserConfig-form">
          <table class="UserSettings-configTable table table-striped">
            <tr>
              <td class="key">
                <label for="UserConfig-sigel">{{ translatePhrase("Active sigel") }}</label>
              </td>
              <td class="value">
                <select-sigel
                  id="UserConfig-sigel" />
              </td>
            </tr>
            <tr>
              <td class="key">
                <label for="clearFlagged">
                  {{ translatePhrase("Clear my flagged documents") }}
                </label>
              </td>
              <td class="value">
                <button
                  name="clearFlagged"
                  v-if="userFlagged.length > 0"
                  class="btn btn--sm btn-danger"
                  @click.prevent="purgeFlagged"
                  @keyup.enter.prevent="purgeFlagged">{{ translatePhrase('Clear') }}</button>
                <span v-if="userFlagged.length === 0" class="disabled">{{ translatePhrase('Nothing flagged') }}</span>
              </td>
            </tr>
            <!-- <tr>
              <td class="key">
                <label for="clearBookmarks">
                  {{ translatePhrase("Clear my bookmarked documents") }}
                </label>
              </td>
              <td class="value">
                <button name="clearBookmarks" v-if="userBookmarks.length > 0" class="btn btn--sm btn-danger" @click.prevent="purgeBookmarks" @keyup.enter.prevent="purgeBookmarks">{{ translatePhrase('Clear') }}</button>
                <span v-if="userBookmarks.length === 0" class="disabled">{{ translatePhrase('Nothing flagged') }}</span>
              </td>
            </tr> -->
          </table>
          <h5 class="uppercaseHeading--bold">{{ translatePhrase('Experimental settings') }}</h5>
          <table class="UserSettings-configTable table table-striped">
            <tr>
              <td class="key">
                <label for="UserConfig-lang">{{ translatePhrase("Language") }}</label>
              </td>
              <td class="value">
                <select
                  id="UserConfig-lang"
                  class="UserConfig-select customSelect"
                  :value="user.settings.language"
                  @change="updateLanguage">
                  <option
                    v-for="language in settings.availableUserSettings.languages"
                    :key="language.value"
                    :value="language.value">{{ translatePhrase(language.label) }}</option>
                </select>
              </td>
            </tr>
            <tr>
              <td class="key">
                <label for="detailsCheckbox">{{ translatePhrase("Activate debug mode") }}</label>
              </td>
              <td class="value">
                <input id="detailsCheckbox" class="customCheckbox-input" type="checkbox" @change="updateAppTech" :checked="user.settings.appTech">
                <div class="customCheckbox-icon" />
              </td>
            </tr>
            <tr>
              <td class="key">
                <label for="siteWidthCheckbox">{{ translatePhrase("Use full site width") }}</label>
              </td>
              <td class="value">
                <input
                  id="siteWidthCheckbox"
                  class="customCheckbox-input"
                  type="checkbox"
                  @change="updateFullSiteWidth"
                  :checked="user.settings.fullSiteWidth">
                <div class="customCheckbox-icon" />
              </td>
            </tr>
          </table>
          <h5 class="uppercaseHeading--bold">{{ translatePhrase("Subscribe to CXZ messages") }}</h5>
          <div class="UserSettings-changeCategories">
            <change-categories :available-sigels="sortedSigels" :userChangeCategories="userChangeCategories"/>
          </div>
        </form>
        <button class="btn btn-primary btn--lg UserSettings-logout" @click="logout">{{ translatePhrase("Log out") }}</button>
      </div>
    </div>
    <div v-else class="UserSettings-content">
      <ul>
        <li>
          <label class="uppercaseHeading">Sigel</label>
          <select-sigel
            id="UserConfig-sigel" />
        </li>
        <li>
          <router-link to="/user">{{ translatePhrase("Settings")}}</router-link>
          <button
            class="btn--as-link"
            v-if="userFlagged.length > 0"
            @click.prevent="purgeFlagged">
            {{ capitalize(translatePhrase(['Clear', 'Flags']).toLowerCase()) }}
          </button>
        </li>
        <li>
          <!-- <span>Växla användare</span> -->
          <button class="btn--as-link" @click="logout">{{ translatePhrase("Log out") }}</button>
        </li>
      </ul>
    </div>
  </section>
</template>

<style lang="less">

.UserSettings {
  padding: 0;

  @media (min-width: @screen-sm) {
    padding: 1em 0 1em 0;
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

  &-changeCategories {
    margin-bottom: 20px;
  }

  &-configTable {
    td {
      padding: 0.5em;
    }
    tr {
      border: solid @grey-lighter;
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
    top: 4rem;
    position: absolute;
    right: 0;
    left: auto;
    z-index: @dropdown-z;
    padding-top: 0.25em;
    padding-left: 0;

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

      & .btn--as-link,
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
  max-width: 500px;
  padding: 20px;

  @media (min-width: @screen-sm) {
    border-right: 1px solid @grey-lighter;
  }

  &-img {
    border: 1px solid @grey;
    border-radius: 50%;
    width: 150px;
    height: 150px;
  }

  &-avatar {
    text-align: center;
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

  &-formGroup {
    padding: 10px 0 5px;
  }

  &-span {
    float: left;
  }
}

@sigel-selector-width: 200px;

</style>
