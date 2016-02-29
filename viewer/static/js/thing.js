$(function () {

  
  var createDuplicates = function () {
    // Copies every chip so that we can use absolute positioning on
    // the expanded chips without breaking the layout.
    $('.link-item').each(function() {
      var $subject = $(this);
      var $copy = $subject.clone();
      $subject.addClass('link-item-original');
      $copy.addClass('link-item-copy').appendTo($subject.parent());
      $copy.css('top', $subject.position().top).css('left', $subject.position().left);
      if ($subject.width() > 260) {
        $copy.css('min-width', $subject.width());
      }
    });
  }

  var expand = function (elem) {
    elem.addClass('to-be-active');
    var resource = elem.attr('resource');
    setTimeout(function() {
      if(elem.hasClass('to-be-active')) {
        elem.addClass('active');
        if(!elem.hasClass('adjusted-top')) {
          // Adjust position so that the chip "grows" around the prefLabel
          var $parent = elem.closest('li');
          if ($parent.length == 0) {
            $parent = elem.closest('dd');
          }
          var $rootHeading = $parent.find('.link-item-original[resource="'+resource+'"] .panel-title');
          var $elemHeading = $parent.find('.link-item-copy[resource="'+resource+'"] .panel-title');
          var diffY = $elemHeading.offset().top - $rootHeading.offset().top;
          elem.css('margin-top', -diffY);
          elem.addClass('adjusted-top');
        }
      }
    }, 500);
    
  };
  var collapse = function (elem) {
    elem.removeClass('to-be-active');
    elem.removeClass('active');
    
    // Removing these so that the chip isn't activated when hovering on the ghost of it...
    elem.css('margin-top', '');
    elem.removeClass('adjusted-top');
    
    elem.css('width', '').css('height', '');
  };
  
  var initHitlistExpands = function() {
    // Hit list expand functionality
    
    $('.hit-item').each(function() {
      $(this).find('.panel-heading').eq(0).append(
        "<i class='expand-button fa fa-plus-circle'></i>"
      );
    })
    
    $('.hit-item .expand-button').click(function() {
      $subject = $(this).closest('.hit-item');
      if ($subject.hasClass('expanded')) {
        $subject.find('.panel-body').slideUp();
        $(this).removeClass('fa-minus-circle');
        $(this).addClass('fa-plus-circle');
        $subject.removeClass('expanded');
      } else {
        $subject.find('.panel-body').slideDown();
        $(this).removeClass('fa-add-circle');
        $(this).addClass('fa-minus-circle');
        $subject.addClass('expanded');
      }
    });
  }

  $(document).ready(function () {
    setTimeout(function() {
      // Small delay to let the chips stack correctly in their lists
      // before we copy every position.
      createDuplicates();
      
      $('.link-item-copy').hover(function() {
        expand($(this));
      }, function() {
        collapse($(this));
      }).focusin(function() {
        expand($(this));
      }).focusout(function() {
        collapse($(this));
      });
      
      initHitlistExpands();
      
    }, 10);
  });

});
