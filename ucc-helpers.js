var Helpers = {
    setCookie: function(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },
    getCookie: function(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    },
    IntervalId: null,
    scrollStep: function(scrollTo) {

        if (window.pageYOffset <= scrollTo) {
            clearInterval(window.IntervalId);
        }
      
        window.scroll(0, window.pageYOffset - 30);
    },
    scrollToTop: function() {
       $(window).animate({scrollTop: 0}, 150);
    },
    scrollTo: function(classname){
        $("body, html").animate({scrollTop: $(classname).offset().top}, 150);
    },
    parseNumber: function (value, locales = navigator.languages) {
      const example = Intl.NumberFormat(locales).format('1.1');
      const cleanPattern = new RegExp(`[^-+0-9${ example.charAt( 1 ) }]`, 'g');
      const cleaned = value.replace(cleanPattern, '');
      const normalized = cleaned.replace(example.charAt(1), '.');
    
      return Helpers.addZeroes(parseFloat(normalized));
    }, addZeroes: function (num) {
      const dec = String(num).split('.')[1]
      const len = dec && dec.length > 2 ? dec.length : 2
      return Number(num).toFixed(2)
    }
};

                