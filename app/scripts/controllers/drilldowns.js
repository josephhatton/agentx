/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Controller for viewing and analyzing inspection data..
 * @author Joseph Hatton
 */

Modustri.controller('DrilldownCtrl', ['$log', '$scope', '$routeParams', '$location', '$http', 'CustomerServices', 'MachineServices',
    'InsServices', 'UserServices', 'AuthServices', 'Utilities', 'AppSettings', '$filter',
    function ($log, $scope, $routeParams, $location, $http, CustomerServices, MachineServices, InsServices, UserServices, AuthServices, Utilities, AppSettings, $filter) {

        "use strict";

        AuthServices.checkUserCreds();
        $scope.UserSettings = AuthServices.getUserSettings();

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
        $('#spinner').hide();

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

        $scope.fromChartDate = moment().subtract(7, 'days').format('MM/DD/YYYY');
        $scope.toChartDate = moment().format('MM/DD/YYYY');


        $scope.UpdateDateRangeData = function () {
            $('#spinner').show();
            $scope.showSpinner = true;
            $scope.UpdateDispatch();
            $scope.UpdateInspectorChart();
            $scope.UpdateCustomerChart();
            $scope.UpdateMachineChart();
        };

        $scope.UpdateDispatch = function () {
            //console.log('Update Chart');
            $scope.fromUnix = moment(new Date($scope.fromChartDate)).unix();
            $scope.toUnix = moment(new Date($scope.toChartDate)).unix();

            InsServices.getByDealerIdStartEnd(AuthServices.getDealerID(), $scope.fromUnix, $scope.toUnix).
                then(function (obj) {
                    var myins = obj.data.results;
                    _.each(obj.data.results, function (ins, index, list) {
                        myins[index].datestring = Utilities.getDatestring(ins.timestamp);
                    });
                    $scope.Chart.inspections = myins;
                });
        };

        $scope.UpdateDispatch();

        //===============================================================================
        //             CHARTS
        //===============================================================================
        //This is what I need to filter programmatically.
        //var selected = $filter('filter')($scope.dealers, {id: id});


        var inspector_chart = $('#total-inspections-chart');

        var customer_chart = $('#total-customers-chart');

        var machine_chart = $('#total-machines-chart');

        var drilldown_chart = $('#drilldown-chart');

        $scope.chartCustomers = [];

        $scope.chartMachines = [];

        //=====================
        //  UPDATE CHART EVENT
        //=====================
        $scope.UpdateInspectorChart = function () {
            $scope.fromUnix = moment(new Date($scope.fromChartDate)).unix();
            $scope.toUnix = moment(new Date($scope.toChartDate)).unix();

            InsServices.getByDealerIdStartEnd(AuthServices.getDealerID(), $scope.fromUnix, $scope.toUnix).
                then(function (obj) {
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
                        if (data.inspection_obj.user !== undefined) {
                            var name = data.inspection_obj.user.username;
                            angular.forEach(inspectorPlots, function (plot) {
                                if (plot.name === name) {
                                    var plotTimeStamp = Utilities.formatDatestring(data.timestamp);
                                    for (var i = 0; i < dayArray.length; i++) {
                                        if (moment(new Date(dayArray[i])).format('MM/DD/YYYY') === moment(new Date(plotTimeStamp)).format('MM/DD/YYYY')) {
                                            plot.data[i] = plot.data[i] + 1;
                                        }
                                    }
                                }
                            });
                        }
                    });

                    // The actual Bar Chart
                    inspector_chart.highcharts({
                        chart: { type: $scope.chartType },
                        title: { text: 'Inspections' },
                        subtitle: { text: 'Daily Inspection Breakdown' },
                        xAxis: { categories: dayArray,
                            title: { text: 'Days' }},
                        yAxis: {
                            min: 0,
                            title: { text: 'Number of Inspections' }
                        },
                        tooltip: {
                            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                                '<td style="padding:0"><b>{point.y}</b></td></tr>',
                            footerFormat: '</table>',
                            shared: true,
                            useHTML: true
                        },
                        plotOptions: {
                            column: {
                                pointPadding: 0.2,
                                borderWidth: 0
                            }
                        },
                        series: inspectorPlots
                    });
                });


            // Create the chart
            drilldown_chart.highcharts({
                chart: {
                    type: 'column',
                    events: {
                        drilldown: function (e) {
                            if (!e.seriesOptions) {

                                var chart = this,
                                    drilldowns = {
                                        'Animals': {
                                            name: 'Animals',
                                            data: [
                                                ['Cows', 2],
                                                ['Sheep', 3]
                                            ]
                                        },
                                        'Fruits': {
                                            name: 'Fruits',
                                            data: [
                                                ['Apples', 5],
                                                ['Oranges', 7],
                                                ['Bananas', 2]
                                            ]
                                        },
                                        'Cars': {
                                            name: 'Cars',
                                            data: [
                                                ['Toyota', 1],
                                                ['Volkswagen', 2],
                                                ['Opel', 5]
                                            ]
                                        }
                                    },
                                    series = drilldowns[e.point.name];

                                // Show the loading label
                                chart.showLoading('Simulating Ajax ...');

                                setTimeout(function () {
                                    chart.hideLoading();
                                    chart.addSeriesAsDrilldown(e.point, series);
                                }, 1000);
                            }

                        }
                    }
                },
                title: {
                    text: 'Drilldown'
                },
                xAxis: {
                    type: 'category'
                },

                legend: {
                    enabled: false
                },

                plotOptions: {
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                        }
                    }
                },

                series: [
                    {
                        name: 'Things',
                        colorByPoint: true,
                        data: [
                            {
                                name: 'Animals',
                                y: 5,
                                drilldown: true
                            },
                            {
                                name: 'Fruits',
                                y: 2,
                                drilldown: true
                            },
                            {
                                name: 'Cars',
                                y: 4,
                                drilldown: true
                            }
                        ]
                    }
                ],

                drilldown: {
                    series: []
                }
            });
        };

        $scope.UpdateCustomerChart = function () {
            $scope.fromUnix = moment(new Date($scope.fromChartDate)).unix();
            $scope.toUnix = moment(new Date($scope.toChartDate)).unix();

            InsServices.getByDealerIdStartEnd(AuthServices.getDealerID(), $scope.fromUnix, $scope.toUnix).
                then(function (obj) {
                    //This is to plot the X-Axis in Days.
                    var dayArray = xAxisPlot();

                    $scope.chartCustomers = removeCustomerDuplicates(obj.data.results);

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
                        if (data.inspection_obj.customer !== undefined) {
                            var custName = data.inspection_obj.customer.name;
                            angular.forEach(customerPlots, function (plot) {
                                if (plot.name === custName) {
                                    var plotTimeStamp = moment.unix(data.timestamp).format('MM/DD/YYYY');
                                    for (var i = 0; i < dayArray.length; i++) {
                                        if (moment(new Date(dayArray[i])).format('MM/DD/YYYY') === moment(new Date(plotTimeStamp)).format('MM/DD/YYYY')) {
                                            plot.data[i] = plot.data[i] + 1;
                                        }
                                    }
                                }
                            });
                        }
                    });

                    // The actual Bar Chart
                    customer_chart.highcharts({
                        chart: { type: $scope.chartType },
                        title: { text: 'Customers' },
                        subtitle: { text: 'Customer Frequency Breakdown' },
                        xAxis: { categories: dayArray,
                            title: { text: 'Days' }},
                        yAxis: {
                            min: 0,
                            title: { text: 'Number of Customers' }
                        },
                        tooltip: {
                            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                                '<td style="padding:0"><b>{point.y}</b></td></tr>',
                            footerFormat: '</table>',
                            shared: true,
                            useHTML: true
                        },
                        plotOptions: {
                            column: {
                                pointPadding: 0.2,
                                borderWidth: 0
                            }
                        },
                        series: customerPlots
                    });
                });
        };

        $scope.UpdateMachineChart = function () {
            $scope.fromUnix = moment(new Date($scope.fromChartDate)).unix();
            $scope.toUnix = moment(new Date($scope.toChartDate)).unix();

            InsServices.getByDealerIdStartEnd(AuthServices.getDealerID(), $scope.fromUnix, $scope.toUnix).
                then(function (obj) {
                    //This is to plot the X-Axis in Days.
                    var dayArray = xAxisPlot();

                    $scope.chartMachines = removeMachineDuplicates(obj.data.results);

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
                            var machineName = data.inspection_obj.machine.model;
                            angular.forEach(machinePlots, function (plot) {
                                if (plot.name === machineName) {
                                    var plotTimeStamp = moment.unix(data.timestamp).format('MM/DD/YYYY');
                                    for (var i = 0; i < dayArray.length; i++) {
                                        if (moment(new Date(dayArray[i])).format('MM/DD/YYYY') === moment(new Date(plotTimeStamp)).format('MM/DD/YYYY')) {
                                            plot.data[i] = plot.data[i] + 1;
                                        }
                                    }
                                }
                            });
                        }
                    });

                    // The actual Bar Chart
                    machine_chart.highcharts({
                        chart: { type: $scope.chartType },
                        title: { text: 'Machines' },
                        subtitle: { text: 'Machine Types Breakdown' },
                        xAxis: { categories: dayArray,
                            title: { text: 'Days' }},
                        yAxis: {
                            min: 0,
                            title: { text: 'Number of Inspections' }
                        },
                        tooltip: {
                            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                                '<td style="padding:0"><b>{point.y}</b></td></tr>',
                            footerFormat: '</table>',
                            shared: true,
                            useHTML: true
                        },
                        plotOptions: {
                            column: {
                                pointPadding: 0.2,
                                borderWidth: 0
                            }
                        },
                        series: machinePlots
                    });
                    $('#spinner').hide();
                });
        };

        $scope.UpdateInspectorChart();
        $scope.UpdateCustomerChart();
        $scope.UpdateMachineChart();

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
        function xAxisPlot() {
            var dayArray = [];

            for (var i = 0; i <= calculateDays(); i++) {
                var xday = moment(new Date($scope.fromChartDate)).add(i, 'days').format('MM/DD/YYYY');
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

        function initializeInspectorPoints() {
            var placeholder = [];
            angular.forEach($scope.Chart.inspectors_list, function (data) {
                placeholder.push({
                    'name': data.name,
                    'data': dataPoints()
                });
            });
            return placeholder;
        }

        function initializeCustomerPoints() {
            var placeholder = [];
            angular.forEach($scope.chartCustomers, function (customer) {
                placeholder.push({
                    'name': customer,
                    'data': dataPoints()
                });
            });
            return placeholder;
        }

        function initializeMachinePoints() {
            var placeholder = [];
            angular.forEach($scope.chartMachines, function (machine) {
                placeholder.push({
                    'name': machine,
                    'data': dataPoints()
                });
            });
            return placeholder;
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
    }
]);