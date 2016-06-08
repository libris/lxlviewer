export function confirmDialog(sTitle, sContent, sAccept, sReject) {

  function createModal(sTitle, sContent, sAccept, sReject) {
    const template = `<div class="modal fade" id="confirmModal"
              tabindex="-1" role="dialog" aria-labelledby="confirmModalLabel">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" id="myModalLabel">${sTitle}</h4>
              </div>
              <div class="modal-body">
                ${sContent}
              </div>
              <div class="modal-footer">
              <button type="button" class="btn btn-default" data-dismiss="modal">${sReject}</button>
              <button type="button" class="btn btn-primary" data-dismiss="modal">${sAccept}</button>
              </div>
            </div>
          </div>
        </div>`;
    if ($('#confirmModal').length == 0) {
      $('body').append(template);
    } else {
      $('#confirmModal').replaceWith(template);
    }

    $('#confirmModal').modal('show');

    return new Promise((resolve, reject) => {
      $('#confirmModal .btn-primary').click(() => {
        resolve();
      });
      $('#confirmModal .btn-default').click(() => {
        reject();
      });
    });
  }

  return new Promise((resolve, reject) => {
    createModal(sTitle, sContent, sAccept, sReject).then(() => {
      resolve();
    }, () => {
      reject();
    });
  });
}
