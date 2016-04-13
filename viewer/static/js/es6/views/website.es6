import View from './view'
import * as searchutil from '../utils/search'

export default class Website extends View {

  initialize() {
    super.initialize();

    searchutil.initTypeButtons();
    searchutil.initializeSearch();
  }
}
