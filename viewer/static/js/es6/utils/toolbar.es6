import * as httpUtil from '../utils/http';
import * as modalUtil from '../utils/modals';
import * as RecordUtil from '../utils/record';

export function initToolbar(_context) {
  const context = _context;
  // TOOLBAR-REMOVE
  $('.js-toolbar-remove').click(function(e) {
    e.preventDefault();
    let url = $(this).attr('data-record-id');
    // TODO: Is this legacy code?
    // if (url[0] !== '/') {
    //   url = `/${url}`;
    // }
    modalUtil.confirmDialog({
      sTitle: 'Ta bort?',
      sContent: 'Du kan inte ångra detta val.',
      sAccept: 'OK',
      sReject: 'Avbryt',
      sType: 'danger' }).then(() => {
        // accepted by user
        httpUtil._delete({ url, token: context.access_token }).then((result) => {
          console.log("post WAS deleted...", result);

          // Force reload
          window.location.reload();
        }, (result) => {
          console.log("post was NOT deleted...", result);
        });
      }, () => {
      // rejected by user
    });
  });

  // Copy button
  const itemId = $('#itemId').text();
  if (itemId.length > 0) {
    RecordUtil.getNewCopy(itemId).then((response) => {
      $('#copyItem').text(JSON.stringify(response));
      $('.js-toolbar-copy').removeClass('hidden');
    }, (error) => {
      console.warn("Couldn't prepare item copy, hiding copy button.", error);
    });
  }
}
