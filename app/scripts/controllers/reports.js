/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Controller for viewing and analyzing inspection data.
 * @author Joseph Hatton
 */

Modustri.controller('ReportCtrl', ['$log', '$scope', '$routeParams', '$location', '$http', 'CustomerServices', 'MachineServices',
    'InsServices', 'UserServices', 'AuthServices', 'Utilities', 'AppSettings', '$filter',
    function ($log, $scope, $routeParams, $location, $http, CustomerServices, MachineServices, InsServices,
              UserServices, AuthServices, Utilities, AppSettings, $filter) {

        "use strict";

        AuthServices.checkUserCreds();
        $scope.UserSettings = AuthServices.getUserSettings();
        $scope.InspectionCache = false;

        $scope.ulevel = AuthServices.getUserLevel();

        $scope.Chart = {
            date: '',
            timestamp: '',
            filter: '',
            from: 0,
            to: 99999999999,
            customer_name: '',
            customer_id: '',
            inspectors_list: [],
            inspections: {}
        };
        $('#spinner').show();

        UserServices.getUsersByDealer(function (data) {
            angular.forEach(data.results, function (v, k) {
                $scope.Chart.inspectors_list.push({
                    'name': v.username,
                    'id': v.id
                });
            });
        });

        $scope.Chart.inspections = {};
        $scope.dashboardCustomers = [];
        $scope.chartType = "column";

        $scope.fromChartDate = moment().subtract('months', 6).format('MM/DD/YYYY hh:mm a');
        $scope.toChartDate = moment().format('MM/DD/YYYY hh:mm a');


        $scope.UpdateDateRangeData = function () {
            if(validateDateRange()) {
                $('#spinner').show();
                $scope.showSpinner = true;
                $scope.InspectionCache = false; // clear the cache.
                $scope.GetInspectionData();
            }
        };

        $scope.UpdateDispatch = function (obj) {
            var myins = obj.data.results;
            _.each(obj.data.results, function (ins, index, list) {
                myins[index].datestring = moment.unix(ins.timestamp).format('MM/DD/YYYY hh:mm a');
            });
            $scope.Chart.inspections = myins;
        };



        //===============================================================================
        //             CHARTS
        //===============================================================================
        //This is what I need to filter programmatically.
        //var selected = $filter('filter')($scope.dealers, {id: id});

        var inspector_chart = $('#total-inspections-chart');
        var customer_chart = $('#total-customers-chart');
        var machine_chart = $('#total-machines-chart');

        var machine_population_wear_chart = $('#machine-population-wear-chart');
        var realtime_inspection_chart = $('#realtime-inspection-chart');
        var wear_analysis_chart = $('#wear-analysis-chart');
        var inspection_gauge_monthly_chart = $('#inspection-gauge-monthly-chart');
        var inspection_gauge_annual_chart = $('#inspection-gauge-annual-chart');
        var machine_population_chart = $('#machine-population-chart');
        var opportunities_converstions_chart = $('#opportunities-converstions-chart');
        var machine_cph_chart = $('#machine-cph-chart');

        var dealer_total_chart = $('#dealer-total-chart');
        var dealer_performance_chart = $('#dealer-performance-chart');
        var average_wear_chart = $('#average-wear-chart');
        var undercarriage_brands_chart = $('#undercarriage-brands-chart');
        var machines_percentage_chart = $('#machines-percentage-chart');

        $scope.chartDealers = [];

        $scope.chartCustomers = [];

        $scope.chartInspectors = [];

        $scope.chartMachines = [];
        $scope.chartMachineTypes = [];

        $scope.chartManufacturers = [];

        $scope.chartWeekly = [];
        $scope.chartMonthly = [];
        $scope.chartAnnual = [];

        $scope.machines = [];
        MachineServices.queryModels().then(function (obj) {
            $scope.machines = obj.data.results;
            //debugger;
            $scope.chartMachineTypes = removeMachineTypeDuplicates(obj.data.results);
        });

        //=====================
        //  UPDATE CHART EVENT
        //=====================

        $scope.GetInspectionData = function()
        {
            /*
            var itr = moment.twix(new Date('2012-01-15'),new Date('2012-05-20')).iterate("weeks");
            var range=[];
            while(itr.hasNext()){
                range.push(itr.next().format("YYYY-M-D"))
            }
            console.log(range);
            */

            $('#spinner').show();
            $scope.fromUnix = moment($scope.fromChartDate).unix();
            $scope.toUnix = moment($scope.toChartDate).unix();

            //need to add 18 hours or subtract 6 - the jquery widget returns the timestamp at 6am for some reason.
            $scope.fromUnix = $scope.fromUnix - 21600;
            $scope.toUnix = $scope.toUnix + 64800;
            if(!$scope.InspectionCache)
            {
                InsServices.getByDealerIdStartEnd(AuthServices.getDealerID(), $scope.fromUnix, $scope.toUnix).
                then(function(obj)
                {
                    //debugger;
                    $scope.InspectionCache = obj;
                    $scope.initializeChart(obj);

                    $scope.UpdateDispatch(obj);
                    $scope.UpdateInspectorChart(obj);
                    $scope.UpdateCustomerChart(obj);
                    $scope.UpdateMachineChart(obj);

                    $scope.UpdateMachinePopulationWearChart(obj);
                    $scope.UpdateRealtimeInspectionChart(obj);
                    $scope.UpdateWearAnalysisChart(obj);
                    $scope.UpdateInspectionGaugeChart(obj);
                    $scope.UpdateMachinePopulationChart(obj);
                    $scope.UpdateOpportunitiesConverstionsChart(obj);
                    $scope.UpdateMachineCphChart(obj);

                    $scope.UpdateDealerTotalChart(obj);
                    $scope.UpdateDealerPerformanceChart(obj);
                    $scope.UpdateAverageWearChart(obj);
                    $scope.UndercarriageBrandsChart(obj);
                    $scope.MachinesPercentageChart(obj);
                });
            } else {
                var obj = $scope.InspectionCache;
                $scope.initializeChart(obj);

                $scope.UpdateDispatch(obj);
                $scope.UpdateInspectorChart(obj);
                $scope.UpdateCustomerChart(obj);
                $scope.UpdateMachineChart(obj);

                $scope.UpdateMachinePopulationWearChart(obj);
                $scope.UpdateRealtimeInspectionChart(obj);
                $scope.UpdateWearAnalysisChart(obj);
                $scope.UpdateInspectionGaugeChart(obj);
                $scope.UpdateMachinePopulationChart(obj);
                $scope.UpdateOpportunitiesConverstionsChart(obj);
                $scope.UpdateMachineCphChart(obj);

                $scope.UpdateDealerTotalChart(obj);
                $scope.UpdateDealerPerformanceChart(obj);
                $scope.UpdateAverageWearChart(obj);
                $scope.UndercarriageBrandsChart(obj);
                $scope.MachinesPercentageChart(obj);
            }
        };

        $scope.initializeChart = function (obj) {
            $scope.chartCustomers = removeCustomerDuplicates(obj.data.results);
            $scope.chartMachines = removeMachineDuplicates(obj.data.results);
            $scope.chartDealers = removeDealerDuplicates(obj.data.results);
            $scope.chartInspectors = removeInspectorDuplicates(obj.data.results);
            $scope.chartManufacturers = removeManufacturerDuplicates(obj.data.results);

            /* --- weekly array between selected dates --- */
            var strFromDate = moment($scope.fromUnix, 'X').format('YYYY-MM-DD');
            var strToDate = moment($scope.toUnix, 'X').format('YYYY-MM-DD');

            var itr = moment.twix(getMonday(new Date(strFromDate)),new Date(strToDate)).iterate("weeks");
            var cur = null, tmp = null;
            while(itr.hasNext()){
                tmp = itr.next();
                if(cur != null) {
                    $scope.chartWeekly.push({start: cur.unix(), end: tmp.unix() - 1, name: cur.format("Wo YYYY")});
                }
                cur = tmp;
                //range.push(cur.format("YYYY-M-D"));
                //range.push(cur.unix());
            }

            // add last week for end date
            $scope.chartWeekly.push({start: cur, end: $scope.toUnix, name: cur.format("Wo YYYY")});

            /* --- monthly array between selected dates --- */
            var itr = moment.twix(getFirstDayofMonth(new Date(strFromDate)), getLastDayofMonth(new Date(strToDate))).iterate("months");
            var cur = null, tmp = null;
            while(itr.hasNext()){
                tmp = itr.next();
                if(cur != null) {
                    $scope.chartMonthly.push({start: cur.unix(), end: tmp.unix() - 1, name: cur.format("YYYY-M"), value: 0, total: 0});
                }
                cur = tmp;
            }

            /* --- anual array between selected dates --- */
            var dStart = new Date(strFromDate), dEnd = new Date(strToDate);
            for(var i = dStart.getFullYear(); i <= dEnd.getFullYear(); i++) {
                $scope.chartAnnual.push({name: i, value: 0, total: 0});
            }
        }

        $scope.UpdateInspectorChart = function (obj)
        {
            //This is to plot the X-Axis in Days.
            var dayArray = xAxisPlot();

            //initialize all points to zero.
            var inspectorPlots = initializeInspectorPoints();

            var result = obj.data.results;
            if ($scope.inspectorChartSearchFilter === undefined ||
                $scope.inspectorChartSearchFilter === null) {
                result = $filter('filter')(obj.data.results, {});
            } else {
                result = $filter('filter')(obj.data.results, {inspection_obj: {user: {username: $scope.inspectorChartSearchFilter}}});
            }
            //This is bulk of the work of plotting the bar chart.
            angular.forEach(result, function (data) {
                //Cyle through Inspector Names
                if (data.inspection_obj.user !== undefined) {// && data.completed) {
                    var name = data.inspection_obj.user.username;
                    angular.forEach(inspectorPlots, function (plot) {
                        if (plot.name === name) {
                            plot.y++;
                        }
                    });
                }
            });

            var xAxisArray = [];
            var dataArray = [];
            angular.forEach(inspectorPlots, function(data) {
                if(data.y > 0)
                {
                    xAxisArray.push(data.name);
                    dataArray.push(data.y);
                }
            });
            var step = 1;
            var cutoff = 25;
            if(dataArray.length > cutoff)
            {
                step = Math.round(dataArray.length / cutoff);
            }
            // The actual Bar Chart
            inspector_chart.highcharts({
                chart: { type: $scope.chartType },
                title: { text: 'Inspections by PSSR' },
                //subtitle: { text: 'Daily Inspection Breakdown' },
                xAxis: {
                        categories: xAxisArray,
                        labels: {
                                    rotation: 90,
                                    step: step,
                                    align: 'left'
                                }
                },
                yAxis: {
                    min: 0,
                    title: { text: 'Number of Inspections' }
                },
                tooltip: {
                    headerFormat: '<table>',
                    pointFormat: '<tr><td style="color:{point.color};padding:0">{point.category}: </td>' +
                        '<td style="padding:0"><b>{point.y}</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    },
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            format: '{point.y}'
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: [
                                {
                                    text: 'Download PDF',
                                    onclick: function () {
                                        this.exportChart({type: 'application/pdf'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download JPG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/jpeg'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download SVG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/svg+xml'});
                                    },
                                    separator: false
                                }
                            ]
                        }
                    }
                },
                series: [{
                            name: 'Inspectors',
                            data: dataArray
                        }]
            });
        };

        $scope.UpdateCustomerChart = function (obj)
        {
            //This is to plot the X-Axis in Days.
            var dayArray = xAxisPlot();

            var customerPlots = initializeCustomerPoints();

            var result = obj.data.results;
            if ($scope.customerChartSearchFilter === undefined ||
                $scope.customerChartSearchFilter === null) {
                result = $filter('filter')(result, {});
            } else {
                result = $filter('filter')(result, {inspection_obj: {customer: {name: $scope.customerChartSearchFilter}}});
            }

            //This is bulk of the work of plotting the bar chart.
            angular.forEach(result, function (data) {
                //Cyle through Customer Names
                if (data.inspection_obj.customer !== undefined && data.completed) {
                    var custName = data.inspection_obj.customer.name;
                    var custID = data.inspection_obj.customer.id;
                    var custUrl = custID;
                    angular.forEach(customerPlots, function (plot) {
                        if(custID !== undefined && custID !== null)
                        {
                            plot.url = custUrl;
                        }else
                        {
                            plot.url = "WTF";
                        }
                        if (plot.name === custName) {
                            plot.y++;
                        }
                    });
                }
            });

            var xAxisArray = [];
            var dataArray = [];
            angular.forEach(customerPlots, function(data) {
                if(data.y >= 1)
                {
                    xAxisArray.push(data.name);
                    dataArray.push(data.y);
                }
            });
            var step = 1;
            var cutoff = 25;
            if(dataArray.length > cutoff)
            {
                step = Math.round(dataArray.length / cutoff);
            }
            //console.log("step: " + step);

            // The actual Bar Chart
            customer_chart.highcharts({
                chart: { type: $scope.chartType },
                title: { text: 'Inspections by Customer' },
                //subtitle: { text: 'Customer Frequency Breakdown' },
                xAxis: {
                        categories: xAxisArray,
                        labels: {
                                    rotation: 90,
                                    step: step,
                                    align: 'left'
                                }
                },
                yAxis: {
                    min: 0,
                    title: { text: 'Number of Inspections' }
                },
                tooltip: {
                    headerFormat: '<table>',
                    pointFormat: '<tr><td style="color:{point.color};padding:0">{point.category}: </td>' +
                        '<td style="padding:0"><b>{point.y}</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    },
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            format: '{point.y}'
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: [
                                {
                                    text: 'Download PDF',
                                    onclick: function () {
                                        this.exportChart({type: 'application/pdf'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download JPG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/jpeg'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download SVG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/svg+xml'});
                                    },
                                    separator: false
                                }
                            ]
                        }
                    }
                },
                series: [{
                            name: 'Customers',
                            data: dataArray
                        }]
            });
        };

        $scope.UpdateMachineChart = function (obj)
        {

            //This is to plot the X-Axis in Days.
            var dayArray = xAxisPlot();

            var machinePlots = initializeMachinePoints();

            var result = obj.data.results;
            if ($scope.machineChartSearchFilter === undefined ||
                $scope.machineChartSearchFilter === null) {
                result = $filter('filter')(result, {});
            } else {
                result = $filter('filter')(result, {inspection_obj: {machine: {model: $scope.machineChartSearchFilter}}});
            }

            //This is bulk of the work of plotting the bar chart.
            angular.forEach(result, function (data) {
                //Cyle through Customer Names
                if (data.inspection_obj.machine !== undefined) {

                    //Get the highest rating
                    var ratings = [];
                    angular.forEach(data.inspection_obj.results, function (components) {
                        if (typeof components[0] !== 'undefined' &&
                            (typeof components[0].left !== 'undefined' || typeof components[0].right !== 'undefined') &&
                            (typeof components[0].left.percentage !== 'undefined' || typeof components[0].right.percentage !== 'undefined')) {

                            for (var i = 0; i < components.length; i++) {
                                ratings.push(parsePercent(components[i].left.percentage));
                                ratings.push(parsePercent(components[i].right.percentage));
                            }
                        }
                    });
                    var ratingArr = ratings.sort(function (a, b) {
                        return b - a;
                    });
                    if (typeof ratingArr[0] !== 'undefined' && ratingArr[0] > 69) {
                        var machineName = data.inspection_obj.machine.model;
                        angular.forEach(machinePlots, function (plot) {
                            if (plot.name === machineName) {
                                plot.y++;
                            }
                        });
                    }

                }
            });

            var xAxisArray = [];
            var dataArray = [];
            angular.forEach(machinePlots, function(data) {
                if(data.y >= 1)
                {
                    xAxisArray.push(data.name);
                    dataArray.push(data.y);
                }
            });
            var step = 1;
            var cutoff = 25;
            if(dataArray.length > cutoff)
            {
                step = Math.round(dataArray.length / cutoff);
            }
            // The actual Bar Chart
            machine_chart.highcharts({
                chart: { type: $scope.chartType },
                title: { text: 'Machines above 70% By Model' },
                //subtitle: { text: 'Machine Types Breakdown' },
                xAxis: {
                        categories: xAxisArray,
                        labels: {
                                    rotation: 90,
                                    step: step,
                                    align: 'left'
                                }
                },
                yAxis: {
                    min: 0,
                    title: { text: 'Number of Inspections' }
                },
                tooltip: {
                    headerFormat: '<table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{point.category}: </td>' +
                        '<td style="padding:0"><b>{point.y}</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    },
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            format: '{point.y}'
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: [
                                {
                                    text: 'Download PDF',
                                    onclick: function () {
                                        this.exportChart({type: 'application/pdf'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download JPG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/jpeg'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download SVG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/svg+xml'});
                                    },
                                    separator: false
                                }
                            ]
                        }
                    }
                },
                series: [{
                            name: 'Machines',
                            data: dataArray
                        }]
            });
            $('#spinner').hide();
        };

        $scope.UpdateDealerTotalChart = function (obj)
        {
            //This is to plot the X-Axis in Days.
            var dayArray = xAxisPlot();

            var dealerPlots = initializeDealerPoints();

            var result = obj.data.results;

            //This is bulk of the work of plotting the bar chart.
            angular.forEach(result, function (data) {
                //Cyle through Customer Names
                if (data.inspection_obj.dealer !== undefined) {
                    var dealerName = data.inspection_obj.dealer.name;
                    var dealerID = data.inspection_obj.dealer.id;
                    var modified = data.modified;//modified, timestamp
                    angular.forEach(dealerPlots, function (plot) {
                        if (plot.name === dealerName) {
                            plot.y++;
                        }
                    });
                }
            });

            var xAxisArray = [];
            var dataArray = [];
            angular.forEach(dealerPlots, function(data) {
                if(data.y > 0)
                {
                    switch(data.name) {
                    case "AgentX":
                        data.name = "NDUSTRIALIZADORA DANAMEX S.A";
                        break;
                    case "Altorfer":
                        data.name = "KOKUKA SHOKAI CO.,LTD";
                        break;
                    case "MacAllister":
                        data.name = "VOIGT WERKZEUGMASCHINEN";
                        break;
                    case "Ziegler":
                        data.name = "PERFECBORE LTD.";
                        break;
                    case "H.O.Penn":
                        data.name = "MENDHAM MACHINERY PTY. LTD.";
                        break;
                    case "Patten Cat":
                        data.name = "SUBRA DO BRASIL";
                        break;
                    case "Warren Cat":
                        data.name = "A.R.A. SRL";
                        break;
                    case "Empire Cat":
                        data.name = "";
                        break;
                    case "Thompson Machinery Cat":
                        data.name = "";
                        break;
                    }
                    if (data.name !== "") {
                        xAxisArray.push(data.name);
                        dataArray.push(data.y);
                    }
                }
            });
            var step = 1;
            var cutoff = 25;
            if(dataArray.length > cutoff)
            {
                step = Math.round(dataArray.length / cutoff);
            }
            //console.log("step: " + step);

            // The actual Bar Chart
            dealer_total_chart.highcharts({
                chart: { type: $scope.chartType },
                title: { text: 'Total Inspections per Dealer' },
                //subtitle: { text: 'Customer Frequency Breakdown' },
                xAxis: {
                        categories: xAxisArray,
                        labels: {
                                    rotation: 90,
                                    step: step,
                                    align: 'left'
                                }
                },
                yAxis: {
                    min: 0,
                    title: { text: 'Number of Inspections' }
                },
                tooltip: {
                    headerFormat: '<table>',
                    pointFormat: '<tr><td style="color:{point.color};padding:0">{point.category}: </td>' +
                        '<td style="padding:0"><b>{point.y}</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    },
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            format: '{point.y}'
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: [
                                {
                                    text: 'Download PDF',
                                    onclick: function () {
                                        this.exportChart({type: 'application/pdf'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download JPG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/jpeg'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download SVG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/svg+xml'});
                                    },
                                    separator: false
                                }
                            ]
                        }
                    }
                },
                series: [{
                            name: 'Dealers',
                            data: dataArray
                        }]
            });
        };

        $scope.UpdateMachinePopulationWearChart = function (obj)
        {
            // http://jsfiddle.net/gh/get/jquery/1.9.1/highslide-software/highcharts.com/tree/master/samples/highcharts/demo/combo-dual-axes/

            //This is to plot the X-Axis in Days.
            var dayArray = xAxisPlot();

            var machinePlots = initializeMachinePoints();

            var result = obj.data.results;

            //This is bulk of the work of plotting the bar chart.
            angular.forEach(result, function (data) {
                //Cyle through Customer Names
                if (data.inspection_obj.machine !== undefined) {

                    //Get the highest rating
                    var ratings = [];
                    angular.forEach(data.inspection_obj.results, function (components) {
                        if (typeof components[0] !== 'undefined' &&
                            (typeof components[0].left !== 'undefined' || typeof components[0].right !== 'undefined') &&
                            (typeof components[0].left.percentage !== 'undefined' || typeof components[0].right.percentage !== 'undefined')) {

                            for (var i = 0; i < components.length; i++) {
                                ratings.push(parsePercent(components[i].left.percentage));
                                ratings.push(parsePercent(components[i].right.percentage));
                            }
                        }
                    });
                    var ratingArr = ratings.sort(function (a, b) {
                        return b - a;
                    });
                    if (typeof ratingArr[0] !== 'undefined' && !isNaN(ratingArr[0])) {
                        var machineName = data.inspection_obj.machine.model;
                        angular.forEach(machinePlots, function (plot) {
                            if (plot.name === machineName) {
                                plot.y++;
                                // calculate % wear
                                plot.rating += ratingArr[0];
                                plot.cnt++;
                                plot.type = getMachineType(data.inspection_obj.machine.manufacturer_id, data.inspection_obj.machine.model);
                            }
                        });
                    }

                }
            });

            // Left y axis = % wear, x axis = machine type, right y axis = # of units
            var xAxisArray = [];
            var dataArray = [], wearDataArray = [], sortArray = [];
            angular.forEach(machinePlots, function(data) {
                var percentage_wear = 0;
                if(data.cnt > 2) {
                    percentage_wear = parseFloat((data.rating / data.cnt).toFixed(2));
                }
                data.rating = percentage_wear;

                if(data.y > 0 && percentage_wear > 0) {
                    data.index = $scope.chartMachineTypes.indexOf(data.type);
                    sortArray.push(data);
                }
            });

            sortArray.sort(function(a, b){
                return (a.index - b.index) || (a.y - b.y);
            });

            angular.forEach(sortArray, function(data) {
                xAxisArray.push(data.name);
                dataArray.push(data.y);
                wearDataArray.push(data.rating);
            });

            var step = 1;
            var cutoff = 25;
            if(dataArray.length > cutoff)
            {
                step = Math.round(dataArray.length / cutoff);
            }
            // The actual Bar Chart
            machine_population_wear_chart.highcharts({
                title: { text: 'Machine population vs Wear' },
                xAxis: {
                        categories: xAxisArray,
                        labels: {
                                    rotation: 90,
                                    //step: step,
                                    align: 'left'
                                }
                },
                yAxis: [
                    { // Primary yAxis
                        labels: {
                            style: { color: 'black' } //Highcharts.getOptions().colors[0]
                        },
                        title: {
                            text: 'Average % wear',
                            style: { color: 'black' }
                        }
                    },
                    { // Secondary yAxis
                        title: {
                            text: 'Machine size',
                            style: { color: 'black' } //Highcharts.getOptions().colors[1]
                        },
                        labels: {
                            style: { color: 'black' }
                        },
                        opposite: true
                    }
                ],
                tooltip: {
                    shared: true
                },
                legend: {
                    enabled: true
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: [
                                {
                                    text: 'Download PDF',
                                    onclick: function () {
                                        this.exportChart({type: 'application/pdf'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download JPG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/jpeg'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download SVG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/svg+xml'});
                                    },
                                    separator: false
                                }
                            ]
                        }
                    }
                },
                series: [{
                        name: '% Wear',
                        type: 'column',
                        yAxis: 1,
                        data: wearDataArray
                    },{
                        name: '# Machines',
                        type: 'spline',
                        data: dataArray
                    }]
            });
        }

        $scope.UpdateRealtimeInspectionChart = function (obj)
        {
            var i = 0, arr = [], s_unix = moment().add('months', -1).unix(), e_unix = moment().unix();
            var hours_unix = 60 * 60; // 1 hour unix

            s_unix =  s_unix - (s_unix % hours_unix); // minus seconds for only showing minute
            e_unix =  e_unix - (e_unix % hours_unix); // minus seconds for only showing minute

            /*
            for(i = s_unix; i <= e_unix; i = i + hours_unix) {
                arr.push({x: i, y: 0, test: ""});
            }
            */

            var xAxisArray = [];

            InsServices.getByDealerIdStartEnd(AuthServices.getDealerID(), s_unix, e_unix).
            then(function(obj)
            {
                var result = obj.data.results, len = 10;
                if(result.length < 10) {
                    len = result.length;
                }

                for(i = 0;i < len;i++) {
                    var data = result[i];

                    //Get the highest rating
                    var ratings = [];
                    angular.forEach(data.inspection_obj.results, function (components) {
                        if (typeof components[0] !== 'undefined' &&
                            (typeof components[0].left !== 'undefined' || typeof components[0].right !== 'undefined') &&
                            (typeof components[0].left.percentage !== 'undefined' || typeof components[0].right.percentage !== 'undefined')) {

                            for (var i = 0; i < components.length; i++) {
                                ratings.push(parsePercent(components[i].left.percentage));
                                ratings.push(parsePercent(components[i].right.percentage));
                            }
                        }
                    });
                    var ratingArr = ratings.sort(function (a, b) {
                        return b - a;
                    });

                    var machineName = "", dealerName = "", rating = 0;

                    if(data.inspection_obj.machine !== undefined)
                        machineName = data.inspection_obj.machine.model;
                    if(data.inspection_obj.dealer !== undefined)
                        dealerName = data.inspection_obj.dealer.name;

                    if (typeof ratingArr[0] !== 'undefined' && !isNaN(ratingArr[0])) {
                        rating = ratingArr[0];
                    }
                    //arr.push({x: data.timestamp, y: rating, machine: machineName, dealer: dealerName});
                    //arr.push({x: Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', data.timestamp * 1000), y: rating, machine: machineName, dealer: dealerName});
                    arr.push({y: rating, machine: machineName, dealer: dealerName, marker: { symbol: getMachineTypeIcon(data.inspection_obj.machine.manufacturer_id, data.inspection_obj.machine.model, rating, "n") } });
                    xAxisArray.push(Highcharts.dateFormat('%Y-%m-%d %H:%M %p', data.timestamp * 1000));
                }

                // reinitialize for chart
                /*
                var xAxisArray = [];
                var dataArray = [];
                for(i = 0;i < arr.length; i++) {
                    //arr[i].x = arr[i].x * 1000;
                    xAxisArray.push(arr[i].x);
                    dataArray.push(arr[i].y);
                }
                */
                arr.reverse();
                xAxisArray.reverse();

                Highcharts.setOptions({
                    global: {
                        useUTC: false
                    }
                });
                realtime_inspection_chart.highcharts({
                    chart: {
                        type: 'spline',
                        //animation: Highcharts.svg, // don't animate in old IE
                        //marginRight: 10 ,
                        events: {
                            load: function () {
                                // set up the updating of the chart each second
                                var series = this.series[0];
                                var xaxis = this.axes[0];
                                setInterval(function () {
                                    s_unix = e_unix + 60;
                                    e_unix = s_unix + 60;

                                    var y = 0;

                                    InsServices.getByDealerIdStartEnd(AuthServices.getDealerID(), s_unix, e_unix).
                                    then(function(obj)
                                    {
                                        var result = obj.data.results;
                                        result.reverse();

                                        for(i = 0;i < result.length;i++) {
                                            var data = result[i];

                                            //Get the highest rating
                                            var ratings = [];
                                            angular.forEach(data.inspection_obj.results, function (components) {
                                                if (typeof components[0] !== 'undefined' &&
                                                    (typeof components[0].left !== 'undefined' || typeof components[0].right !== 'undefined') &&
                                                    (typeof components[0].left.percentage !== 'undefined' || typeof components[0].right.percentage !== 'undefined')) {

                                                    for (var i = 0; i < components.length; i++) {
                                                        ratings.push(parsePercent(components[i].left.percentage));
                                                        ratings.push(parsePercent(components[i].right.percentage));
                                                    }
                                                }
                                            });
                                            var ratingArr = ratings.sort(function (a, b) {
                                                return b - a;
                                            });

                                            var machineName = "", dealerName = "", rating = 0;

                                            if(data.inspection_obj.machine !== undefined)
                                                machineName = data.inspection_obj.machine.model;
                                            if(data.inspection_obj.dealer !== undefined)
                                                dealerName = data.inspection_obj.dealer.name;

                                            if (typeof ratingArr[0] !== 'undefined' && !isNaN(ratingArr[0])) {
                                                rating = ratingArr[0];
                                            }
                                            //var value = {x: data.timestamp * 1000, y: rating, machine: machineName, dealer: dealerName};
                                            //var value = {x: Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', data.timestamp * 1000), y: rating, machine: machineName, dealer: dealerName};

                                            xAxisArray.push(Highcharts.dateFormat('%Y-%m-%d %H:%M %p', data.timestamp * 1000));
                                            xaxis.setCategories(xAxisArray, false);

                                            var value = {y: rating, machine: machineName, dealer: dealerName, marker: { symbol: getMachineTypeIcon(data.inspection_obj.machine.manufacturer_id, data.inspection_obj.machine.model, rating, "n") }};
                                            series.addPoint(value, true, true);

                                        }

                                    });

                                    // test script
                                    /*
                                    xAxisArray.push(Highcharts.dateFormat('%Y-%m-%d %H:%M %p', moment().unix() * 1000));
                                    xaxis.setCategories(xAxisArray, false);

                                    var value = {y: 10, machine: "machineName", dealer: "dealerName"};
                                    series.addPoint(value, true, true);
                                    */
                                }, 60000); // 1 minute interval
                            }
                        }
                    },
                    title: {
                        text: 'Real Time Inspection Tracker'
                    },
                    xAxis: {
                        //type: 'datetime',
                        //tickPixelInterval: 150
                        categories: xAxisArray
                    },
                    yAxis: {
                        title: {
                            text: '% worn'
                        },
                        min: 0,
                        max: 120,
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: '#808080'
                        }]
                    },
                    tooltip: {
                        formatter: function () {
                            if(this.point.options.dealer != "") {
                                return this.point.options.dealer + '<br/>' +
                                    this.point.options.machine + '<br/>' +
                                    this.y + '% worn<br/>' +
                                    this.x;
                                    //Highcharts.numberFormat(this.y, 2);
                            } else {
                                return this.point.options.machine + '<br/>' +
                                    this.y + '% worn<br/>' +
                                    this.x;
                                    //Highcharts.numberFormat(this.y, 2);
                            }
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    exporting: {
                        buttons: {
                            contextButton: {
                                menuItems: [
                                    {
                                        text: 'Download PDF',
                                        onclick: function () {
                                            this.exportChart({type: 'application/pdf'});
                                        },
                                        separator: false
                                    },
                                    {
                                        text: 'Download JPG',
                                        onclick: function () {
                                            this.exportChart({type: 'image/jpeg'});
                                        },
                                        separator: false
                                    },
                                    {
                                        text: 'Download SVG',
                                        onclick: function () {
                                            this.exportChart({type: 'image/svg+xml'});
                                        },
                                        separator: false
                                    }
                                ]
                            }
                        }
                    },
                    series: [{
                        name: 'Inspection',
                        data: arr
                        //data: dataArray
                    }]
                });
            });
        }

        $scope.UpdateWearAnalysisChart = function (obj)
        {
            // http://jsfiddle.net/gh/get/jquery/1.9.1/highslide-software/highcharts.com/tree/master/samples/highcharts/demo/scatter/

            //This is to plot the X-Axis in Days.
            var dayArray = xAxisPlot();

            var machinePlots = initializeMachinePoints();
            var regMachPlots = [];
            var result = obj.data.results;

            //This is bulk of the work of plotting the bar chart.
            angular.forEach(result, function (data) {
                //Cyle through Customer Names
                if (data.inspection_obj.machine !== undefined) {
                    //Get the highest rating
                    var ratings = [];
                    angular.forEach(data.inspection_obj.results, function (components) {
                        if (typeof components[0] !== 'undefined' &&
                            (typeof components[0].left !== 'undefined' || typeof components[0].right !== 'undefined') &&
                            (typeof components[0].left.percentage !== 'undefined' || typeof components[0].right.percentage !== 'undefined')) {

                            for (var i = 0; i < components.length; i++) {
                                ratings.push(parsePercent(components[i].left.percentage));
                                ratings.push(parsePercent(components[i].right.percentage));
                            }
                        }
                    });
                    var ratingArr = ratings.sort(function (a, b) {
                        return b - a;
                    });
                    if (typeof ratingArr[0] !== 'undefined' && !isNaN(ratingArr[0])) {
                        var machineName = data.inspection_obj.machine.model;
                        angular.forEach(machinePlots, function (plot) {
                            if (plot.name === machineName) {
                                var hour_meter_reading = data.inspection_obj.hour_meter_reading;
                                if(hour_meter_reading > 0 && ratingArr[0] > 0 && hour_meter_reading < 15000) {
                                    if ( (hour_meter_reading < 500 && ratingArr[0] < 30) ||
                                         (hour_meter_reading > 500 && hour_meter_reading < 1000 && ratingArr[0] < 50) ||
                                         (hour_meter_reading > 1000 && hour_meter_reading < 2000 && ratingArr[0] < 80) ||
                                         (hour_meter_reading > 2000 && hour_meter_reading < 3000) ||
                                         (hour_meter_reading > 3000 && hour_meter_reading < 7000 && ratingArr[0] <= 80) ||
                                         (hour_meter_reading > 7000 && hour_meter_reading < 8000 && ratingArr[0] <= 120)
                                        ){
                                        //([data.inspection_obj.hour_meter_reading, ratingArr[0]]);
                                        plot.regInspections.push({x: hour_meter_reading,
                                                            y: ratingArr[0],
                                                            marker: { symbol: getMachineTypeIcon(data.inspection_obj.machine.manufacturer_id, data.inspection_obj.machine.model, ratingArr[0], "s") }
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            });

            // Left y axis = % wear, x axis = machine type, right y axis = # of units
            var dataArray = [];

            angular.forEach(machinePlots, function(data) {
                if(data.regInspections.length > 0)
                    dataArray = dataArray.concat(data.regInspections);
            });

            // The actual Bar Chart
            wear_analysis_chart.highcharts({
                chart: { type: 'scatter' },
                title: { text: 'Life-cycle wear analysis' },
                xAxis: {
                    title: {
                        enabled: true,
                        text: 'Hours on machine'
                    },
                    startOnTick: true,
                    endOnTick: true,
                    showLastLabel: true,
                    min: 0
                },
                yAxis: {
                    min: 0,
                    max: 120,
                    title: {
                        text: '% worn'
                    }
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    scatter: {
                        marker: {
                            radius: 5,
                            states: {
                                hover: {
                                    enabled: true,
                                    lineColor: 'rgb(100,100,100)'
                                }
                            }
                        },
                        states: {
                            hover: {
                                marker: {
                                    enabled: false
                                }
                            }
                        },
                        tooltip: {
                            headerFormat: '<b>{series.name}</b><br>',
                            pointFormat: 'hours: {point.x}, % worn: {point.y}'
                        }
                    }
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: [
                                {
                                    text: 'Download PDF',
                                    onclick: function () {
                                        this.exportChart({type: 'application/pdf'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download JPG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/jpeg'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download SVG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/svg+xml'});
                                    },
                                    separator: false
                                }
                            ]
                        }
                    }
                },
                //series: dataArray
                series: [
                    {
                        regression: true ,
                        regressionSettings: {
                            type: 'linear'//,
                            //color:  'rgba(223, 83, 83, .9)'
                        },
                        name: 'Inspection',
                        //olor: 'rgba(223, 83, 83, .5)',
                        data: dataArray
                    }
                ]
            });
        }

        $scope.UpdateInspectionGaugeChart = function (obj)
        {
            // http://jsfiddle.net/gh/get/jquery/1.9.1/highslide-software/highcharts.com/tree/master/samples/highcharts/demo/gauge-solid/

            // initialize monthly & annual
            angular.forEach($scope.chartMonthly, function (data) {
                data.value = 0;
                data.total = 0;
            });
            angular.forEach($scope.chartAnnual, function (data) {
                data.value = 0;
                data.total = 0;
            });

            // render chart
            var result = obj.data.results;

            angular.forEach(result, function (data) {
                var modified = data.modified;
                angular.forEach($scope.chartMonthly, function (month) {
                    if(month.start <= modified && modified <= month.end) {
                        month.total++;
                        if (data.completed)
                            month.value++;
                    }
                });
                angular.forEach($scope.chartAnnual, function (year) {
                    var cDate = new Date(modified*1000);
                    if(cDate.getFullYear() == year.name) {
                        year.total++;
                        if (data.completed)
                            year.value++;
                    }
                });
            });

            // get averaging month & anual for completed & total
            var monthly_value = 0, monthly_total = 0, annual_value = 0, annual_total = 0;
            angular.forEach($scope.chartMonthly, function (month) {
                monthly_value += month.value;
                monthly_total += month.total;
            });
            monthly_value = parseInt(monthly_value / $scope.chartMonthly.length);
            monthly_total = parseInt(monthly_total / $scope.chartMonthly.length);

            angular.forEach($scope.chartAnnual, function (year) {
                annual_value += year.value;
                annual_total += year.total;
            });
            annual_value = parseInt(annual_value / $scope.chartAnnual.length);
            annual_total = parseInt(annual_total / $scope.chartAnnual.length);

            // set total again for chart
            //monthly_total = 170;
            //annual_total = 1200;

            var gaugeOptions = {
                chart: {
                    type: 'solidgauge'
                },
                title: null,
                pane: {
                    center: ['50%', '85%'],
                    size: '140%',
                    startAngle: -90,
                    endAngle: 90,
                    background: {
                        backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                        innerRadius: '60%',
                        outerRadius: '100%',
                        shape: 'arc'
                    }
                },
                tooltip: {
                    enabled: false
                },
                // the value axis
                yAxis: {
                    stops: [
                        [0.1, '#55BF3B'], // green
                        [0.5, '#DDDF0D'], // yellow
                        [0.9, '#DF5353'] // red
                    ],
                    lineWidth: 0,
                    minorTickInterval: 'auto', // null,
                    tickPixelInterval: 400,
                    tickWidth: 0,
                    title: {
                        y: -70
                    },
                    labels: {
                        y: 16,
                        style: {
                            fontSize:'18px'
                        }
                    }
                },
                plotOptions: {
                    solidgauge: {
                        dataLabels: {
                            y: 5,
                            borderWidth: 0,
                            useHTML: true
                        }
                    }
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: [
                                {
                                    text: 'Download PDF',
                                    onclick: function () {
                                        this.exportChart({type: 'application/pdf'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download JPG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/jpeg'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download SVG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/svg+xml'});
                                    },
                                    separator: false
                                }
                            ]
                        }
                    }
                }
            };

            // The Monthly gauge
            inspection_gauge_monthly_chart.highcharts(Highcharts.merge(gaugeOptions, {
                yAxis: {
                    min: 0,
                    max: monthly_total,
                    tickInterval: monthly_total / 2,
                    title: {
                        text: '' // Monthly Goal
                    }
                },

                credits: {
                    enabled: false
                },

                series: [{
                    name: 'Monthly Inspection',
                    data: [monthly_value],
                    dataLabels: {
                        format: '<div style="text-align:center;margin-top:20px;"><span style="font-size:24px;color:' +
                            ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                               '<span style="font-size:12px;color:silver">MTD Inspections</span></div>'
                    },
                    tooltip: {
                        valueSuffix: ' Monthly'
                    }
                }]

            }));

            // The Annual gauge
            inspection_gauge_annual_chart.highcharts(Highcharts.merge(gaugeOptions, {
                yAxis: {
                    min: 0,
                    max: annual_total,
                    tickInterval: annual_total / 2,
                    title: {
                        text: '' // Annual Goal
                    }
                },

                series: [{
                    name: 'Annual Inspection',
                    data: [annual_value],
                    dataLabels: {
                        format: '<div style="text-align:center;margin-top:20px;"><span style="font-size:24px;color:' +
                            ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                               '<span style="font-size:12px;color:silver">YTD Inspections</span></div>'
                    },
                    tooltip: {
                        valueSuffix: ' Annual'
                    }
                }]

            }));

        };

        $scope.UpdateMachinePopulationChart = function (obj)
        {
            console.log('called update machine population chart');
            var colors = Highcharts.getOptions().colors;

            // Initialize the data array first
            var manufacturerPlots = [];
            angular.forEach($scope.chartManufacturers, function (manufacturer, index) {
                manufacturerPlots.push({
                    name: manufacturer,
                    y: 0,
                    color: colors[index],
                    drilldown: {
                        name: manufacturer,
                        machineTypes: [],
                        data: []
                    }
                });
                angular.forEach($scope.chartMachineTypes, function (machine_type) {
                    if(machine_type !== "") {
                        manufacturerPlots[index].drilldown.machineTypes.push(machine_type);
                        manufacturerPlots[index].drilldown.data.push(0);
                    }
                });
            });

            var result = obj.data.results, total = 0;
            // retrieve data
            angular.forEach(result, function (data) {
                if (data.inspection_obj.manufacturer !== undefined && data.inspection_obj.machine !== undefined) {
                    var manufacturer = data.inspection_obj.manufacturer;
                    var machine = data.inspection_obj.machine;
                    angular.forEach(manufacturerPlots, function (plot) {
                        if (plot.name === manufacturer.company) {
                            angular.forEach(plot.drilldown.machineTypes, function (machineType, index) {
                                if(getMachineType(manufacturer.id, machine.model) == machineType) {
                                    total++;
                                    plot.y++;
                                    plot.drilldown.data[index]++;

                                    // test dummy data
                                    if(plot.name != "Caterpillar" || true) {
                                        total = total + 30;
                                        plot.y = plot.y + 30;
                                        plot.drilldown.data[index] = plot.drilldown.data[index] + 30;
                                    }
                                }
                            });
                        }
                    });
                }
            });

            var p, dataLen, browserData = [], versionsData = [], drillDataLen, brightness;
            dataLen = manufacturerPlots.length;
            // Build the data arrays
            for (var i = 0; i < dataLen; i += 1) {
                if(manufacturerPlots[i].y > 0) {
                    // add browser data
                    browserData.push({
                        name: manufacturerPlots[i].name,
                        y: manufacturerPlots[i].y,
                        percent: 0,
                        color: manufacturerPlots[i].color
                    });

                    browserData[browserData.length - 1].percent = Math.round((manufacturerPlots[i].y / total * 100) * 100)/100;

                    // add version data
                    drillDataLen = manufacturerPlots[i].drilldown.data.length;
                    for (var j = 0; j < drillDataLen; j += 1) {
                        brightness = 0.2 - (j / drillDataLen) / 5;
                        if(manufacturerPlots[i].drilldown.data[j] > 0) {
                            versionsData.push({
                                name: manufacturerPlots[i].drilldown.machineTypes[j],
                                y: manufacturerPlots[i].drilldown.data[j],
                                percent: 0,
                                color: Highcharts.Color(manufacturerPlots[i].color).brighten(brightness).get()
                            });
                            versionsData[versionsData.length - 1].percent = Math.round((manufacturerPlots[i].drilldown.data[j] / manufacturerPlots[i].y * 100) * 100)/100;
                        }
                    }
                }
            }

            machine_population_chart.highcharts({
                chart: {
                    type: 'pie'
                },
                title: {
                    text: 'Machine Population'
                },
                yAxis: {
                    title: {
                        text: 'Total percent machine population'
                    }
                },
                plotOptions: {
                    pie: {
                        shadow: false,
                        center: ['50%', '50%']
                    }
                },
                tooltip: {
                    //valueSuffix: '%',
                    formatter: function() {
                        var p = this.point.percent; // percentage of total
                        return "<b>" + this.point.name + "</b>: " + p + "%";
                    }
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: [
                                {
                                    text: 'Download PDF',
                                    onclick: function () {
                                        this.exportChart({type: 'application/pdf'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download JPG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/jpeg'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download SVG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/svg+xml'});
                                    },
                                    separator: false
                                }
                            ]
                        }
                    }
                },
                series: [{
                    name: 'Manufacturers',
                    data: browserData,
                    size: '80%',
                    dataLabels: {
                        formatter: function () {
                            //return this.y > 5 ? this.point.name : null;
                            var p = this.point.percent; // percentage of total
                            return p > 5 ? ("<b>" + this.point.name + "</b><br/>(" + p + "%)") : null;
                        },
                        color: 'white',
                        align: 'center',
                        distance: -50
                    }
                }, {
                    name: 'MachineTypes',
                    data: versionsData,
                    size: '100%',
                    innerSize: '80%',
                    dataLabels: {
                        formatter: function () {
                            // display only if larger than 1
                            //return this.y > 1 ? '<b>' + this.point.name + ':</b> ' + this.y + '%'  : null;
                            var p = this.point.percent; // percentage of total
                            return p > 1 ? '<b>' + this.point.name + ':</b> ' + p + '%'  : null;
                        }
                    }
                }]
            });
        }

        $scope.UpdateOpportunitiesConverstionsChart = function (obj)
        {
            //$scope.chartInspectors
            // Initialize the data array first
            var inspectorPlots = [];
            angular.forEach($scope.chartInspectors, function (inspector, index) {
                inspectorPlots.push({
                    name: inspector,
                    total: 0,
                    opportunities: 0,
                    quotes: 0,
                    parts: 0,
                    services: 0
                });
            });

            var result = obj.data.results, total = 0;
            // retrieve data
            angular.forEach(result, function (data) {
                if (data.inspection_obj.user !== undefined && data.inspection_obj.user != null) {
                    var user = data.inspection_obj.user;
                    angular.forEach(inspectorPlots, function (plot) {
                        if (plot.name === user.username) {
                            // put dummy data
                            var opportunity = 0, quote = 0, part = 0, service = 0;
                            opportunity = Math.round(Math.random()); // random 0 or 1
                            if(opportunity == 1) {
                                quote = Math.round(Math.random()); // random 0 or 1
                                if(quote == 1) {
                                    part = Math.round(Math.random()); // random 0 or 1
                                    service = Math.round(Math.random()); // random 0 or 1
                                }
                            }
                            plot.total++;
                            plot.opportunities = plot.opportunities + opportunity;
                            plot.quotes = plot.quotes + quote;
                            plot.parts = plot.parts + part;
                            plot.services = plot.services + service;
                        }
                    });
                }
            });

            // order by total
            inspectorPlots.sort(function(a, b){
                return (b.total - a.total);
            });

            var categories = [], dataArray = [];
            dataArray.push({name: 'Opportunities', data: [], color: '#178BA2', stack: 'bar1'});
            dataArray.push({name: 'Quotes', data: [], color: '#F38435', stack: 'bar1'});
            dataArray.push({name: 'Parts Tickets', data: [], color: '#7DC44E', stack: 'bar2'});
            dataArray.push({name: 'Service Tickets', data: [], color: '#6059A5', stack: 'bar3'});
            angular.forEach(inspectorPlots, function (data) {
                if(data.opportunities > 0 && data.total > 5) { // data.total > 10 for testing
                    // user inspector initials instead of user full name
                    if(data.name.indexOf("@") > 0) {
                        data.name = data.name.substring(0, data.name.indexOf("@"));
                    }
                    if(data.name.indexOf(" ") > 0) {
                        var matches = data.name.match(/\b(\w)/g);
                        var acronym = matches.join('').toUpperCase();
                        categories.push(acronym);
                    } else {
                        categories.push(data.name);
                    }
                    // calculate percentage with toal
                    var pct_opportunities = 0, pct_quotes = 0, pct_parts = 0, pct_services = 0;
                    pct_opportunities = Math.round((data.opportunities / data.total * 100) * 100)/100;
                    pct_quotes = Math.round((data.quotes / data.total * 100) * 100)/100;
                    pct_parts = Math.round((data.parts / data.total * 100) * 100)/100;
                    pct_services = Math.round((data.services / data.total * 100) * 100)/100;
                    dataArray[0].data.push({y: pct_opportunities - pct_quotes, insp_total: data.total});
                    dataArray[1].data.push({y: pct_quotes, insp_total: data.total});
                    dataArray[2].data.push({y: pct_parts, insp_total: data.total});
                    dataArray[3].data.push({y: pct_services, insp_total: data.total});
                }
            });
            var step = 1;
            var cutoff = 25;
            if(categories.length > cutoff)
            {
                step = Math.round(categories.length / cutoff);
            }

            opportunities_converstions_chart.highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'OPPORTUNITIES & CONVERSTIONS'
                },
                xAxis: {
                    categories: categories,
                    labels: {
                                rotation: 90,
                                step: step,
                                align: 'left'
                            }
                },
                yAxis: {
                    allowDecimals: false,
                    min: 0,
                    max: 100,
                    title: {
                        text: '% of Inspections'
                    },
                    labels: {
                        format: '{value}%'
                    }
                },
                tooltip: {
                    formatter: function () {
                        if(this.series.name == "Opportunities") {
                            return '<b>' + this.x + '</b><br/>' +
                                this.series.name + ': ' + this.point.stackTotal + '%<br/>' +
                                'Total Inspections: ' + this.point.insp_total;
                        } else {
                            return '<b>' + this.x + '</b><br/>' +
                                this.series.name + ': ' + this.y + '%<br/>' +
                                'Total Inspections: ' + this.point.insp_total;
                        }
                    }
                },
                plotOptions: {
                    column: {
                        stacking: 'normal'
                    }
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: [
                                {
                                    text: 'Download PDF',
                                    onclick: function () {
                                        this.exportChart({type: 'application/pdf'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download JPG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/jpeg'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download SVG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/svg+xml'});
                                    },
                                    separator: false
                                }
                            ]
                        }
                    }
                },
                series: dataArray
            });
        }

        $scope.UpdateMachineCphChart = function (obj)
        {
            var machinePlots = [];
            angular.forEach($scope.chartMachines, function (machine) {
                if(machine != '(null)') {
                    machinePlots.push({
                        'name': machine,
                        'm_cph': 0, // Machine CPH
                        'c_cph': 0, // Customer CPH
                        'total': 0
                    });
                }
            });

            var result = obj.data.results;
            // retrieve data
            angular.forEach(result, function (data) {
                if (data.inspection_obj.machine !== undefined) {
                    var machineName = data.inspection_obj.machine.model;
                    angular.forEach(machinePlots, function (plot) {
                        if (plot.name === machineName) {
                            plot.total++;
                        }
                    });
                }
            });

            // random values for test
            angular.forEach(machinePlots, function (plot) {
                plot.m_cph = parseFloat((Math.random() * 10).toFixed(2));
                plot.c_cph = parseFloat((Math.random() * 10).toFixed(2));
            });

            var categories = [], dataArray = [{name: 'Regional Machine CPH', color: '#56C6D2', data:[]}, {name: 'Customer XYZ Machine CPH', color: '#2E3192', data:[]}];
            angular.forEach(machinePlots, function (plot) {
                if( plot.total > 1 && (plot.m_cph > 1 && plot.c_cph > 1) && (plot.m_cph < 5 && plot.c_cph < 5) ){
                    categories.push(plot.name);

                    var m_total = 0, c_total = 0, p = Math.round(Math.random() * 100);
                    m_total = parseInt(plot.total * p / 100);
                    if(m_total == 0) {
                        m_total = 1;
                    }
                    c_total = plot.total - m_total;

                    //Regional machines will always be a greater number then customer XYZ machines.
                    if(c_total > m_total) {
                        var temp = m_total;
                        m_total = c_total;
                        c_total = temp;
                    }
                    if(m_total == 1) {
                        m_total = parseInt(m_total * Math.random() * 20);
                    }

                    dataArray[0].data.push({y: -1 * plot.m_cph, insp_total: m_total});
                    dataArray[1].data.push({y: plot.c_cph, insp_total: c_total});
                }
            });

            var step = 1;
            var cutoff = 20;
            if(categories.length > cutoff)
            {
                step = Math.round(categories.length / cutoff);
            }

            machine_cph_chart.highcharts({
                chart: {
                    type: 'bar'
                },
                title: {
                    text: 'AVERAGE CPH PER MACHINE VS CUSTOMER XYZ CPH'
                },
                xAxis: [{
                    categories: categories,
                    reversed: false,
                    labels: {
                        step: step
                    }
                }, { // mirror axis on right side
                    opposite: true,
                    reversed: false,
                    categories: categories,
                    linkedTo: 0,
                    labels: {
                        step: step
                    }
                }],
                yAxis: {
                    title: {
                        text: null
                    },
                    labels: {
                        formatter: function () {
                            return '$' + Math.abs(this.value);
                        }
                    },
                    min: -5,
                    max: 5
                },
                plotOptions: {
                    series: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true,
                            inside: false,
                            formatter: function () {
                                return this.point.insp_total;
                            }
                        }
                    }
                },
                tooltip: {
                    formatter: function () {
                        /*
                        return '<b>' + this.series.name + '</b><br/>' +
                            'CPH: $' + Highcharts.numberFormat(Math.abs(this.point.y), 2);
                        */
                        return '<b>' + this.key + '</b>: $' + Highcharts.numberFormat(Math.abs(this.point.y), 2);
                    }
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: [
                                {
                                    text: 'Download PDF',
                                    onclick: function () {
                                        this.exportChart({type: 'application/pdf'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download JPG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/jpeg'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download SVG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/svg+xml'});
                                    },
                                    separator: false
                                }
                            ]
                        }
                    }
                },
                series: dataArray
            });
        }

        $scope.UpdateDealerPerformanceChart = function (obj)
        {
            //This is to plot the X-Axis in Days.
            var dayArray = xAxisPlot();

            var dealerPlots = initializeDealerPoints();

            var result = obj.data.results;

            //This is bulk of the work of plotting the bar chart.
            angular.forEach(result, function (data) {
                //Cyle through Customer Names
                if (data.inspection_obj.dealer !== undefined && data.completed) {
                    var dealerName = data.inspection_obj.dealer.name;
                    var dealerID = data.inspection_obj.dealer.id;
                    var modified = data.modified;//modified, timestamp
                    angular.forEach(dealerPlots, function (plot) {
                        if (plot.name === dealerName) {
                            angular.forEach(plot.weeks, function (week) {
                                if(week.start <= modified && modified <= week.end) {
                                    week.y++;
                                }
                            });
                        }
                    });
                }
            });

            var xAxisArray = [];
            angular.forEach($scope.chartWeekly, function(data) {
                xAxisArray.push(data.name);
            });
            var dataArray = [];
            angular.forEach(dealerPlots, function(dealer) {
                switch(dealer.name) {
                    case "AgentX":
                        dealer.name = "NDUSTRIALIZADORA DANAMEX S.A";
                        break;
                    case "Altorfer":
                        dealer.name = "KOKUKA SHOKAI CO.,LTD";
                        break;
                    case "MacAllister":
                        dealer.name = "VOIGT WERKZEUGMASCHINEN";
                        break;
                    case "Ziegler":
                        dealer.name = "PERFECBORE LTD.";
                        break;
                    case "H.O.Penn":
                        dealer.name = "MENDHAM MACHINERY PTY. LTD.";
                        break;
                    case "Patten Cat":
                        dealer.name = "SUBRA DO BRASIL";
                        break;
                    case "Warren Cat":
                        dealer.name = "A.R.A. SRL";
                        break;
                    case "Empire Cat":
                        dealer.name = "";
                        break;
                    case "Thompson Machinery Cat":
                        dealer.name = "";
                        break;
                }
                if (dealer.name !== "") {
                    var arr = {name: dealer.name, data: []};
                    angular.forEach(dealer.weeks, function(week) {
                        arr.data.push(week.y);
                    });
                    dataArray.push(arr);
                }

            });
            var step = 1;
            var cutoff = 25;
            if(dataArray.length > cutoff)
            {
                step = Math.round(dataArray.length / cutoff);
            }
            //console.log("step: " + step);

            // The actual Bar Chart
            dealer_performance_chart.highcharts({
                chart: { type: 'spline' },
                title: { text: 'Dealer Performance' },
                //subtitle: { text: 'Customer Frequency Breakdown' },
                xAxis: {
                        categories: xAxisArray,
                        labels: {
                                    rotation: 90,
                                    step: step,
                                    align: 'left'
                                }
                },
                yAxis: {
                    min: 0,
                    title: { text: 'Number of Inspections' }
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    borderWidth: 0
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: [
                                {
                                    text: 'Download PDF',
                                    onclick: function () {
                                        this.exportChart({type: 'application/pdf'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download JPG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/jpeg'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download SVG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/svg+xml'});
                                    },
                                    separator: false
                                }
                            ]
                        }
                    }
                },
                series: dataArray
            });
        };

        $scope.UpdateAverageWearChart = function (obj)
        {

            //This is to plot the X-Axis in Days.
            var dayArray = xAxisPlot();

            var machinePlots = initializeMachinePoints();

            var result = obj.data.results;
            // order by result to get only 2 latest inspections
            result = $filter('orderBy')(result, '-timestamp');

            //This is bulk of the work of plotting the bar chart.
            angular.forEach(result, function (data) {
                //Cyle through Customer Names
                if (data.inspection_obj.machine !== undefined && data.completed) {

                    //Get the highest rating
                    var ratings = [];
                    angular.forEach(data.inspection_obj.results, function (components) {
                        if (typeof components[0] !== 'undefined' &&
                            (typeof components[0].left !== 'undefined' || typeof components[0].right !== 'undefined') &&
                            (typeof components[0].left.percentage !== 'undefined' || typeof components[0].right.percentage !== 'undefined')) {

                            for (var i = 0; i < components.length; i++) {
                                ratings.push(parsePercent(components[i].left.percentage));
                                ratings.push(parsePercent(components[i].right.percentage));
                            }
                        }
                    });
                    var ratingArr = ratings.sort(function (a, b) {
                        return b - a;
                    });
                    if (typeof ratingArr[0] !== 'undefined' && !isNaN(ratingArr[0])) {
                        var machineName = data.inspection_obj.machine.model;
                        angular.forEach(machinePlots, function (plot) {
                            if (plot.name === machineName) {
                                if(plot.inspections.length < 2) {
                                    plot.inspections.push({hour_meter_reading: data.inspection_obj.hour_meter_reading, rating: ratingArr[0]});
                                }
                            }
                        });
                    }

                }
            });

            var xAxisArray = [];
            var dataArray = [];
            angular.forEach(machinePlots, function(data) {
                if(data.inspections.length == 2)
                {
                    xAxisArray.push(data.name);
                    // Take the latest  inspection hour meter reading and subtract the previous inspection hour meter reading to get the total hours on parts
                    // hoursLeft = totalHoursOnParts * (worstPercent / 100)
                    var d = parseFloat(((data.inspections[0].hour_meter_reading - data.inspections[1].hour_meter_reading) * ((data.inspections[0].rating - data.inspections[1].rating) / 100)).toFixed(2));
                    if (d > 4000) {
                        data.y = d;
                        dataArray.push(data.y);
                    }
                }
            });
            var step = 1;
            var cutoff = 25;
            if(dataArray.length > cutoff)
            {
                step = Math.round(dataArray.length / cutoff);
            }
            // The actual Bar Chart
            average_wear_chart.highcharts({
                chart: { type: 'column' },
                title: { text: 'Average Hours of Machine Undercarriage' },
                //subtitle: { text: 'Machine Types Breakdown' },
                xAxis: {
                        categories: xAxisArray,
                        labels: {
                                    rotation: 90,
                                    //step: step,
                                    align: 'left'
                                }
                },
                yAxis: {
                    title: { text: 'Average Hours' }
                },
                tooltip: {
                    headerFormat: '<table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{point.category}: </td>' +
                        '<td style="padding:0"><b>{point.y}</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    },
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: false,
                            format: '{point.y}'
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: [
                                {
                                    text: 'Download PDF',
                                    onclick: function () {
                                        this.exportChart({type: 'application/pdf'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download JPG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/jpeg'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download SVG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/svg+xml'});
                                    },
                                    separator: false
                                }
                            ]
                        }
                    }
                },
                series: [{
                            name: 'Machines',
                            data: dataArray
                        }]
            });
            $('#spinner').hide();
        };

        $scope.UndercarriageBrandsChart = function (obj)
        {
            //This is to plot the X-Axis in Days.
            var dayArray = xAxisPlot();

            var manufacturerPlots = initializeManufacturersPoints();

            var result = obj.data.results;

            //This is bulk of the work of plotting the bar chart.
            angular.forEach(result, function (data) {
                //Cyle through Customer Names
                if (data.inspection_obj.manufacturer !== undefined && data.inspection_obj.machine !== undefined) {
                    var machine = data.inspection_obj.machine;
                    var manufacturer = data.inspection_obj.manufacturer;
                    angular.forEach(manufacturerPlots, function (plot) {
                        if (plot.name === manufacturer.company) {
                            if(plot.machines.indexOf(machine.model) == -1) {
                                plot.machines.push(machine.model);
                                plot.y++;
                            }
                        }
                    });
                }
            });

            var dataArray = [];
            angular.forEach(manufacturerPlots, function(data) {
                if(data.y > 0)
                {
                    dataArray.push({ name: data.name, y: data.y});
                }
            });

            // The actual Pie Chart
            undercarriage_brands_chart.highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: 1,//null,
                    plotShadow: false
                },
                title: { text: 'Undercarriage Brands' },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    }
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: [
                                {
                                    text: 'Download PDF',
                                    onclick: function () {
                                        this.exportChart({type: 'application/pdf'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download JPG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/jpeg'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download SVG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/svg+xml'});
                                    },
                                    separator: false
                                }
                            ]
                        }
                    }
                },
                series: [{
                            type: 'pie',
                            name: 'Undercarriage Brands',
                            data: dataArray
                        }]
            });
        }

        $scope.MachinesPercentageChart = function (obj)
        {

            //This is to plot the X-Axis in Days.
            var dayArray = xAxisPlot();

            var machinePlots = initializeMachinePoints();

            var result = obj.data.results;

            //This is bulk of the work of plotting the bar chart.
            angular.forEach(result, function (data) {
                //Cyle through Customer Names
                //if (data.inspection_obj.machine !== undefined && data.completed) {
                if (data.inspection_obj.machine !== undefined) {
                    var machineName = data.inspection_obj.machine.model;
                    angular.forEach(machinePlots, function (plot) {
                        if (plot.name === machineName) {
                            if(data.completed) {
                                plot.y++;
                            } else {
                                plot.n++;
                            }
                        }
                    });
                }
            });
            var xAxisArray = [];
            var dataArray = [], dataArray1 = [];
            angular.forEach(machinePlots, function(data) {
                if(data.y > 0 || data.n > 0)
                {
                    if (data.y >= 1) {
                        xAxisArray.push(data.name);
                        dataArray.push(data.y);
                        dataArray1.push(data.n);
                    }
                }
            });
            var step = 1;
            var cutoff = 25;
            if(dataArray.length > cutoff)
            {
                step = Math.round(dataArray.length / cutoff);
            }

            // The actual Pi Chart
            machines_percentage_chart.highcharts({
                chart: {
                    type: 'column'
                },
                title: { text: 'Percentage of Machines Inspected' },
                xAxis: {
                        categories: xAxisArray,
                        labels: {
                                    rotation: 90,
                                    step: step,
                                    align: 'left'
                                }
                },
                yAxis: {
                    min: 0,
                    title: { text: 'Number of Inspections' },
                    stackLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold',
                            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                        }
                    }
                },
                tooltip: {
                    formatter: function() {
                        return '<b>'+ this.x +'</b>: ' + this.y;
                        /*
                        return '<b>'+ this.x +'</b><br/>'+
                            this.series.name +': '+ this.y +'<br/>' +
                            'Total: '+ this.point.stackTotal; */
                    }
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        pointPadding: 0.2,
                        borderWidth: 0 /*,
                        dataLabels: {
                            enabled: true,
                            color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                            style: {
                                textShadow: '0 0 3px black, 0 0 3px black'
                            }
                        }*/
                    }
                },
                legend: {
                    enabled: false
                },
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: [
                                {
                                    text: 'Download PDF',
                                    onclick: function () {
                                        this.exportChart({type: 'application/pdf'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download JPG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/jpeg'});
                                    },
                                    separator: false
                                },
                                {
                                    text: 'Download SVG',
                                    onclick: function () {
                                        this.exportChart({type: 'image/svg+xml'});
                                    },
                                    separator: false
                                }
                            ]
                        }
                    }
                },
                series: [{
                            name: 'Total',
                            data: dataArray1
                        },{
                            name: 'Completed',
                            data: dataArray
                        }]
            });
        };

        //$scope.UpdateInspectorChart();
        //$scope.UpdateCustomerChart();
        //$scope.UpdateMachineChart();
        $scope.GetInspectionData();

        $scope.selectedChartByInspector = function () {
            if ($scope.inspectorChartSearchFilter === null) {
                $scope.filterChartByInspector = {};
            } else {
                $scope.filterChartByInspector = {inspection_obj: {user: {username: $scope.inspectorChartSearchFilter}}};
            }
        };

        $scope.selectedChartByCustomer = function () {
            if ($scope.customerChartSearchFilter === null) {
                $scope.filterChartByCustomer = {};
            } else {
                $scope.filterChartByCustomer = {inspection_obj: {customer: {name: $scope.customerChartSearchFilter}}};
            }
        };

        //======================================
        //      FUNCTIONS
        //======================================
        function getMonday(d) {
            d = new Date(d);
            var day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
            return new Date(d.setDate(diff));
        }

        function getFirstDayofMonth(d) {
            d = new Date(d);
            return (new Date(d.getFullYear(), d.getMonth(), 1));
        }

        function getLastDayofMonth(d) {
            d = new Date(d);
            //return (new Date(d.getFullYear(), d.getMonth() + 1, 0));
            return (new Date(d.getFullYear(), d.getMonth() + 1, 1)); // return next month first date because of moment js iterator
        }

        function getFirstDayofYear(d) {
            d = new Date(d);
            return (new Date(d.getFullYear(), 0, 1));
        }

        function xAxisPlot() {
            var dayArray = [];

            for (var i = 0; i <= calculateDays(); i++) {
                var xday = moment($scope.fromChartDate).add('days', i).format('MM/DD/YYYY hh:mm a');
                dayArray.push(xday);
            }
            return dayArray;
        }

        function dataPoints() {
            var points = [];

            for (var i = 0; i <= calculateDays(); i++) {
                points.push(0);
            }
            return points;
        }

        function calculateDays() {
            var millisecondsPerDay = 1000 * 60 * 60 * 24;
            var days = (new Date($scope.toChartDate) - new Date($scope.fromChartDate)) / millisecondsPerDay;
            return days + 1;
        }

        function validateDateRange() {
            var from_unix = moment($scope.fromChartDate).unix(),
                to_unix = moment($scope.toChartDate).unix();
            if(to_unix < from_unix) {
                alert("From date cannot be later than To date");
                return false;
            }
            return true;
        }

        function initializeInspectorPoints() {
            var placeholder = [];
            angular.forEach($scope.Chart.inspectors_list, function (data) {
                placeholder.push({
                    'name': data.name,
                    'y': 0
                    //'data': dataPoints()
                });
            });
            return placeholder;
        }

        function initializeCustomerPoints() {
            var placeholder = [];
            angular.forEach($scope.chartCustomers, function (customer) {
                placeholder.push({
                    'name': customer,
                    'y': 0
                    //'data': dataPoints()
                });
            });
            return placeholder;
        }

        function initializeMachineTypePoints() {
            var placeholder = [];
            angular.forEach($scope.chartMachineTypes, function (machine_type) {
                if(machine_type != "") {
                    placeholder.push({
                        'name': machine_type,
                        'y': 0,
                        'cnt': 0, // for average wear calculation & percentage of Machines inspected
                        'rating': 0 // for Machine population vs Wear : for % wear(rating)
                    });
                }
            });
            return placeholder;
        }

        function initializeMachinePoints() {
            var placeholder = [];
            angular.forEach($scope.chartMachines, function (machine) {
                placeholder.push({
                    'name': machine,
                    'type': '',
                    'y': 0,
                    'cnt': 0, // for average wear calculation & percentage of Machines inspected
                    'rating': 0, // for Machine population vs Wear : for % wear(rating)
                    'n': [], // for MachinesPercentageChart
                    'inspections': [], // for Average Hours of Machine Undercarriage : only add the latest 2 inspections
                    'regInspections': [] // for Life-cycle wear analysis
                });
            });
            return placeholder;
        }

        function initializeDealerPoints() {
            var placeholder = [];
            angular.forEach($scope.chartDealers, function (dealer) {
                var weekly = [];
                angular.forEach($scope.chartWeekly, function(week) {
                    weekly.push({start: week.start, end: week.end, name: week.name, y: 0});
                });
                placeholder.push({
                    'name': dealer,
                    'weeks': weekly,
                    'unix': [], // unix timestamp : Real Time Inspection Tracker
                    'y': 0
                    //'data': dataPoints()
                });
            });
            return placeholder;
        }

        function initializeManufacturersPoints() {
            var placeholder = [];
            angular.forEach($scope.chartManufacturers, function (manufacturer) {
                placeholder.push({
                    'name': manufacturer,
                    'machines': [],
                    'y': 0
                    //'data': dataPoints()
                });
            });
            return placeholder;
        }

        function getMachineType(manufacturer_id, model) {
            for(var i = 0; i < $scope.machines.length; i ++) {
                var obj = $scope.machines[i];
                if(obj.manufacturer_id == manufacturer_id && obj.model == model) {
                    var mtype = obj.type;
                    return mtype;
                }
            }
        }

        function getMachineTypeIcon(manufacturer_id, model, rating, size) {
            var color = "", name = "";
            if(rating > 70) {
                color = "_red";
            } else if(rating > 30) {
                color = "_yellow";
            } else {
                color = "_green";
            }

            var mtype = getMachineType(manufacturer_id, model);
            if(mtype == "Excavator") {
                name = "Excavator" + color;
            } else {
                name = "Bulldozer" + color;
            }

            name += "_" + size;
            return 'url(images/icons/machines/' + name + '.png)';
        }

        function removeMachineTypeDuplicates(results) {
            //Remove duplicate Customer Name
            var machineArr = [];
            var removedDupArr = [];
            angular.forEach(results, function (obj) {
                if (obj.type !== null
                    && obj.type !== undefined
                    && machineArr.indexOf(obj.type) == -1) {
                    machineArr.push(obj.type);
                }
            });
            $.each(machineArr, function (i, el) {
                if ($.inArray(el, removedDupArr) === -1) removedDupArr.push(el);
            });

            return removedDupArr;
        }

        function removeCustomerDuplicates(results) {
            //Remove duplicate Customer Name
            var customerArr = [];
            var removedDupArr = [];
            angular.forEach(results, function (obj) {
                if (obj.inspection_obj.customer !== null
                    && obj.inspection_obj.customer !== undefined
                    && customerArr.indexOf(obj.inspection_obj.customer.name) == -1) {
                    customerArr.push(obj.inspection_obj.customer.name);
                }
            });
            $.each(customerArr, function (i, el) {
                if ($.inArray(el, removedDupArr) === -1) removedDupArr.push(el);
            });

            return removedDupArr;
        }

        function removeMachineDuplicates(results) {
            //Remove duplicate Customer Name
            var machineArr = [];
            var removedDupArr = [];
            angular.forEach(results, function (obj) {
                if (obj.inspection_obj.machine !== null
                    && obj.inspection_obj.machine !== undefined
                    && machineArr.indexOf(obj.inspection_obj.machine.model) == -1) {
                    machineArr.push(obj.inspection_obj.machine.model);
                }
            });
            $.each(machineArr, function (i, el) {
                if ($.inArray(el, removedDupArr) === -1) removedDupArr.push(el);
            });

            return removedDupArr;
        }

        function removeDealerDuplicates(results) {
            //Remove duplicate Dealer Name
            var dealerArr = [];
            var removedDupArr = [];
            angular.forEach(results, function (obj) {
                if (obj.inspection_obj.dealer !== null && obj.completed
                    && obj.inspection_obj.dealer !== undefined
                    && dealerArr.indexOf(obj.inspection_obj.dealer.name) == -1
                    && obj.inspection_obj.dealer.name != "") {
                    dealerArr.push(obj.inspection_obj.dealer.name);
                }
            });
            $.each(dealerArr, function (i, el) {
                if ($.inArray(el, removedDupArr) === -1) removedDupArr.push(el);
            });

            return removedDupArr;
        }

        function removeInspectorDuplicates(results) {
            //Remove duplicate Dealer Name
            var inspectorArr = [];
            var removedDupArr = [];
            angular.forEach(results, function (obj) {
                if (obj.inspection_obj.user !== null
                    && obj.inspection_obj.user !== undefined
                    && inspectorArr.indexOf(obj.inspection_obj.user.username) == -1
                    && obj.inspection_obj.user.username != "") {
                    inspectorArr.push(obj.inspection_obj.user.username);
                }
            });
            $.each(inspectorArr, function (i, el) {
                if ($.inArray(el, removedDupArr) === -1) removedDupArr.push(el);
            });

            return removedDupArr;
        }

        function removeManufacturerDuplicates(results) {
            //Remove duplicate Manufacturer Name
            var manufacturerArr = [];
            var removedDupArr = [];
            angular.forEach(results, function (obj) {
                if (obj.inspection_obj.manufacturer !== null
                    && obj.inspection_obj.manufacturer !== undefined
                    && manufacturerArr.indexOf(obj.inspection_obj.manufacturer.company) == -1) {
                    manufacturerArr.push(obj.inspection_obj.manufacturer.company);
                }
            });
            $.each(manufacturerArr, function (i, el) {
                if ($.inArray(el, removedDupArr) === -1) removedDupArr.push(el);
            });

            return removedDupArr;
        }

        function parsePercent(val) {
            var arr;
            if (typeof val !== 'undefined' && val !== null && val !== "Hi" && val !== "Lo" && val !== "NA") {
                //arr = val.split('%');
                //return arr[0];
                return parseFloat(val);
            }
        }
    }
]);
