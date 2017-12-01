import View from './view';

export default class Thing extends View {

  initialize() {
    const postId = window.location.toString().split('#')[0];
    window.location = `${postId}/edit`;
  }

}
