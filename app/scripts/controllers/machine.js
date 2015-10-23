/*global angular, Modustri,_*/
/**
 * @fileOverview Controller for viewing and editing machines.
 * @author Tim Snyder <tim.snyder@modustri.com>
 */

Modustri.controller('MachineCtrl', ['$log', '$scope', '$routeParams', '$location', 'MachineServices',
    'InsServices', 'CustomerServices', 'ScoreBoardServices', 'Utilities', 'AuthServices', 'UserServices', 'AppSettings',
    function ($log, $scope, $routeParams, $location, MachineServices, InsServices,
              CustomerServices, ScoreBoardServices, Utilities, AuthServices, UserServices, AppSettings) {

        "use strict";

        AuthServices.checkUserCreds();
        $scope.UserSettings = AuthServices.getUserSettings();

        var url = $location.url();
        var match = url.match(/edit/);
        var t_id;
        var cache;
        var dealer_id = AuthServices.getDealerID();

        $scope.image_upload = '';
        $scope.customer_changed = false;

        if (_.isArray(match) && match[0] === 'edit') {
            $scope.state = "edit";
        }
        else {
            $scope.state = "view";
        }

        $scope.AllMachineActionDates = [];
        $scope.MachineActions = [];
        
        MachineServices.get($routeParams.machineID, false).then(function (obj) {
            //does the user have permission to see this machine?
//            if(dealer_id !== obj.data.results.dealer_id){
//                $location.path('/dashboard');
//            }

            $scope.Machine = obj.data.results;
            $scope.Machine.serial = $scope.Machine.serial.trim().length > 0  ? $scope.Machine.serial : "N/A";
            $scope.Machine.equipment_id = $scope.Machine.equipment_id.trim().length > 0  ? $scope.Machine.equipment_id : "N/A";
            $scope.Machine.hide_upload = $scope.state === 'edit' ? false : true;
            $scope.Inspections = [];
            //set main photo for image.
            if ($scope.Machine.main_image_id !== "" && $scope.Machine.main_image_id !="false" && $scope.Machine.main_image_id !=0 && $scope.Machine.main_image_id!="(null)") {
                $scope.Machine.img = AppSettings.BASE_URL + "imgtmb/" + $scope.Machine.main_image_id + "/";
                $scope.Machine.img_full = AppSettings.BASE_URL + "img/" + $scope.Machine.main_image_id + "/";
                //cache the full image for the lightbox.
                t_id = setTimeout(function(){
                    cache = document.createElement('img');
                    cache.src = $scope.Machine.img_full;
                }, 0);
            }
            
            //get customer info for this machine.
            if(obj.data.results.customer_id != 0) {
                CustomerServices.get(obj.data.results.customer_id).then(function (obj) {
                    $scope.Customer = obj.data.results;
                    $scope.Machine.customer_name = obj.data.results.name;
                    $scope.Customer.url = '#/customers/' + obj.data.results.id + '/';
                    if($scope.Customer.primary_contact_id !== null && $scope.Customer.primary_contact_id !== 0){
                    	UserServices.getContactById($scope.Customer.primary_contact_id).then(function(obj){
			            	$scope.Customer.email = obj.data.results.email;
			            	console.log(obj.data.results);
			            });	
                    }else{
                    	$scope.Customer.email = "";
                    }
                });
            }
            
            //get all inspections for this machine and their details.
            InsServices.getByMachineId($scope.Machine.id).then(function (obj) {
                $scope.Inspections = obj.data.results.sort(function(a,b){
                	return b.timestamp - a.timestamp;
                });
                _.each($scope.Inspections, function (ins, index, list) {
                    ins.datestring = Utilities.getDatestring(ins.timestamp);
                    ins.update_datestamp = Utilities.getDatestring(ins.modified);
                    if (!ins.inspection_obj.hasOwnProperty('user') || ins.inspection_obj.user.username === undefined) {
                        ins.inspector = 'NA';
                    } else {
                        //if(ins.inspection_obj.user.hasOwnProperty('username'))
                        ins.inspector = ins.inspection_obj.user.username;
                    }
                    ins.imagescount = 0;
                    var ratings = [];
                    ins.components = [];
                    angular.forEach(ins.inspection_obj.results, function (components, key){
                        if (typeof components[0] !== 'undefined' &&
                            (typeof components[0].left !== 'undefined' || typeof components[0].right !== 'undefined') &&
                            (typeof components[0].left.percentage !== 'undefined' || typeof components[0].right.percentage !== 'undefined'))
                        {
                            for (var i = 0; i < components.length; i++)
                            {
                                ratings.push(parsePercent(components[i].left.percentage));
                                ratings.push(parsePercent(components[i].right.percentage));
                                components[i].component_type = key;
                                components[i].left.percent = parsePercent(components[i].left.percentage);
                                components[i].left.color = getColorFromPercent(components[i].left.percent);
                                components[i].right.percent = parsePercent(components[i].right.percentage);
                                components[i].right.color = getColorFromPercent(components[i].right.percent);
                                ins.components.push(components[i]);
                                if(components[i].left.hasOwnProperty('image_timestamp')) {
                                    ins.imagescount++;
                                }
                                if(components[i].right.hasOwnProperty('image_timestamp')) {
                                    ins.imagescount++;
                                }
                            }
                        }
                    });
                    var ratingArr = ratings.sort(function (a, b) {
                        return b - a;
                    });	                    
                    if (typeof ratingArr[0] === 'undefined') {
                        ins.rating = 'N/A';
                        ins.color = 'red';
                    } else {
                        ins.rating = ratingArr[0].toString() + '%';
                        ins.color = getColorFromPercent(ratingArr[0]);
                    }
                    ins.show_components = 0;
                });
            });

            //get manufacturers list for dropdown field.
            MachineServices.queryManufacturers().then(function (obj) {
                $scope.ManufacturerList = obj.data.results;
                //find the manufacturer for this machine, for the default view.
                var temp = _.where(obj.data.results, { id: $scope.Machine.manufacturer_id });
                var co = temp[0].company.trim();
                co = co.length > 0 ? co : "N/A";
                $scope.Machine.manufacturer_name = co;

                //get model list that goes with manufacturer.
                MachineServices.queryModels($scope.Machine.manufacturer_id).then(function (obj) {
                    $scope.ModelList = obj.data.results;
                });
            });

            //runs when the manufacturer dropdown is changed.
            //updates models appropriate for selected manufacturer.
            $scope.updateMachineModels = function (data) {
                MachineServices.queryModels($scope.Machine.manufacturer_id).then(function (obj) {
                    $scope.ModelList = obj.data.results;
                });
            };

            //update the model string var when the id changes in the dropdown
            $scope.$watch('Machine.model_id', function (new_val, old_val) {
                if (new_val === old_val) {
                    return;
                }
                var temp = (_.where($scope.ModelList, {id: new_val}));
                $scope.Machine.model = temp[0].model;
            });

            ScoreBoardServices.getAllScoreBoardData('actions', function(obj){
                $scope.MachineActions = obj.results;
                ScoreBoardServices.getAllScoreBoardData('machineactiondates', function(obj){
                    $scope.AllMachineActionDates = obj.results;
                    $scope.Machine.opportunity = '';
                    angular.forEach($scope.AllMachineActionDates, function (actiondate, key){
                        if(actiondate.machine_id == $routeParams.machineID){
                            $scope.Machine.opportunity = $scope.Machine.opportunity + $scope.MachineActions[parseInt(actiondate.action_id)-1].abr + ' ';
                        }
                    });
                });
            });
            

        });

        $scope.$watch('image_upload', function (new_val, old_val) {
            if (new_val === old_val) {
                return;
            }
        });

        $scope.saveMachine = function () {
            var img_payload = {};

            var save = function(){
                MachineServices.save($scope.Machine).then(function (obj) {
                    alert("Machine saved.");
                    $scope.$emit("machine_saved", obj);
                    if($scope.image_upload !== '') {
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
                        MachineServices.savePhoto(img_payload).then(function (obj) {
                            console.log('saved image');
                            console.dir(obj);
                            $location.path('/machines/' + $scope.Machine.id);
                        });
                    } else {
                        $location.path('/machines/' + $scope.Machine.id);
                    }
                });
            };

            delete $scope.Machine.archived;
            if($scope.customer_changed){
                var ins_id;
                //we need to update the customer info on every inspection
                InsServices.getByMachineId($scope.Machine.id).then(function(obj){
                    //save each ins
                    if(obj.data.results.length > 0){
                        angular.forEach(obj.data.results,  function(ins){
                           ins.customer_id = $scope.Machine.customer_id;
                           ins_id = ins.id;
                           delete ins.id;
                           delete ins.archived;
                           delete ins.modified;
                           ins.inspection_obj = JSON.stringify(ins.inspection_obj);
                           InsServices.save(ins, ins_id);
                        });
                    }
                    save();
                });
            }
            else{
                save();
            }
        };

        $scope.deleteMachine = function () {
            if (confirm("Are you sure you want to delete this machine?")) {
                MachineServices.del($scope.Machine.id).then(function (obj) {
                    $location.path('/machines/list/');
                });
            }
        };
        
        function parsePercent(val) {
            var arr;
            if (typeof val !== 'undefined' && val !== null && val !== "Hi" && val !== "Lo" && val !== "NA" && val !== "") {
                return parseFloat(val);
            }
        }
        
        function getColorFromPercent(val) {
            if (typeof val === 'undefined' || val ==='' || val===null) {
                return 'red';
            } else if (val > 69) {
                return 'red';
            } else if (val > 30 && val < 70) {
                return 'orange';
            } else if (val < 31) {
                return 'green';
            }
        }
        
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

    }]);