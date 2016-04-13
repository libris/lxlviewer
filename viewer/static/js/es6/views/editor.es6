import Thing from './thing'

export default class Editor extends Thing {

  initialize() {
    super.initialize();
    
    createVue();
  }
}

function createVue() {
  new Vue({
    el: '#editorApp',
    data: {
      message: 'Välkommen till editorn!'
    }
  });
}
