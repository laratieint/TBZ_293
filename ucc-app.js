/*
 Uccelerate - 0.2.0
*/

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function addUrlVars(key, value) {
    key = encodeURI(key);
    value = encodeURI(value);

    var kvp = document.location.search.substr(1).split('&');

    var i = kvp.length;
    var x;
    while (i--) {
        x = kvp[i].split('=');

        if (x[0] == key) {
            x[1] = value;
            kvp[i] = x.join('=');
            break;
        }
    }

    if (i < 0) {
        kvp[kvp.length] = [key, value].join('=');
    }

    //this will reload the page, it's likely better to store this until finished
    document.location.search = kvp.join('&');
}

var app = angular.module("Uccelerate", ["checklist-model", "ngSanitize", "bc.Flickity"]);

app.filter('trusted', ['$sce', function ($sce) {
    var div = document.createElement('div');
    return function (text) {
        div.innerHTML = text;
        return $sce.trustAsHtml(div.textContent);
    };
}]);

app.controller("instagramshop", function ($scope, $http, $timeout, FlickityService) {
    $scope.showBox = false;

    $scope.close = function () {
        // console.log("close");
        $scope.showBox = false;
        $("body").removeClass("instabox-visible");
    }

    /*======================================
   #Init intagram
 ======================================*/

    if ($("#instashop").length) {
        $("#instashop").each(function () {

            var wrap = $(this),
                count = (wrap.data("count") != "") ? parseInt(wrap.data("count")) : 1000,
                link = wrap.data("link"),
                icon = wrap.data("icon"),
                token = wrap.data("token"),
                user = wrap.data("user"),
                username = wrap.data("username"),
                template = "",
                linkstart = "",
                linkend = "",
                iconlink = "";


            template = '<div class="col-20 col-s-50"><div class="gallery-item"><figure><span class="gallery-item__ov"><span><i class="fa fa-instagram"></i>Shop it</span></span>' + iconlink + '' + linkstart + '<span style="display:none;" class="json"></span><a class="instagram-image-link-shop" data-tags="{{model.tags}}"><span class="bg" data-image="{{image}}" style="display:block;background-size:cover;background-position:center; padding-top: 100%; width: 100%; height: 100% ;background-color: #eee;background-image: url();" data-caption="{{caption}}" alt="{{caption}}"></span></a>' + linkend + '</figure></div></div>';


            var loadedImages = 0;
            var i = 0;

            // Get images
            var feed = new Instafeed({
                userId: user,
                accessToken: token,
                get: 'user',
                limit: count,
                template: template,
                resolution: 'standard_resolution',
                target: 'instashop',
                filter: function (image) {
                    if (image.tags.length > 0) {
                        loadedImages++;
                    }

                    return image.tags.length > 0 && (loadedImages <= count);
                },
                success: function (data) {
                    // console.log("timed")
                    setTimeout(function () {
                        $(".instagram-image-link-shop").each(function () {
                            // console.log("test")
                            var $obj = $(this);
                            $(this).find(".bg").css("background-image", "url(" + $(this).find(".bg").data("image") + ")");



                        });

                    }, 200);
                }
            });
            feed.run();

            $(window).on("scroll", function () {
                var fromTop = $(".instagram-image-link-shop:last").offset().top;
                var scrolled = $(window).scrollTop() + $(window).height() + 200;
                // console.log("Scrolled: " + scrolled)
                // console.log("From top: " + fromTop)
                if (scrolled > fromTop && loadedImages <= count) {
                    feed.next();
                }
            });
        });
    }

    $scope.flickityOptions = {
        cellSelector: '.product',

    };

    $(document).on("click", ".instagram-shop .gallery-item", function () {

        $("body").addClass("instabox-visible");
        var image = $(this).find(".bg").data("image");
        var tags = $(this).find(".instagram-image-link-shop").data("tags");
        var caption = $(this).find(".bg").data("caption");

        $.ajax({
            url: "/ucommerceapi/json/reply/GetProductsByTags",
            async: false,
            data: {
                Tags: tags
            },
            success: function (data) {
                var products = data.Products;

                // console.log(caption)

                $scope.showBox = true;

                $scope.$apply(function () {
                    $scope.image = image;
                    $scope.products = products;

                    $scope.caption = caption;

                    const element = angular.element(document.getElementById('product-slider'));

                    FlickityService.destroy(element[0].id);
                    $timeout(function () {
                        // Initialize our Flickity instance
                        FlickityService.create(element[0], element[0].id);
                    });
                });
            }
        });
    });
});

app.controller("master", function ($scope, $http, $timeout) {
    $scope.AngularLoaded = true;

    $scope.RegisterProductClick = function (e, product, listname) {
        // console.log("RegisterProductClick");
        e.preventDefault();
        var price = Helpers.parseNumber(product.ListPrice, $scope.Culture);
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'eec.impressionClick',
            'ecommerce': {
                'currencyCode': $scope.Currency,
                'click': {
                    'actionField': {
                        'list': listname
                    }, // Optional list property.
                    'products': [{

                        'name': product.ParentName ? product.ParentName : product.ProductName, // Name or ID is required.
                        'id': product.VariantSku ? product.VariantSku : product.Sku,
                        'price': String(price),
                        'brand': 'Bliz',
                        'category': product.Category,
                        'variant': product.ParentName ? product.ProductName : ""

                    }]
                }
            },
            'eventCallback': function () {
                document.location = product.Url
            }
        });
    }

    $scope.setCurrency = function (currency) {
        // console.log("setCurrency");
        $scope.PickedCurrency = currency;
        Helpers.setCookie("defaultcurrency", currency, 100);

        $timeout(function () {
            location.reload();
        }, 200);

    };

    $scope.setCulture = function (currency, country) {
        // console.log("setCulture");
        $scope.PickedCurrency = currency;
        $scope.PickedCountry = country;
        setCookie("defaultcurrency", currency, 100);
        setCookie("UserCountry", country, 100);

        $timeout(function () {
            // console.log(location)
            //location.reload();
            if (location.href.indexOf('langChange') !== -1)
                location.href = location.href;
            else
                location.href = window.location.href.split("#")[0] + "?langChange=true";
        }, 200)
    }

    if (getCookie("defaultcurrency"))
        $scope.PickedCurrency = getCookie("defaultcurrency");
    else
        $scope.PickedCurrency = "6";


    if (getCookie("UserCountry"))
        $scope.PickedCountry = getCookie("UserCountry");
    else
        $scope.PickedCountry = "en-GB";

    $scope.getCart = function () {
        // console.log("getCart");
        $http.post("/Umbraco/Api/BlizBasket/Get?ustoreid=" + $scope.CatalogId, {
            Culture: $scope.Culture
        }).then(function (response) {
            $scope.basket = response.data.Basket;

        });
    };

    $scope.addToCart = function (sku, variantsku) {
        // console.log("addToCart");
        $http.post("/Umbraco/Api/BlizBasket/Add?ustoreid=" + $scope.CatalogId, {
            Sku: sku,
            VariantSku: variantsku,
            Quantity: 1,
            Culture: $scope.Culture
        }).then(function (data) {
            var productAdded = window.CurrentTrackedProduct;
            productAdded[0]["quantity"] = 1;
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'eec.add',
                'ecommerce': {
                    'currencyCode': $scope.Currency,
                    'add': {
                        'products': productAdded
                    }
                }
            });

            $scope.getCart();
        });
    };

    $scope.removeLineItem = function (lineitem) {
        // console.log("removeLineItem");
        $http.post("/Umbraco/Api/BlizBasket/Update?ustoreid=" + $scope.CatalogId, {
            NewQuantity: 0,
            OrderLineId: lineitem.OrderLineId
        }).then(function (data) {

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'eec.remove',
                'ecommerce': {
                    'currencyCode': $scope.Currency,
                    'remove': {
                        'products': [{
                            'name': lineitem.ProductName,
                            'id': lineitem.VariantSku ? lineitem.VariantSku : lineitem.Sku,
                            'price': String(Helpers.addZeroes(lineitem.Price + lineitem.VAT)),
                            'brand': 'Bliz',
                            'category': lineitem.Category,
                            'variant': lineitem.VariantName,
                            'quantity': lineitem.Quantity
                        }]
                    }
                }
            });
            $scope.getCart();
        });
    };

    $scope.updateLineItem = function (lineitem) {
        // console.log("updateLineItem");
        $scope.BasketLoading = true;
        $http.post("/Umbraco/Api/BlizBasket/Update?ustoreid=" + $scope.CatalogId, {
            NewQuantity: lineitem.NewQuantity,
            OrderLineId: lineitem.OrderLineId
        }).then(function (data) {

            var isAdding = (lineitem.NewQuantity - lineitem.Quantity) > 0;

            window.dataLayer = window.dataLayer || [];
            if (isAdding) {
                window.dataLayer.push({
                    'event': 'eec.add',
                    'ecommerce': {
                        'currencyCode': $scope.Currency,
                        'add': {
                            'products': [{
                                'name': lineitem.Category == "Customise" ? "Customise" : lineitem.ProductName,
                                'id': lineitem.VariantSku ? lineitem.VariantSku : lineitem.Sku,
                                'price': String(Helpers.addZeroes(lineitem.Price + lineitem.VAT)),
                                'brand': 'Bliz',
                                'category': lineitem.Category,
                                'variant': lineitem.VariantName,
                                'quantity': lineitem.NewQuantity - lineitem.Quantity
                            }]
                        }
                    }
                });
            } else {
                window.dataLayer.push({
                    'event': 'eec.remove',
                    'ecommerce': {
                        'currencyCode': $scope.Currency,
                        'remove': {
                            'products': [{
                                'name': lineitem.Category == "Customise" ? "Customise" : lineitem.ProductName,
                                'id': lineitem.VariantSku ? lineitem.VariantSku : lineitem.Sku,
                                'price': String(Helpers.addZeroes(lineitem.Price + lineitem.VAT)),
                                'brand': 'Bliz',
                                'category': lineitem.Category,
                                'variant': lineitem.VariantName,
                                'quantity': -(lineitem.NewQuantity - lineitem.Quantity)
                            }]
                        }
                    }
                });
            }

            $scope.getCart();
            $scope.BasketLoading = false;
        });
    }

    $timeout(function () {
        $scope.getCart();
    }, 200);

    function SendToAnalytics(initialProducts) {
        var products = [];
        for (var i = 0; i < initialProducts.length; i++) {
            var price = Helpers.parseNumber(initialProducts[i].ListPrice, $scope.Culture);
            products.push({
                'name': initialProducts[i].ParentName ? initialProducts[i].ParentName : initialProducts[i].ProductName, // Name or ID is required.
                'id': initialProducts[i].VariantSku ? initialProducts[i].VariantSku : initialProducts[i].Sku,
                'price': String(price),
                'brand': 'Bliz',
                'category': initialProducts[i].Category,
                'variant': initialProducts[i].ParentName ? initialProducts[i].ProductName : "",
                'list': "Header Search",
                'position': (i + 1)
            });
        }

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'eec.impressionView',
            'ecommerce': {
                'currencyCode': $scope.Currency,
                'impressions': products
            }
        });
    }

    $scope.searchQuery = "";
    var filterTextTimeout;
    $scope.$watch('searchQuery', function () {

        if (filterTextTimeout) $timeout.cancel(filterTextTimeout);

        filterTextTimeout = $timeout(function () {
            if ($scope.searchQuery.length > 0) {
                $scope.searchResult = [];

                $http.post("/Umbraco/Api/SearchProductsApi/Search?q=" + $scope.searchQuery + "&culture=" + $scope.Culture).then(function (response) {
                    $scope.searchResult = response.data.Products.slice(0, 10);

                });
            }

        }, (300));

    });
});

app.controller("customise", function ($scope, $http, $timeout) {

    $scope.PickedLensColor = 'Blue';
    $scope.PickedFrameColor = 'Black';
    $scope.PickedLensSku = '';
    $scope.PickedFrameSku = '';
    $scope.Price = '';

    $scope.CalculatePrice = function () {
        // console.log("CalculatePrice");
        var skus = [$scope.PickedLensSku, $scope.PickedFrameSku];

        if ($scope.PickedJawboneSku)
            skus.push($scope.PickedJawboneSku);

        $http.post("/Umbraco/Api/PriceCalculaton/GetPrice?ustoreid=" + $scope.CatalogId, {
            Skus: skus,
            Culture: $scope.Culture
        }).then(function (response) {
            $scope.Price = response.data.replace('€', '');

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'eec.detail',
                'ecommerce': {
                    'currencyCode': $scope.Currency,
                    'detail': {
                        'products': [{
                            'name': "Customise",
                            'id': $scope.PickedFrameSku,
                            'price': $scope.Price,
                            'brand': 'Bliz',
                            'category': "Customise",
                        }]
                    }
                }
            });

        });
    }

    $scope.RemoveJawbone = function () {
        // console.log("RemoveJawbone");
        $scope.PickedJawboneImage = '';
        $scope.PickedJawboneColor = '';
        $scope.PickedJawboneSku = '';
        $scope.CalculatePrice();
    };

    $scope.AddMultiToCart = function () {
        // console.log("AddMultiToCart");

        var skus = [$scope.PickedLensSku];

        if ($scope.PickedJawboneSku)
            skus.push($scope.PickedJawboneSku);

        $http.post("/Umbraco/Api/BasketAddMultiSkus/AddToBasket?ustoreid=" + $scope.CatalogId, {
            MasterSku: $scope.PickedFrameSku,
            Skus: skus,
            Quantity: 1
        }).then(function () {
            $scope.getCart();

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'eec.add',
                'ecommerce': {
                    'currencyCode': $scope.Currency,
                    'add': {
                        'products': [{
                            'name': "Customise",
                            'id': $scope.PickedFrameSku,
                            'price': String($scope.Price),
                            'brand': 'Bliz',
                            'category': "Customise",
                            'quantity': 1
                        }]
                    }
                }
            });

        });

    }
});

app.controller("productCategory", function ($scope, $http, $timeout) {

    function SendToAnalytics(initialProducts) {
        var products = [];
        var page = $scope.CurrentPage == 0 ? 1 : $scope.CurrentPage;
        // console.log(page)
        for (var i = 0; i < initialProducts.length; i++) {
            var price = Helpers.parseNumber(initialProducts[i].ListPrice, $scope.Culture);
            products.push({
                'name': initialProducts[i].ParentName ? initialProducts[i].ParentName : initialProducts[i].ProductName, // Name or ID is required.
                'id': initialProducts[i].VariantSku ? initialProducts[i].VariantSku : initialProducts[i].Sku,
                'price': String(price),
                'brand': 'Bliz',
                'category': initialProducts[i].Category,
                'variant': initialProducts[i].ParentName ? initialProducts[i].ProductName : "",
                'list': "Category Page",
                'position': $scope.CurrentPage > 0 ? (i + 1) + (page * $scope.ProductsPerPage) : i + 1
            });
        }
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'eec.impressionView',
            'ecommerce': {
                'currencyCode': $scope.Currency,
                'impressions': products
            }
        });
    }

    /*Filter and sort*/
    $scope.filter = {};

    $scope.FilterCount = 0;
    $scope.SortSelect = "4";
    $scope.CurrentPage = 0;
    $scope.InitiatedPagination = false;
    $scope.Products = [];
    $scope.ShowLoader = false;
    $scope.AllLoaded = false;
    $scope.VariantsInGrid = false;
    $scope.BaseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;

    $scope.ClearFilter = function () {
        // console.log("ClearFilter");
        $scope.FilterCount = 0;
        for (var prop in $scope.filter) {
            $scope.filter[prop] = [];
        }
        Helpers.scrollTo(".store");
        $scope.changeFilter();
    };

    $scope.InitLoader = function () {
        // console.log("InitLoader");
        for (var i = 0; i < $scope.ProductsPerPage; i++) {
            var p = {
                ProductName: i
            };
            p.ProductName = i;
            $scope.Products.push(p);
        }
    }

    $scope.ScrapLoader = function () {
        // console.log("ScrapLoader");
        $scope.Products.splice($scope.Products.length - $scope.ProductsPerPage, $scope.ProductsPerPage);
    }

    $scope.UpdateFilterCount = function () {
        // console.log("UpdateFilterCount");

        for (var key in $scope.initialFilterList) {
            for (var i = 0; i < $scope.initialFilterList[key].length; i++) {

                var found = false;

                for (var j = 0; j < $scope.filterList[key].length; j++) {
                    if ($scope.initialFilterList[key][i].FilterName === $scope.filterList[key][j].FilterName) {
                        $scope.initialFilterList[key][i].Count = $scope.filterList[key][j].Count;
                        found = true;
                    }
                }

                if (found === false)
                    $scope.initialFilterList[key][i].Count = 0;
            }
        }
    };


    $scope.changeFilter = function () {
        // console.log("changeFilter");
        $scope.FilterCount = 0;
        $scope.Products = [];
        $scope.InitLoader();

        for (var prop in $scope.filter) {
            $scope.FilterCount += $scope.filter[prop].length;
        }

        $scope.CurrentPage = 0;

        $http.post("/Umbraco/Api/BlizProducts/GetProducts?ustoreid=" + $scope.CatalogId, {
            BaseUrl: $scope.BaseUrl,
            Filter: JSON.stringify($scope.filter),
            Amount: $scope.ProductsPerPage,
            CurrentPage: $scope.CurrentPage,
            CategoryList: $scope.pickedCategories,
            SortOrderId: parseInt($scope.SortSelect),
            Culture: $scope.Culture,
            VariantsInGrid: $scope.VariantsInGrid
        }).then(function (response) {
            $scope.filterList = response.data.Facets;

            $scope.ScrapLoader();

            $scope.Products = response.data.Products;

            SendToAnalytics($scope.Products);

            $scope.TotalResult = response.data.TotalResults;
            $scope.InitiatedPagination = true;
            $scope.ShowLoader = false;
            $scope.UpdateFilterCount();

            if (response.data.TotalResults === $scope.Products.length)
                $scope.AllLoaded = true;
            else
                $scope.AllLoaded = false;

            $timeout(function () {
                Helpers.scrollTo(".store");
            }, 200);
        });
    };

    $scope.loadProducts = function () {
        // console.log("loadProducts");
        var vars = getUrlVars();
        var amount = vars["page"] ? parseInt(vars["page"]) * $scope.ProductsPerPage : $scope.ProductsPerPage;

        $http.post("/Umbraco/Api/BlizProducts/GetProducts?ustoreid=" + $scope.CatalogId, {
            BaseUrl: $scope.BaseUrl,
            Filter: JSON.stringify($scope.filter),
            Amount: amount,
            CurrentPage: $scope.CurrentPage,
            CategoryList: $scope.pickedCategories,
            SortOrderId: parseInt($scope.SortSelect),
            Culture: $scope.Culture,
            VariantsInGrid: $scope.VariantsInGrid
        }).then(function (response) {
            $scope.Products = response.data.Products;

            SendToAnalytics($scope.Products);

            $scope.TotalResult = response.data.TotalResults;
            $scope.filterList = response.data.Facets;
            $scope.initialFilterList = response.data.Facets;
            $scope.ShowLoader = false;

            if (response.data.TotalResults === $scope.Products.length)
                $scope.AllLoaded = true;

            if (vars["page"])
                $scope.CurrentPage = parseInt(vars["page"]);

        });
    };

    $scope.changeSort = function () {
        // console.log("changeSort");
        $scope.Products = [];
        $scope.InitLoader();
        $scope.CurrentPage = 0;
        $http.post("/Umbraco/Api/BlizProducts/GetProducts?ustoreid=" + $scope.CatalogId, {
            BaseUrl: $scope.BaseUrl,
            Filter: JSON.stringify($scope.filter),
            Amount: $scope.ProductsPerPage,
            CurrentPage: $scope.CurrentPage,
            CategoryList: $scope.pickedCategories,
            SortOrderId: parseInt($scope.SortSelect),
            Culture: $scope.Culture,
            VariantsInGrid: $scope.VariantsInGrid
        }).then(function (response) {
            $scope.Products = response.data.Products;
            SendToAnalytics($scope.Products);
            if (response.data.TotalResults === $scope.Products.length)
                $scope.AllLoaded = true;
            else
                $scope.AllLoaded = false;

        });
    };

    $scope.loadMoreProducts = function ($event) {
        // console.log("loadMoreProducts");
        $event.preventDefault();
        $scope.InitLoader();
        $scope.CurrentPage = $scope.CurrentPage + 1;

        window.history.pushState({
            path: $scope.BaseUrl + "?page=" + $scope.CurrentPage
        }, '', $scope.BaseUrl + "?page=" + $scope.CurrentPage);

        $http.post("/Umbraco/Api/BlizProducts/GetProducts?ustoreid=" + $scope.CatalogId, {
            NewInventory: true,
            BaseUrl: $scope.BaseUrl,
            Filter: JSON.stringify($scope.filter),
            Amount: $scope.ProductsPerPage,
            CurrentPage: $scope.CurrentPage,
            CategoryList: $scope.pickedCategories,
            SortOrderId: parseInt($scope.SortSelect),
            Culture: $scope.Culture,
            VariantsInGrid: $scope.VariantsInGrid
        }).then(function (response) {
            SendToAnalytics(response.data.Products);
            $scope.ScrapLoader();
            $scope.Products = $scope.Products.concat(response.data.Products);

            if (response.data.TotalResults === $scope.Products.length)
                $scope.AllLoaded = true;
        });
    }
});

app.controller("product", function ($scope, $http, $sce, $timeout) {
    $scope.Review = {};
    $scope.AngularLoaded = true;
    $(".js-flickity").flickity('resize')
    $scope.ShowMessage = false;

    $timeout(function () {
        $scope.ShowGallery = true;
        $(".js-flickity").flickity('resize')
    }, 250);
    $timeout(function () {
        $scope.ShowGallery = true;
        $(".js-flickity").flickity('resize')
    }, 500);

    $scope.LowerCase = function (string) {
        // console.log("LowerCase");
        return angular.lowercase(string);
    };

    $scope.SubmitReview = function () {
        // console.log("SubmitReview");

        $http.post("/Umbraco/Api/ProductReview/Add", {
            Title: $scope.Review.Title,
            Comments: $scope.Review.Comments,
            Name: $scope.Review.Name,
            Email: $scope.Review.Email,
            Rating: $scope.Review.Rating,
            Sku: $scope.Review.Sku
        }).then(function (response) {
            $scope.ShowMessage = true;
        });
    }

    $scope.foundMatch = false;
    $scope.pickerCount = 0;

    $scope.LoadPreVariation = function () {
        // console.log("LoadPreVariation");

        if (window.location.hash !== "" || window.location.href.indexOf("--") > 0) {
            $scope.pickedVariant = window.location.hash ? window.location.hash.replace('#', '') : window.location.href.split('--')[1];

            if ($scope.pickedVariant.indexOf("?") > -1) {
                $scope.pickedVariant = $scope.pickedVariant.split('?')[0]
            }

            for (var i = 0; i < $scope.variants.length; i++) {
                var matches = 0;

                if ($scope.pickedVariant == $scope.variants[i].Sku.replace(/ /g, '').toLowerCase()) {
                    for (var key in $scope.variantPicker) {
                        $scope.variantPicker[key] = $scope.variants[i][key];
                    }
                }
                $(".js-flickity").flickity('resize');

            }
        }
    }

    $scope.reloadSlider = function () {
        // console.log("reloadSlider");

        $(".js-flickity").flickity('resize');
        $timeout(function () {
            $(".js-flickity").flickity('resize');
        }, 0);
        $timeout(function () {
            $(".js-flickity").flickity('resize');
        }, 100);
        $timeout(function () {
            $(".js-flickity").flickity('resize');
        }, 500);
    }

    $scope.changeVariant = function () {
        // console.log("changeVariant");

        $scope.foundMatch = false;
        $scope.pickerCount = 0;

        for (var i = 0; i < $scope.variants.length; i++) {
            var matches = 0;
            for (var key in $scope.variantPicker) {

                if ($scope.variantPicker[key].replace(/ /g, '').toLowerCase() === $scope.variants[i][key].replace(/ /g, '').toLowerCase()) {
                    matches++;
                }
            }

            if (matches === Object.keys($scope.variantPicker).length) {
                $scope.pickedVariant = $scope.variants[i].Sku;
                $scope.foundMatch = true;
            }

            $scope.pickerCount = Object.keys($scope.variantPicker).length;

        }

        $timeout(function () {
            $(".js-flickity").flickity('reloadCells');
            var $carousel = $('.js-flickity').flickity()
            $carousel.flickity('resize')
        }, 500);

    }
});

app.controller("checkout", function ($scope, $http, $sce, $timeout) {
    $scope.CheckoutUpdating = false;
    $scope.CheckoutValid = true;
    $scope.Retries = 0;

    function getCheckoutMarkup() {

        if ($scope.CheckoutForm.paymentSelectionLabel.toLowerCase().indexOf("klarna") != -1) {
            // console.log('Retry #', $scope.Retries);
            $http.post("/Umbraco/Api/BlizCheckout/GetKlarnaMarkup", {
                CountryId: parseInt($scope.CheckoutForm.CountryId),
                Version: $scope.CheckoutForm.paymentSelectionLabel.toLowerCase().indexOf("3") > -1 ? 3 : 2
            }).then(function (response) {

                $scope.checkoutMarkup = $sce.trustAsHtml("");

                if (!response.data.Markup && $scope.Retries < 4) {
                    $timeout(function () {
                        getCheckoutMarkup();
                    }, 600);
                }

                if ($scope.int === 0) {
                    $scope.int = 1;
                    $timeout(function () {
                        $scope.checkoutMarkup = $sce.trustAsHtml(response.data.Markup);
                        $scope.Retries = 0;
                    }, 250);
                } else {
                    //didnt update correctly without this
                    $timeout(function () {
                        $scope.checkoutMarkup = $sce.trustAsHtml(response.data.Markup);
                        $scope.Retries = 0;
                    }, 600);
                }

                $scope.Retries++;

            });
        }
    }

    $scope.setState = function () {
        // console.log("setState");
        $http.post("/Umbraco/Api/BlizCheckout/SetState?State=" + $scope.CheckoutForm.State).then(function (response) {
            $scope.getCart();
        });
    };

    $scope.getCart = function () {
        // console.log("getCart");
        $scope.BasketLoading = true;
        $http.post("/Umbraco/Api/BlizBasket/Get?ustoreid=" + $scope.CatalogId, {
            Culture: $scope.Culture,
            CatalogId: $scope.CatalogId
        }).then(function (response) {
            $scope.basket = response.data.Basket;
            $scope.CheckoutValid = true;

            for (var i = 0; i < $scope.basket.LineItems.length; i++) {

                if ($scope.basket.LineItems[i].InStock == 0)
                    $scope.CheckoutValid = false;
            }
            $scope.BasketLoading = false;
        });
    };

    $scope.removeLineItem = function (lineitem) {
        // console.log("removeLineItem");
        $http.post("/Umbraco/Api/BlizBasket/Update?ustoreid=" + $scope.CatalogId, {
            NewQuantity: 0,
            OrderLineId: lineitem.OrderLineId
        }).then(function (data) {
            $scope.getCart();
            getCheckoutMarkup();
            updateCheckout(false, false);
        });
    };

    $scope.updateLineItem = function (lineitem) {
        // console.log("updateLineItem");
        $scope.BasketLoading = true;
        $http.post("/Umbraco/Api/BlizBasket/Update?ustoreid=" + $scope.CatalogId, {
            NewQuantity: lineitem.NewQuantity,
            OrderLineId: lineitem.OrderLineId
        }).then(function (data) {

            var isAdding = (lineitem.NewQuantity - lineitem.Quantity) > 0;

            window.dataLayer = window.dataLayer || [];
            if (isAdding) {
                window.dataLayer.push({
                    'event': 'eec.add',
                    'ecommerce': {
                        'currencyCode': $scope.Currency,
                        'add': {
                            'products': [{
                                'name': lineitem.Category == "Customise" ? "Customise" : lineitem.ProductName,
                                'id': lineitem.VariantSku ? lineitem.VariantSku : lineitem.Sku,
                                'price': String(Helpers.addZeroes(lineitem.Price + lineitem.VAT)),
                                'brand': 'Bliz',
                                'category': lineitem.Category,
                                'variant': lineitem.VariantName,
                                'quantity': lineitem.NewQuantity - lineitem.Quantity
                            }]
                        }
                    }
                });
            } else {
                window.dataLayer.push({
                    'event': 'eec.remove',
                    'ecommerce': {
                        'currencyCode': $scope.Currency,
                        'remove': {
                            'products': [{
                                'name': lineitem.Category == "Customise" ? "Customise" : lineitem.ProductName,
                                'id': lineitem.VariantSku ? lineitem.VariantSku : lineitem.Sku,
                                'price': String(Helpers.addZeroes(lineitem.Price + lineitem.VAT)),
                                'brand': 'Bliz',
                                'category': lineitem.Category,
                                'variant': lineitem.VariantName,
                                'quantity': -(lineitem.NewQuantity - lineitem.Quantity)
                            }]
                        }
                    }
                });
            }

            $scope.getCart();
            getCheckoutMarkup();
            updateCheckout(false, false);
            $scope.BasketLoading = false;
        });
    };


    $timeout(function () {
        $scope.getCart();
    }, 200);

    $timeout(function () {
        if ($scope.CheckoutForm.CountryId == 252) {
            $scope.CheckoutForm.State = "Alberta";
            $scope.setState();
        }
    }, 500);

    $scope.CheckoutLoading = true;
    $scope.CheckoutForm = {};
    $scope.CheckoutForm.CountryId = "";
    $scope.CheckoutForm.paymentSelectionLabel = "";

    $scope.getShippingAndPaymentMethods = function (UpdatePayment, UpdateShipping) {
        // console.log("getShippingAndPaymentMethods");

        if (typeof $scope.CheckoutForm.CountryId !== "undefined") {

            $http.post("/Umbraco/Api/BlizCheckout/GetShippingAndPaymentMethods?ustoreid=" + $scope.CatalogId, {
                CountryId: parseInt($scope.CheckoutForm.CountryId),
                Culture: $scope.Culture
            }).then(function (response) {

                if (UpdateShipping) {
                    $scope.shippingMethods = response.data.ShippingMethods;
                    $scope.CheckoutForm.shippingSelection = String($scope.shippingMethods[0].Id);
                }

                $scope.paymentMethods = response.data.PaymentMethods;

                if (UpdatePayment) {
                    $scope.CheckoutForm.paymentSelection = String($scope.paymentMethods[0].Id);
                    $scope.CheckoutForm.paymentSelectionLabel = String($scope.paymentMethods[0].Name);
                }

                if (UpdatePayment && UpdateShipping) {
                    // console.log("UpdatePayment && UpdateShipping");
                    updateCheckout(false, false, false);
                }

                // console.log("getCheckoutMarkup");
                getCheckoutMarkup();
            });
            $scope.CheckoutLoading = false;
        }
    };

    $timeout(function () {
        // console.log('timeout scope.getShippingAndPaymentMethods');
        $scope.getShippingAndPaymentMethods(true, true);
    }, 250);

    function updateCheckout(UpdatePayment, updateShipping, triggerGet = true) {
        // console.log('updateCheckout', UpdatePayment, updateShipping, triggerGet);
        console.trace();
        if (UpdatePayment) {
            var products = [];
            for (var i = 0; i < $scope.basket.LineItems.length; i++) {

                products.push({
                    'name': $scope.basket.LineItems[i].ProductName,
                    'id': $scope.basket.LineItems[i].VariantSku ? $scope.basket.LineItems[i].VariantSku : $scope.basket.LineItems[i].Sku,
                    'price': String(Helpers.addZeroes($scope.basket.LineItems[i].Price + $scope.basket.LineItems[i].VAT)),
                    'brand': 'Bliz',
                    'category': $scope.basket.LineItems[i].Category,
                    'variant': $scope.basket.LineItems[i].VariantName,
                    'quantity': $scope.basket.LineItems[i].Quantity
                });
            }

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'eec.checkout',
                'ecommerce': {
                    'currencyCode': $scope.Currency,
                    'checkout': {
                        'actionField': {
                            'step': 1,
                            'option': $scope.CheckoutForm.paymentSelectionLabel
                        },
                        'products': products
                    }
                },
                'eventCallback': function () {

                }
            });
        }

        $timeout(function () {
            if($scope.CheckoutUpdating){
                // console.log('Already updating so skipping');
                return;
            }
            $scope.CheckoutUpdating = true;
            // console.log('SetPaymentAndShipping');
            $http.post("/Umbraco/Api/BlizCheckout/SetPaymentAndShipping?ustoreid=" + $scope.CatalogId, {
                ShipmentId: parseInt($scope.CheckoutForm.shippingSelection),
                PaymentId: parseInt($scope.CheckoutForm.paymentSelection),
                CountryId: parseInt($scope.CheckoutForm.CountryId)
            }).then(function (response) {
                $scope.CheckoutUpdating = false;
                $scope.getCart();
                $scope.discounts = response.data.Discounts;
                if (triggerGet)
                    $scope.getShippingAndPaymentMethods(UpdatePayment, updateShipping);
            });
        }, 500);
    }

    $scope.$watch('CheckoutForm.shippingSelection', function () {
        if (typeof $scope.CheckoutForm.paymentSelection !== "undefined" && typeof $scope.CheckoutForm.shippingSelection !== "undefined" && typeof $scope.CheckoutForm.CountryId !== "undefined") {
            // console.log("CheckoutForm.shippingSelection");
            updateCheckout(true, false);
        }
    });

    $scope.SetPaymentMethod = function (method) {
        // console.log("SetPaymentMethod");

        $scope.CheckoutForm.paymentSelection = method.Id;
        $scope.CheckoutForm.paymentSelectionLabel = method.Name;

        var products = [];
        for (var i = 0; i < $scope.basket.LineItems.length; i++) {

            products.push({
                'name': $scope.basket.LineItems[i].ProductName,
                'id': $scope.basket.LineItems[i].VariantSku ? $scope.basket.LineItems[i].VariantSku : $scope.basket.LineItems[i].Sku,
                'price': String(Helpers.addZeroes($scope.basket.LineItems[i].Price + $scope.basket.LineItems[i].VAT)),
                'brand': 'Bliz',
                'category': $scope.basket.LineItems[i].Category,
                'variant': $scope.basket.LineItems[i].VariantName,
                'quantity': $scope.basket.LineItems[i].Quantity
            });
        }

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'eec.checkout',
            'ecommerce': {
                'currencyCode': $scope.Currency,
                'checkout': {
                    'actionField': {
                        'step': 1,
                        'option': $scope.CheckoutForm.paymentSelectionLabel
                    },
                    'products': products
                }
            },
            'eventCallback': function () {

            }
        });

        if (typeof $scope.CheckoutForm.paymentSelection !== "undefined" && typeof $scope.CheckoutForm.shippingSelection !== "undefined" && typeof $scope.CheckoutForm.CountryId !== "undefined") {
            updateCheckout(false, false);
        }
    };

    $scope.$watch('CheckoutForm.ShippingCountryId', function () {

        if (typeof $scope.CheckoutForm.ShippingCountryId !== "undefined") {

            $scope.CheckoutForm.CountryId = $scope.CheckoutForm.ShippingCountryId;
            var oldCurrency = Helpers.getCookie("defaultcurrency");

            //redirect to swedish checkout in case your in international
            if ($scope.CheckoutForm.CountryId == 12 && (window.location.pathname == "/checkout" || window.location.pathname == "/checkout/")) {
                window.location.href = "/sv/checkout";
            }

            //redirect to norwegian checkout in case your in international
            if ($scope.CheckoutForm.CountryId == 13 && (window.location.pathname == "/checkout" || window.location.pathname == "/checkout/")) {
                window.location.href = "/no/checkout";
            }

            //redirect to danish checkout in case your in international
            if ($scope.CheckoutForm.CountryId == 6 && (window.location.pathname == "/checkout" || window.location.pathname == "/checkout/")) {
                window.location.href = "/dk/checkout";
            }

        }

        if (typeof $scope.CheckoutForm.paymentSelection !== "undefined" && typeof $scope.CheckoutForm.shippingSelection !== "undefined" && typeof $scope.CheckoutForm.ShippingCountryId !== "undefined") {
            $scope.getShippingAndPaymentMethods(true, true);
        }

    });

    $scope.VoucherMessage = "";
    $scope.VoucherSuccess = false;

    $scope.SetNewsLetterSetting = function () {
        // console.log("SetNewsLetterSetting");
        // console.log()
        Helpers.setCookie("NewsletterSetting", $scope.CheckoutForm.SubscribeToNewsletter, 100);
    }

    $scope.setVoucher = function () {
        // console.log("setVoucher");
        $http.post("/Umbraco/Api/BlizVoucher/Set?ustoreid=" + $scope.CatalogId, {
            VoucherCode: $scope.VoucherCodeInput
        }).then(function (response) {
            $scope.getCart();
            $scope.VoucherMessage = response.data.Message;
            $scope.VoucherSuccess = response.data.Success;
            updateCheckout(false, false);
        });
    };

    $scope.removeVoucher = function (discountId) {
        // console.log("removeVoucher");
        $http.post("/Umbraco/Api/BlizVoucher/Remove?ustoreid=" + $scope.CatalogId, {
            DiscountId: discountId
        }).then(function (response) {
            $scope.getCart();
            updateCheckout(false, false);
        });
    };


    $scope.placeOrder = function () {
        // console.log("placeOrder");
        $scope.CheckoutForm.Culture = $scope.Culture;
        $http.post("/Umbraco/Api/Order/Submit?ustoreid=" + $scope.CatalogId, $scope.CheckoutForm).then(function (response) {
            window.location.href = window.location.href + "?payment=1"
        });
    }

});

app.controller("ProductList", function ($scope, $http, $timeout) {

    function SendToAnalytics(initialProducts) {
        var products = [];
        for (var i = 0; i < initialProducts.length; i++) {
            var price = Helpers.parseNumber(initialProducts[i].ListPrice, $scope.Culture);
            products.push({
                'name': initialProducts[i].ParentName ? initialProducts[i].ParentName : initialProducts[i].ProductName, // Name or ID is required.
                'id': initialProducts[i].VariantSku ? initialProducts[i].VariantSku : initialProducts[i].Sku,
                'price': String(price),
                'brand': 'Bliz',
                'category': initialProducts[i].Category,
                'variant': initialProducts[i].ParentName ? initialProducts[i].ProductName : "",
                'list': $scope.listname,
                'position': (i + 1)
            });
        }

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'eec.impressionView',
            'ecommerce': {
                'currencyCode': $scope.Currency, // Local currency is optional.
                'impressions': products
            }
        });
    }


    $timeout(function () {
        $http.post("/Umbraco/Api/BlizProductList/GetProductList?ustoreid=" + $scope.CatalogId, {
            ProductIds: $scope.ProductIds,
            Culture: $scope.Culture,
            BaseUrl: $scope.BaseUrl
        }).then(function (response) {
            $scope.Products = response.data.Products;
            $scope.AllLoaded = true;
            SendToAnalytics($scope.Products);
        });
    }, 200);
});

app.controller("search", function ($scope, $http, $timeout) {

    function SendToAnalytics(initialProducts) {
        var products = [];
        for (var i = 0; i < initialProducts.length; i++) {
            var price = Helpers.parseNumber(initialProducts[i].ListPrice, $scope.Culture);
            products.push({
                'name': initialProducts[i].ParentName ? initialProducts[i].ParentName : initialProducts[i].ProductName, // Name or ID is required.
                'id': initialProducts[i].VariantSku ? initialProducts[i].VariantSku : initialProducts[i].Sku,
                'price': String(price),
                'brand': 'Bliz',
                'category': initialProducts[i].Category,
                'variant': initialProducts[i].ParentName ? initialProducts[i].ProductName : "",
                'list': "Header Search",
                'position': (i + 1)
            });
        }
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'eec.impressionView',
            'ecommerce': {
                'currencyCode': $scope.Currency, // Local currency is optional.
                'impressions': products
            }
        });
    }

    $scope.SearchLoading = false;
    $scope.ClearFilter = function () {
        // console.log("ClearFilter");
        $scope.FilterCount = 0;
        $scope.filter = {};
    }

    /*Filter and sort*/
    $scope.filter = {};

    $scope.FilterCount = 0;
    $scope.SortSelect = "2";
    $scope.CurrentPage = 0;
    $scope.InitiatedPagination = false;
    $scope.Products = [];
    $scope.ShowLoader = true;
    $scope.AllLoaded = false;
    $scope.Facets = null;
    $scope.SelectedFacets = {};
    $scope.FirstLoad = true;

    var filterTextTimeout;

    $scope.postSearch = function () {
        // console.log("postSearch");
        if (filterTextTimeout) $timeout.cancel(filterTextTimeout);

        filterTextTimeout = $timeout(function () {
            $scope.SearchLoading = true;
            $scope.Products = [];

            $http.post("/Umbraco/Api/SearchProductsApi/Search?q=" + $scope.mainSearch + "&culture=" + $scope.Culture).then(function (response) {
                $scope.Products = response.data.Products;
                $scope.totalResult = response.data.TotalResult;
                $scope.wordSearched = $scope.mainSearch;
                $scope.SearchLoading = false;

                $scope.currentPage = 1;
                SendToAnalytics($scope.Products);
            });

        }, 300);
    };


    $scope.setPage = function (page) {
        // console.log("setPage");
        var pageAmount = 10;
        var start = (page - 1) * pageAmount;

        $http.post("/Umbraco/Api/BlizSearch/Products?ustoreid=" + $scope.CatalogId, {
            NewInventory: true,
            Keyword: $scope.mainSearch,
            Start: 0,
            Amount: 0
        }).then(function (response) {
            $scope.Products = response.data.Products;
            $scope.totalResult = response.data.TotalResult;
            $scope.wordSearched = $scope.mainSearch;
        });
    }

    $timeout(function () {
        $scope.postSearch();
    }, 250);
});

app.controller("gridProductController", function ($scope, $http) {

    if ($scope.product.HasVariants) {
        //   $scope.PickedVariant = $scope.product.Variants[0].VariantSku;

    }

    $scope.SetVariant = function (product) {
        // console.log("SetVariant");
        $scope.PickedVariant = product.VariantSku;
        $scope.CurrentVariant = product;

        // console.log(product)
    }
});

app.controller("CampaignCategory", function ($scope, $http, $timeout) {
    $scope.Products = [];
    $scope.CurrentPage = 0;
    $scope.ProductsPerPage = 12;

    $scope.InitLoader = function () {
        // console.log("InitLoader");
        for (var i = 0; i < $scope.ProductsPerPage; i++) {
            var p = {
                ProductName: i
            };
            p.ProductName = i;
            $scope.Products.push(p);

        }
    }

    $scope.ScrapLoader = function () {
        // console.log("ScrapLoader");
        $scope.Products.splice($scope.Products.length - $scope.ProductsPerPage, $scope.ProductsPerPage);
    }


    $scope.LoadProducts = function () {
        // console.log("LoadProducts");
        $scope.InitLoader();

        $http.post("/Umbraco/Api/BlizProductCampaign/GetCampaignProducts?ustoreid=" + $scope.CatalogId, {
            ProductIds: $scope.ProductIds,
            Culture: $scope.Culture,
            BaseUrl: "",
            Amount: $scope.ProductsPerPage,
            CurrentPage: $scope.CurrentPage
        }).then(function (response) {
            $scope.ScrapLoader();
            $scope.Products = response.data.Products;
            //$scope.AllLoaded = true;
        });
    };


    $scope.loadMoreProducts = function () {
        // console.log("loadMoreProducts");
        $scope.InitLoader();
        $scope.CurrentPage = $scope.CurrentPage + 1;

        $http.post("/Umbraco/Api/BlizProductCampaign/GetCampaignProducts?ustoreid=" + $scope.CatalogId, {
            ProductIds: $scope.ProductIds,
            Culture: $scope.Culture,
            BaseUrl: "",
            Amount: $scope.ProductsPerPage,
            CurrentPage: $scope.CurrentPage
        }).then(function (response) {
            $scope.ScrapLoader();

            $scope.Products = $scope.Products.concat(response.data.Products);

            if (response.data.TotalResults === $scope.Products.length)
                $scope.AllLoaded = true;
        });
    };
});

function deCapitalizeFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}