import View from './view';
import * as _ from 'lodash';
import * as httpUtil from '../utils/http';

export default class Editor extends View {

  initialize() {
    super.initialize();
    
    this.loadItem();
    let self = this;
    this.loadVocab().then(function(vocab) {
      self.initVue(self.thing, self.linked, vocab);
    });
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
  }
  
  loadVocab() {
    return new Promise(function(resolve, reject) {
      httpUtil.getContent('/vocab/', 'application/ld+json').then(function(response) {
        resolve(JSON.parse(response));
      }, function(error) {
        reject("Error loading vocabulary...");
      });
    });
  }
  
  initVue(thing, linked, vocab) {
    
    let self = this;
    
    $('#loadingText').hide();
    $('#editorApp').show();
    
    Vue.filter('labelByLang', function (label) {
      // Filter for fetching labels from vocab
      let preferredVocab = 'kbv';
      let item = _.find(vocab['descriptions'], {'@id': preferredVocab + ':' + label });
      let labelByLang = '';
      if (typeof item !== 'undefined' && item.labelByLang) {
        labelByLang = item.labelByLang[self.language];
      }
      // Check if we have something of value
      if (labelByLang.length > 0) {
        return labelByLang;
      } else {
        return label;
      }
    })
    
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
