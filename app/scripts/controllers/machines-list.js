/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Controller for viewing and editing customers.
 * @author Tim Snyder <tim.snyder@modustri.com>
 */

Modustri.controller('MachinesListCtrl', ['$log', '$scope', '$routeParams', '$location', 'MachineServices', 'CustomerServices',
    'InsServices', 'AuthServices', 'Utilities', 'AppSettings',
    function ($log, $scope, $routeParams, $location, MachineServices, CustomerServices,
              InsServices, AuthServices, Utilities, AppSettings) {

        "use strict";

        AuthServices.checkUserCreds();
        $scope.UserSettings = AuthServices.getUserSettings();

        var page = ($routeParams.page ? $routeParams.page : 1);
        var cache, t_id, c_id;
        $scope.uiToggle = function () {
            return AuthServices.uiToggle();
        };

        $scope.deleteMachine = function (machine_id, row) {
            if (confirm("Are you sure you want to delete this machine?")) {
                MachineServices.del(machine_id).then(function (obj) {
                    $scope.Machines.splice(row.$index, 1);
                    $scope.$emit("obj_deleted", 'Machine');
                });
            }
        };

        if(typeof $routeParams.customerID !== 'undefined'){
            c_id = $routeParams.customerID;
        }

        //note: this query is set up to always filter by dealer id.
        MachineServices.query(page, c_id).then(function (obj) {
            $scope.pages = obj.data.pages;
            $scope.Machines = obj.data.results;

            //grab customer and inspection data
            _.each($scope.Machines, function (machine, index, list) {
                MachineServices.queryManufacturers().then(function (obj) {
                    var ML = obj.data.results;
                    //find the manufacturer for this machine, for the default view.
                    var temp = _.where(ML, { id: machine.manufacturer_id });
                    $scope.Machines[index].manufacturer_name = temp[0].company;
                    //get model list that goes with manufacturer.
                    /*
                     MachineServices.queryModels($scope.Machine.manufacturer_id).then(function(obj){
                     $scope.ModelList = obj.data.results;
                     });
                     */
                });
                if (machine.main_image_id != "" && machine.main_image_id !== "0" && machine.main_image_id !== 0 && machine.main_image_id != "(null)") {
                    $scope.Machines[index].img = AppSettings.BASE_URL + "imgtmb/" + machine.main_image_id + "/";
                    $scope.Machines[index].img_full = AppSettings.BASE_URL + "img/" + machine.main_image_id + "/";
                    t_id = setTimeout(function(){
                        //cache the full image
                        cache = document.createElement('img');
                        cache.src = $scope.Machines[index].img_full;
                    }, 0);
                }

                CustomerServices.get(machine.customer_id).then(function (obj) {
                    machine.CustomerData = obj.data.results;
                });
                if (machine.last_inspected === 0) {
                    machine.latest_inspection = 'n/a';
                }
                else {
                    machine.latest_inspection = Utilities.getDatestring(machine.last_inspected);
                }
                InsServices.getNewestInspectionByMachineId(machine.id).then(function(obj){
                	if(obj.data.results[0]){
                		if(obj.data.results[0].inspection_obj.user){
                			machine.last_inspectorid = obj.data.results[0].inspection_obj.user.id;
                			machine.last_inspector = obj.data.results[0].inspection_obj.user.username;
                		}
                		var ratings = [];
	                    angular.forEach(obj.data.results[0].inspection_obj.results, function (components, key){
	                        if (typeof components[0] !== 'undefined' &&
	                            (typeof components[0].left !== 'undefined' || typeof components[0].right !== 'undefined') &&
	                            (typeof components[0].left.percentage !== 'undefined' || typeof components[0].right.percentage !== 'undefined'))
	                        {
	                            for (var i = 0; i < components.length; i++)
	                            {
	                                ratings.push(parsePercent(components[i].left.percentage));
	                                ratings.push(parsePercent(components[i].right.percentage));
	                            }
	                        }
	                    });
	                    var ratingArr = ratings.sort(function (a, b) {
	                        return b - a;
	                    });
	                    if (typeof ratingArr[0] === 'undefined') {
	                        machine.rating = 'N/A';
	                        machine.color = 'red';
	                    } else {
	                        machine.rating = ratingArr[0].toString() + '%';
	                        if (ratingArr[0] > 69) {
				                machine.color = 'red';
				            } else if (ratingArr[0] > 30 && ratingArr[0] < 70) {
				                machine.color = 'orange';
				            } else if (ratingArr[0] < 31) {
				                machine.color = 'green';
				            }
	                    }
                	}else{
                		machine.rating = 'N/A';
                		machine.color = 'red';
                	}
                });
            });
        });

        function parsePercent(val) {
            var arr;
            if (typeof val !== 'undefined' && val !== null && val !== "Hi" && val !== "Lo" && val !== "NA" && val !== "") {
                return parseFloat(val);
            }
        }

    }]);