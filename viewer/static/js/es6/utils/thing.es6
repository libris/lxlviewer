

export function createChips($panelElement) {
    if ($panelElement.length < 1)
      return;

    setTimeout(function() {
      // Copies every chip in the panel so that we can use absolute positioning on
      // the expanded chips without breaking the layout.
      $panelElement.find('.link-item').each(function() {
        var $subject = $(this);
        var $copy = $subject.clone();
        var $holder = $('<div class="copy-holder">');
        var $arrow = $('<div class="arrow">').appendTo($holder);
        $arrow.css('left', ($subject.width()*0.25)-3);
        $subject.addClass('link-item-original');
        $copy.addClass('link-item-copy').appendTo($holder);
        $holder.appendTo($subject);
        if ($subject.width() > 260) {
          $copy.css('min-width', $subject.width());
        }
      });

      // Initialize hover functionality
      $panelElement.find('.link-item-original').hover(function() {
        expand($(this).find('.copy-holder'));
      }, function() {
        collapse($(this).find('.copy-holder'));
      }).focusin(function() {
        expand($(this).find('.copy-holder'));
      }).focusout(function() {
        collapse($(this).find('.copy-holder'));
      });

    }, 250);
}

export function destroyChips($panelElement) {
    $panelElement.find('.copy-holder').each(function() {
      $(this).remove();
    })
}

export function expand($elem) {
    $elem.addClass('to-be-active');
    var resource = $elem.attr('resource');
    setTimeout(function() {
      if($elem.hasClass('to-be-active')) {
        $elem.addClass('active');
      }
    }, 500);
};
export function collapse($elem) {
    $elem.removeClass('to-be-active');
    $elem.removeClass('active');
    $elem.find('.link-item-copy').removeClass('active');

    // Removing these so that the chip isn't activated when hovering on the ghost of it...
    $elem.css('margin-top', '');
    $elem.removeClass('adjusted-top');

    $elem.css('width', '').css('height', '');
};

export function initHitlistExpands($hitlist) {
  // Hit list expand functionality
    $($hitlist).find('.hit-item').each(function() {
      $("<div class='expand-button'><i class='fa rotate fa-plus-circle'></i></div>").prependTo($(this).find('.panel-title').eq(0));
    })

    $($hitlist).find('.hit-item .expand-button').click(function() {
      let $subject = $(this).closest('.hit-item');
      if ($subject.hasClass('expanded')) {
        $(this).find('i').removeClass('rotate-180');
        $(this).find('i').addClass('fa-plus-circle');
        $(this).find('i').removeClass('fa-minus-circle');
        $subject.removeClass('expanded');
        destroyChips($subject);
      } else {
        $(this).find('i').addClass('rotate-180');
        $(this).find('i').addClass('fa-minus-circle');
        $(this).find('i').removeClass('fa-plus-circle');
        $subject.addClass('expanded');
        createChips($subject);
      }
    });
};
