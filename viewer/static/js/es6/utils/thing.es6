export function initializeHoverCards($thingContainer, delay) {
  const $chipContainers = $thingContainer.find('.chip-container');
  $chipContainers.each(function () {
    const $chipContainer = $(this);
    $(this).find('.chip').on('mouseenter', function () {
      $(this).addClass('highlighted');
      const $card = $chipContainer.find('.card-info-container');
      $card.addClass('to-be-active');
      setTimeout(() => {
        if ($card.hasClass('to-be-active')) {
          $card.addClass('card-shown')
          .removeClass('card-hidden')
          .removeClass('to-be-active');
        }
      }, delay);
    });
    $(this).on('mouseleave', function () {
      $(this).find('.chip').removeClass('highlighted');
      $chipContainer.find('.card-info-container')
        .addClass('card-hidden')
        .removeClass('card-shown')
        .removeClass('to-be-active');
    });
  });
}

export function initHitlistExpands() {
  // Hit list expand functionality
  $('.thing-list-item .header').click(function(e) {
    const targetIsLink = (e.target.tagName.toLowerCase() === 'a');
    if (!targetIsLink) {
      const $subject = $(this).closest('.thing-list-item');
      if ($subject.hasClass('expanded')) {
        $(this).find('i').removeClass('rotate-90');
        $subject.removeClass('expanded');
      } else {
        $(this).find('i').addClass('rotate-90');
        $subject.addClass('expanded');
        initializeHoverCards($(this).parent(), 500);
      }
    }
  });
}
