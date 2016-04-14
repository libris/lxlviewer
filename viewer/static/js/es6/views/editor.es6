import Thing from './thing'

export default class Editor extends Thing {

  initialize() {
    super.initialize();
    
    this.createVue();
  }
  
  createVue() {
    
    let data = document.getElementById('data').innerText
    let graph = JSON.parse(data)
    document.getElementById('editor').value = data
    document.querySelector('h1').innerHTML += graph['@graph'][0]['@id']

    new Vue({
      el: '#editorApp',
      data: {
        message: data
      }
    });
  }
}
