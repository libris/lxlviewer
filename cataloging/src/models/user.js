import { each, find } from 'lodash-es';
import md5 from 'md5';
import URIMinter from '@/utils/uriminter';
import * as StringUtil from 'lxljs/string';

function getLibraryUri(sigel) {
  return StringUtil.getLibraryUri(sigel);
}

export class User {
  constructor(fullName = 'anonymous', shortName = '', email = '', collections = [], id = '') {
    this.isLoggedIn = (fullName !== 'anonymous');
    this.fullName = fullName;
    this.shortName = shortName;
    this.email = email;
    this.emailHash = md5(email);
    this.collections = collections;
    this.id = id;
    this.idHash = md5(id);
    this.settings = {
      resultListType: 'detailed',
      appTech: false,
      activeSigel: '',
      list: {},
      language: 'sv',
      defaultDatabases: ['OCLC'],
      forceFullViewPanel: false,
      fullSiteWidth: false,
      searchParam: false,
      searchType: null,
      sort: false,
      facetSortings: {},
      shelfMarkSearch: '',
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
    if (savedSettings.hasOwnProperty(this.idHash) || savedSettings.hasOwnProperty(this.emailHash)) {
      const savedUserSettings = savedSettings[this.idHash] || savedSettings[this.emailHash];
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
    savedSettings[this.idHash] = this.settings;
    delete savedSettings[this.emailHash];

    localStorage.setItem('userSettings', JSON.stringify(savedSettings));
  }

  getPermissions() {
    if (!this.settings.activeSigel) {
      return this.collections[0];
    }
    return find(this.collections, (o) => o.code === this.settings.activeSigel);
  }

  getActiveLibraryUri() {
    return getLibraryUri(this.settings.activeSigel);
  }

  async loadUserData(apiPath) {
    // Chunking requests is necessary because for users with a *lot* of sigels
    // the request URI can get so large that our backend responds with a 431.
    const CHUNK_SIZE = 40;
    const chunks = [];

    for (let i = 0; i < this.collections.length; i += CHUNK_SIZE) {
      chunks.push(this.collections.slice(i, i + CHUNK_SIZE));
    }

    const allItems = [];
    for (const chunk of chunks) {
      const findUrl = `${apiPath}/find.jsonld?@type=EntityContainer&${
        chunk.map((it) => `administeredBy.@id=${getLibraryUri(it.code)}`).join('&')
      }`;
      const found = await (await fetch(findUrl)).json();
      if (found.items) {
        allItems.push(...found.items);
      }
    }

    this.uriMinter = allItems.length > 0 ? new URIMinter(allItems) : null;
  }

  isGlobalRegistrant() {
    if (this.getPermissions().global_registrant !== true) {
      return false;
    }
    return true;
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
      `${userObj.id}`,
    );
  }
  user.loadSettings();
  return user;
}
