$(function () {

  var createChips = function ($panelElement) {    
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
  
  var destroyChips = function($panelElement) {
    $panelElement.find('.copy-holder').each(function() {
      $(this).remove();
    })
  }

  var expand = function (elem) {
    elem.addClass('to-be-active');
    var resource = elem.attr('resource');
    setTimeout(function() {
      if(elem.hasClass('to-be-active')) {
        elem.addClass('active');
      }
    }, 500);
    
  };
  var collapse = function (elem) {
    elem.removeClass('to-be-active');
    elem.removeClass('active');
    elem.find('.link-item-copy').removeClass('active');
    
    // Removing these so that the chip isn't activated when hovering on the ghost of it...
    elem.css('margin-top', '');
    elem.removeClass('adjusted-top');
    
    elem.css('width', '').css('height', '');
  };
  
  var initHitlistExpands = function() {
    // Hit list expand functionality
    
    
    $('.hit-item').each(function() {
      $("<div class='expand-button'><i class='fa rotate fa-plus-circle'></i></div>").prependTo($(this).find('.panel-title').eq(0));
    })
  
    $('.hit-item .expand-button').click(function() {
      $subject = $(this).closest('.hit-item');
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
  
  var getParameters = function () {
    var params = [];
    $('input[type=hidden]').each(function() {
      params.push({ key: $(this).attr('name'), value: $(this).val() });
      $(this).remove();
    });
    return params;
  };
  
  var getParameter = function (name) {
    var parameters = getParameters();
    for (var i = 0; i < parameters.length; i++){
      if (name == parameters[i].key) {
        return parameters[i];
      }
    }
  }
  
  var initTypeButtons = function() {
    var type = getParameter('type');
    if (typeof type !== 'undefined') {
      $('.type-buttons input').each(function() {
        if ($(this).val() == type.value) {
          $(this).closest('label').addClass('active');
          $(this).attr('checked', '');
        }
      });
    } else {
      $('.type-buttons .no-choice').addClass('active');
    }
  }

  $(document).ready(function () {
    
    createChips($('.main-item'));
    createChips($('.side-view'));
    initTypeButtons();
    initHitlistExpands();
    
    // Remove empty fields
    $('form').submit(function(e){
        var emptyinputs = $(this).find('input').filter(function(){
            return !$.trim(this.value).length;
        }).prop('disabled',true);
    });
    
  });

});
