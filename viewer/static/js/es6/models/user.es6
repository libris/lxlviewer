import * as _ from 'lodash';

export class User {
  constructor(user) {
    this.fullName = user.full_name;
    this.shortName = user.short_name;
    this.email = user.email;
    this.emailHash = user.email_hash;
    this.permissions = user.permissions;
    this.settings = {
      resultListType: 'detailed',
      appTech: 'off',
      activeSigel: '',
      language: 'sv',
    }
  }

  hasAnyPermissions() {
    if (this.permissions && this.permissions.length > 0) {
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
              this.settings[key] = this.permissions[0].code;
            }
          } else {
            this.settings[key] = savedUserSettings[key];
          }
        }
        if (this.settings.activeSigel === '') {
          this.settings.activeSigel = this.permissions[0].code;
        }
      });
    }
    this.saveSettings();
  }

  getPermissions() {
    const active = this.settings.activeSigel;
    const permissions = this.permissions;
    return _.find(permissions, (o) => {
      return o.code === active;
    });
  }

  verifySigel(sigelCode) {
    // Check if the chosen sigel is in list of permissions.
    let verified = false;
    if (sigelCode.length > 0) {
      _.each(this.permissions, (sigel) => {
        if (sigel.code === sigelCode) {
          verified = true;
        }
      });
    }
    return verified;
  }

  saveSettings() {
    let savedSettings = JSON.parse(localStorage.getItem('userSettings'));
    if (typeof savedSettings === 'undefined' || !savedSettings) {
      savedSettings = {};
    }
    savedSettings[this.emailHash] = this.settings;
    localStorage.setItem('userSettings', JSON.stringify(savedSettings));
  }
}

export function getUserObject(userJson) {
  const user = new User(JSON.parse(userJson));
  user.loadSettings();
  return user;
}
