import View from './view';
import * as UserUtil from '../utils/user';

export default class UserSettings extends View {

  initialize() {
    super.initialize();
    const self = this;

    $('#switchLocation').val(this.getSigel());

    this.updateButtons();
    $('.sigel-button').click(function() {
      self.changeSigel($(this).val());
    });
  }

  updateButtons() {
    const sigel = this.getSigel();
    $('.sigel-option').each(function () {
      $(this).removeClass('active');
      if ($(this).find('.sigel-button').val() === sigel) {
        $(this).addClass('active');
      }
    });
  }

  getSigel() {
    return this.settings.userSettings.currentSigel;
  }

  changeSigel(sigel) {
    this.settings.userSettings.currentSigel = sigel;
    UserUtil.saveUserSettings(this.settings.userSettings);
    $('.sigelLabel').text(`(${this.settings.userSettings.currentSigel})`);
    this.updateButtons();
  }
}
