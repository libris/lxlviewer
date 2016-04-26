import Thing from './thing'
import * as _ from 'lodash'

export default class Editor extends Thing {

  initialize() {
    super.initialize();
    
    this.loadItem();
  }
  
  loadItem() {
    this.data = JSON.parse(document.getElementById('data').innerText)['@graph'];
    this.thing = this.data[0];
    this.data.splice(0, 1);

    this.linked = [];
    
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].hasOwnProperty('@graph')) {
        this.linked.push(this.data[i]['@graph']);
      } else {
        this.linked.push(this.data[i]);
      }
    }
    
    this.initVue(this.thing, this.linked);
  }
  
  initVue(thing, linked) {
    console.log(JSON.stringify(thing), JSON.stringify(linked));
    
    new Vue({
      el: '#editorApp',
      data: {
        thing: thing,
        linked: linked,
        title: "something"
      },
      methods: {
        removeItem: function(key, item) {
          this.thing[key].$remove(item);
        },
        addItem: function(key) {
          if (thing[key]) {
            let newItem = { '@id': thing[key].length + 21233, prefLabel : 'Test' };
            thing[key].push(newItem);
          }
        },
        isArray(o) {
          return _.isArray(o);
        },
        isPlainObject(o) {
          return _.isPlainObject(o);
        }
      },
      components: {
        'data-node': {
          template: '#data-node',
          name: 'data-node',
          props: ['key', 'value', 'index'],
          methods: {
            getLinked: function(id) {
              let index = this.index;
              if (typeof index === 'undefined') {
                return {};
              }
              for (var i = 0; i < index.length; i ++) {
                if (index[i]['@id'] == id) {
                  return index[i];
                }
              }
              return {};
            },
            isArray(o) {
              return _.isArray(o);
            },
            isPlainObject(o) {
              return _.isPlainObject(o);
            },
            removeItem: function(key, value) {
              return this.$parent.removeItem(key, value);
            }
          }
        }
      }
    });
  }
}
