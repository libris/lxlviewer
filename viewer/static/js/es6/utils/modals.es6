
function createModal(id, options) {
  options.sFooterContent = options.sFooterContent || '';

  const elementId = `#${id}`;
  let footerTemplate = '';
  if(options.sFooterContent) {
    footerTemplate = `<div class="modal-footer">
                        ${options.sFooterContent}
                      </div>`;
  }

  const template =
      `<div class="modal fade in" id="${id}" tabindex="-1" role="dialog" aria-labelledby="${id}-label">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span></button>
              <h4 class="modal-title" id="${id}-label">${options.sTitle}</h4>
            </div>
            <div class="modal-body">
              ${options.sContent}
            </div>
              ${footerTemplate}
          </div>
        </div>
      </div>`;

  if ($(elementId).length === 0) {
    $('body').append(template);
  } else {
    $(elementId).replaceWith(template);
  }
  $(elementId).modal('show');

  return new Promise((resolve, reject) => {
    $(elementId + ' .js-button-accept').click(() => {
      resolve();
    });
    $(elementId + ' .js-button-reject').click(() => {
      reject();
    });
    $(elementId).on('hidden.bs.modal', () => {
      reject();
    })
  });
}

/*
  Creates a confirm dialog and returns a promise.
    Params object:
    sTitle          - Title (string)
    sContent        - Content (string)
    sAccept         - Accept button text (string)
    sReject         - Reject button text (string)
    [sType]         - Optional accept style (string) - 'danger', 'warning'
*/
export function confirmDialog(options) {

  switch (options.sType) {
    case 'danger':
      options.sAcceptClass = 'btn-danger';
      break;
    case 'warning':
      options.sAcceptClass = 'btn-warning';
      break;
    default:
      options.sAcceptClass = 'btn-primary';
  }
  options.sFooterContent = `<button type="button" class="btn js-button-reject btn-default" data-dismiss="modal">${options.sReject}</button>
                            <button type="button" class="btn js-button-accept ${options.sAcceptClass}" data-dismiss="modal">${options.sAccept}</button>`;

  return createModal('confirm-modal', options);
}

/*
  Creates a modal
    Params object:
    sTitle          - Title (string)
    sContent        - Content (string)
*/
export function modal(options) {
  return createModal('modal-modal', options);

}
