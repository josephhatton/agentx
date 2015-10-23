/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Controller for adding new machines.
 * @author Tim Snyder <tim.snyder@modustri.com>
 */

Modustri.controller('MachineAddCtrl', ['$log', '$scope', '$routeParams', '$location', 'MachineServices',
    'CustomerServices', 'AuthServices', 'Utilities',
    function($log, $scope, $routeParams, $location, MachineServices,
        CustomerServices, AuthServices, Utilities) {

        "use strict";

        AuthServices.checkUserCreds();
        $scope.UserSettings = AuthServices.getUserSettings();

        $scope.Machine = MachineServices.getEmptyMachine();

        $scope.image_upload = '';

        //we'll set this to false for use with the ng-hide directive in the view.
        $scope.Machine.main_image_id = false;

        //attach the dealer id of the logged in user to the machine obj.
        $scope.Machine.dealer_id = AuthServices.getDealerID();

        //get manufacturers list for dropdown field.
        MachineServices.queryManufacturers().then(function(obj) {
            $scope.ManufacturerList = obj.data.results;
            //console.dir(obj.data.results);
            //get model list that goes with manufacturer.
            MachineServices.queryModels($scope.Machine.manufacturer_id).then(function(obj) {
                $scope.ModelList = obj.data.results;
            });
        });

        //runs when the manufacturer dropdown is changed.
        //updates models appropriate for selected manufacturer.
        //not crazy about this being so tightly coupled with the dom but oh well.
        $scope.updateMachineModels = function(obj) {
            MachineServices.queryModels($scope.Machine.manufacturer_id).then(function(obj) {
                $scope.ModelList = obj.data.results;
                console.log(JSON.stringify(obj.data.results));
            });
        };

        //update the model string var when the id changes in the dropdown
        $scope.$watch('Machine.model_id', function(new_val, old_val) {
            if (new_val === old_val) {
                return;
            } //first run
            var temp = (_.where($scope.ModelList, {
                id: new_val
            }));
            $scope.Machine.model = temp[0].model;
        });

        $scope.$watch('image_upload', function(new_val, old_val) {
            if (new_val === old_val) {
                return;
            }
        });

        $scope.saveMachine = function() {
            var img_payload = {};
            
            //Validation
            var validFlag = true;
            if (typeof $scope.Machine.manufacturer_id == 'undefined' || $scope.Machine.manufacturer_id == '') {
                alert('Please select manufacturer');
                validFlag = false;
            }
            else if (typeof $scope.Machine.serial == 'undefined' || $scope.Machine.serial == '') {
                alert('Please input serial number');
                validFlag = false;
            }
            else if ($scope.Machine.serial.length < 3) {
                alert('Serial number should be more than 3 chars');
                validFlag = false;
            }
            else if (typeof $scope.Machine.equipment_id == 'undefined' || $scope.Machine.equipment_id == '') {
                alert('Please input unit number');
                validFlag = false;
            }
            else if (typeof $scope.Machine.model == 'undefined' || $scope.Machine.model == '') {
                alert('Please select model');
                validFlag = false;
            }
            else if (typeof $scope.Machine.customer_name == 'undefined' || $scope.Machine.customer_name.trim() == '') {
                alert('Please input customer');
                validFlag = false;
            }
            
            //Form validation
            if (validFlag == false) {
                return;
            }
            
            //saving
            CustomerServices.getByName($scope.Machine.customer_name).then(function(result) {
                var validCustomer = false;
                angular.forEach(result.data.results, function (customer) {
                    if(!validCustomer) {
                        if($scope.Machine.customer_name == customer.name) {
                            $scope.Machine.customer_name = customer.name;
                            $scope.Machine.customer_id = customer.id;
                            validCustomer = true;
                        }
                    }
                });
                if(!validCustomer) {
                    alert('Customer doesn\'t exist');
                    return;
                }

                MachineServices.getBySerial($scope.Machine.serial).then(function (machine) {
                    if (machine.data.results.length == 0) {
                        MachineServices.saveNew($scope.Machine).then(function(obj) {
                            if (obj.data.errors.length > 0) {
                                alert("There was a problem saving the machine: " + obj.data.errors[0]);
                            } else {
                                $scope.$emit('machine_saved', obj);
                                if ($scope.image_upload) {
                                    console.log('uploading image');
                                    //now upload and save photo
                                    img_payload = {
                                        machine_obj: obj.data.results,
                                        machine_id: obj.data.results.id,
                                        file: $scope.image_upload,
                                        customer_id: obj.data.results.customer_id,
                                        description: "",
                                        user_id: AuthServices.getUserID()
                                        //name: 'file'
                                    };
                                    MachineServices.savePhoto(img_payload).then(function(obj) {
                                        console.log('saved image');
                                        console.dir(obj);
                                    });
                                }
                                alert("New machine saved.");
                                //angular's pub/sub
                                $scope.$emit("obj_saved", 'New ');
                                $location.path('/machines/list/');
                            }
                        });
                    } else {
                        alert('The same serial number already exists');
                        return;
                    }
                });

            });
        };

        $scope.deleteMachine = function() {
            alert("There is no machine to delete.");
        };

    }
]);
