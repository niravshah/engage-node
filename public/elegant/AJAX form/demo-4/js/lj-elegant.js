/*
  Author: Lumberjacks
  Template: Elegant (Coming Soon)
  Version: 1.0
  URL: http://themeforest.net/user/Lumberjacks/
*/

(function($) {
  "use strict";

  // Scroll down button show/hide function
  function scrolldown() {
    var header_h = $('header').height();
    var scrolldown = $('.lj-scroll-down');

    if( header_h >= 650 )
      scrolldown.show();
    else
      scrolldown.hide();
  }

  $(document).ready(function (){
    'use strict';

    // E-mail validation via regular expression
    function isValidEmailAddress(emailAddress) {
      var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
      return pattern.test(emailAddress);
    };

    // Subscription form notifications and AJAX function
    $(function () {
      $("#subscribe").submit(function (event) {
        var input = $('.lj-subscribe-message');
          if(!input.is(':empty')) {
            $('.lj-subscribe-message').stop(true);
          }
          event.preventDefault();
          event.stopImmediatePropagation();

          var email = $("input#subscribe-email").val();

          if (email == "") {

            $(".lj-subscribe-message").stop(true).html('<i class="fa fa-warning"></i> You must enter a valid e-mail address.');
            $("input#subscribe-email").focus();
          } 
          else if (!isValidEmailAddress( email )) {
            $(".lj-subscribe-message").stop(true).html('<i class="fa fa-warning"></i> E-mail address is not valid.');
            $("input#subscribe-email").focus();            
          }
          else {
            $.ajax({
              type: "POST",
              url: "./php/send-subscription.php",
              data: {subscription:email},
              success: function () {
                $(".lj-subscribe-message").html('<i class="fa fa-check"></i> We will be in touch soon!');
                $('input#subscribe-email').val('');
              }
            });
          }
       });
    });

    // Contact form functions
    $(function () {
      $("#contactform").submit(function (event) {
        var input = $('.lj-contact-message');
          if(!input.is(':empty')) {
            $('.lj-contact-message').stop(true);
          }
          event.preventDefault();
          event.stopImmediatePropagation();

          var name = $("input#contact-name").val();
          var email = $("input#contact-email").val();
          var message = $("textarea#contact-message").val();

          if (name == "" || email == "" || message == "") {

            $(".lj-contact-message").stop(true).html('<i class="fa fa-warning"></i> All fields are required.');
            //$("input#contact-email").focus();
          }
          else if (!isValidEmailAddress( email )) {
            $(".lj-contact-message").stop(true).html('<i class="fa fa-warning"></i> E-mail address is not valid.');
            $("input#contact-email").focus();
          }
          else {
            $.ajax({
              type: "POST",
              url: "./php/send-contact.php",
              data: {contact_email:email,
                     contact_name:name,
                     contact_message:message},
              success: function () {
                $(".lj-contact-message").html('<i class="fa fa-check"></i> Thank you for your message!');
                $('input#contact-name').val('');
                $('input#contact-email').val('');
                $('textarea#contact-message').val('');
              }
            });
          }
       });
    });

    // Scroll to next module after Header section 
    $(".lj-scroll-down").click(function(e) { 
      e.preventDefault();
      $('html,body').animate({
        scrollTop: $("header").nextAll('.module').offset().top},
        1250);           
    });

    // Countdown
    // To change date, simply edit: var endDate = "June 26, 2015 20:39:00";
    $(function() {
      var endDate = "June 26, 2015 20:39:00";
      $('.lj-countdown .row').countdown({
        date: endDate,
        render: function(data) {
          $(this.el).html('<div><div><span>' + (parseInt(this.leadingZeros(data.years, 2)*365) + parseInt(this.leadingZeros(data.days, 2))) + '</span><span>days</span></div><div><span>' + this.leadingZeros(data.hours, 2) + '</span><span>hours</span></div></div><div class="lj-countdown-ms"><div><span>' + this.leadingZeros(data.min, 2) + '</span><span>minutes</span></div><div><span>' + this.leadingZeros(data.sec, 2) + '</span><span>seconds</span></div></div>');
        }
      });
    });

    // backstretch
    $("header").backstretch("img/bg.jpg");

    // JQUERY.MB.YTPLAYER
    /*
    $(function(){
      $(".yt-player").mb_YTPlayer();
    });

    // yt controls
    $('#yt-play').click(function(event){
      event.preventDefault();
      if ($(this).hasClass("fa-play") ) {
          $('.yt-player').playYTP();
      } else {
          $('.yt-player').pauseYTP(); 
      }
      $(this).toggleClass("fa-play fa-pause");
      return false;
    });
    $('#yt-volume').click(function(event){
      event.preventDefault();
      $('.yt-player').toggleVolume();
      $(this).toggleClass("fa-volume-off fa-volume-up");
      return false;
    });
    */

    // Header's wrapper vertical centering
    $(function () {
      var wrapper_height = $('.wrapper').height();
      var negative_margin = -(wrapper_height / 2);
      $('.wrapper').css({'marginTop':negative_margin+'px'});
    });

    // Init scrolldown() function
    scrolldown();

    // scrollReveal
    (function($) {
      window.scrollReveal = new scrollReveal();
    })();

    // Stellar.js
    // To get more info and check all parameters, please go to: https://github.com/markdalgleish/stellar.js
    $(function () {
      $.stellar({
        horizontalScrolling: false
      });
    });

    // jQuery Tweetie
    $(function () {
      $('.lj-twitter-feed').twittie({
        username: 'envato',
        count: 5,
        dateFormat: '%d %B %Y',
        template: '{{tweet}} <div class="lj-twitter-date"><a href="{{url}}" target="_blank">{{date}}</a> <span>@{{user_name}}</span></div>',
        apiPath: 'twitter/api/tweet.php',
      }, function () {
        var ticker = $('.lj-twitter-feed ul');
        ticker.children('li:first').show().siblings().hide();        
        setInterval(function() {
          ticker.find('li:visible').fadeOut(500,function() {
            $(this).appendTo(ticker);
            ticker.children('li:first').fadeIn(500);
          });
        },5000);
      });
    }); 

  });

  // Scroll down button show/hide function re-init on window resize
  $(window).on('resize', function(){
      scrolldown();
  });

  // Preloader
  // Change delay and fadeOut speed (in miliseconds)
  $(window).load(function() {
    $(".lj-preloader").delay(100).fadeOut(500);
  });

})(jQuery);