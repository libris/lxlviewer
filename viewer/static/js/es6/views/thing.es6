import View from './view';
import * as thingutil from '../utils/thing';
import * as searchutil from '../utils/search';
import * as VocabLoader from '../utils/vocabloader';
import * as httpUtil from '../utils/http';
import * as modalUtil from '../utils/modals';

export default class Thing extends View {

  initialize() {
    super.initialize();

    VocabLoader.initVocabClicks();
    searchutil.initTypeButtons();
    thingutil.createChips($('.main-item'));
    thingutil.createChips($('.side-view'));
    thingutil.initHitlistExpands('.result-list');
    searchutil.initializeSearch();
    this.initToolbar();
  }

  initToolbar() {
    const self = this;
    // TOOLBAR-REMOVE
    $('.js-toolbar-remove').click(function(e) {
      e.preventDefault();
      const url = $(this).attr('data-record-id').replace('/', '');
      modalUtil.confirmDialog({
        sTitle: 'Ta bort?',
        sContent: 'Du kan inte ångra detta val.',
        sAccept: 'OK',
        sReject: 'Avbryt',
        sType: 'danger' }).then(() => {
          // accepted by user
          httpUtil._delete(url, self.access_token).then((result) => {
            console.log("post WAS deleted...", result);
          }, (result) => {
            console.log("post was NOT deleted...", result);
          });
        }, () => {
        // rejected by user
      });
    });

    $('.js-toolbar-marc').click(function(e) {
      e.preventDefault();
      const url = $(this).attr('data-record-id').replace('/', '');
      modalUtil.modal({
        sTitle: 'MARC Vy',
        sContent: `<section class="marc-code">
                    <table>
                      <tr>
                        <td data-ng-if="record.leader">
                          <code>000</code>
                        </td>
                        <td></td>
                        <td></td>
                        <td colspan="3">
                          <span>{{record.leader}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <code>{{key}}</code>
                        </td>
                        <td class="ind">
                          {{value.ind1}}
                        </td>
                        <td class="ind">
                          {{value.ind2}}
                        </td>
                        <td>
                          <span>{{value}}</span>
                          <span>{{value.subfields}}</span>
                        </td>
                      </tr>
                    </table>
                  </section>`
      }).then(() => {}, () => {});;
    });
  }
}
