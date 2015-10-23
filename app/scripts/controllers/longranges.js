/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Controller for viewing and analyzing inspection data.
 * @author Joseph Hatton
 */

Modustri.controller('LongRangeCtrl', ['$log', '$scope', '$routeParams', '$location', '$http', 'CustomerServices', 'MachineServices',
    'InsServices', 'UserServices', 'AuthServices', 'Utilities', '$filter',
    function ($log, $scope, $routeParams, $location, $http, CustomerServices, MachineServices, InsServices, UserServices, AuthServices, Utilities, $filter) {

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

        $scope.Chart.inspections = {};

        $scope.fromChartDate = moment().subtract(120, 'days').format('MM/DD/YYYY');
        $scope.toChartDate = moment().format('MM/DD/YYYY');
        $scope.fromUnix = moment(new Date($scope.fromChartDate)).unix();
        $scope.toUnix = moment(new Date($scope.toChartDate)).unix();

        //===============================================================================
        //             CHARTS
        //===============================================================================

        var stock_chart = $('#stock-chart');

        //=====================
        //  UPDATE CHART EVENT
        //=====================
        $scope.UpdateChart = function () {
            var data = [];

            InsServices.getByDealerIdStartEnd(AuthServices.getDealerID(), $scope.fromUnix, $scope.toUnix).
                then(function (obj) {

                    var result = obj.data.results;

                    //This is to plot the X-Axis in Days.
                    data = dataSet();

                    //This is bulk of the work of plotting the bar chart.
                    angular.forEach(result, function (rs) {
                        //Cyle through Inspector Names
                        var plotTimeStamp = moment.unix(rs.timestamp).format('MM/DD/YYYY');
                        for (var i = 0; i < data.length; i++) {
                            var record = data[i];
                            if (record[0] === (new Date(plotTimeStamp).getTime())) {
                                record[1] = record[1] + 1;
                                continue;
                            }
                        }
                    });

                    stock_chart.highcharts('StockChart', {
                        rangeSelector: {
                            selected: 1,
                            inputEnabled: $('#stock-chart').width() > 480
                        },
                        title: {
                            text: 'Total Inspections vs. Days'
                        },
                        series: [
                            {
                                name: 'Inspection(s)',
                                data: data,
                                tooltip: {
                                    valueDecimals: 2
                                }
                            }
                        ],
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
                                                this.exportChart({type: 'image/JPEG'});
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
                    });
                });
        };

        $scope.UpdateChart();

        /* ---------------------------------------------------------------------
         Detail Graph
         ------------------------------------------------------------------------*/
        var detail_stock_chart = $('#detail-stock-chart');

        var inspectors = [];
        UserServices.getUsersByDealer(function (data) {
            angular.forEach(data.results, function (v) {
                inspectors.push(v.username);
            });
        });

        $scope.UpdateDetailChart = function () {

            var seriesOptions = [],
                yAxisOptions = [],
                seriesCounter = 0,
                colors = Highcharts.getOptions().colors;

            InsServices.getByDealerIdStartEnd(AuthServices.getDealerID(), $scope.fromUnix, $scope.toUnix).
                then(function (obj) {
                    var result = obj.data.results;

                    $.each(inspectors, function (i, inspector) {
                        //This is to plot the X-Axis in Days.
                        var data = dataSet();

                        //This is bulk of the work of plotting the bar chart.
                        angular.forEach(result, function (rs) {
                            if (rs.inspection_obj.user !== undefined) {
                                var name = rs.inspection_obj.user.username;
                                if (inspector === name) {
                                    //Cyle through Inspector Names
                                    var plotTimeStamp = moment.unix(rs.timestamp).format('MM/DD/YYYY');
                                    for (var i = 0; i < data.length; i++) {
                                        var record = data[i];
                                        if (record[0] === (new Date(plotTimeStamp).getTime())) {
                                            record[1] = record[1] + 1;
                                            continue;
                                        }
                                    }
                                }
                            }
                        });
                        seriesOptions[i] = {
                            name: inspector,
                            data: data
                        };

                        // As we're loading the data asynchronously, we don't know what order it will arrive. So
                        // we keep a counter and create the chart when all the data is loaded.
                        seriesCounter++;

                        if (seriesCounter == inspectors.length) {
                            createChart();
                        }
                    });
                });

            // create the chart when all data is loaded
            function createChart() {

                $('#detail-stock-chart').highcharts('StockChart', {
                    chart: { },
                    title: { text: 'Inspector Breakdowns vs. Days' },
                    rangeSelector: {
                        inputEnabled: $('#detail-stock-chart').width() > 480,
                        selected: 3
                    },
                    yAxis: {
                        labels: {
                            formatter: function () {
                                return this.value;
                            }
                        },
                        plotLines: [
                            {
                                value: 0,
                                width: 2,
                                color: 'silver'
                            }
                        ],
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
                                                this.exportChart({type: 'image/JPEG'});
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
                    },
                    tooltip: {
                        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b>',
                        valueDecimals: 2
                    },
                    series: seriesOptions
                });
            }
        };
        $scope.UpdateDetailChart();

        /* ---------------------------------------------------------------------
         Machine Graph
         ------------------------------------------------------------------------*/
        var machine_stock_chart = $('#machine-stock-chart');

        $scope.UpdateMachineChart = function () {

            var seriesOptions = [],
                yAxisOptions = [],
                seriesCounter = 0,
                colors = Highcharts.getOptions().colors;

            InsServices.getByDealerIdStartEnd(AuthServices.getDealerID(), $scope.fromUnix, $scope.toUnix).
                then(function (obj) {

                    var data = machineDataSet();
                    $scope.chartMachines = removeMachineDuplicates(obj.data.results);

                    var result = obj.data.results;
                    if ($scope.machineChartSearchFilter === undefined ||
                        $scope.machineChartSearchFilter === null) {
                        result = $filter('filter')(result, {});
                    } else {
                        result = $filter('filter')(result, {inspection_obj: {machine: {model: $scope.machineChartSearchFilter}}});
                    }
                    var intervalHolder = 0;
                    var ratingsHolder = [];

                    angular.forEach(result, function (rs) {
                        var plotTimeStamp = moment.unix(rs.timestamp).format('MM/DD/YYYY');
                        //Get the ratings
                        var ratings = [];

                        angular.forEach(rs.inspection_obj.results, function (components) {
                            if (components[0] !== undefined &&
                                (components[0].left !== undefined || components[0].right !== undefined) &&
                                (components[0].left.percentage !== undefined || components[0].right.percentage !== undefined)) {

                                for (var i = 0; i < components.length; i++) {
                                    ratings.push(parsePercent(components[i].left.percentage));
                                    ratings.push(parsePercent(components[i].right.percentage));
                                }
                            }
                        });
                        var ratingSort = ratings.sort(function (a, b) {
                            return a - b
                        });

                        if (intervalHolder !== plotTimeStamp) {
                            if (ratingSort.length > 1 && ratingSort[0] !== ratingSort[ratingSort.length - 1]) {
                                angular.forEach(data, function (rec) {
                                    if (rec[0] == new Date(plotTimeStamp).getTime()) {
                                        rec[1] = ratingSort[0];
                                        rec[2] = ratingSort[ratingSort.length - 1];
                                    }
                                });
                            }
                            intervalHolder = plotTimeStamp;
                            ratingsHolder = ratings;
                        } else {
                            angular.forEach(ratingsHolder, function (rating) {
                                ratings.push(rating);
                            });
                        }
                    });

                    machine_stock_chart.highcharts('StockChart', {
                        chart: {
                            type: 'arearange'
                        },

                        rangeSelector: {
                            inputEnabled: $('#machine-stock-chart').width() > 480,
                            selected: 1
                        },

                        title: {
                            text: 'Machine wear MAX-MIN variation '
                        },

                        tooltip: {
                            valueSuffix: ''
                        },

                        series: [
                            {
                                name: '%',
                                data: data
                            }
                        ],
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
                                                this.exportChart({type: 'image/JPEG'});
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
                    });
                });
        };
        $scope.UpdateMachineChart();


        //======================================
        //      FUNCTIONS
        //======================================

        function dataSet() {
            var dayArray = [];

            for (var i = 0; i <= calculateDays(); i++) {
                var xday = moment(new Date($scope.fromChartDate)).add(i, 'days').format('MM/DD/YYYY');
                dayArray.push([new Date(xday).getTime(), 0]);
            }
            return dayArray;
        }

        function machineDataSet() {
            var dayArray = [];

            for (var i = 0; i <= calculateDays(); i++) {
                var xday = moment(new Date($scope.fromChartDate)).add(i, 'days').format('MM/DD/YYYY');
                dayArray.push([new Date(xday).getTime(), 0, 0]);
            }
            return dayArray;
        }

        function removeDuplicateRatings(results) {
            //Remove duplicate Customer Name
            var removedDupArr = [];
            $.each(results, function (i, el) {
                if ($.inArray(el, removedDupArr) === -1) removedDupArr.push(el);
            });

            return removedDupArr;
        }

        function calculateDays() {
            var millisecondsPerDay = 1000 * 60 * 60 * 24;
            var days = (new Date($scope.toChartDate) - new Date($scope.fromChartDate)) / millisecondsPerDay;
            return days + 1;
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

        function parsePercent(val) {
            var arr = [];
            if (val === undefined ||
                val === "Hi" ||
                val === "Lo" ||
                val === "NA%" ||
                val === null ||
                val === "" ||
                val === "NA") return -1;
            arr = val.split('%');
            return parseInt(arr[0]);
        }

    }
]);
