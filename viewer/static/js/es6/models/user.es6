import * as _ from 'lodash';

export class User {
  constructor(fullName = '', shortName = '', email = '', emailHash = '', collections = []) {
    this.fullName = fullName;
    this.shortName = shortName;
    this.email = email;
    this.emailHash = emailHash;
    this.collections = collections;
    this.settings = {
      resultListType: 'detailed',
      appTech: 'off',
      activeSigel: '',
      language: 'sv',
    };
  }

  hasAnyCollections() {
    if (this.collections && this.collections.length > 0) {
      return true;
    }
    return false;
  }

  loadSettings() {
    let savedSettings = JSON.parse(localStorage.getItem('userSettings'));
    if (typeof savedSettings === 'undefined' || !savedSettings) {
      savedSettings = {};
    }
    if (savedSettings.hasOwnProperty(this.emailHash)) {
      const savedUserSettings = savedSettings[this.emailHash];
      _.each(this.settings, (value, key) => {
        if (savedUserSettings.hasOwnProperty(key)) {
          if (key === 'activeSigel') {
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
        if (this.settings.activeSigel === '') {
          this.settings.activeSigel = this.collections[0].code;
        }
      });
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
    return _.find(this.collections, (o) => {
      return o.code === this.settings.activeSigel;
    });
  }

  verifySigel(sigelCode) {
    // Check if the chosen sigel is in list of permissions.
    let verified = false;
    if (sigelCode.length > 0) {
      _.each(this.collections, (sigel) => {
        if (sigel.code === sigelCode) {
          verified = true;
        }
      });
    }
    return verified;
  }
}

export function getUserObject(userObj) {
  const user = new User(
    userObj.full_name,
    userObj.short_name,
    userObj.email,
    userObj.email_hash,
    userObj.permissions
  );
  if (user.fullName !== '') {
    user.loadSettings();
  }
  return user;
}
