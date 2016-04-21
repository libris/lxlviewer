import Thing from './thing'
import * as _ from 'lodash'

export default class Editor extends Thing {

  initialize() {
    super.initialize();
    
    this.loadItem();
  }
  
  loadItem() {
    this.data = JSON.parse(document.getElementById('data').innerText);
    this.initVue(this.data);
  }
  
  initVue(data) {
    console.log(JSON.stringify(data));
    
    new Vue({
      el: '#editorApp',
      data: {
        data: data,
        title: "something"
      },
      methods: {
      },
      components: {
        'data-node': {
          template: '#data-node',
          name: 'data-node',
          props: ['key', 'value']
        }
      }
    });
  }
}
