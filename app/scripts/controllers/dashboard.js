/*global Modustri,$,moment,angular,google*/
/**
 * @fileOverview Controller for viewing and analyzing inspection data.
 * @author Joseph Hatton
 * @author Ma Chen
 */

Modustri.controller('DashboardCtrl', ['$log', '$scope', '$routeParams',
    '$location', '$modal', '$http', 'CustomerServices', 'MachineServices', 'InsServices',
    'UserServices', 'AuthServices', 'ScoreBoardServices', 'Utilities', 'AppSettings', 'DealerServices',
    '$filter', '$q',
    function($log, $scope, $routeParams, $location, $modal, $http, CustomerServices,
        MachineServices, InsServices, UserServices, AuthServices, ScoreBoardServices, Utilities,
        AppSettings, DealerServices, $filter, $q) {

        "use strict";
        $scope.InspectionCache = {};
        $scope.FilterLock = false;
        $scope.FilterMD = function() {
            $scope.FilterLock = false;
        };
        $scope.FilterMU = function() {
            $scope.FilterLock = false;
        };
        $scope.filterValue_FromDate = localStorage.getItem('filterValue_FromDate') ?
            localStorage.getItem('filterValue_FromDate') : moment().subtract(1, 'months').format('MM/DD/YYYY');
        $scope.filterValue_ToDate = localStorage.getItem('filterValue_ToDate') ?
            localStorage.getItem('filterValue_ToDate') : moment().format('MM/DD/YYYY');

        $scope.$watch('filterValue_FromDate', function(new_val) {
            localStorage.setItem('filterValue_FromDate', new_val);
        });
        $scope.$watch('filterValue_ToDate', function(new_val) {
            localStorage.setItem('filterValue_ToDate', new_val);
        });

        $scope.filterValue_Customer = [];
        $scope.filterValue_Model = [];
        $scope.filterValue_Month = [];
        $scope.filterValue_LastThis = 0;
        $scope.filterValue_FromRating = 0;
        $scope.filterValue_ToRating = 120;
        $scope.filterValue_NA = false;
        $scope.filterValue_Keyword = '';
        $scope.filterMenu = {
            'customer': false,
            'customer_filter': '',
            'model': false,
            'model_filter': ''
        };

        var Spin = $('#spinner');
        Spin.css('width', '24px').css('height', '24px');
        Spin.show();
        AuthServices.checkUserCreds();
        $scope.UserSettings = AuthServices.getUserSettings();
        // set the dealer logo to the header bar

        var now = moment();
        InsServices.getInspectionCountByRange(
            moment("01-01-" + now.year(), "MM-DD-YYYY").unix(),
            now.unix()
        ).then(function(obj) {
            if (obj.data.results.length > 0) {
                $scope.Trend.ytd_inspections = obj.data.results[0].dealer_inspections;
                $scope.readySalesWidget = true;
            }
        });

        // Filter Criterias
        $scope.filter_Customers = {};
        $scope.filter_Models = {};
        $scope.filter_Months = [];
        MachineServices.queryModels().then(function(obj) {
            angular.forEach(obj.data.results, function(model) {
                $scope.filter_Models[model.id] = model;
            });
        });

        $scope.AllMachineActionDates = [];
        $scope.MachineActions = [];
        ScoreBoardServices.getAllScoreBoardData('actions', function(obj) {
            $scope.MachineActions = obj.results;
        });
        ScoreBoardServices.getAllScoreBoardData('machineactiondates', function(obj) {
            $scope.AllMachineActionDates = obj.results;
        });

        //  -----  Statistics & Trends  -----

        $scope.Trend = {
            ytd_inspections: 0,
            ytd_sales: 0,
            revenue: 0.0,
            missed_opportunities: 0,
            monthly_teamgoals: 0,
            user_engagement: 0.0,
            customer_engagement: 0.0
        };

        function calcTrends() {
            // validate filter start and end date
            if (moment($scope.filterValue_FromDate) > moment($scope.filterValue_ToDate)) {
                alert("Enter a To Date later than From Date!");
                return;
            }

            // Filter From & To Date
            $scope.fromUnix = moment($scope.filterValue_FromDate);
            $scope.toUnix = moment($scope.filterValue_ToDate);
            //the jquery calendar widget returns the time set at 5am
            $scope.fromUnix.subtract(5, 'hours');
            $scope.toUnix.add(19, 'hours');
            $scope.fromUnix = $scope.fromUnix.unix();
            $scope.toUnix = $scope.toUnix.unix();

            // Show / Hide Filter Buttons
            $scope.filter_today = moment().unix();
            $scope.filter_thisweek = moment().weekday(0).unix();
            $scope.filter_lastweek = moment().weekday(-7).unix();
            $scope.filter_thismonth = moment().date(1).unix();
            $scope.filter_lastmonth = moment().add(-1, 'months').date(1).unix();

            // Set Filter Months
            $scope.filter_Months = [];
            var temp_date = moment($scope.filterValue_FromDate);
            var end_unix = moment($scope.filterValue_ToDate).add(1, 'months').date(-1).unix();
            while (temp_date.unix() < end_unix) {
                $scope.filter_Months.push({
                    value: temp_date.unix(),
                    text: temp_date.format("MMM YYYY")
                });
                temp_date = temp_date.add(1, 'months');
            }

            // Since this grabs a years data, we'll use it to warm a cache and make fewer api calls
            $scope.InspectionCache = {};
            $scope.Inspections = [];
            //var now = moment();
            //var thefirst = moment($scope.filterValue_FromDate).subtract(5, 'hours');
            //now.add(19, 'hours');
            //InsServices.getByDealerIdStartEnd(AuthServices.getDealerID(), thefirst.unix(), now.unix()).then(function(obj){
            InsServices.getByDealerIdStartEnd(AuthServices.getDealerID(), $scope.fromUnix, $scope.toUnix).then(function(obj) {
                var inspections = obj.data.results;
                $scope.InspectionCache = inspections;
                $scope.UpdateDispatch();
            });
        }

        calcTrends();


        //  -----  Dispatch Manager  -----

        // Google Map

        var map;
        var markers = [];

        function zoom() {
            var bounds = new google.maps.LatLngBounds();
            for (var i in markers) {
                // console.dir(markers[i]);
                var lat = parseFloat(markers[i].position.k, 10);
                var lon = parseFloat(markers[i].position.B, 10);
                var point = new google.maps.LatLng(lat, lon);
                bounds.extend(point);
            }
            map.fitBounds(bounds);
        }
        $scope.InfoWindows = [];

        // Scope Variables

        $scope.showTrends = 1;
        $scope.showFilter = 1;
        $scope.showMap = 1;

        $scope.showhideTrends = function(val) {
            $scope.showTrends = val;
        };

        $scope.showhideFilter = function(val) {
            $scope.showFilter = val;
        };

        $scope.showhideMap = function(val) {
            $scope.showMap = val;
        };

        // Dispatch

        $scope.DispatchReady = false;
        $scope.Inspections = [];

        $scope.ApplyFilters = function() {
            $scope.DispatchReady = false;
            calcTrends();
        };

        $scope.ClearFilters = function() {
            $scope.filterValue_Customer = [];
            $scope.filterValue_Model = [];
            $scope.filterValue_Month = [];
            $scope.filterValue_LastThis = 0;
            $scope.filterValue_FromRating = 0;
            $scope.filterValue_ToRating = 120;
            $scope.filterValue_NA = false;
            $scope.filterValue_Keyword = '';

            $scope.filterValue_FromDate = moment().subtract(1, 'months').format('MM/DD/YYYY');
            $scope.filterValue_ToDate = moment().format('MM/DD/YYYY');
        };

        $scope.Spin = Spin;
        // Update Dispatch

        $scope.Loaded = false;

        $scope.$watch('Loaded', function(newval, oldval) {
            if (newval !== oldval) {
                Spin.hide();
                $scope.DispatchReady = true;
            }
        });

        $scope.UpdateDispatch = function() {
            // !!! TODO - Refactor this loop, break out things into functions
            /*
			$scope.fromUnix = moment($scope.filterValue_FromDate);
            $scope.toUnix = moment($scope.filterValue_ToDate);
            //the jquery calendar widget returns the time set at 5am
            $scope.fromUnix.subtract(5, 'hours');
            $scope.toUnix.add(19, 'hours');
            $scope.fromUnix = $scope.fromUnix.unix();
            $scope.toUnix = $scope.toUnix.unix();
            */
            deleteMarkers();

            var InsCount = $scope.InspectionCache.length;
            var CurCount = 0;
            var inspectionsArray = [];

            angular.forEach($scope.InspectionCache, function(data, k) {
                // console.log(k);
                var myts = parseInt(data.timestamp, 10);
                var dfrm = parseInt($scope.fromUnix, 10);
                var dto = parseInt($scope.toUnix, 10);

                //console.log('mine: ' + myts + '\n' + 'from: ' + dfrm +'\n' + 'too : ' + dto);
                if (myts > dfrm && myts < dto) {

                    if (!data.hasOwnProperty('datestring')) {
                        data.datestring = Utilities.getDatestring(data.timestamp);
                    }
                    if (!data.inspection_obj.hasOwnProperty('customer')) {
                        CustomerServices.get(data.customer_id).then(function(obj) {
                            data.customer_name = obj.data.results.name;
                        });
                    } else {
                        data.customer_name = data.inspection_obj.customer.name;
                    }
                    var ratings = [];
                    data.components = [];
                    // data.inspection_obj.totalimages = 0;
                    // data.inspection_obj.images = [];
                    /*
                    MachineServices.getInspectionPhotos(data.id).then(function (obj) {
                         renderInspectionPhotos(data, obj);
                    });
                    */

                    angular.forEach(data.inspection_obj.results, function(components, key) {
                        if (typeof components[0] !== 'undefined' &&
                            (typeof components[0].left !== 'undefined' || typeof components[0].right !== 'undefined') &&
                            (typeof components[0].left.percentage !== 'undefined' || typeof components[0].right.percentage !== 'undefined')) {
                            for (var i = 0; i < components.length; i++) {
                                ratings.push(parsePercent(components[i].left.percentage));
                                ratings.push(parsePercent(components[i].right.percentage));
                                components[i].component_type = key;
                                components[i].left.percent = parsePercent(components[i].left.percentage);
                                components[i].left.color = getColorFromPercent(components[i].left.percent);
                                components[i].right.percent = parsePercent(components[i].right.percentage);
                                components[i].right.color = getColorFromPercent(components[i].right.percent);
                                var plm = components[i].left.measured;
                                var plmm = false;
                                var prm = components[i].right.measured;
                                var prmm = false;
                                if (!components[i].left.hasOwnProperty('measured_metric')) {
                                    if (plm !== 0 && plm !== false) {
                                        plmm = plm / 0.03937;
                                    }
                                    if (isNaN(plmm)) {
                                        components[i].left.measured_metric = '';
                                    } else {
                                        components[i].left.measured_metric = Math.round(plmm, 2);
                                    }
                                }
                                if (!components[i].right.hasOwnProperty('measured_metric')) {
                                    if (prm !== 0) {
                                        prmm = prm / 0.03937;
                                    }
                                    if (isNaN(prmm)) {
                                        components[i].right.measured_metric = '';
                                    } else {
                                        components[i].right.measured_metric = Math.round(prmm, 2);
                                    }
                                }
                                data.components.push(components[i]);
                            }
                        }
                    });

                    var ratingArr = ratings.sort(function(a, b) {
                        return b - a;
                    });
                    if (typeof ratingArr[0] === 'undefined') {
                        data.rating = 'N/A';
                        data.rating_value = -1;
                        data.color = '';
                    } else {
                        data.rating = ratingArr[0].toString() + '%';
                        data.rating_value = ratingArr[0];
                    }
                    data.color = getColorFromPercent(data.rating_value);
                    data.markerIcon = 'http://maps.google.com/mapfiles/ms/icons/' + data.color + '-dot.png';
                    /*
                    MachineServices.getInspectionPhotos(data.id).then(function(obj){
                        data.totalimages = obj.data.results.length;
                    });
                    */
                    try {
                        if (data.inspection_obj.machine.id != '' && data.inspection_obj.machine.serial === '') {
                            MachineServices.get(data.inspection_obj.machine.id).then(function(obj) {
                                console.log('Called get machine');
                                data.inspection_obj.machine.serial = obj.data.results.serial;
                            });
                        }
                    } catch (err) {
                        //console.dir(err);
                        // console.dir(data.inspection_obj);
                    }
                    data.opportunity = '';
                    angular.forEach($scope.AllMachineActionDates, function(actiondate, key) {
                        if (actiondate.inspection_id == data.id) {
                            data.opportunity = data.opportunity + $scope.MachineActions[parseInt(actiondate.action_id) - 1].abr + ' ';
                        }
                    });

                    data.checked = false;
                    inspectionsArray.push(data);
                    var ins = data.inspection_obj;
                    var jstr = ins.machine.serial + ' ';
                    jstr += ins.machine.model + ' ';
                    jstr += ins.machine.manufacturer_name + ' ';
                    if(ins.hasOwnProperty('user'))
                    {
                        jstr += ins.user.username + ' ';
                        jstr += ins.user.email + ' ';
                    }
                    if(ins.hasOwnProperty('customer'))
                    {
                        jstr += ins.customer.name;
                    }
                    // data.search_field = jstr;

                    data.show_components = 0;
                    // console.dir(data);
                    CurCount++;
                    // console.log(InsCount + '-' + CurCount);
                    if (InsCount <= CurCount) {
                        $scope.Loaded = true;
                    }
                    if (data.inspection_obj.inspector == undefined && data.inspection_obj.user != undefined && data.inspection_obj.user.username != undefined) {
                        data.inspection_obj.inspector = data.inspection_obj.user.username;
                    }
                } else {
                    CurCount++;
                }
            });

            $scope.Inspections = inspectionsArray;
            updateMarkers();
            $scope.DispatchReady = true;
            getCustomers();
        };

        function getCustomers() {
            var customerIdArr = [];
            $scope.filter_Customers = {};
            angular.forEach($scope.Inspections, function(obj) {
                if (typeof obj.inspection_obj.customer !== 'undefined' && obj.inspection_obj.customer !== null && customerIdArr.indexOf(obj.inspection_obj.customer.id) === -1) {
                    $scope.filter_Customers[obj.inspection_obj.customer.id] = obj.inspection_obj.customer;
                    customerIdArr.push(obj.inspection_obj.customer.id);
                }
            });
        }


        // Filtering Dispatch
        $scope.preventHide = function($event) {
            if ($event != undefined) {
                $event.preventDefault();
                $event.stopPropagation();
            }
        }

        $scope.filterByCustomerText = function() {
            var text = [];
            angular.forEach($scope.filterValue_Customer, function(value) {
                text.push($scope.filter_Customers[value]['name']);
            });

            if (text.length == 0) {
                return "-- Filter by Customer --";
            } else {
                return text.join(", ");
            }
        }

        $scope.filterByModelText = function() {
            var text = [];
            angular.forEach($scope.filterValue_Model, function(value) {
                text.push($scope.filter_Models[value]['model']);
            });

            if (text.length == 0) {
                return "-- Filter by Model --";
            } else {
                return text.join(", ");
            }
        }

        $scope.filterByCustomer = function(customer, $event) {
            if ($scope.filterValue_Customer.indexOf(customer) < 0) {
                $scope.filterValue_Customer.push(customer);
            } else {
                $scope.filterValue_Customer.splice($scope.filterValue_Customer.indexOf(customer), 1);
            }

            if ($event != undefined) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.filterMenu.customer = !$scope.filterMenu.customer;
            }

        };

        $scope.tblFilterCustomer = function(inspection) {
            if ($scope.filterValue_Customer.length == 0) {
                return true;
            } else if (inspection.inspection_obj.hasOwnProperty('customer') && $scope.filterValue_Customer.indexOf(inspection.inspection_obj.customer.id) != -1) {
                return true;
            } else {
                return false;
            }
        };

        $scope.filterByModel = function(model, $event) {
            if ($scope.filterValue_Model.indexOf(model) < 0) {
                $scope.filterValue_Model.push(model);
            } else {
                $scope.filterValue_Model.splice($scope.filterValue_Model.indexOf(model), 1);
            }

            if ($event != undefined) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.filterMenu.model = !$scope.filterMenu.model;
            }
        };

        $scope.tblFilterModel = function(inspection) {

            if ($scope.filterValue_Model.length == 0) {
                return true;
            } else if (inspection.inspection_obj.hasOwnProperty('machine') && $scope.filterValue_Model.indexOf(inspection.inspection_obj.machine.model_id) != -1) {
                return true;
            } else {
                return false;
            }
        };

        $scope.tblFilterFromRating = function(inspection) {
            if ((inspection.rating_value >= $scope.filterValue_FromRating && inspection.rating_value <= $scope.filterValue_ToRating) || ($scope.filterValue_NA && inspection.rating_value == -1)) {
                return true;
            } else {
                return false;
            }
        };

        $scope.filterByMonth = function(month) {
            $scope.filterValue_LastThis = 0;
            if ($scope.filterValue_Month.indexOf(month) < 0) {
                $scope.filterValue_Month.push(month);
            } else {
                $scope.filterValue_Month.splice($scope.filterValue_Month.indexOf(month), 1);
            }
        };

        $scope.tblFilterMonth = function(inspection) {
            if ($scope.filterValue_Month.length > 0) {
                var filterFlag = false;

                for (var idx = 0; idx < $scope.filterValue_Month.length; idx++) {
                    var curMonth = moment($scope.filterValue_Month[idx], "X");

                    var temp_date = moment(inspection.timestamp, "X");

                    if (curMonth.month() === temp_date.month() && curMonth.year() === temp_date.year()) {
                        filterFlag = true;
                    }
                    /*
                    if(curMonth >= 1 && curMonth <= 9) {
                        if (inspection.datestring.match("0"+curMonth+"/[0-9][0-9]/[0-9][0-9][0-9][0-9]")!==null) {
                            filterFlag = true;
                        }
                    }else if(curMonth >= 10){
                        if (inspection.datestring.match(""+curMonth+"/[0-9][0-9]/[0-9][0-9][0-9][0-9]")!==null) {
                            filterFlag = true;
                        }
                    }
                    */
                }

                return filterFlag;

            } else {
                return true;
            }
        };

        $scope.tblFilterKeyword = function(inspection) {
            if ($scope.filterValue_Keyword == "") {
                return true;
            }

            if (inspection.search_field.toLowerCase().indexOf($scope.filterValue_Keyword.toLowerCase()) >= 0) {
                return true;
            } else {
                // check Man / Model
                if ($scope.filterValue_Keyword.toLowerCase() == (inspection.inspection_obj.manufacturer.company + " " + inspection.inspection_obj.machine.model).toLowerCase()) {
                    return true;
                } else {
                    return false;
                }
            }
        };

        $scope.filterByLastThis = function(lastthis) {
            if ($scope.filterValue_LastThis === lastthis) {
                $scope.filterValue_LastThis = 0;
            } else {
                $scope.filterValue_LastThis = lastthis;
                $scope.filterValue_Month = [];
            }
            $scope.filterValue_Month = [];
        };

        $scope.tblFilterLastThis = function(inspection) {
            var dt = moment(inspection.datestring, "MM/DD/YYYY");
            var now = moment();
            switch ($scope.filterValue_LastThis) {
                case 1: // Last Week
                    dt.add(1, 'weeks');
                    if (dt.week() === now.week() && dt.year() === now.year()) {
                        return true;
                    }
                    break;
                case 2: // Last Month
                    dt.add(1, 'months');
                    if (dt.month() === now.month() && dt.year() === now.year()) {
                        return true;
                    }
                    break;
                case 3:
                    if (dt.year() === now.year() && dt.month() === now.month() && dt.date() === now.date()) {
                        return true;
                    }
                    break;
                case 4: // This Week
                    if (dt.week() === now.week() && dt.year() === now.year()) {
                        return true;
                    }
                    break;
                case 5: // This Month
                    if (dt.month() === now.month() && dt.year() === now.year()) {
                        return true;
                    }
                    break;
                default: // Others
                    return true;
            }
            return false;
        };

        $scope.getFilterMonthsLabel = function() {
            var text = [];
            angular.forEach($scope.filter_Months, function(month) {
                if ($scope.filterValue_Month.indexOf(month.value) != -1) {
                    text.push(month.text);
                }
            });

            if (text.length == 0) {
                return "Select a Month";
            } else {
                return text.join(", ");
            }

            /*
            var len = $scope.filterValue_Month.length;
            if(len == 0) {
                return "";
            } else if(len == 1) {
                for(var i = 0; i < $scope.filter_Months.length; i++) {
                    if($scope.filter_Months[i].value == $scope.filterValue_Month[0]) {
                        return $scope.filter_Months[i].text;
                    }
                }
            } else {
                return len + " months";
            }
            */
        }

        $scope.$watch('filterValue_Customer', function(newval, oldval) {
            if (!angular.equals(newval, oldval)) {
                updateMarkers();
            }
        });

        $scope.$watch('filterValue_Model', function(newval, oldval) {
            if (!angular.equals(newval, oldval)) {
                updateMarkers();
            }
        });

        $scope.$watch('filterValue_FromRating', function(newval, oldval) {
            if (newval !== oldval && !$scope.FilterLock) {
                updateMarkers();
            }
        });

        $scope.$watch('filterValue_ToRating', function(newval, oldval) {
            if (newval !== oldval && !$scope.FilterLock) {
                updateMarkers();
            }
        });

        $scope.$watch('filterValue_NA', function(newval, oldval) {
            if (newval !== oldval && !$scope.FilterLock) {
                updateMarkers();
            }
        });

        $scope.$watch('filterValue_Month', function(newval, oldval) {
            if (!angular.equals(newval, oldval)) {
                updateMarkers();
            }
        });

        $scope.$watch('filterValue_LastThis', function(newval, oldval) {
            if (newval !== oldval) {
                updateMarkers();
            }
        });

        $scope.$watch('filterValue_Keyword', function(newval, oldval) {
            if (newval !== oldval) {
                updateMarkers();
            }
        });

        // Drawing Google Map

        function initMap() {
            var lat = 38.582436;
            var lon = -30.386832;
            var latlon = new google.maps.LatLng(lat, lon);
            var mapOptions = {
                zoom: 2,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                center: latlon
            };

            map = new google.maps.Map(document.getElementById("dispatch-manager-map"), mapOptions);
        }

        function updateMarkers() {
            deleteMarkers();
            angular.forEach($scope.Inspections, function(inspection) {
                if ($scope.tblFilterCustomer(inspection) &&
                    $scope.tblFilterModel(inspection) &&
                    $scope.tblFilterFromRating(inspection) &&
                    $scope.tblFilterMonth(inspection) &&
                    $scope.tblFilterLastThis(inspection) &&
                    $scope.tblFilterKeyword(inspection)) {
                    createMapMarker(inspection);
                }
            });
            for (var i in markers) {
                markers[i].setMap(map);
            }
            zoom();
        }

        function createMapMarker(data) {
            var myimgsrc = "./images/tmp.png";
            if (data.job_site_id !== 0 && typeof data.inspection_obj.jobsite !== 'undefined') {
                var machineimgid = data.inspection_obj.machine.main_image_id;
                if (machineimgid !== false && machineimgid > 0) {
                    myimgsrc = AppSettings.BASE_URL + "imgtmb/" + machineimgid + "/";
                    setMarker(myimgsrc, data);
                } else {
                    myimgsrc = 'images/tmp.png';
                    setMarker(myimgsrc, data);
                    /*
                    MachineServices.get(data.machine_id).then(function (obj) {
                        if (obj.data.results.main_image_id > 0) {
                            myimgsrc = AppSettings.BASE_URL + "imgtmb/" + obj.data.results.main_image_id + "/";
                            setMarker(myimgsrc, data);
                        }
                    });
                    */
                }
            }
        }

        function setMarker(myimgsrc, data) {
            if (data.inspection_obj.jobsite.lat !== 0 && data.inspection_obj.jobsite.lon !== 0) {
                var latlong = new google.maps.LatLng(data.inspection_obj.jobsite.lat, data.inspection_obj.jobsite.lon);
                var cname = "Not Set";
                if (typeof data.inspection_obj.customer !== 'undefined') {
                    cname = data.inspection_obj.customer.name;
                }

                var infoWindow = new google.maps.InfoWindow({
                    content: mapContent(myimgsrc, data, cname)
                });
                $scope.InfoWindows.push(infoWindow);

                var marker = new google.maps.Marker({
                    position: latlong,
                    // map: map,
                    // animation: google.maps.Animation.DROP,
                    title: "Inspection Location",
                    icon: data.markerIcon
                });

                google.maps.event.addListener(marker, 'click', function() {
                    for (var i = 0; i < $scope.InfoWindows.length; i++) {
                        $scope.InfoWindows[i].close();
                    }
                    infoWindow.open(map, marker);
                });
                markers.push(marker);
            }


        }

        function mapContent(myimgsrc, data, cname) {
            var inspector = "";
            if (data.inspection_obj.hasOwnProperty("user")) {
                inspector = data.inspection_obj.user.username;
            }
            var contentString = '<div class="map-data-container">' +
                '<div class="map-image"><img alt="Inspection ' + data.id + '" src="' + myimgsrc + '"/></div>' +
                '<div class="map-data">' +
                '<h3><a href="#/inspections/' + data.id + '">Inspection ' + data.id + '</a></h3>' +
                'Inspector: <strong>' + inspector + '</strong><br />' +
                'Serial: <strong><a href="#/machines/' + data.machine_id + '">' + data.inspection_obj.machine.serial + '</a></strong><br />' +
                'Customer: <strong>' + cname + '</strong><br />' +
                '</div>' +
                '</div>';
            return contentString;
        }

        // Sets the map on all markers in the array.
        function setAllMap(maps) {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(maps);
            }
        }

        // Removes the markers from the map, but keeps them in the array.
        function clearMarkers() {
            setAllMap(null);
        }

        // Deletes all markers in the array by removing references to them.
        function deleteMarkers() {
            clearMarkers();
            markers = [];
        }

        // Utility Functions

        function parsePercent(val) {
            var arr;
            if (typeof val !== 'undefined' && val !== null && val !== "Hi" && val !== "Lo" && val !== "NA" && val !== "") {
                return parseFloat(val);
            }
        }

        function getColorFromPercent(val) {
            if (typeof val === 'undefined' || val === '' || val === null) {
                return 'red';
            } else if (val > 69) {
                return 'red';
            } else if (val > 30 && val < 70) {
                return 'orange';
            } else if (val < 31) {
                return 'green';
            }
        }

        function renderInspectionPhotos(inspection, obj) {
            return;
            var l, r; //components where id matches photo id
            var ins = inspection.inspection_obj; //shortcut
            var l_caches = [];
            var r_caches = [];

            // todo: this is a brutal loop, should be refactored and optimised but for now it works
            // - JJR 3/21/2014
            if (obj.data.hasOwnProperty('results') && obj.data.results.length > 0) {
                ins.imgs = [];
                _.each(obj.data.results, function(photo_obj, index, list) {
                    // We have an image object, iterate through the components
                    // within the inpsection object and shim them in
                    // where applicable

                    _.each(ins.results,
                        function(result_obj, result_idx, result_lst) {
                            if (typeof result_obj !== 'string') {
                                var rl = result_obj.length;
                                if (rl > 0) {
                                    for (var i = 0; i < rl; i++) {
                                        if (result_obj[i].hasOwnProperty('left')) {
                                            //console.log('has left');
                                            if (result_obj[i].left.hasOwnProperty('image_timestamp')) {
                                                //console.log('left has img');
                                                if (photo_obj.timestamp === result_obj[i].left.image_timestamp) {
                                                    ins.results[result_idx][i].left.image_url = AppSettings.BASE_URL +
                                                        'imgtmb/' + photo_obj.id + '/';
                                                    ins.results[result_idx][i].left.image_full_url = AppSettings.BASE_URL +
                                                        'img/' + photo_obj.id + '/';
                                                    l_caches[i] = document.createElement('img');
                                                    l_caches[i].src = ''; //AppSettings.BASE_URL + 'img/' + photo_obj.id + '/';
                                                    ins.totalimages++;
                                                    ins.images.push({
                                                        'comp': result_idx + ' left',
                                                        'image': ins.results[result_idx][i].left.image_full_url
                                                    });
                                                }
                                            }
                                        }
                                        if (result_obj[i].hasOwnProperty('right')) {
                                            //console.log('has right');
                                            if (result_obj[i].right.hasOwnProperty('image_timestamp')) {
                                                if (photo_obj.timestamp === result_obj[i].right.image_timestamp) {
                                                    ins.results[result_idx][i].right.image_url = AppSettings.BASE_URL +
                                                        'imgtmb/' + photo_obj.id + '/';
                                                    ins.results[result_idx][i].right.image_full_url = AppSettings.BASE_URL +
                                                        'img/' + photo_obj.id + '/';
                                                    r_caches[i] = document.createElement('img');
                                                    r_caches[i].src = ''; //AppSettings.BASE_URL + 'img/' + photo_obj.id + '/';
                                                    ins.totalimages++;
                                                    ins.images.push({
                                                        'comp': result_idx + ' right',
                                                        'image': ins.results[result_idx][i].right.image_full_url
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        });
                });
            }

            var imagecomps = [
                'track_links left', 'track_links right',
                'bushings left', 'bushings right',
                'track_shoes left', 'track_shoes right',
                'idlers_front left', 'idlers_front right',
                'idlers_rear left', 'idlers_rear right',
                'carrier_rollers left', 'carrier_rollers right',
                'track_rollers left', 'track_rollers right',
                'sprockets left', 'sprockets right'
            ];
            ins.images = _.sortBy(ins.images, function(image) {
                return _.indexOf(imagecomps, image.comp);
            });
        };

        // Useful Scope Variables

        $scope.usv_component = {
            "track_links": {
                name: "Link",
                icon_cls: "links-btn"
            },
            "bushings": {
                name: "Bushing",
                icon_cls: "bushings-btn"
            },
            "track_shoes": {
                name: "Shoe",
                icon_cls: "shoes-btn"
            },
            "idlers_front": {
                name: "Front Idler",
                icon_cls: "idlers-btn"
            },
            "idlers_rear": {
                name: "Rear Idler",
                icon_cls: "idlers-btn"
            },
            "carrier_rollers": {
                name: "Carrier Roller",
                icon_cls: "carrier-rollers-btn"
            },
            "track_rollers": {
                name: "Track Roller",
                icon_cls: "track-rollers-btn"
            },
            "sprockets": {
                name: "Sprocket",
                icon_cls: "sprockets-btn"
            }
        };

        // Run Dispatch Manager
        initMap();

        $scope.deleteInspections = function() {
            if (confirm("Are you sure you want to delete selected inspections?")) {
                for (var i = 0; i < $scope.Inspections.length; i++) {
                    if ($scope.Inspections[i].checked) {
                        InsServices.del($scope.Inspections[i].id).then(function(obj) {});
                        $scope.Inspections.splice(i, 1);
                        i--;
                    }
                }
            }
        };

        $scope.openCarousel = function(inspection) {
            $scope.inspection = inspection;
            var modalInstance = $modal.open({
                templateUrl: 'dashboard-carousel.html',
                controller: 'DashboardCarouselCtrl',
                resolve: {
                    inspection: function() {
                        return $scope.inspection;
                    }
                },
                windowClass: 'dashboard-carousel-modal',
            });
        };
    }
]);

Modustri.controller('DashboardCarouselCtrl', ['$scope','$modalInstance','inspection','AppSettings',
    function($scope, $modalInstance, inspection, AppSettings) {
    $scope.images = [];
    for(var i in inspection.inspection_obj.images)
    {
        var img = inspection.inspection_obj.images[i];
        img.image = AppSettings.BASE_URL + 'img/' + img.id + "/";
        $scope.images.push(img);
    }
    $scope.insid = inspection.id;
    $scope.carouselIndex = 0;
    $scope.close = function() {
        $modalInstance.dismiss('cancel');
    };
}]);
