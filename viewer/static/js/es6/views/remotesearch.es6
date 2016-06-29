import View from './view';
import Vue from 'vue';
import * as VocabUtil from '../utils/vocab';
import remoteSearch from '../components/remoteSearch';

export default class RemoteSearch extends View {

  initialize() {
    super.initialize();
    const self = this;
    this.activeForm = '';
    this.transition = false;
    this.params = window.urlArgs;

    VocabUtil.getVocab().then((vocab) => {
      self.initVue(vocab, self.vocabPfx, self.params);
    });
  }

  initVue(vocab, vocabPfx, params) {
    const self = this;
    $('#app').show();

    const vm = new Vue({
      el: '#app',
      data: {
        vocabPfx: 'kbv:',
        language: self.language,
        vocab,
        params,
      },
      methods: {
      },
      computed: {
      },
      components: {
        'remote-search': remoteSearch,
      },
    });
  }

}
