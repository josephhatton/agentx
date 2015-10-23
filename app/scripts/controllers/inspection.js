/*global  moment, angular, $, alert,confirm,_, Modustri*/
/**
 * @fileOverview Controller for adding, editing, and viewing inspections.
 * @author Tim Snyder <tim.snyder@modustri.com>
 * @todo needs major refactoring - rework calls to functions with pub/sub pattern, consolidate with the permalink ctrl
 */

Modustri.controller('InspectionCtrl', ['$log', '$scope', '$q', '$routeParams',
    '$location', '$http', 'InsServices', 'CustomerServices',
    'MachineServices', 'UserServices', 'Utilities', 'AuthServices',
    'DealerServices', 'TemplateServices', 'AppSettings',
    function ($log, $scope, $q, $routeParams, $location, $http, InsServices, CustomerServices, MachineServices, UserServices,
              Utilities, AuthServices, DealerServices, TemplateServices, AppSettings) {

        "use strict";

        AuthServices.checkUserCreds();
        $scope.UserSettings = AuthServices.getUserSettings();

        var ui_const = 'uiinspections';
        var dealer_id = AuthServices.getDealerID();

        $scope.uiShow = function (f) {
            return AuthServices.uiToggle(AuthServices.getUserLevel(), ui_const, f);
        };

		$scope.savebtn_locked = false;

        //we want to keep the state (edit/view or add) on scope so
        //our directive can read it.
        $scope.state = null;
        $scope.is_latest_ins = false;

        $scope.photouploaded = [];

        $scope.Components = {};
        $scope.Measureable_parts = [];
        $scope.Tools = [];
        $scope.Summaries = [];
        $scope.Prev_ins = {};

        var date = new Date();
        $scope.today_unix = moment.utc().format('X');
        $scope.today_ds = Utilities.getDatestring($scope.today_unix);

        //check to see if we are viewing/editing an inspection, or creating a new one.
        if ("inspectionID" in $routeParams) {
            $scope.state = 'edit';
        } else {
            $scope.state = 'add';
        }

        //is this an undercarriage inspection?
        //defautls to true.
        var isUCI = function () {
            if ("inspectionTypeUCI" in $scope.Ins.inspection_obj === false) {
                return true;
            }
            return $scope.Ins.inspection_obj.inspectionTypeUCI;
        };

        $scope.condition_class = function (cond, side) {
            var classname = cond;
            if (side === "left") {
                classname += " left-percentage";
            }
            if (side === "right") {
                classname += " right-percentage";
            }
            return classname;
        };


        /**
         * @desc
         */

        var createInspectorList = function () {
            UserServices.query().then(function (obj) {
                var users = obj.results;

                $scope.Ins.inspection_obj.inspector = '';
                if ($scope.Ins.inspection_obj.user != undefined && $scope.Ins.inspection_obj.user.username != undefined) {
                    $scope.Ins.inspection_obj.inspector = $scope.Ins.inspection_obj.user.username;
                }


                $scope.UserList = users;

                $scope.$emit("inspector_list_loaded");
            });
        };


        /**
         * @desc
         */

        var setUpWatches = function(){
            //we need to update the corresponding machine record with the new hour meter reading when we save.
            $scope.$watch('Ins.inspection_obj.hour_meter_reading', function (nv, ov) {
                if (nv !== ov) {
                    $scope.Ins.inspection_obj.machine.hour_meter_reading = nv;
                }
            });

            //update user/inspector data when the id changes
            $scope.$watch('Ins.inspection_obj.user.id', function (nv, ov) {
                var user;
                if (nv !== ov) {
                    user = _.find($scope.UserList, function (x) {
                        return x.id === nv;
                    });
                    $scope.Ins.inspection_obj.user.username = user.username;
                    $scope.Ins.inspection_obj.user.userlevel = user.userlevel;
                    $scope.Ins.inspection_obj.user.archived = user.archived;
                    $scope.Ins.inspection_obj.user.customer_id = user.customer_id;
                    $scope.Ins.inspection_obj.user.dealer_id = user.dealer_id;
                    $scope.Ins.inspection_obj.user.email = user.email;
                }
            });

            //watch for changes on the machine serial num made by the autocomplete directive.
            //our auto-complete directive will update the machine obj for us.
            $scope.$watch('Ins.inspection_obj.machine.serial', function (new_val, old_val) {
                //if (new_val == old_val) return;
                if(new_val==''){
                	return;
                }
                getComponents();
                var temp;
                //get hour meter reading from machine
                MachineServices.getBySerial($scope.Ins.inspection_obj.machine.serial).then(function (obj) {
                    $scope.Ins.inspection_obj.hour_meter_reading = obj.data.results[0].hour_meter_reading;
                    if (obj.data.results[0].main_image_id !== "" && obj.data.results[0].main_image_id!="false" && obj.data.results[0].main_image_id!='(null)') {
                    	$scope.Ins.inspection_obj.machine.main_image_id = obj.data.results[0].main_image_id;
                        $scope.Ins.inspection_obj.machine.img = AppSettings.BASE_URL + "imgtmb/" + obj.data.results[0].main_image_id + "/";
                        $scope.Ins.inspection_obj.machine.img_full = AppSettings.BASE_URL + "img/" + obj.data.results[0].main_image_id + "/";
                    }else{
                    	$scope.Ins.inspection_obj.machine.main_image_id = "";
	                	$scope.Ins.inspection_obj.machine.img = "";
	                	$scope.Ins.inspection_obj.machine.img_full = "";
                    }
                    if (obj.data.results[0].manufacturer_id){
                    	$scope.Ins.inspection_obj.machine.manufacturer_id = obj.data.results[0].manufacturer_id;
                    	//get manufacturer name from id.
		                MachineServices.getManufacturerById($scope.Ins.inspection_obj.machine.manufacturer_id).then(function (obj) {
		                    $scope.Ins.inspection_obj.machine.manufacturer_name = obj.data.results.company;
		                });
                    }
                    $scope.Ins.inspection_obj.machine.under_carriage_brand = obj.data.results[0].under_carriage_brand;
                });
            });
        };

        /**
         * @desc Collect all the available components for a machine. Attaches them to $scope.Components.
         */
        var getComponents = function () {
            var d, t_id, index;
            var comp_type = '';

            getComponents.cache = getComponents.cache || { init: false };

            //I want to call a callback function after getting whole components
            Utilities.showLoading();
            getComponents.act_queue = {started:true, length:1};

            MachineServices.getComponentsByMachineModel($scope.Ins.inspection_obj.machine.model_id, function (obj) {
                $scope.Components = []; //clear out any previous component data.
                d = obj.results;

                if (d.length > 0) {
                    getComponents.act_queue.started = true;
                    getComponents.act_queue.length = d.length;
                }
                else {
                    //$emit 'completed'
                    Utilities.hideLoading();
                }

                for (var i = 0; i < d.length; i++) {
                    if (d[i].hasOwnProperty('component_id')) {
                        //add a component obj that includes wear maps.
                        MachineServices.createComponentObj($scope, d[i].component_id).then(function (obj) {
                            if(obj !== false)
                            {
                                comp_type = Utilities.snakeCase(obj.type);
                                if (comp_type !== 'idlers') {
                                    if (!$scope.Components[comp_type]) {
                                        $scope.Components[comp_type] = [];
                                    }
                                    if (!$scope.Components[comp_type]) {
                                        $scope.Components[comp_type] = [];
                                    }
                                    $scope.Components[comp_type].push(obj);
                                    if (typeof $scope.Components[comp_type] !== 'undefined' &&
                                        $scope.state == 'add' && getComponents.cache.init !== true) {
                                        if (typeof $scope.Ins.inspection_obj.results[comp_type] !== 'undefined') {
                                            $scope.Ins.inspection_obj.results[comp_type].model_id = $scope.Components[comp_type][0].component_id;
                                        }
                                    }
                                }
                                //we need to differentiate between front and rear idlers in our ui and inspection obj.
                                if (comp_type === 'idlers') {
                                    if (!$scope.Components.idlers_front) {
                                        comp_type = 'idlers_front';
                                        $scope.Components[comp_type] = [];
                                    }
                                    $scope.Components['idlers_front'].push(obj); //is this correct?
                                    if (typeof $scope.Components[comp_type] !== 'undefined' &&
                                        $scope.state == 'add' && getComponents.cache.init !== true) {
                                            if (typeof $scope.Ins.inspection_obj.results[comp_type] !== 'undefined') {
                                                $scope.Ins.inspection_obj.results[comp_type].model_id = $scope.Components[comp_type][0].component_id;
                                            }

                                    }
                                    if (!$scope.Components['idlers_rear']) {
                                        comp_type = 'idlers_rear';
                                        $scope.Components[comp_type] = [];
                                    }
                                    if (!$scope.Components[comp_type]) {
                                        $scope.Components[comp_type] = [];
                                    }
                                    $scope.Components[comp_type].push(obj);
                                    if (typeof $scope.Components[comp_type] !== 'undefined' &&
                                        $scope.state == 'add' && getComponents.cache.init !== true) {
                                            if (typeof $scope.Ins.inspection_obj.results[comp_type] !== 'undefined') {
                                                $scope.Ins.inspection_obj.results[comp_type].model_id = $scope.Components[comp_type][0].component_id;
                                            }
                                    }
                                }
                            }
                            //Calc
                            getComponents.act_queue.length --;
                            if (getComponents.act_queue.length == 0) {
                                getComponents.act_queue.started = false;
                                //$emit 'completed'
                                Utilities.hideLoading();
                            }
                        });
                    }
                }

                //this is a dirty hack and i feel awful for using it.
                /*t_id = setTimeout(function () {
                    getComponents.cache.init = true;
                    $scope.$emit("components_loaded");
                }, 1000);*/
            });
        };

        /**
         * @desc Populates dropdown list of Undercarriage manufacturers.
         */

        var createUCBrandsList = function () {
            MachineServices.getPartManufacturers().then(function (obj) {
                $scope.UndercarriageBrands = obj.data.results;
            });
        };

        /**
         * @param {string} part_type
         * @param {number} index (int)
         */

        $scope.removePart = function (part_type, index) {
            $scope.Ins.inspection_obj.results[part_type].splice(index, 1);
        };

        /**
         * @desc Updates all component ids & wear percents for a particular component type.
         * Triggered when the component model is changed in the UI.
         * @param {string} component_type Name of component from api in the format: 'Foo Bar'. Passed from UI.
         */

        $scope.updateAllComponentData = function (component_type) {
            //shortcut
            var ins = $scope.Ins.inspection_obj.results;
            //some wear percentages are adjusted based on allowable wear options.
            var wear_options = {
                bushing_allowable_wear: ins.bushing_allowable_wear,
                link_allowable_wear: ins.link_allowable_wear
            };

            wear_options.impact = ins.underfoot_conditions.impact;
            wear_options.abrasive = ins.underfoot_conditions.abrasive;
            wear_options.packing = ins.underfoot_conditions.packing;
            wear_options.moisture = ins.underfoot_conditions.moisture;

            //if this inspection has no measurement yet
            ins.underfoot_conditions = ins.underfoot_conditions || {};

            //we want to keep each component as 'atomic' and self-contained as possible,
            //thus the redundant model id on each one
            switch (component_type) {
                case 'Track Link':
                    _.forEach(ins['track_links'], function (component, component_index) {
                        component.left.id = component.right.id = ins['track_links'].model_id;
                        InsServices.setPercentages('track_links', component_index, wear_options, $scope, $scope.UserSettings.show_metric);
                    });
                    break;

                case 'Track Rollers':
                    _.forEach(ins['track_rollers'], function (component, component_index) {
                        component.left.id = component.right.id = ins['track_rollers'].model_id;
                        InsServices.setPercentages('track_rollers', component_index, wear_options, $scope, $scope.UserSettings.show_metric);
                    });
                    break;

                case 'Bushing':
                    _.forEach(ins['bushings'], function (component, component_index) {
                        component.left.id = component.right.id = ins['bushings'].model_id;
                        InsServices.setPercentages('bushings', component_index, wear_options, $scope, $scope.UserSettings.show_metric);
                    });
                    break;

                case 'Carrier Roller':
                    _.forEach(ins['carrier_rollers'], function (component, component_index) {
                        component.left.id = component.right.id = ins['carrier_rollers'].model_id;
                        InsServices.setPercentages('carrier_rollers', component_index, wear_options, $scope, $scope.UserSettings.show_metric);
                    });
                    break;

                case 'Idler':
                    _.forEach(ins['idlers'], function (component, component_index) {
                        component.left.id = component.right.id = ins['idlers'].model_id;
                        InsServices.setPercentages('idlers', component, component_index, $scope, $scope.UserSettings.show_metric);
                    });
                    break;

                case 'Idler Front':
                    _.forEach(ins['idlers_front'], function (component, component_index) {
                        component.left.id = component.right.id = ins['idlers_front'].model_id;
                        InsServices.setPercentages('idlers_front', component_index, wear_options, $scope, $scope.UserSettings.show_metric);
                    });
                    break;

                case 'Idler Rear':
                    _.forEach(ins['idlers_rear'], function (component, component_index) {
                        component.left.id = component.right.id = ins['idlers_rear'].model_id;
                        InsServices.setPercentages('idlers_rear', component_index, wear_options, $scope, $scope.UserSettings.show_metric);
                    });
                    break;

                case 'Pins and Bushings':
                    _.forEach(ins['pins_and_bushings'], function (component, component_index) {
                        component.left.id = component.right.id = ins['pins_and_bushings'].model_id;
                        InsServices.setPercentages('pins_and_bushings', component_index, wear_options, $scope, $scope.UserSettings.show_metric);
                    });
                    break;

                case 'Sprocket':
                    _.forEach(ins['sprockets'], function (component, component_index) {
                        component.left.id = component.right.id = ins['sprockets'].model_id;
                        InsServices.setPercentages('sprockets', component_index, wear_options, $scope, $scope.UserSettings.show_metric);
                    });
                    break;

                case 'Track Shoe':
                    _.forEach(ins['track_shoes'], function (component, component_index) {
                        component.left.id = component.right.id = ins['track_shoes'].model_id;
                        InsServices.setPercentages('track_shoes', component_index, wear_options, $scope, $scope.UserSettings.show_metric);
                    });
                    break;

                default:
            }
        };

        /**
         * @param {string} component_type Name of component from api in the format: 'Foo Bar'. Passed from UI.
         * @param {number} component_index (int) Passed from UI
         * @param {string} show_metric
         * @desc Triggered when measurement tool or measurement is changed in the UI.
         */

        $scope.updateWearPercentages = function (component_type, component_index, show_metric) {

            var ins = $scope.Ins.inspection_obj.results;
            //some wear percentages are adjusted based on allowable wear options.
            var wear_options = {
                bushing_allowable_wear: ins.bushing_allowable_wear,
                link_allowable_wear: ins.link_allowable_wear
            };
            wear_options.impact = ins.underfoot_conditions.impact;
            wear_options.abrasive = ins.underfoot_conditions.abrasive;
            wear_options.packing = ins.underfoot_conditions.packing;
            wear_options.moisture = ins.underfoot_conditions.moisture;

            //if this inspection has no measurement yet
            ins.underfoot_conditions = ins.underfoot_conditions || {};

            switch (component_type) {
                case 'Track Link':
                    InsServices.setPercentages('track_links', component_index, wear_options, $scope, show_metric);
                    break;

                case 'Track Rollers':
                    InsServices.setPercentages('track_rollers', component_index, wear_options, $scope, show_metric);
                    break;

                case 'Bushing':
                    InsServices.setPercentages('bushings', component_index, wear_options, $scope, show_metric);
                    break;

                case 'Bushings':
                    InsServices.setPercentages('bushings', component_index, wear_options, $scope, show_metric);
                    break;

                case 'Carrier Roller':
                    InsServices.setPercentages('carrier_rollers', component_index, wear_options, $scope, show_metric);
                    break;

                case 'Idler':
                    InsServices.setPercentages('idlers', component_index, wear_options, $scope, show_metric);
                    break;

                case 'Idler Front':
                    InsServices.setPercentages('idlers_front', component_index, wear_options, $scope, show_metric);
                    break;

                case 'Idler Rear':
                    InsServices.setPercentages('idlers_rear', component_index, wear_options, $scope, show_metric);
                    break;

                case 'Pins and Bushings':
                    InsServices.setPercentages('pins_and_bushings', component_index, wear_options, $scope, show_metric);
                    break;

                case 'Sprocket':
                    InsServices.setPercentages('sprockets', component_index, wear_options, $scope, show_metric);
                    break;

                case 'Track Shoe':
                    InsServices.setPercentages('track_shoes', component_index, wear_options, $scope, show_metric);
                    break;

                default:
            }
        };

        $scope.toggleCompleted = function () {
            if ($scope.Ins.completed === 1) {
                $scope.Ins.completed = 0;
            } else {
                $scope.Ins.completed = 1;
            }
        };

        $scope.addPart = function (part_type) {
            var part_obj = {
                "left": {
                    "measured": "",
                    "id": "",
                    "percent": "",
                    "tool": "",
                    "tool_type": "",
                    "notes": ""
                },
                "right": {
                    "measured": "",
                    "id": "",
                    "percent": "",
                    "tool": "",
                    "notes": ""
                }
            };

            if ("results" in $scope.Ins.inspection_obj === false) {
                $scope.Ins.inspection_obj.results = {};
            }

            if (typeof $scope.Ins.inspection_obj.results[part_type] === 'undefined') {
                $scope.Ins.inspection_obj.results[part_type] = [];
                $scope.Ins.inspection_obj.results[part_type].model_id = '';
            }

            //all components should be the same model
            part_obj.left.id = part_obj.right.id = $scope.Ins.inspection_obj.results[part_type].model_id;

            //add the component to scope
            $scope.Ins.inspection_obj.results[part_type].unshift(part_obj);
        };


        /**
         * @desc EDIT or VIEW an inspection (they both use the same data)
         */

        $scope.general_images = [];
        if ($scope.state === 'edit') {
            //load data and bind to the template.
            InsServices.get($routeParams.inspectionID).then(function (obj) {
                $scope.Ins = obj.data.results;
                // console.dir($scope.Ins);
                // Get Machine Details again because some machine details doesn't return properly
                MachineServices.get($scope.Ins.inspection_obj.machine.id, false).then(function (m) {
                    var machine = m.data.results;
                    if (machine.main_image_id !== "" && machine.main_image_id > 0) {
                        $scope.Ins.inspection_obj.machine.main_image_id = machine.main_image_id;
                        $scope.Ins.inspection_obj.machine.img = AppSettings.BASE_URL + "imgtmb/" + machine.main_image_id + "/";
                        $scope.Ins.inspection_obj.machine.img_full = AppSettings.BASE_URL + "img/" + machine.main_image_id + "/";
                    }
                    if(machine.manufacturer_id){
                    	$scope.Ins.inspection_obj.machine.manufacturer_id = machine.manufacturer_id;
                    	MachineServices.getManufacturerById($scope.Ins.inspection_obj.machine.manufacturer_id).then(function (obj) {
		                    $scope.Ins.inspection_obj.machine.manufacturer_name = obj.data.results.company;
		                });
                    }
                    if(machine.model)
                    	$scope.Ins.inspection_obj.machine.model = machine.model;
                });

                if($scope.Ins.inspection_obj.general!==undefined){
                    _.each($scope.Ins.inspection_obj.general.template_inspection_types, function(template_inspection_type, index, list){
                    	$scope.templatetype_showhide[index] = 1;
                        _.each(template_inspection_type.inspection_type_tasks, function(task, index, list){
                            task.task_instructions_object = angular.fromJson(task.task_instructions);
                            _.each(task.task_instructions_object.steps, function(step, index, list){
                                if(step.photos){
                                	step.photos.url = [];
                                    step.photos.newimage = [];
                                	_.each(step.photos.value, function(photo, index, list){
                                		if(photo==""){
                                			step.photos.url.push("");
                                		}else{
                                			step.photos.url.push(AppSettings.BASE_URL + 'imgtmb/'+ photo);
                                		}
                                        step.photos.newimage.push(false);
                                	});
                                }
                                if(step.rating){
                                    if(!step.rating.rating_increment){
                                        step.rating.rating_min = 1;
                                        step.rating.rating_max = 10;
                                        step.rating.rating_increment = 1;
                                    }
                                    step.rating.values = [];
                                    for(var v=step.rating.rating_min; v<=step.rating.rating_max; v+=step.rating.rating_increment){
                                        step.rating.values.push(v);
                                    }
                                    step.rating.width = ((step.rating.value-step.rating.rating_min)/step.rating.rating_increment+1)*20;
                                    step.rating.width_gray = ((step.rating.rating_max-step.rating.value)/step.rating.rating_increment)*20;
                                }
                                if(step.boolean){
                                	if(!step.boolean.boolean_type || step.boolean.boolean_type==0){
                                		step.boolean.values = {
                                			0: 'Incomplete',
                                			1: 'Complete',
                                		};
                                	}else if(step.boolean.boolean_type==1){
                                		step.boolean.values = {
                                			0: 'No',
                                			1: 'Yes',
                                		};
                                	}else if(step.boolean.boolean_type==2){
                                		step.boolean.values ={
                                			0: 'Off',
                                			1: 'On',
                                		}
                                	}
                                }
                            });
                        });
                    });
                }

                $scope.Measureable_parts = [];
                var ins = {};
                $scope.Prev_ins = false;

                //if there are no inspection results - perhaps an inspection was created
                //but no data ever entered?
                if ("results" in $scope.Ins.inspection_obj === false) {
                    $scope.Ins.inspection_obj.results = {};
                }

                //we need to get unit number if it isn't already on the inspection
                MachineServices.queryPhotos($scope.Ins.inspection_obj.machine.id).then(function(obj ){
                    //http://api.modustri.com/v1/imgtmb/14965/
                    angular.forEach(obj.data.results, function (value, key) {
                        if (value.description == "General Image" && value.inspection_id == $routeParams.inspectionID) {
                            $scope.general_images.push({"url" : AppSettings.BASE_URL + 'imgtmb/'+ value.id, "name" : value.description});
                        }
                    });
                });

                if($scope.Ins.inspection_obj.machine.main_image_id=="false"){
                	$scope.Ins.inspection_obj.machine.main_image_id = "";
                	$scope.Ins.inspection_obj.machine.img = "";
                	$scope.Ins.inspection_obj.machine.img_full = "";
                }
                //we need to get unit number if it isn't already on the inspection
                MachineServices.get($scope.Ins.machine_id).then(function(obj){
                    $scope.Ins.inspection_obj.machine.equipment_id = obj.data.results.equipment_id;
                    if($scope.Ins.inspection_obj.machine.id < 1) {
                        $scope.Ins.inspection_obj.machine.id = $scope.Ins.machine_id;
                    }

                    $scope.Ins.inspection_obj.machine.serial = obj.data.results.serial;
                    // set machine image again if not yet have in json
                    if($scope.Ins.inspection_obj.machine.main_image_id == 0 && obj.data.results.main_image_id > 0) {
                        // img and img_full of machine is not yet set correctly, here set img again
                        $scope.Ins.inspection_obj.machine.main_image_id = obj.data.results.main_image_id;
                        $scope.Ins.inspection_obj.machine.img = AppSettings.BASE_URL +
                            "imgtmb/" + $scope.Ins.inspection_obj.machine.main_image_id + "/";
                        $scope.Ins.inspection_obj.machine.img_full = AppSettings.BASE_URL +
                            "/img/" + $scope.Ins.inspection_obj.machine.main_image_id + "/";
                    }
                });

                //get customer data - the customer data in the inspection obj may not be up to date
                CustomerServices.get($scope.Ins.customer_id).then(function (obj) {
                    var c = obj.data.results;
                    $scope.Ins.inspection_obj.customer = $scope.Ins.inspection_obj.customer || {};
                    $scope.Ins.inspection_obj.customer.name = c.name;
                    $scope.Ins.customer_name = c.name;
                    $scope.Ins.inspection_obj.customer.id = c.id;
                    $scope.Ins.inspection_obj.customer.address = c.address;
                    $scope.Ins.inspection_obj.customer.city = c.city;
                    $scope.Ins.inspection_obj.customer.state = c.state;
                    $scope.Ins.inspection_obj.customer.zip = c.zip;
                    $scope.Ins.inspection_obj.customer.primary_contact_id = c.primary_contact_id;
                    $scope.$emit('inspection_loaded', $scope.Ins);
                });

                //get previous inspection so we can calculate wear dates and
                //find out if this is the latest inspection or not, so we
                //know whether to update the machine record as well.
                InsServices.getByMachineId($scope.Ins.machine_id).then(function (obj) {
                    $scope.prev_ins_arr = obj.data.results;
                    if ($scope.prev_ins_arr.length > 0) {
                        $scope.prev_ins_arr.sort(function (a, b) {
                            if (parseInt(a.timestamp, 10) < parseInt(b.timestamp, 10)) {
                                return 1;
                            }
                            if (parseInt(a.timestamp, 10) > parseInt(b.timestamp, 10)) {
                                return -1;
                            }
                            if (parseInt(a.timestamp, 10) === parseInt(b.timestamp, 10)) {
                                return 0;
                            }
                        });

                        //is this inspection the latest?
                        if ($scope.Ins.timestamp == $scope.prev_ins_arr[0].timestamp) {
                            $scope.is_latest_ins = true;
                            $scope.Prev_ins = $scope.prev_ins_arr[1];
                        }
                        //if not, find the previous inspection
                        else{
                            for(var i = 1; i <= $scope.prev_ins_arr.length; i++){
                                if($scope.prev_ins_arr[i] !== undefined)
                                {
                                    if(parseInt($scope.prev_ins_arr[i].timestamp, 10) < parseInt($scope.Ins.timestamp, 10)){
                                        $scope.Prev_ins = $scope.prev_ins_arr[i];
                                        break;
                                    }}
                            }
                        }
                    }

                    if($scope.Prev_ins){
                        // console.dir('some stuff is being called');
                        InsServices.getFailureDates($scope);
                    }

                    InsServices.buildSummariesTable($scope);

                });

                InsServices.cleanUpNulls($scope);

                $scope.Ins.datestring = Utilities.getDatestring($scope.Ins.timestamp);
                $scope.Ins.dealer_id = AuthServices.getDealerID();

                InsServices.setMainPhoto($scope);

                //make sure each component container has an id, and add condition verbage for the ui
                _.each($scope.Ins.inspection_obj.results, function (obj, index, list) {
                    if (!obj.hasOwnProperty('model_id') || !obj.model_id) {
                        for(var z in obj)
                        {
                            if (typeof obj[z] !== 'undefined' && obj[z].hasOwnProperty('left'))
                            {
                                obj.model_id = obj[z].left.id || obj[z].right.id;
                                var plm = obj[z].left.measured;
                                var plmm = false;
                                var prm = obj[z].right.measured;
                                var prmm = false;
                                if(!obj[z].left.hasOwnProperty('measured_metric'))
                                {
                                    if(plm !== 0 && plm !== false)
                                    {
                                        plmm = plm / 0.03937;
                                    }
                                    if(isNaN(plmm))
                                    {
                                        obj[z].left.measured_metric = '';
                                    }else{
                                        obj[z].left.measured_metric = Math.round(plmm,2);
                                    }
                                }
                                if(!obj[z].right.hasOwnProperty('measured_metric'))
                                {
                                    if(prm !== 0)
                                    {
                                        prmm = prm / 0.03937;
                                    }if(isNaN(prmm))
                                    {
                                        obj[z].right.measured_metric = '';
                                    }else{
                                        obj[z].right.measured_metric = Math.round(prmm,2);
                                    }
                                }
                            }
                        }
                    }
                    _.each(obj, function (comp, comp_index, comp_list) {
                        InsServices.setCondition(list, index, comp_index);
                        if(comp.hasOwnProperty('left') && comp.left.hasOwnProperty('id') && comp.left.id!=null){
                            MachineServices.getComponentData(comp.left.id).then(function (obj) {
                                comp.left.compdata = obj.data.results;
                            });
                        }
                        if(comp.hasOwnProperty('right') && comp.right.hasOwnProperty('id') && comp.right.id!=null){
                            MachineServices.getComponentData(comp.right.id).then(function (obj) {
                                comp.right.compdata = obj.data.results;
                            });
                        }
                        if(comp.hasOwnProperty('left') && comp.left.hasOwnProperty('install_date')){
                        	comp.left.install_datestring = Utilities.getDatestring(comp.left.install_date);
                        }
                        if(comp.hasOwnProperty('right') && comp.right.hasOwnProperty('install_date')){
                        	comp.right.install_datestring = Utilities.getDatestring(comp.right.install_date);
                        }
                    });
                });

                MachineServices.getInspectionPhotos($scope.Ins.id).then(function (obj) {
                    InsServices.renderInspectionPhotos($scope, obj);
                });

                //get all the selectable components for this machine.
                getComponents();
                createInspectorList();
                createUCBrandsList();

                InsServices.getToolTypes().then(function (obj) {
                    $scope.Tools = obj.data.results;
                });

                //get dealer logo
                DealerServices.getDealerImg(dealer_id).then(function(obj){
                    if("image_id" in obj.data.results && obj.data.results.image_id !== null){
                        $scope.Ins.dealer_img_url = AppSettings.BASE_URL + 'img/' + obj.data.results.image_id + '/';
                    }
                    else{
                        $scope.Ins.dealer_img_url = false;
                    }
                });

                //shortcut
                ins = $scope.Ins.inspection_obj.results;

                //set up components
                MachineServices.getComponentTypesMachineNames().then(function (measureable_parts_obj) {
                    $scope.Measureable_parts = measureable_parts_obj;
                    angular.forEach(ins, function (value, key) {
                        if (_.contains($scope.Measureable_parts, key)) {
                            angular.forEach(ins[key], function (value2, key2) {
                                InsServices.setMeasurementToolNames($scope, ins[key][key2]);
                                InsServices.setComponentDescription(ins[key][key2]);
                            });
                        }
                    });
                    setUpWatches();
                });
                //console.log($scope.Ins.inspection_obj.machine.under_carriage_brand);
            });

            $scope.saveInspection = function () {
            	$scope.savebtn_locked = true;
                //angular's deep copy
                var payload = angular.copy($scope.Ins);

                //cache the id because we need it for the request uri.
                var id = payload.id;

                if ($scope.Ins.datestring === '') {
                    //$scope.Ins.datestring = Utilities.getDatestring($scope.today_unix);
                    alert('Inspection Date should not be empty');
                    return;
                }
                if ($scope.Ins.inspection_obj.maintenance_datestring === '') {
                    $scope.Ins.inspection_obj.maintenance_datestring = Utilities.getDatestring($scope.today_unix);
                }

                payload.timestamp = Utilities.getTimestamp(payload.datestring);
                payload.inspection_obj.maintenance_date = Utilities.getTimestamp($scope.Ins.inspection_obj.maintenance_datestring);
                $scope.Ins.inspection_obj.maintenance_date = Utilities.getTimestamp($scope.Ins.inspection_obj.maintenance_datestring);

                //the server wont accept these values, it just needs inspection data.
                delete payload.machine;
                delete payload.customer;
                delete payload.id;
                delete payload.archived;
                delete payload.modified;

                delete payload.note;

                delete payload.dealer_img_url;
                delete payload.inspector; //why is this property even here?
                delete payload.datestring;
                delete payload.inspection_obj.maintenance_datestring;

                angular.forEach(payload.results, function (value) {
                    angular.forEach(value, function (value2) {
                        if ("description" in payload.results[value][value2]) {
                            delete payload.results[value][value2].description;
                        }
                        if ("tool_name" in payload.results[value][value2].left) {
                            delete payload.results[value][value2].left.tool_name;
                        }
                        if ("tool_name" in payload.results[value][value2].right) {
                            delete payload.results[value][value2].right.tool_name;
                        }
                    });
                });

                if($scope.photouploaded && $scope.photouploaded.length>0){
                    console.log('uploading general photos...');
                    _.each($scope.photouploaded, function(photo, idx, list){
                        var img_payload = {
                            //machine_obj: $scope.Ins.inspection_obj.machine,
                            //machine_id: $scope.Ins.inspection_obj.machine.id,
                            file: photo.photo,
                            //customer_id: $scope.Ins.inspection_obj.customer.id,
                            description: "Inspection's General Photo",
                            user_id: AuthServices.getUserID()
                        };
                        InsServices.saveGeneralPhotos(img_payload).then(function(obj){
                            if(obj==false){
                                console.log('inspection general photo has been failed');
                            }else{
                                console.log('inspection general photo has been saved');
                                var indics = photo.index.split('_');
                                var photos = $scope.Ins.inspection_obj.general.template_inspection_types[indics[0]].inspection_type_tasks[indics[1]].task_instructions_object.steps[indics[2]].photos;
                                photos.value[indics[3]] = obj.id;
                                photos.url[indics[3]] = AppSettings.BASE_URL + 'imgtmb/'+ obj.id;
                            }
                            photo.processed = true;
                            if(idx+1==$scope.photouploaded.length){
                                $scope.saveInspectionReally(payload, id);
                        }
                    });
                });
                }else{
                    $scope.saveInspectionReally(payload, id);
                }
            };

            $scope.saveInspectionReally = function(payload, id){
                if($scope.Ins.inspection_obj.general!==undefined){
                    _.each($scope.Ins.inspection_obj.general.template_inspection_types, function(template_inspection_type, index, list){
                        _.each(template_inspection_type.inspection_type_tasks, function(task, index, list){
                        	for(var ii=0;ii<task.task_instructions_object.steps.length;ii++){
                        		var step = task.task_instructions_object.steps[ii];
                        		if(step.boolean){
                        			step.boolean.value = (step.boolean.value)? 1:0;
                        		}
                        	}
                            task.task_instructions = angular.toJson(task.task_instructions_object);
                        });
                    });
                }

                _.each($scope.Ins.inspection_obj.results, function (obj, index, list) {
                	_.each(obj, function (comp, comp_index, comp_list) {
                        if(comp.hasOwnProperty('left') && comp.left.hasOwnProperty('install_datestring')){
                        	comp.left.install_date = Utilities.getTimestamp(comp.left.install_datestring);
                        	delete comp.left.install_datestring;
                        }
                        if(comp.hasOwnProperty('right') && comp.right.hasOwnProperty('install_datestring')){
                        	comp.right.install_date = Utilities.getTimestamp(comp.right.install_datestring);
                        	delete comp.left.install_datestring;
                        }
                    });
                });

                //and the server expects a json object for the inspection data.
                payload.inspection_obj = JSON.stringify($scope.Ins.inspection_obj);

                InsServices.save(payload, id).then(function (obj) {
                    alert("Inspection saved.");
                    //if this is the latest inspection, we will need to
                    //keep the data for the machine here in sync with
                    //the machine object
                    if ($scope.is_latest_ins) {
                        //now update the machine record
                        payload = $scope.Ins.inspection_obj.machine;
                        delete payload.img_full;
                        delete payload.img;
                        delete payload.archived;
                        MachineServices.save(payload).then(function (obj) {
                            console.log("Machine updated.");
                        });
                    }
                    $scope.$emit("inspection_saved", obj);
                    $location.path('/inspections/' + id);
                });
            }

            $scope.addPhoto = function(photos){
                photos.newimage.push(false);
                photos.url.push("");
                photos.value.push("");
            }

            $scope.deletePhoto = function(photos, typeindex, taskindex, stepindex, index){
                if(confirm("Really Delete?")) {
                    var p = _.find($scope.photouploaded, function(obj){ return obj.index == typeindex+'_'+taskindex+'_'+stepindex+'_'+index; });
                    if(p!=undefined){
                        $scope.photouploaded.splice(p.order,1);
                    }
                    for(var i=0; i<$scope.photouploaded.length; i++)
                        $scope.photouploaded[i].order = i;

                    $('#photo-upload-'+typeindex+'-'+taskindex+'-'+stepindex+'-'+index+' .upload-image-wrapper img').remove();

                    photos.newimage.splice(index,1);
                    photos.url.splice(index,1);
                    photos.value.splice(index,1);
                }
            }

            $scope.$watch('photouploaded', function (new_val, old_val) {
                if (new_val === old_val) {
                    return;
                }
                });

            $scope.deleteInspection = function () {
                if (confirm("Are you sure you want to delete this inspection?")) {
                    InsServices.del($scope.Ins.id).then(function (obj) {
                        $scope.$emit("inspection_deleted", obj);
                        $location.path('/inspections/list/');
                    });
                }
            };

        }

        /*
         * @desc create a NEW inspection.
         */

        else {
            $scope.Ins = InsServices.getEmptyInspection();
            //set some defaults
            $scope.Ins.dealer_id = AuthServices.getDealerID();
            $scope.Ins.datestring = $scope.today_ds;
            $scope.Ins.inspection_obj.maintenance_datestring = $scope.today_ds;
            $scope.Ins.inspection_obj.user.id = AuthServices.getUserID();
            $scope.Ins.user_id = AuthServices.getUserID();
            $scope.machine_img = "images/tmp.png";
            $scope.Ins.inspection_obj.machine.manufacturer_name = '';

            getComponents();
            createInspectorList();
            createUCBrandsList();

            InsServices.getToolTypes().then(function (obj) {
                $scope.Tools = obj.data.results;
            });

            if (typeof $routeParams.machineID !== 'undefined') {
                $scope.Ins.inspection_obj.machine.serial = $routeParams.machineID;
                //get hour meter reading from machine
                MachineServices.getBySerial($scope.Ins.inspection_obj.machine.serial).then(function (obj) {
                    $scope.Ins.inspection_obj.hour_meter_reading = obj.data.results[0].hour_meter_reading;
                });
            }

            //get dealer logo
            DealerServices.getDealerImg(dealer_id).then(function(obj){
                if("image_id" in obj.data.results && obj.data.results.image_id !== null){
                    $scope.Ins.dealer_img_url = AppSettings.BASE_URL + 'img/' + obj.data.results.image_id + '/';
                }
                else{
                    $scope.Ins.dealer_img_url = false;
                }
            });

            setUpWatches();

            $scope.saveInspection = function () {

                if ($scope.Ins.machine_id === '') {
                    alert("Please pick a machine to associate with this inspection.");
                    return;
                }

                if ($scope.Ins.datestring === '') {
                    //$scope.Ins.datestring = Utilities.getDatestring($scope.today_unix);
                    alert('Inspection Date should not be empty');
                    return;
                }

				$scope.savebtn_locked = true;
                //angular's deep copy
                var payload = angular.copy($scope.Ins);

                payload.timestamp = Utilities.getTimestamp(payload.datestring);

                if (typeof payload.inspection_obj.maintenance_datestring === 'undefined' || payload.inspection_obj.maintenance_datestring === '') {
                    payload.inspection_obj.maintenance_date = payload.timestamp;
                }
                else {
                    payload.inspection_obj.maintenance_date = Utilities.getTimestamp(payload.inspection_obj.maintenance_datestring);
                }

                //the server wont accept these values, it just needs inspection data.
                delete payload.machine;
                delete payload.customer;
                delete payload.id;
                delete payload.archived;
                delete payload.inspector;
                delete payload.dealer_img_url;
                delete payload.datestring;
                delete payload.inspection_obj.maintenance_datestring;

                //this customer obj within the inspection obj represents
                //the ownership of the machine at the time of inspection.
                //it could differ from the customer id in the root of the
                //main obj.
                if(payload.customer_id == "") {
                    // when machine don't have customer
                    payload.customer_id = 0;
                }
                payload.inspection_obj.customer.id = payload.customer_id;

                _.each($scope.Ins.inspection_obj.results, function (obj, index, list) {
                	_.each(obj, function (comp, comp_index, comp_list) {
                        if(comp.hasOwnProperty('left') && comp.left.hasOwnProperty('install_datestring')){
                        	comp.left.install_date = Utilities.getTimestamp(comp.left.install_datestring);
                        	delete comp.left.install_datestring;
                        }
                        if(comp.hasOwnProperty('right') && comp.right.hasOwnProperty('install_datestring')){
                        	comp.right.install_date = Utilities.getTimestamp(comp.right.install_datestring);
                        	delete comp.left.install_datestring;
                        }
                    });
                });

                //and the server expects a json object for the inspection data.
                payload.inspection_obj = JSON.stringify(payload.inspection_obj);
                InsServices.saveNew(payload).then(function (obj) {
                    alert("Inspection saved.");
                    $scope.$emit("inspection_saved", obj);
                    //now update the machine record
                    payload = $scope.Ins.inspection_obj.machine;
                    delete payload.img_full;
                    delete payload.img;

                    MachineServices.save(payload).then(function (obj) {
                        // do nothing
                    });

                    $location.path('/inspections/' + obj.data.results.id);
                });
            };
        }

        // Slide Toggle
        $scope.toggleGeneralImages = function() {
            $("#imagesSection").slideToggle("normal");
        };

        $scope.generalimages_showhide = 1;

        $scope.comppanels_showhide = 1;

        $scope.templatetype_showhide = [];

        $scope.comp_showhide = {
            sprocket: 1,
            bushing: 1,
            frontidler: 1,
            carrierroller: 1,
            link: 1,
            shoe: 1,
            rearidler: 1,
            trackroller: 1,
        }

        $scope.comppanels_left = {
            sprocket: {
                id: 'sprocket',
                dtarray: 'sprockets',
                showhide: 1,
                title: 'Sprockets',
                icon: 'svg/sprockets.svg',
            },
            bushing:{
                id: 'bushing',
                dtarray: 'bushings',
                showhide: 1,
                title: 'Bushings',
                icon: 'svg/bushings.svg',
            },
            frontidler: {
                id: 'frontidler',
                dtarray: 'idlers_front',
                showhide: 1,
                title: 'Front Idlers',
                icon: 'svg/idler.svg',
            },
            carrierroller: {
                id: 'carrierroller',
                dtarray: 'carrier_rollers',
                showhide: 1,
                title: 'Carrier Rollers',
                icon: 'svg/carrier_rollers.svg',
            }
        }

        $scope.comppanels_right = {
            link: {
                id: 'link',
                dtarray: 'track_links',
                showhide: 1,
                title: 'Links',
                icon: 'svg/links.svg',
            },
            shoe:{
                id: 'shoe',
                dtarray: 'track_shoes',
                showhide: 1,
                title: 'Shoes',
                icon: 'svg/shoes.svg',
            },
            rearidler: {
                id: 'rearidler',
                dtarray: 'idlers_rear',
                showhide: 1,
                title: 'Rear Idlers',
                icon: 'svg/idler.svg',
            },
            trackroller: {
                id: 'trackroller',
                dtarray: 'track_rollers',
                showhide: 1,
                title: 'Track Rollers',
                icon: 'svg/track_rollers.svg',
            }
        }

        $scope.edit_comps = {
            0: {
                id: 'link',
                icon_cls: 'links-btn',
                dtarray: 'track_links',
                title: 'Track Link',
                label: 'Track Links',
                icon: 'svg/links.svg',
                showhide: 1,
            },
            1: {
                id: 'bushing',
                icon_cls: 'bushings-btn',
                dtarray: 'bushings',
                title: 'Bushing',
                label: 'Bushings',
                icon: 'svg/bushings.svg',
                showhide: 1,
            },
            2: {
                id: 'shoe',
                icon_cls: 'shoes-btn',
                dtarray: 'track_shoes',
                title: 'Track Shoe',
                label: 'Track Shoes',
                icon: 'svg/shoes.svg',
                showhide: 1,
            },
            3: {
                id: 'frontidler',
                icon_cls: 'idlers-btn',
                dtarray: 'idlers_front',
                title: 'Idler Front',
                label: 'Front Idlers',
                icon: 'svg/idler.svg',
                showhide: 1,
            },
            4: {
                id: 'rearidler',
                icon_cls: 'idlers-btn',
                dtarray: 'idlers_rear',
                title: 'Idler Rear',
                label: 'Rear Idlers',
                icon: 'svg/idler.svg',
                showhide: 1,
            },
            5: {
                id: 'carrierroller',
                icon_cls: 'carrier-rollers-btn',
                dtarray: 'carrier_rollers',
                title: 'Carrier Roller',
                label: 'Carrier Rollers',
                icon: 'svg/carrier_rollers.svg',
                showhide: 1,
            },
            6: {
                id: 'trackroller',
                icon_cls: 'track-rollers-btn',
                dtarray: 'track_rollers',
                title: 'Track Rollers',
                label: 'Track Rollers',
                icon: 'svg/track_rollers.svg',
                showhide: 1,
            },
            7: {
                id: 'sprocket',
                icon_cls: 'sprockets-btn',
                dtarray: 'sprockets',
                title: 'Sprocket',
                label: 'Sprockets',
                icon: 'svg/sprockets.svg',
                showhide: 1,
            },
        }
    }
]);