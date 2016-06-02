import View from './view';
import * as UserUtil from '../utils/user';

export default class CreateNew extends View {

  initialize() {
    super.initialize();

    this.initMenu();
  }

  initMenu() {
    $('.choice').click(function() {
      $('.form-container').hide();
      const id = $(this).attr('data-toggle');
      $('#'+id).show();
    });
  }
}
