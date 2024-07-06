/*======================================
  #Set browser class
======================================*/

AOS.init({
    once: true
});

navigator.browserSpecs = (function(){
    var ua= navigator.userAgent, tem,
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return {name:'IE',version:(tem[1] || '')};
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return {name:tem[1].replace('OPR', 'Opera'),version:tem[2]};
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return {name:M[0],version:M[1]};
})();

$(function(){
  var OSName="os";
  if (navigator.appVersion.indexOf("Win")!=-1) OSName="windows";
  else if (navigator.appVersion.indexOf("Mac")!=-1) OSName="macos";
  else if (navigator.appVersion.indexOf("X11")!=-1) OSName="unix";
  else if (navigator.appVersion.indexOf("Linux")!=-1) OSName="linux";
  $("body").addClass(OSName);

  if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 ) { $('body').addClass('browser-opera'); }
  else if(navigator.userAgent.indexOf("Chrome") != -1 ) { $('body').addClass('browser-chrome'); }
  else if(navigator.userAgent.indexOf("Safari") != -1) { $('body').addClass('browser-safari'); }
  else if(navigator.userAgent.indexOf("Firefox") != -1 ) { $('body').addClass('browser-firefox'); }
  else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )){ $('body').addClass('browser-explorer'); }
  else if(navigator.userAgent.indexOf("Edge") != -1 ) { $('body').addClass('browser-edge'); }
  if(navigator.browserSpecs.version){ $('body').addClass('browser-version-'+navigator.browserSpecs.version); }

  var el = document.createElement('div');
  el.setAttribute('ongesturestart', 'return;');
  if(typeof el.ongesturestart == "function"){ $("body").addClass("touch"); }
  else { $("body").addClass("no-touch"); }
});

/*======================================
  #Set .scroll class on scroll
======================================*/
$(function(){
  var body          = $("body"),
    scrollVal       = 30;
    currentScroll   = 0;

  if($(window).scrollTop() > scrollVal){body.addClass("scroll");}

  $(window).on("scroll", function(){
    currentScroll = $(this).scrollTop();
    if(currentScroll > scrollVal){body.addClass("scroll");}
    else{body.removeClass("scroll");}
  });
});

/*======================================
  #Toggle mobile nav
======================================*/
$(function(){
  $(document).on("click", ".toggle-mobile-nav, .mobile-culture-indicator", function(e){
    e.preventDefault();
    $("body").toggleClass("mobile-nav-visible");
  });

  //Toggle mobile second level nav
  $(document).on("click", ".main-nav ul li a .expand", function(e){
    e.preventDefault();
    $(this).toggleClass("open").closest("li").children("ul").slideToggle(200);
  });
});

/*======================================
  #Adjust navigation offscreen
======================================*/
$(window).on("load", function(){
  var navs = $(".main-nav ul ul");
  var screenWidth = $(window).width();
  navs.each(function(){
    var rightEdge = $(this).width() + $(this).offset().left;
    if(rightEdge > screenWidth){
      $(this).addClass("go-right");
    }
  });
});

/*======================================
  #Navigation touch support
======================================*/
$(document).on("touchstart", ".main-nav ul li a", function(e){
    var navLi = $(this).parent("li");
    var navAllLi = $(".main-nav li");
    var dropExist = navLi.children("ul").length;

    if(!navLi.hasClass("touch-open") && dropExist && !$("body").hasClass("mobile-nav-visible")){
      e.preventDefault();
      var parentLi = navLi.closest(".touch-open");
      navAllLi.not(parentLi).removeClass("touch-open");
      navLi.addClass("touch-open");
    }
    else if(dropExist){
      navAllLi.removeClass("touch-open");
    }
});

/*======================================
  #Scroll to top
======================================*/
$(function(){
  $(document).on("click", ".to-top", function(e){
    e.preventDefault();
    $("html, body").animate({scrollTop: 0}, 500);
  });
});

/*======================================
  #Responsive video
======================================*/
$(document).ready(function(){
  $("body").fitVids();
});

/*======================================
  #Umbraco forms - Success scroll
======================================*/
$(window).on("load", function(){
  if ($(".umbraco-forms-submitmessage").length){
      var v = ($( ".umbraco-forms-submitmessage").offset().top - 120);
      $("html, body").animate({scrollTop: v}, 500);
  }
});

/*======================================
  #Googlemap
======================================*/
$(function(){
  if ($(".map .map-canvas").length){
    $(".map .map-canvas").each(function(){

      var map = $(this),
          mapCanvas = map[0],
          lat = map.data("lat"),
          long = map.data("long"),
          zoom = map.data("zoom"),
          pin = map.data("pin");

      var mapOptions = {
          center: new google.maps.LatLng(lat, long),
          zoom: zoom,
          scrollwheel: false
      };

      var mapobj = new google.maps.Map(mapCanvas, mapOptions);

      if(pin == "no"){
         var marker = new google.maps.Marker({
          position: new google.maps.LatLng(lat, long),
          map: mapobj
        });
      }
      else{
        var image = {
            url: pin,
            scaledSize: new google.maps.Size(50, 50),
        };

        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(lat, long),
          map: mapobj,
          optimized: false,
          icon: image
        });
      }

    });
  }

});

/*======================================
  #PhotoSwipe gallery
======================================*/
$(function(){
  if ($(".gallery").length){

    $('.gallery').each( function() {
        var $pic     = $(this),
            getItems = function() {
                var items = [];
                $pic.find('a').each(function() {
                    var $href   = $(this).attr('href'),
                        $size   = $(this).data('size').split('x'),
                        $width  = $size[0],
                        $height = $size[1];

                    var item = {
                        src : $href,
                        w   : $width,
                        h   : $height
                    };

                    items.push(item);
                });
                return items;
            };

        var items = getItems();

        var $pswp = $('.pswp')[0];
        $pic.on('click', 'figure', function(event) {
          event.preventDefault();

          var $index = $(this).index();
          var options = {
              index: $index,
              bgOpacity: 0.9,
              showHideOpacity: true,
              shareEl: false,
              getThumbBoundsFn: function($index) {
                var thumbnail = document.querySelectorAll('.gallery-item img')[$index];
                var pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                var rect = thumbnail.getBoundingClientRect(); 
                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            }
          };

          // Initialize PhotoSwipe
          var lightBox = new PhotoSwipe($pswp, PhotoSwipeUI_Default, items, options);
          lightBox.init();
      });
    });
  }
});

/*======================================
  #Instagram
======================================*/
$(function(){
	if ($("#instafeed").length){
	    
	    try {


		$("#instafeed").each(function(){
			
			var wrap = $(this),
		        count = wrap.data("count"),  
		        link = wrap.data("link"),
		        icon = wrap.data("icon"),
		        token = wrap.data("token"),
		        user = wrap.data("user"),
		        username = wrap.data("username"),
		        imagewidth = wrap.data("imagewidth"),
		        template = "",
		        linkstart = "",
		        linkend = "",
		        iconlink = "";

		        if(link == "1"){
		        	linkstart = '<a href="{{link}}" class="instagram-image-link" target="_blank">';
		        	linkend = '</a>';
		        }

		        if(icon == "1"){
		        	iconlink = '<a target="_blank" class="instagram-user-link" href="https://www.instagram.com/'+ username +'"><i class="fa fa-instagram"></a></i>';
		        }

		        template = '<div class="col-'+ imagewidth +'"><div class="gallery-item"><figure>'+iconlink+''+linkstart+'<span class="bg" style="display:block;background-size:cover;background-position:center; padding-top: 100%; width: 100%; height: 100% ;background-image: url({{image}});" alt="{{caption}}"></span>'+linkend+'</figure></div></div>';

			// Get images
			var feed = new Instafeed({
		    	//userId: user,
		    	accessToken: token,
		        get: 'user',
				limit: count,		
				template: template,
				resolution: 'standard_resolution'
		    });
		    feed.run();
		});
	    } catch (error) {}
	}	
});

/*======================================
  #Accordion
======================================*/
$(function(){
  $(document).on("click", ".acc-head", function(e){
    e.preventDefault();
    $(this).parent(".acc").toggleClass("open");
    $(this).next(".acc-body").slideToggle(300);
  });
});

/*======================================
  #Share modals
======================================*/
$(function(){
  $(document).on("click", ".share-list a", function(e){
      if($(window).width() > 768){
        e.preventDefault();
        var targetUrl = $(this).attr("href");
        var winWidth = $(this).data("width");
        var winHeight = $(this).data("height");
        PopupCenter(targetUrl,'sharer',winWidth,winHeight);
      }
  });
});

function PopupCenter(url, title, w, h) {
    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;
    var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

    if (window.focus) {
        newWindow.focus();
    }
}


/*======================================
  #Contact Form
======================================*/
$(function(){
  $('#contact-form').on('submit', function(e){
    if($("#contact-form")[0].checkValidity()){
      e.preventDefault();

      var $form = $(this);

      $.ajax({
        url: $form.data('posturl'),
        method: "POST",
        data: $form.serialize(),
        success: function(data){
          $form.html('<p class="contourMessageOnSubmit">'+$form.data('thankyoumessage')+'</p>');
        }
      });
    }
  });
  
 /* $('.newsletter form').on('submit', function(e){
    if($(".newsletter form")[0].checkValidity()){
      e.preventDefault();
      var $form = $(this);
      $.ajax({
        url: $form.attr('action'),
        method: "POST",
        data: $form.serialize(),
        success: function(data){
          $form.replaceWith('<p class="contourMessageOnSubmit">'+$form.data('thankyoumessage')+'</p>');
        }
      });
    }
  });*/
});


/*======================================
  #Video
======================================*/
$(function(){
  // Toggle video sound
  $(document).on("click", ".video-mute", function(e){
      e.preventDefault();
      $(this).toggleClass("sound-on");
      var video = $(this).prev(".hero-video").children(".hero-video__player");
      video.prop('muted', !video.prop('muted'));
  });
});

/*======================================
  #Minicart
======================================*/
$(function () {
  $(document).on("click", ".toggle-cart a", function(e){
    e.preventDefault();
    $("body").addClass("mini-cart-visible");     
  });

  $(document).on("click", ".add-to-cart", function(e){
    e.preventDefault();
    $("body").addClass("mini-cart-visible");     
  });

  $(document).on("click touchstart", ".mini-cart-overlay", function () {
    $("body").removeClass("mini-cart-visible");
  });
});

/*======================================
  #Search
======================================*/
$(function () {
    $(document).on("click", ".toggle-search a, .show-search", function (e) {
        e.preventDefault();
        $("body").addClass("search-visible");
        
        setTimeout(function () {
            $(".search__input").focus();
        }, 600);
    });
  
    $(document).on("click touchstart", ".search-overlay", function(){
        $("body").removeClass("search-visible");      
    });

    $(document).on("input", ".search .search__input", function (e) {
        if ($(this).val() == "") {
          $(".search__prefilled").slideDown(200);
          $(".search__autocomplete").slideUp(200);
        }
        else {
          $(".search__prefilled").slideUp(200);
          $(".search__autocomplete").slideDown(200);
        }
    });

    $(document).on("input", ".search-block .search__input", function (e) {
        $(".search-block__text-bg").text($(this).val());
    });

    $(document).on("click touchstart", ".search__close", function () {
        $("body").removeClass("search-visible");
    });
});

/*======================================
  #Filter
======================================*/
$(function () {
  $(document).on("click", ".toggle-store-filter", function (e) {
    e.preventDefault();
    $("body").addClass("store-filter-visible");
  });

  $(document).on("click touchstart", ".store-filter-overlay, .hide-filter", function (e) {
      e.preventDefault();
    $("body").removeClass("store-filter-visible");
  });
  
  $(document).on("click ", ".store-filter-section header", function(){
   $(this).parent().toggleClass("store-filter-section--open");
  });
});

/*======================================
  #Grid
======================================*/
/*$(function () {
  $(document).on("mouseenter", ".product", function () {
    var extra = $(this).find(".extra");

    if (extra.length && !extra.hasClass("loaded")) {
      var imageUrl = extra.data("image");
      extra.css('background-image', 'url(' + imageUrl + ')').addClass("loaded");
    }

  });
});*/

/*======================================
  #Tabs
======================================*/
$(function(){
    $(document).on("click", ".tabs-nav a:not(.active)", function(e){
        e.preventDefault();

        $(this).closest("ul").find("a").removeClass("active");
        $(this).addClass("active");
        var target = $(this).attr("href");

        $(this).closest(".tabs-nav").next(".tabs-container").find(".tab--active").slideUp(300).removeClass("tab--active");
        $(target).slideDown(300);

        setTimeout(function(){
            $(target).addClass("tab--active");
        },300);

    });
});

/*======================================
  #PhotoSwipe gallery
======================================*/
$(function(){
  if ($(".product-post__media").length){

    $('.product-post__media').each( function() {
        var $pic     = $(this),
            getItems = function() {
                var items = [];
                $pic.find('a.product-post__toggle-gallery').each(function() {
                    var $href   = $(this).attr('href'),
                        $size   = $(this).data('size').split('x'),
                        $width  = $size[0],
                        $height = $size[1];
     
                    var item = {
                        src : $href,
                        w   : $width,
                        h   : $height
                    }
     
                    items.push(item);
                });
                return items;
            }
     
        var items = getItems();

        var $pswp = $('.pswp')[0];
        $pic.on('click', '.product-post__toggle-gallery', function(event) {
          event.preventDefault();
           
          var $index = ($(".product-post__media--3d").length > 0) ? $(this).parent("figure").parent().index()-1 : $(this).parent("figure").parent().index();
          
          console.log($index)
          
          var options = {
              index: $index,
              bgOpacity: 0.9,
              showHideOpacity: true,
              shareEl: false,
              getThumbBoundsFn: function($index) {
                var thumbnail = document.querySelectorAll('.pw-thumb')[$index];
                var pageYScroll = window.pageYOffset || document.documentElement.scrollTop; 
                var rect = thumbnail.getBoundingClientRect(); 
                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            }
          }
           
          // Initialize PhotoSwipe
          var lightBox = new PhotoSwipe($pswp, PhotoSwipeUI_Default, items, options);
          lightBox.init();
      });

    });

  }

});

/*======================================
  #Review
======================================*/
$(function () {
  $(document).on("click", ".rating-input.rating--set span", function (e) {

    $(this).siblings().removeClass("selected");
    $(this).addClass("selected").nextAll().addClass("selected");

    var rating = $(this).data("val");

    $("#input-rating").val(rating);

    if (!$(".review-form__body").is(":visible")) {
      $(".review-form__body").slideDown(300);
    }

  });
  
  //Add some random colors to review avatars
  if ($(".review").length){
        var avatarColors = ["#E6567A", "#BADA55", "#1DABB8", "#FCB941", "#8870FF", "#B0DACC", "#F5CD79", "#F8A5C2", "#485460", "#05C46B", "#F53B57", "#34E7E4", "#00B894", "#636E72"];
    
        $(".review__avatar").each(function(){
          var random = Math.floor(Math.random() * avatarColors.length);
          $(this).css("background-color", avatarColors[random]);
        });
    };
});


/*======================================
  #Checkout
======================================*/
$(function () {
    // Radio box toggle
    $(document).on("change", ".radio-box input", function(){
        $(this).closest(".radio-box-wrap").children(".radio-box.selected").removeClass("selected");
        $(this).closest(".radio-box").addClass("selected");
    });

    // Toggle Voucher form
    $(document).on("click", ".voucher-code > a", function(e){
       $(".co-voucher-code").slideToggle(200);
    });

    // Payment tabs
    $(document).on("click", "ul.payment-options li:not(.selected) a", function(e){
        e.preventDefault();
        var target = $(this).attr("href");
        $("ul.payment-options li").removeClass("selected");
        $(this).parent("li").addClass("selected");

        $(".payment-content").hide();
        $(target).show();
    });

    // Toggle alt delivery info
    $(document).on("change", "#toggle-alt-delivery", function(){
        if($(this).is(":checked")){
          $(".alt-delivery").slideDown(200);
        }
        else{
          $(".alt-delivery").slideUp(200);
        }
    });
});

/*======================================
  #Newsletter modal
======================================*/
$(function () {

    $(document).on("click", ".close-newsletter-modal", function (e) {
        e.preventDefault();
        $(".newsletter-modal").remove();
        setCookie("newsletter-modal-dismissed", "true", 20);
    });

    if (getCookie("newsletter-modal-dismissed") == "") {
        $(".newsletter-modal").removeClass("hide-me");
    }
});


function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};


function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};

/*======================================
  #Page loaded
======================================*/
$(window).on("load", function(){
  $("body").addClass("page-loaded").removeClass("page-loading");
});




$(function(){
    
    
	$('.product-fit').waypoint(function(direction) {
		$('.pie:not(.ran)').each(function(index, element) {
		  var num = +($(this).data('val'));
		  var $self = $(this);

		  	var options = {
			  useEasing: true, 
			  useGrouping: true, 
			  formattingFn: function(num, elem){

				var animateTo = (num/6);
				animateTo = animateTo*5;
				animateTo = (animateTo+1); //fix for the last mile

			  	$(elem).parents('.pie').find('.circle').css('stroke-dasharray', animateTo + ' 100');

			  	return num;
			  }
			};
			var demo = new CountUp($(this).find('h2')[0], 0, num, 0, 3, options);
			demo.start();

			$(this).addClass("ran");

		  
		});
	}, {offset: window.innerHeight-$('.product-fit').height()});

});



//Store locator
/*
var storelocator = (function ($) {
  "use strict";

  return {

    init: function () {
      var obj = this;

      if ($('.storelocator').length > 0) {
        this.events();
        this.loadmap();
      }
      if (!navigator.geolocation) {
        $('.locateme').remove();
      }

      if (window.location.search) {
        var q = window.location.search.split('q=');
        q = decodeURIComponent(q[1]);

        if (q) {
          $('.search-query').val(q);
          obj.search(q);
        }
      }
    },

    events: function () {
      var obj = this;
      $('.locateme').on('click', function () {
        navigator.geolocation.getCurrentPosition(function (position) {
          obj.handlePositon(position, obj);
        });
      });
      $('.search-btn').on('click', function () {
        var query = $('.search-query').val();
        obj.search(query);
      });

      $('.search-query').on('keydown', function (e) {
        if (e.keyCode == 13) {
          var query = $('.search-query').val();
          obj.search(query);
        }
      });
    },
    loadmap: function () {
      function initialize() {
        var mapOptions = {
          center: { lat: 57.7087, lng: 11.9751 },
          disableDefaultUI: false,
          zoom: 3,
          scrollwheel: false,
          navigationControl: false,
          mapTypeControl: false,
          scaleControl: false
        };
        window.map = new google.maps.Map(document.getElementById('storemap'), mapOptions);
      }
      google.maps.event.addDomListener(window, 'load', initialize);
    },
    handlestores: function (stores) {

      if (typeof google === 'undefined') {
          return;
      }

      var obj = this;

      //put markers on map
      var markers = [];
      
      for (var i = 0; i < stores.length; i++) {

        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(stores[i].Latitude, stores[i].Longitude),
          map: window.map,
          icon: '/media/4815/marker.png',
          animation: google.maps.Animation.DROP,
          ResellerID: stores[i].ResellerID
        });

        markers.push(marker);

        google.maps.event.addListener(marker, 'click', function () {
          obj.pickStore(this, markers);
          $('body, html').animate({ scrollTop: ($('#storemap').next().position().top - 80 ) + 'px' });
        });
     

      }

      $('.multimap__result').on('click', '.show-store-loc', function () {
        
        
        
        var lat = $(this).data('lat'),
            lng = $(this).data('lng'),
            index = $(this).parents('li').index();

        obj.pickStore(markers[index], markers);
        $('.multimap__stores').animate({ scrollTop: '0px' });
      });
      if (stores[0]) {
        window.map.setCenter(new google.maps.LatLng(stores[0].Latitude, stores[0].Longitude));
        window.map.setZoom(9);
      }
    },
    pickStore: function (marker, markers) {


      for (var i = 0; i < markers.length; i++) {
        markers[i].setIcon('/media/4815/marker.png');
        markers[i].setZIndex(1);
      }

      marker.setIcon('/media/4816/marker-white.png');
      marker.setZIndex(9);
      $('.search-result li').show();

      var $store = $('#store-' + marker.ResellerID),
          title = $store.data('title'),
          website = ($store.data('website').length > 0) ? $store.data('website') : '',
          websiteTitle = website.split('/'),
          websiteTitle = (website.length > 0) ? websiteTitle[2] : '',
          phone = ($store.data('phone') != 'undefined') ? $store.data('phone') : '',
          address = $store.data('address'),
          distance = $store.data('distance');

      $('.selected-store').show().find('h2').text(title);
      $('.selected-store a').text(websiteTitle).attr('href', website);
      $('.selected-store .phone span').text(phone);
      $('.selected-store .address span').text(address);
      $('.selected-store .distance span').text(distance);

      $('#store-' + marker.ResellerID).hide();

      $('.selected-store .col-md-1').remove();

      window.map.setZoom(12);
      window.map.panTo(marker.position);

    },
    search: function (query) {

        if (query === '')
            return;

        query = encodeURIComponent(query)
        //ga('send', 'event', 'storelocator', 'search', query, 0);
      var obj = this;
      $.ajax({
        url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + query + '&sensor=false&language=en&key=AIzaSyDdleKiX2fUxogrmUk4YEgFP7ej2crLLvM',
        dataType: 'json',
        type: "GET",
        cache: false,
        crossDomain: true,
        success: function (data) {

            if (data === null)
                return;

            if (data.results.length === 0)
                return;
        
            var Country = obj.GetCountryFromResult(data.results[0]);
            var Tags = obj.GetQuerystringByName('tags');
            $.ajax({
              url: 'https://future-storelocator.azurewebsites.net/api/resellers?brand=bliz&query=' + data.results[0].address_components[0].long_name.toLowerCase() + '&longLat=' + data.results[0].geometry.location.lng + ' ' + data.results[0].geometry.location.lat + '&country=' + Country + '&iscoord=true&tags=' + Tags,
            dataType: 'json',
            type: "GET",
            cache: false,
            crossDomain: true,
            success: function (data) {

              obj.handlestores(data.PhysicalStores);
              $('.multimap__result ul').empty();
              for (var i = 0; i < data.PhysicalStores.length; i++) {
                  obj.AddPhysicalStoreToSearchResults(data.PhysicalStores[i]);
              }
            }
          });
        },
        error: function(er, ermessage){
          alert(ermessage);
        }
      });
    },
    handlePositon: function (position, obj) {
      $.ajax({
        url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.coords.latitude + ',' + position.coords.longitude + '&sensor=false&language=en',
        dataType: 'json',
        type: "GET",
        success: function (data) {
            var Country = obj.GetCountryFromResult(data.results[0]);
            var Tags = obj.GetQuerystringByName('tags');
          $.ajax({
            url:'https://future-storelocator.azurewebsites.net/api/resellers?brand=bliz&query=' + data.results[0].address_components[3].long_name.toLowerCase() + '&longLat=' + data.results[0].geometry.location.lng + ' ' + data.results[0].geometry.location.lat + '&country=' + Country + '&iscoord=true&tags=' + Tags,
            dataType: 'json',
            type: "GET",
            success: function (data) {
              obj.handlestores(data.PhysicalStores);
              $('.multimap__result ul').empty();
              for (var i = 0; i < data.PhysicalStores.length; i++) {
                  obj.AddPhysicalStoreToSearchResults(data.PhysicalStores[i]);
              }
            }
          });
        }
      });

    },

    GetCountryFromResult: function(result){

          for (var i = 0; i < result.address_components.length; i++) {
              var element = result.address_components[i];
              if (element.types[0] === 'country') {
                  return element.long_name;
              }
          }
    },

   GetQuerystringByName: function(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
          results = regex.exec(location.search);
      return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
   },

   AddPhysicalStoreToSearchResults: function (store) {
       var link = "",
                      phone = "",
                      recommendedDealer = "",
                      ulsDealer = "",
                      chainstore = "";

       if (store.Website)
           link = ' <a href="' + store.Website + '" target="_blank"><i class="fa fa-link"></i></a>';

       if (store.Phone)
           phone = store.Phone;

       if (store.IsRecommendedDealer)
           recommendedDealer = '<i title="Recommended Dealer" class="fa fa-thumbs-up theme-color"></i> ';

       if (store.Tags) {
           if (store.Tags.indexOf('ULS') > -1)
               ulsDealer = '<strong>(ULS Dealer) </strong>';
       }

       $('.multimap__result ul').append('<li id="store-' + store.ResellerID + '" class="" data-title="' + store.Name +
           '" data-website="' + store.Website + '" data-phone="' + store.Phone +
           '" data-address="' + store.Address + '" data-distance="' + store.Distance +
           '" ><div class="row"><div class="col-80"><h6>' + store.Name +
           '' + link + '</h6>' + recommendedDealer + ulsDealer +
           '<span>' + store.Address + '</span>' + phone +
           '</div><div class="col-20 text-right"><button class="button button--small show-store-loc"><i class="fa fa-map-marker bz-map"></i></button></div></div></li>');
   }

  };
})(jQuery);

storelocator.init();
*/
/*=============================
Checkout validate
==============================*/

$(function(){
    $(".checkout").on("keyup", ".payment-content .input-simple[data-error]", function(e){

        if(!e.target.checkValidity() && $(this).parent().siblings(".error").length == 0){
            //add error
            $(this).parent().siblings("label").after('<span class="error field-validation-error">'+ $(this).data("error")+'</span>');
        } else if(e.target.checkValidity()) {
            //remove error
            $(this).parent().siblings(".error").remove();
        }
        
    }); 
});



$(function(){
	if($('.reseller').length > 0){
		
		var bounds = new google.maps.LatLngBounds();
		var infowindow = new google.maps.InfoWindow();
		var geocoder = new google.maps.Geocoder();
		
		  var mapOptions = {
			  center : new google.maps.LatLng(57.691773, 11.9498),
			  zoom: 8,
			  scrollwheel: false
		  };
	

      	var mapobj = new google.maps.Map($("#reseller-map")[0], mapOptions);
		var markers = [];
		$(".reseller").each(function(key){
			var lat = $(this).data("lat");
			var lng = $(this).data("lng");
			var title = $(this).find(".title").text();
			var address = $(this).find(".address").html();
			var addressText = $(this).find(".address").text();
			var index = $(this).index();
			var latlng = $(this).data("latlng");
			latlng = latlng.split(",");


					var marker = new google.maps.Marker({
					  map: mapobj,
					  optimized: false,
					  position: new google.maps.LatLng(latlng[0], latlng[1]),
					  title: title,
					  address: address
					});

					bounds.extend(marker.position);

					  google.maps.event.addListener(marker, 'click', (function(marker) {
						return function() {
						  infowindow.setContent('<h5>'+marker.title+'</h5>'+marker.address);
						  infowindow.open(mapobj, marker);
						  $("html, body").animate({scrollTop: 0});
						}
					  })(marker));

					markers[index] = marker;
					
					mapobj.fitBounds(bounds);
		
		
		});
		
		
		
		$(".reseller .showInMap").on("click", function(){
			var index = $(this).parents(".reseller").index();

			var marker = markers[index];
			
			mapobj.setCenter(marker.position);
			mapobj.setZoom(12);
			new google.maps.event.trigger( marker, 'click' );
		});
	
	}
});

/*====================================
          CUSTOM FORM
======================================*/
$(function () {
    $(document).on("click", ".custom-form__rate .table-icon", function () {
        $(this).toggleClass("selected");
        $(this).nextAll().removeClass("selected");
        $(this).prevAll().addClass("selected");

        var parent = $(this).closest(".custom-form__rate");
        var input = parent.find(".star-counter");
        var counter = parent.find(".selected").length;
        input.val(counter.toString());
    });
});
/*====================================
    Input files
  ===================================*/
$(".custom-form input[type=file]").on("change", function () {
    var numFiles = $(this)[0].files.length;
    var uploadedFiles = $(this)[0].files;
    var container = $(this).parent().find(".files-result");
    if (numFiles > 0) {
        container.removeClass("hide");
        container.addClass("show");
    } else {
        container.addClass("hide");
        container.removeClass("show");
    }
    $.each(uploadedFiles, function (idx, elm) {
        container.append("<p>" + elm.name + "</p>");
    });
});
/*=======================
    Custom Form Hidden fields
==========================*/

$(window).on("load", function () {
    var fieldsetCount = $(".custom-form form").find(".custom-form-box");
    var i = 0;
    fieldsetCount.each(function () {
        if ($(this).css("display") !== "none" && i % 2 == 0) {
            i++;
            $(this).addClass("custom-form__line");
        } else if ($(this).css("display") !== "none" && i % 2 != 0) {
            i++;
        } else if ($(this).css("display") == "none") {
            i == i;
        }
    });
});

$(function () {
    $(document).on("change", ".custom-form select", function () {
        var parent = $(this).closest(".custom-form");
        var fieldsetCount = parent.find(".custom-form-box");
        var i = 0;
        fieldsetCount.each(function () {
            if ($(this).css("display") !== "none" && i % 2 == 0) {
                i++;
                $(this).addClass("custom-form__line");
            } else if ($(this).css("display") !== "none" && i % 2 != 0) {
                i++;
            } else if ($(this).css("display") == "none") {
                i == i;
            }
        });
    });
});
/*======================================
    #Custom select
  ======================================*/
var x, i, j, selElmnt, a, b, c;
/*look for any elements with the class "custom-select":*/
x = document.getElementsByClassName("custom-select");
for (i = 0; i < x.length; i++) {
    selElmnt = x[i].getElementsByTagName("select")[0];
    /*for each element, create a new DIV that will act as the selected item:*/
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x[i].appendChild(a);
    /*for each element, create a new DIV that will contain the option list:*/
    b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide");
    for (j = 0; j < selElmnt.length; j++) {
        /*for each option in the original select element,
          create a new DIV that will act as an option item:*/
        c = document.createElement("DIV");
        c.innerHTML = selElmnt.options[j].innerHTML;
        c.addEventListener("click", function (e) {
            /*when an item is clicked, update the original select box,
                and the selected item:*/
            var y, i, k, s, h;
            s = this.parentNode.parentNode.getElementsByTagName("select")[0];
            h = this.parentNode.previousSibling;
            for (i = 0; i < s.length; i++) {
                if (s.options[i].innerHTML == this.innerHTML) {
                    s.selectedIndex = i;
                    h.innerHTML = this.innerHTML;
                    y = this.parentNode.getElementsByClassName("same-as-selected");
                    for (k = 0; k < y.length; k++) {
                        y[k].removeAttribute("class");
                    }
                    this.setAttribute("class", "same-as-selected");
                    break;
                }
            }
            h.click();
        });
        b.appendChild(c);
    }
    x[i].appendChild(b);
    a.addEventListener("click", function (e) {
        /*when the select box is clicked, close any other select boxes,
            and open/close the current select box:*/
        e.stopPropagation();
        closeAllSelect(this);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
    });
}
function closeAllSelect(elmnt) {
    /*a function that will close all select boxes in the document,
      except the current select box:*/
    var x,
        y,
        i,
        arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    for (i = 0; i < y.length; i++) {
        if (elmnt == y[i]) {
            arrNo.push(i);
        } else {
            y[i].classList.remove("select-arrow-active");
        }
    }
    for (i = 0; i < x.length; i++) {
        if (arrNo.indexOf(i)) {
            x[i].classList.add("select-hide");
        }
    }
}
/*if the user clicks anywhere outside the select box,
  then close all select boxes:*/
document.addEventListener("click", closeAllSelect);


/*======================================
  #Filter search
======================================*/
$(document).ready(function(){
  $("#filter").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $(".reseller").filter(function() {
      $(this).toggle($(this).data("meta").toLowerCase().indexOf(value) > -1)
    });
  });
});

/*================================
  #Promotion Click
=================================*/
/*
$(document).ready(function(){
  $(".hero a, .grid-item--card a").on("click", function(e) {
      e.preventDefault();
      var href = $(this).attr("href");
      var id = $(this).parents(".grid-item--card, .hero").data("analyticsid");
      var promotion = window.promotions.filter(function(x){ return x.id == id;});

       window.dataLayer.push({
        'event': 'eec.promotionClick',
        'ecommerce': {
          'promoClick': {
            'promotions': promotion
          }
        },
        'eventCallback': function() {
          document.location = href;
        }
      });
  });
});*/