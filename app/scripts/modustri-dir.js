/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Directives for various UI elements
 * @author Tim Snyder <tim.snyder@modustri.com>
 * @todo Whole file is a mess. Its unclear what is a form field and what is an search field. Consolidate fns into controllers.
 */
var ModustriDirectives = angular.module("ModustriDirectives", ['ModustriServices']);

// "use strict";

//TODO: IMPORT APP SETTINGS SERVICE


ModustriDirectives.directive("mdPagination", function ($location, InsServices, AppSettings) {
    return {
        template: '',
        restrict: 'A',
        controller: function ($scope) {
        },
        scope: false,
        //the linking function runs BEFORE controllers do, so that's
        //why we need to use $watch to wait for our pages var to be populated.
        link: function ($scope, el, attrs) {
            $scope.$watch('pages', function (new_val, old_val) {
                if (new_val === old_val) {
                    return;
                }
                var i;
                var link;
                var page_num;
                var current_page;
                var pages = new_val;
                var MAX_PAGES = 14;
                var parent_el = el[0].parentElement;

                //get current page.
                var url = $location.url();
                current_page = url.match(/\d{1,}$/);

                if (current_page === null) {
                    current_page = 1;
                } else {
                    current_page = current_page[0];

                    //strip number from url
                    url = url.replace(/\/\d{1,}$/, '');
                }

                current_page = parseInt(current_page, 10);

                //set up pagination links.
                if (pages <= MAX_PAGES) {
                    for (i = 0; i < pages; i++) {
                        link = document.createElement('a');
                        page_num = parseInt(i + 1, 10);
                        $(link).attr('href', '#' + url + '/' + page_num).text(page_num);
                        if (page_num === current_page) {
                            //add current page class
                            $(link).addClass('current-page');
                        }
                        el.append(link);
                    }
                } else {
                    var all_pages = _.range(1, pages);
                    var HALF_MAX_PAGES = Math.ceil(MAX_PAGES / 2);
                    var last, first;
                    var start, end;
                    var txt;

                    //set up start and end points for pagination
                    end = current_page + HALF_MAX_PAGES > all_pages.length ? all_pages.length : current_page + HALF_MAX_PAGES;

                    //if we are at the very end of pagination
                    if (end === all_pages.length) {
                        start = end - MAX_PAGES;
                    } else {
                        //if we are at the beginning of pagination
                        if (current_page - HALF_MAX_PAGES <= 0) {
                            start = 1;

                            //reset end so we can show a full set of links on the first pagination set
                            end = start + MAX_PAGES - 1;
                        } else {
                            start = current_page - HALF_MAX_PAGES;
                        }
                    }

                    for (i = start; i <= end; i++) {
                        link = document.createElement('a');
                        $(link).attr('href', '#' + url + '/' + i).text(i);
                        if (i === current_page) {
                            $(link).addClass('current-page');
                        }
                        el.append(link);
                    }

                    //check to see if we need ellipses to jump to beginning or end
                    if (current_page > MAX_PAGES) {
                        first = document.createElement('a');
                        first.setAttribute('href', '#' + url + '/1');
                        first.setAttribute('class', 'paginatation-first');
                        txt = document.createTextNode('‹‹');
                        first.appendChild(txt);
                        el.prepend(first);
                    }
                    if (current_page < all_pages.length - MAX_PAGES) {
                        last = document.createElement('a');
                        last.setAttribute('href', '#' + url + '/' + all_pages.length);
                        last.setAttribute('class', 'pagination-last');
                        txt = document.createTextNode('››');
                        last.appendChild(txt);
                        el.append(last);
                    }
                }
                switch (attrs.mdPagination){
                    case 'inspections':


                        //InsServices.getInspectionCount().then(function(obj){
                        var text = "Page " + current_page + " of " + $scope.pages;
                        var text_node = document.createTextNode(text);
                        var wrapper = document.createElement("div");
                        wrapper.className = "pagination-range";
                        wrapper.appendChild(text_node);
                        parent_el.appendChild(wrapper);
                        //});
                        break;
                }
            });
        }
    };
});


/**
 * @desc Converts values to and from metric. Actual model data stays imperial.
 */
ModustriDirectives.directive("mdMeasurement",
    function(Utilities, $rootScope){
        return {
            require: 'ngModel',
            template: '',
            restrict: 'A',
            priority: 5000,
            scope: false,
            controller: function($scope){
            },
            link: function($scope, el, attrs, ngModel){
//                if($scope.UserSettings.show_metric === "cancel"){
//                    $rootScope.$on('components_loaded', function(){
//                        ngModel.$setViewValue(Utilities.inToMm($scope.Ins.inspection_obj.results[attrs.part][attrs.index][attrs.side].measured));
//                        ngModel.$render();
//                        //$formatters: model->view
//                        ngModel.$formatters.unshift(function(value){
//                            if(value != ''){
//                                ngModel.$setViewValue(Utilities.inToMm(value));
//                                ngModel.$render();
//                            }
//                        });
//                        //$parsers: view->model
//                        ngModel.$parsers.unshift(function(value){
//                            if(value != ''){
//                                console.log('going to model');
//                                return Utilities.mmToIn(value);
//                            }
//                        });
//                    });
//                }
            }
        };
});

/**
 * @desc Uses jQuery UI autocomplete widget.
 * @see http://jqueryui.com/autocomplete/
 */
ModustriDirectives.directive("mdAutocompleteSearch",
    function ($http, $location, CustomerServices, MachineServices, AuthServices, AppSettings) {
        return {
            template: '',
            restrict: 'A',
            controller: function ($scope) {
            },
            scope: false,
            link: function ($scope, el, attrs) {
                var url;
                if (attrs.mdAutocompleteSearch === 'customers') {
                    url = AppSettings.BASE_URL + 'js/customers/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/';
                    $(el).autocomplete({
                        minLength: 3,
                        delay: 0,
                        source: function (request, response) {
                            request.dealer_id = AuthServices.getDealerID();
                            $.ajax({
                                type: 'post',
                                url: url,
                                data: request,
                                success: function (data) {
                                    response(data);
                                }
                            });
                        },
                        select: function (event, ui) {
                            CustomerServices.getByName(ui.item.value).then(function (obj) {
                                $location.path('/customers/' + obj.data.results[0].id);
                            });
                        }
                    });
                }

                if (attrs.mdAutocompleteSearch === 'inspectors') {
                    url = AppSettings.BASE_URL + 'js/customers/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/';
                    $(el).autocomplete({
                        minLength: 3,
                        delay: 0,
                        source: function (request, response) {
                            request.dealer_id = AuthServices.getDealerID();
                            $.ajax({
                                type: 'post',
                                url: url,
                                data: request,
                                success: function (data) {
                                    response(data);
                                }
                            });
                        },
                        select: function (event, ui) {
                            CustomerServices.getByName(ui.item.value).then(function (obj) {
                                switch ($(el).attr('id')) {
                                    case "total-ins-autocomplete":
                                        $scope.TotalIns.customer_id = obj.data.results[0].id;
                                        break;

                                    case "dispatch-autocomplete":
                                        $scope.Dispatch.customer_id = obj.data.results[0].id;
                                        break;
                                }
                            });
                        }
                    });
                }

                if (attrs.mdAutocompleteSearch === 'machines') {
                    url = AppSettings.BASE_URL + 'js/machines/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/';
                    $(el).autocomplete({
                        minLength: 3,
                        delay: 0,
                        source: function (request, response) {
                            request.dealer_id = AuthServices.getDealerID();
                            $.ajax({
                                type: 'post',
                                url: url,
                                data: request,
                                success: function (data) {
                                    response(data);
                                }
                            });
                        },
                        select: function (event, ui) {
                            var dealer_id = AuthServices.getDealerID();
                            var machine = false;
                            $http.post(url, { 'dealer_id': dealer_id, 'term': ui.item.value }).then(function(obj){
                                machine = _.find(obj.data, function(machine){
                                    return machine.id = ui.item.id;
                                });
                                if(machine){
                                    $location.path('/machines/' + machine.id);
                                }
                            });
                        }
                    });
                }

                if (attrs.mdAutocompleteSearch === 'inspections') {
                    url = AppSettings.BASE_URL + 'js/inspections/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/';
                    $(el).autocomplete({
                        minLength: 3,
                        delay: 0,
                        source: function (request, response) {
                            request.dealer_id = AuthServices.getDealerID();
                            $.ajax({
                                type: 'post',
                                url: url,
                                data: request,
                                success: function (data) {
                                    response(data);
                                }
                            });
                        },
                        select: function (event, ui) {
                            //console.dir(ui);
                            //console.dir(event);
                            //                        MachineServices.getBySerial(ui.item.value).then(function (obj) {
                            //                            $location.path('/machines/' + obj.data.results[0].id);
                            //                        });
                        }
                    });
                }

                if (attrs.mdAutocompleteSearch === 'inspection-machines') {
                    url = AppSettings.BASE_URL + 'js/machines/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/';
                    var data;
                    if(typeof $scope.Ins !== 'undefined' && $scope.Ins.inspection_obj.machine.serial){
                        $(el).val($scope.Ins.inspection_obj.machine.serial);
                        MachineServices.getBySerial($scope.Ins.inspection_obj.machine.serial).then(function (obj) {
                            $scope.Ins.inspection_obj.machine = obj.data.results[0];
                            $scope.Ins.machine_id = obj.data.results[0].id;
                            CustomerServices.get(obj.data.results[0].customer_id).then(function (returned) {
                                data = returned.data;
                                $scope.Ins.customer_id = data.results.id;
                                $scope.Ins.inspection_obj.customer.name = data.results.name;
                                $scope.Ins.inspection_obj.customer.email = data.results.email;
                                $scope.Ins.inspection_obj.customer.phone = data.results.phone;
                                $scope.Ins.inspection_obj.customer.city = data.results.city;
                                $scope.Ins.inspection_obj.customer.zip = data.results.zip;
                                $scope.Ins.inspection_obj.customer.primary_contact_id = data.results.primary_contact_id;
                                $scope.Ins.inspection_obj.customer.state = data.results.state;
                            });
                        });
                    }
                    $(el).autocomplete({
                        minLength: 3,
                        delay: 0,
                        source: function (request, response) {
                            request.dealer_id = AuthServices.getDealerID();
                            $.ajax({
                                type: 'post',
                                url: url,
                                data: request,
                                success: function (data) {
                                    response(data);
                                }
                            });
                        },
                        select: function (event, ui) {
                            MachineServices.getBySerial(ui.item.value).then(function (obj) {
                                $scope.Ins.inspection_obj.machine = obj.data.results[0];
                                $scope.Ins.machine_id = obj.data.results[0].id;
                                CustomerServices.get(obj.data.results[0].customer_id).then(function (returned) {
                                    data = returned.data;
                                    $scope.Ins.customer_id = data.results.id;
                                    $scope.Ins.inspection_obj.customer.name = data.results.name;
                                    $scope.Ins.inspection_obj.customer.email = data.results.email;
                                    $scope.Ins.inspection_obj.customer.phone = data.results.phone;
                                    $scope.Ins.inspection_obj.customer.city = data.results.city;
                                    $scope.Ins.inspection_obj.customer.zip = data.results.zip;
                                    $scope.Ins.inspection_obj.customer.primary_contact_id = data.results.primary_contact_id;
                                    $scope.Ins.inspection_obj.customer.state = data.results.state;
                                });
                            });
                        }
                    });
                }
            }
        };
    });

/**
 * @desc Uses jQuery UI autocomplete. Similar to the autocomplete search, except this just grabs some value for lookup later.
 * @see http://jqueryui.com/autocomplete/
 */
ModustriDirectives.directive("mdAutocompleteFormField", function ($http, $location, CustomerServices, AuthServices, AppSettings) {
    return {
        template: '',
        restrict: 'A',
        controller: function ($scope) {
        },
        scope: false,
        link: function (scope, el, attrs) {
            var url;
            if (attrs.mdAutocompleteFormField == 'customers') {
                url = AppSettings.BASE_URL + 'js/customers/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/';
                $(el).autocomplete({
                    minLength: 1,
                    delay: 0,
                    source: function (request, response) {
                        request.dealer_id = AuthServices.getDealerID();
                        $.ajax({
                            type: 'post',
                            url: url,
                            data: request,
                            success: function (data) {
                                response(data);
                            }
                        });
                    },
                    select: function (event, ui) {
                        CustomerServices.getByName(ui.item.value).then(function (obj) {
                            //i dont like this being tied so tightly daa in the controller,
                            //but in the name of expediency, this is how we roll.
                            scope.Machine.customer_id = obj.data.results[0].id;
                            scope.Machine.customer_name = ui.item.value;
                            scope.customer_changed = true;
                        });
                    }
                });
            }

            //TODO: this is sloppy and redundant, needs some renaming.
            if (attrs.mdAutocompleteFormField === 'customers_for_inspection') {
                url = AppSettings.BASE_URL + 'js/customers/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/';
                $(el).autocomplete({
                    minLength: 1,
                    delay: 0,
                    source: function (request, response) {
                        request.dealer_id = AuthServices.getDealerID();
                        $.ajax({
                            type: 'post',
                            url: url,
                            data: request,
                            success: function (data) {
                                response(data);
                            }
                        });
                    },
                    select: function (event, ui) {
                        CustomerServices.getByName(ui.item.value).then(function (obj) {
                            scope.Ins.customer_id = obj.data.results[0].id;
                            scope.Ins.inspection_obj.customer.id = obj.data.results[0].id;
                            scope.Ins.inspection_obj.customer.name = ui.item.value;
                        });
                    }
                });
            }

            if (attrs.mdAutocompleteFormField === 'machines') {
                url = AppSettings.BASE_URL + 'machines/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/';
                $(el).autocomplete({
                    minLength: 1,
                    delay: 0,
                    source: function (request, response) {
                        $.ajax({
                            type: 'get',
                            url: url,
                            data: request,
                            success: function (data) {
                                response(data);
                            }
                        });
                    },
                    select: function (event, ui) {
                    }
                });
            }
        }
    };
});


ModustriDirectives.directive("mdPermalink", function($http, $routeParams){
    return {
        template: '',
        restrict: 'A',
        scope: false,
        link: function($scope, el, attrs){
            var BASE_ALPH = 'ABCDEGHIJKLMNOPQRSTVWXYZabcdeghijklmnopqrstvwxyz';
            var sharelink = document.createElement('a');
            var linkhash = '';
            var remainder;
            var quotient;

            if('inspectionID' in $routeParams){
                quotient = parseInt($routeParams.inspectionID, 10);
                while(quotient > 0){
                    remainder = parseInt(quotient % BASE_ALPH.length, 10);
                    quotient = parseInt(quotient / BASE_ALPH.length, 10);
                    linkhash = BASE_ALPH[remainder] + linkhash;
                }
                sharelink.href = '#/perm/inspections/' + $routeParams.inspectionID;//+ linkhash;
                $(el).addClass('share-permalink');
                sharelink.textContent = 'Permalink';
                $(sharelink).on('click', function(e){
                    window.open(sharelink);
                    e.preventDefault();
                });
                $(el).append(sharelink);
            }
        }
    };
});

ModustriDirectives.directive("mdMap", function () {
    return {
        template: '',
        restrict: 'A',
        scope: false,
        link: function ($scope, el, attrs) {
            $scope.$watch('Ins.inspection_obj.jobsite', function (Ins) {
                if (typeof Ins !== 'undefined') {
                    var mapOptions = {
                        center: new google.maps.LatLng(Ins.lat, Ins.lon),
                        zoom: 10,
                        mapTypeId: google.maps.MapTypeId.HYBRID
                    };
                    var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
                    var loc = new google.maps.LatLng(Ins.lat, Ins.lon);
                    var marker = new google.maps.Marker({
                        position: loc,
                        map: map
                    });
                }
            });
        }
    };
});

/**
 * @desc Uses File API for modern browsers, attaches img data uri to controller's $scope.
 * @see https://github.com/MrSwitch/dropfile
 */
ModustriDirectives.directive("mdImageUpload", function () {
    return {
        template: '',
        restrict: 'A',
        scope: false,
        link: function ($scope, el, attrs) {
            //attach preview markup
            var files = [];
            var reader = new FileReader();
            var data_uri;
            var parent = el.parent();
            var container = document.createElement('div');
            var img_preview = document.createElement('img');
            var $remove_btn = parent.find('.remove-image');
            var scopevar = el.context.attributes['scopevar'];

            container.setAttribute('id', 'upload-image-wrapper');
            container.setAttribute('class', 'upload-image-wrapper');
            $(parent).prepend(container);
            $(el).text('Drop new image here.');

            el = el[0]; //remove jquery wrapper

            //add the image to the dom so it can be previewed before uploading.
            reader.onload = function (e) {
                img_preview.src = e.target.result;
                $(container).append(img_preview);
            };

            reader.onerror = function (e) {
                throw new Error('Problem reading file.');
            };

            el.addEventListener('dragover', function (e) {
                e.preventDefault();
            }, false);

            //we will use css to show / hide the form element and image preview,
            //but we'll attach / remove the 'remove image' button.
            el.addEventListener('drop', function (e) {
                e.preventDefault();
                var type;
                var validMimeTypes = ['image/png', 'image/jpeg', 'image/gif'];
                var isTypeValid = function(type) {
                    if ((validMimeTypes === (void 0) || validMimeTypes === '') || validMimeTypes.indexOf(type) > -1) {
                        return true;
                    } else {
                        alert("Invalid file type.  File must be one of following types " + validMimeTypes);
                        return false;
                    }
                };

                // Check Type Validation
                if (!isTypeValid(e.dataTransfer.files[0].type)) {
                    return false;
                }

                reader.readAsDataURL(e.dataTransfer.files[0]);
                $scope.image_upload = e.dataTransfer.files[0];
                if(scopevar){
                    if(!$scope.photouploaded){
                        $scope.photouploaded = [];
                    }
                    p = _.find($scope.photouploaded, function(obj){ return obj.index == scopevar.value; });
                    if(p==undefined){
                        $scope.photouploaded.push({
                            order: $scope.photouploaded.length,
                            index: scopevar.value,
                            photo: e.dataTransfer.files[0],
                            processed: false,
                        });
                    }else{
                        $scope.photouploaded[p.order] = {
                            order: p.order,
                            index: scopevar.value,
                            photo: e.dataTransfer.files[0],
                            processed: false,
                        };
                    }
                }
                $(el).addClass('hidden-img-upload');
                img_preview.setAttribute('class', '');

                $remove_btn[0].addEventListener('click', function (e) {
                    img_preview.setAttribute('class', 'hidden-preview-img');
                    $(el).removeClass('hidden-img-upload');
                    if(scopevar){
                        p = _.find($scope.photouploaded, function(obj){ return obj.index == scopevar.value; });
                        if(p!=undefined){
                            $scope.photouploaded.splice(p.order,1);
                        }
                        for(i=0; i<$scope.photouploaded.length; i++)
                            $scope.photouploaded[i].order = i;
                    }
                });
            }, false);
        }
    };
});


ModustriDirectives.directive('mdToggle', function($compile){
    var linker = function($scope, element, attrs){
        var bind_to = element.context.attributes['md-toggle'].nodeValue;
        var id = element.context.attributes['id'];
        var bindtoinspectionobj = element.context.attributes['bindtoinspectionobj'];
        var toggle_template;

        if(bind_to === 'show_metric'){
            bind_to = 'UserSettings.' + bind_to;
        }
        else if(bindtoinspectionobj && bindtoinspectionobj.value=="0"){

        }
        else{
            bind_to = 'Ins.inspection_obj.' + bind_to;
        }

        toggle_template = '<div class="onoffswitch">' +
            '<input type="checkbox" name="onoffswitch"' +
            'ng-model="' + bind_to + '"' +
            'ng-checked="' + bind_to + '"' +
            'class="onoffswitch-checkbox" '+
            ((id)? 'id="'+id.nodeValue+'">' : 'id="'+bind_to+'">') +
            '<label class="onoffswitch-label" '+
            ((id)? 'for="'+id.nodeValue+'">' : 'for="'+bind_to+'">') +
            '<div class="onoffswitch-inner"></div>' +
            '<div class="onoffswitch-switch"></div></label></div>';

        var el = $compile(toggle_template)($scope);
        element.replaceWith(el);
    };
    return{
        restrict: 'A',
        link: linker
    };
});

ModustriDirectives.directive('fileChange', function () {
    var linker = function ($scope, element, attributes) {
        $scope.files = [];
        var outFile = [];

        // onChange, push the files to $scope.files.
        element.bind('change', function (event) {
            var mfiles = event.target.files;
            for (var i = 0, length = mfiles.length; i < length; i++) {
                outFile.push(mfiles[i]);
            }
            $scope.files = outFile;
        });
    };
    return {
        restrict: 'A',
        scope: false,
        link: linker
    };
});

ModustriDirectives.directive('innerHtmlBind', function() {
    return {
        restrict: 'A',
        scope: {
            inner_html: '=innerHtml'
        },
        link: function(scope, element, attrs) {
            scope.inner_html = element.html();
        }
    };
});

ModustriDirectives.directive('sort', function() {
    return {
        transclude: true,
        template :
            '<a href="" ng-click="onSortClick()">' +
                '<span ng-transclude></span>' +
                '<span ng-show="reversed && predicate===by" class="reversed">&uarr;</span>' +
                '<span ng-show="!reversed && predicate===by" class="notreversed">&darr;</span>' +
            '</a>',
        scope: {
            predicate: '=',
            by: '=',
            reversed : '='
        },
        link: function(scope, element, attrs) {
            scope.onSortClick = function () {
                if( scope.predicate === scope.by ) {
                    scope.reversed = !scope.reversed;
                } else {
                    scope.by = scope.predicate;
                    scope.reversed = false;
                }
            };
        }
    };
});

var DraggableModule = angular.module("lvl.directives.dragdrop", ['lvl.services']);

DraggableModule.directive('lvlDraggable', ['$rootScope', 'uuid', function($rootScope, uuid) {
    return {
        restrict: 'A',
        link: function(scope, el, attrs, controller) {
            console.log("linking draggable element");

            angular.element(el).attr("draggable", "true");
            var id = angular.element(el).attr("id");
            if (!id) {
                id = uuid.new()
                angular.element(el).attr("id", id);
            }

            el.bind("dragstart", function(e) {
                e.dataTransfer.setData('text', id);

                $rootScope.$emit("LVL-DRAG-START");
            });

            el.bind("dragend", function(e) {
                $rootScope.$emit("LVL-DRAG-END");
            });
        }
    };
}]);

DraggableModule.directive('lvlDropTarget', ['$rootScope', 'uuid', function($rootScope, uuid) {
    return {
        restrict: 'A',
        scope: {
            onDrop: '&'
        },
        link: function(scope, el, attrs, controller) {
            var id = angular.element(el).attr("id");
            if (!id) {
                id = uuid.new()
                angular.element(el).attr("id", id);
            }

            el.bind("dragover", function(e) {
                if (e.preventDefault) {
                    e.preventDefault(); // Necessary. Allows us to drop.
                }

                e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
                return false;
            });

            el.bind("dragenter", function(e) {
                // this / e.target is the current hover target.
                angular.element(e.target).addClass('lvl-over');
            });

            el.bind("dragleave", function(e) {
                angular.element(e.target).removeClass('lvl-over');  // this / e.target is previous target element.
            });

            el.bind("drop", function(e) {
                if (e.preventDefault) {
                    e.preventDefault(); // Necessary. Allows us to drop.
                }

                if (e.stopPropogation) {
                    e.stopPropogation(); // Necessary. Allows us to drop.
                }
                var data = e.dataTransfer.getData("text");
                var dest = document.getElementById(id);
                var src = document.getElementById(data);

                scope.onDrop({dragEl: src, dropEl: dest});
            });

            $rootScope.$on("LVL-DRAG-START", function() {
                var el = document.getElementById(id);
                angular.element(el).addClass("lvl-target");
            });

            $rootScope.$on("LVL-DRAG-END", function() {
                var el = document.getElementById(id);
                angular.element(el).removeClass("lvl-target");
                angular.element(el).removeClass("lvl-over");
            });
        }
    };
}]);

ModustriDirectives.directive('showDropdownOnHover', function() {
    return {
        link : function(scope, element, attrs) {
            element.bind('mouseenter', function() {

                //default value for dropdown menu
                var dropMenuWidth = 160;

                element.css('position', 'relative');

                if(element.find('.ss-dropdown').length > 0) {
                    return false;
                }


                //Position calculate

                var _x = 0; //offsetLeft
                var _y = 0;
                el = element[0];

                while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
                    _x += el.offsetLeft - el.scrollLeft;
                    _y += el.offsetTop - el.scrollTop;
                    // chrome/safari
                    if ($.browser == 'webkit') {
                        el = el.parentNode;
                    } else {
                        // firefox/IE
                        el = el.offsetParent;
                    }
                }
                //console.log(_x);

                var menuOffsetLeft = 0;
                var allowOffsetLeft = dropMenuWidth / 4;

                if (angular.element(window).innerWidth() - _x < dropMenuWidth) {
                    menuOffsetLeft = angular.element(window).outerWidth() - _x - dropMenuWidth - 10;

                    allowOffsetLeft -= menuOffsetLeft;
                }


                var outputHtml = '';

                outputHtml += '<div class="ss-dropdown" style="left:'+ menuOffsetLeft +'px">';
                outputHtml += '<div class="ss-arrow" style="left:' + allowOffsetLeft + 'px"></div>';
                outputHtml += '<div class="ss-dropdown-inner">';
                outputHtml += angular.element('#'+attrs.showDropdownOnHover).html();
                outputHtml += '</div>';
                outputHtml += '</div>';

                element.append(outputHtml);

                //console.dir(attrs.showDropdownOnHover);
                //element.show();
            });
            element.bind('mouseleave', function() {
                element.find('.ss-dropdown').remove();
            });
        }
    };
});


ModustriDirectives.directive('ngFocus', [function() {
    var FOCUS_CLASS = "ng-focused";
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
            ctrl.$focused = false;
            element.bind('focus', function(evt) {
                element.addClass(FOCUS_CLASS);
                scope.$apply(function() {ctrl.$focused = true;});
            }).bind('blur', function(evt) {
                element.removeClass(FOCUS_CLASS);
                scope.$apply(function() {ctrl.$focused = false;});
            });
        }
    }
}]);

ModustriDirectives.directive('dtPicker', [function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
            element.datepicker();
        }
    }
}]);
