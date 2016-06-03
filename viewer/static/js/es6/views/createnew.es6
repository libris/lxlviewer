import View from './view';
import * as UserUtil from '../utils/user';
import * as VocabUtil from '../utils/vocab';

export default class CreateNew extends View {

  initialize() {
    super.initialize();

    this.activeForm = '';
    this.transition = false;
    this.initMenu();
    this.initMaterials();
  }

  initMenu() {
    self = this;

    function show(id) {
      self.activeForm = id;
      $('#'+id).fadeIn('fast', function() {
        self.transition = false;
      });
    }

    $('.choice').click(function() {
      const id = $(this).attr('data-toggle');
      if (self.activeForm === id || self.transition) return;
      self.transition = true;
      if (self.activeForm) {
        $('#'+self.activeForm).fadeOut('fast', function() {
          show(id);
        });
      } else {
        show(id);
      }
    });
  }

  initMaterials() {
    const self = this;
    VocabUtil.getVocab().then((result) => {
      self.vocab = result;
      const CreativeWork = VocabUtil.getClass(self.vocabPfx+'CreativeWork', result);
      const Aggregate = VocabUtil.getClass(self.vocabPfx+'Aggregate', result);

      const CreativeWorkClasses = VocabUtil.getSubClasses(self.vocabPfx+'CreativeWork', result);
      const AggregateClasses = VocabUtil.getSubClasses(self.vocabPfx+'Aggregate', result);

      self.chosenTypes = [];

      let html = '';
      html = '<h2>Typ</h2>';
      for (let i = 0; i < CreativeWorkClasses.length; i++) {
        const id = CreativeWorkClasses[i]['@id'].replace(self.vocabPfx, '');
        const label = CreativeWorkClasses[i].labelByLang ? CreativeWorkClasses[i].labelByLang[self.language] : CreativeWorkClasses[i]['@id'];
        console.log(CreativeWorkClasses[i].labelByLang);
        html += `<div class="radio"><label><input name="creativeworkRadio" type="radio" value="${id}">${label}</input></label></div>`;
      }
      $('#create_new_post .creativeworkclasses').html(html);

      html = '<h2>Bibliografisk nivå</h2>';
      for (let i = 0; i < AggregateClasses.length; i++) {
        const id = AggregateClasses[i]['@id'].replace(self.vocabPfx, '');
        const label = AggregateClasses[i].labelByLang ? AggregateClasses[i].labelByLang[self.language] : AggregateClasses[i]['@id'];
        console.log(AggregateClasses[i].labelByLang);
        html += `<div class="radio"><label><input name="aggregateRadio" type="radio" value="${id.replace(self.vocabPfx, '')}">${label}</input></label></div>`;
      }
      $('#create_new_post .aggregateclasses').html(html);

      $('#create_new_post .creativeworkclasses input').click(function() {
        self.chosenTypes[0] = $(this).val();
          console.log(self.chosenTypes);
      });
      $('#create_new_post .aggregateclasses input').click(function() {
        self.chosenTypes[1] = $(this).val();
          console.log(self.chosenTypes);
      })

      $('#create_new_post button[type=submit]').click((e) => {
        e.preventDefault();
        const params = '@type=' + JSON.stringify(self.chosenTypes);
        console.log(params);
        window.location.href = '/new?' + params;
      });

    });
  }
}
