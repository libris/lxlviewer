import View from './view';
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';

export default class Editor extends View {

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
    
    new Vue({
      el: '#editorApp',
      data: {
        thing: thing,
        linked: linked,
        saved: {
          loading: false,
          status: 'normal'
        }
      },
      methods: {
        removeItem: function(key, item) {
          thing[key].$remove(item);
        },
        addItem: function(key) {
          let tempInput = prompt("Give id plix", "");
          let newItem = { '@id': tempInput, 'prefLabel' : tempInput };
          thing[key].push(newItem);
        },
        isArray(o) {
          return _.isArray(o);
        },
        isPlainObject(o) {
          return _.isPlainObject(o);
        },
        saveItem() {
          this.saved.loading = true;
          this.saved.status = "normal";
          
          let obj = JSON.stringify(this.thing);
          let url = "/create";
          let self = this;
          
          httpUtil.post(obj, url).then(function (response) {
            self.saved.loading = false;
            self.saved.status = "success";
            setTimeout(() => {
              self.saved.status = "normal";
            },750);
          }, function (error) {
            self.saved.loading = false;
            self.saved.status = "fail";
            setTimeout(() => {
              self.saved.status = "normal";
            },750);
          });
          
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
            updateValue(key, value) {
              
            },
            isMarc(key) {
              if (typeof key === 'undefined') {
                return false;
              }
              return (
                !!~key.indexOf('marc:') || !!~key.indexOf('_marc')
              );
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
