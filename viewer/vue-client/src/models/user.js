import { each, find } from 'lodash-es';
import * as md5 from 'md5';
import URIMinter from '@/utils/uriminter';

async function createUriMinter(findContainerUrl) {
  const found = await (await fetch(findContainerUrl)).json();
  return found.items ? new URIMinter(found.items) : null;
}

function getLibraryUri(sigel) {
  return `https://libris.kb.se/library/${sigel}`;
}

export class User {
  constructor(fullName = 'anonymous', shortName = '', email = '', collections = []) {
    this.isLoggedIn = (fullName !== 'anonymous');
    this.fullName = fullName;
    this.shortName = shortName;
    this.email = email;
    this.emailHash = md5(email);
    this.collections = collections;
    this.settings = {
      resultListType: 'detailed',
      appTech: false,
      activeSigel: '',
      list: {},
      language: 'sv',
      defaultDatabases: ['OCLC'],
      forceFullViewPanel: false,
      searchParam: false,
      searchType: null,
      sort: false,
    };
    this.uriMinter = null;
  }

  hasAnyCollections() {
    if (this.collections.length > 0) {
      if (this.collections[0].code === '?') {
        return false;
      } 
      return true;
    }
    return false;
  }

  timeLeftOnToken() {
    if (this.token_expires_at) {
      const now = new Date();
      const expires = new Date(this.token_expires_at);
      return Math.floor((expires - now) * 0.001);
    }
    return -1;
  }

  hasTokenExpired() {
    return this.timeLeftOnToken() < 0;
  }

  loadSettings() {
    let savedSettings = JSON.parse(localStorage.getItem('userSettings'));
    if (typeof savedSettings === 'undefined' || !savedSettings) {
      savedSettings = {};
    }
    if (savedSettings.hasOwnProperty(this.emailHash)) {
      const savedUserSettings = savedSettings[this.emailHash];
      each(this.settings, (value, key) => {
        if (savedUserSettings.hasOwnProperty(key)) {
          if (key === 'activeSigel' && this.isLoggedIn) {
            if (this.verifySigel(savedUserSettings[key])) {
              this.settings[key] = savedUserSettings[key];
            } else {
              console.warn('Saved sigel not present in permissions list. Switching to first available.');
              this.settings[key] = this.collections[0].code;
            }
          } else {
            this.settings[key] = savedUserSettings[key];
          }
        }
      });
    }
    if (this.settings.activeSigel === '' && this.isLoggedIn) {
      this.settings.activeSigel = this.collections[0].code;
    }
    this.saveSettings();
  }

  saveSettings() {
    let savedSettings = JSON.parse(localStorage.getItem('userSettings'));
    if (typeof savedSettings === 'undefined' || !savedSettings) {
      savedSettings = {};
    }
    savedSettings[this.emailHash] = this.settings;
    localStorage.setItem('userSettings', JSON.stringify(savedSettings));
  }

  getPermissions() {
    if (!this.settings.activeSigel) {
      return this.collections[0];
    }
    return find(this.collections, o => o.code === this.settings.activeSigel);
  }

  getActiveLibraryUri() {
    return getLibraryUri(this.settings.activeSigel);
  }

  async loadUserData(apiPath) {
    const findUrl = `${apiPath}/find.json?@type=EntityContainer&${
      this.collections.map(it => `administeredBy.@id=${getLibraryUri(it.code)}`).join('&')
    }`;
    const uriMinter = await createUriMinter(findUrl);
    this.uriMinter = uriMinter;
  }

  verifySigel(sigelCode) {
    // Check if the chosen sigel is in list of permissions.
    let verified = false;
    if (sigelCode.length > 0) {
      each(this.collections, (sigel) => {
        if (sigel.code === sigelCode) {
          verified = true;
        }
      });
    }
    return verified;
  }
}

export function getUserObject(userObj) {
  let user = new User();
  if (userObj) {
    user = new User(
      userObj.full_name,
      userObj.short_name,
      userObj.email,
      userObj.permissions,
    );
  }
  user.loadSettings();
  return user;
}
