import View from './view';
import * as UserUtil from '../utils/user';

export default class UserSettings extends View {

  initialize() {
    super.initialize();

    $('#switchLocation').val(this.getSigel());

    $('#sigelSubmit').click((e) => {
      e.preventDefault();
      this.changeSigel($('#switchLocation').val());
    });
  }

  getSigel() {
    return UserUtil.get('sigel');
  }

  changeSigel(sigel) {
    UserUtil.set('sigel', sigel);
    $('.sigelLabel').text(`(${sigel})`);
  }
}
