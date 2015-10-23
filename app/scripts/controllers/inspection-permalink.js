/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Simple controller for showing a permalink version of an inspection
 * @author Tim Snyder <tim.snyder@agent-x.com>
 * @todo Needs major refactoring. This shares most functionality with the inspection controller.
 */

Modustri.controller('InspectionPermalinkCtrl', ['$scope', '$q', '$http', 'InsServices', 'Utilities',
    'AppSettings', 'MachineServices', 'CustomerServices', 'AuthServices', 'UserServices', 'DealerServices', '$routeParams',
    function ($scope, $q, $http, InsServices, Utilities, AppSettings, MachineServices,
              CustomerServices, AuthServices, UserServices, DealerServices, $routeParams) {

        "use strict";

        $scope.UserSettings = AuthServices.getUserSettings();

        var ui_const = 'uiinspections';
        var dealer_id = AuthServices.getDealerID();
        DealerServices.getDealerImg(dealer_id)
        .then(function(obj){
            if("image_id" in obj.data.results && obj.data.results.obj !== null && obj.data.results.image_id !== null)
            {
                var img = AppSettings.BASE_URL + 'img/' + obj.data.results.image_id + '/';
                $('#logo').css('background-image', 'url(' + img + ')').css('width','250px');
                $('.logo-wrapper').css('width','250px');
            }
        });

        $scope.uiShow = function (f) {
            return AuthServices.uiToggle(AuthServices.getUserLevel(), ui_const, f);
        };

        //we want to keep the state (edit/view or add) on scope so
        //our directive can read it.
        $scope.state = null;
        $scope.is_latest_ins = false;

        $scope.Components = {};
        $scope.Measureable_parts = [];
        $scope.Tools = [];
        $scope.Summaries = [];
        $scope.Prev_ins = {};


        /**
         * @desc Utility functions
         */

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
                var temp = _.where(users, {
                    id: $scope.Ins.user_id
                });
                if (temp[0]) {
                    $scope.Ins.inspection_obj.inspector = temp[0].username;
                }
                $scope.UserList = users;
            });
        };


        /**
         * @desc Collect all the available components for a machine. Attaches them to $scope.Components.
         */
        var getComponents = function () {
            var d;
            var component_type = '';
            MachineServices.getComponentsByMachineModel($scope.Ins.inspection_obj.machine.model_id, function (obj) {
                $scope.Components = []; //clear out any previous component data.
                d = obj.results;

                for (var i = 0; i < d.length; i++) {
                    if (d[i].hasOwnProperty('component_id')) {
                        //add a component obj that includes wear maps.
                        MachineServices.createComponentObj($scope, d[i].component_id).then(function (obj) {
                            component_type = Utilities.snakeCase(obj.type);
                            //we need to differentiate between front and rear idlers in our ui and inspection obj.
                            if (component_type === 'idlers') {
                                if (!$scope.Components.idlers_front) {
                                    $scope.Components['idlers_front'] = [];
                                }
                                $scope.Components['idlers_front'].push(obj);

                                if (!$scope.Components['idlers_rear']) {
                                    $scope.Components['idlers_rear'] = [];
                                }
                                $scope.Components['idlers_rear'].push(obj);
                            }
                            if (component_type !== 'idlers') {
                                if (!$scope.Components[component_type]) {
                                    $scope.Components[component_type] = [];
                                }
                                $scope.Components[component_type].push(obj);
                            }
                        });
                    }
                }
            });
        };


        InsServices.getForPermalink($routeParams.hash).then(function (obj) {
            $scope.Ins = obj.data.results;
            $scope.Measureable_parts = [];

            var ins = {};

            //if there are no inspection results - perhaps an inspection was created
            //but no data ever entered?
            if ("results" in $scope.Ins.inspection_obj === false) {
                $scope.Ins.inspection_obj.results = {};
            }

            //get previous inspection so we can calculate wear dates and
            //find out if this is the latest inspection or not, so we
            //know whether to update the machine record as well.
            InsServices.getByMachineId($scope.Ins.machine_id).then(function (obj) {
                $scope.Prev_ins = obj.data.results;
                if ($scope.Prev_ins.length > 0) {
                    $scope.Prev_ins.sort(function (a, b) {
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

                    if ($scope.Ins.timestamp === $scope.Prev_ins[0].timestamp) {
                        $scope.is_latest_ins = true;
                    }

                    //set the previous ins
                    $scope.Prev_ins = $scope.Prev_ins[1];
                }
                else {
                    $scope.Prev_ins = false;
                }

                InsServices.getFailureDates($scope);

                InsServices.buildSummariesTable($scope);

            });

            InsServices.cleanUpNulls($scope);

            $scope.Ins.datestring = Utilities.getDatestring($scope.Ins.timestamp);
            $scope.Ins.MaintenanceDate = Utilities.getDatestring($scope.Ins.inspection_obj.maintenance_date);
            $scope.Ins.dealer_id = AuthServices.getDealerID();

            InsServices.setMainPhoto($scope);

            //get dealer logo
            DealerServices.getDealerImg(dealer_id).then(function(obj){
                if("image_id" in obj.data.results && obj.data.results.obj !== null){
                    $scope.Ins.dealer_img_url = AppSettings.BASE_URL + 'img/' + obj.data.results.image_id + '/';
                }
                else{
                    $scope.Ins.dealer_img_url = false;
                }
            });

            //make sure each component container has an id, and add condition verbage for the ui
            _.each($scope.Ins.inspection_obj.results, function (obj, index, list) {
                if (!obj.hasOwnProperty('model_id') || !obj.model_id) {
                    if (typeof obj[0] !== 'undefined' && obj[0].hasOwnProperty('left')) {
                        obj.model_id = obj[0].left.id || obj[0].right.id;
                    }
                }
                _.each(obj, function (comp, comp_index, comp_list) {
                    InsServices.setCondition(list, index, comp_index); //(ins, part_type, component_index)
                });

            });

            MachineServices.getInspectionPhotos($scope.Ins.id).then(function (obj) {
                InsServices.renderInspectionPhotos($scope, obj);
            });

            //get all the selectable components for this machine.
            getComponents();
            createInspectorList();

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
            });


            //get customer data - the customer data in the inspection obj may not be up to date
            CustomerServices.get($scope.Ins.customer_id).then(function(obj){
                var c = obj.data.results;
                $scope.Ins.inspection_obj.customer.name = c.name;
                $scope.Ins.inspection_obj.customer.address = c.address;
                $scope.Ins.inspection_obj.customer.city = c.city;
                $scope.Ins.inspection_obj.customer.state = c.state;
                $scope.Ins.inspection_obj.customer.zip = c.zip;
                $scope.Ins.inspection_obj.customer.primary_contact_id = c.primary_contact_id;
            });
            
            //we need to get img and full_img of machine if it isn't already on the inspection
            MachineServices.get($scope.Ins.inspection_obj.machine.id).then(function(obj ){
                // set machine image again if not yet have in json
                if(!$scope.Ins.inspection_obj.machine.hasOwnProperty("img") || 
                    ($scope.Ins.inspection_obj.machine.main_image_id < 1 && obj.data.results.main_image_id > 0)) {
                    // img and img_full of machine is not yet set correctly, here set img again
                    $scope.Ins.inspection_obj.machine.main_image_id = obj.data.results.main_image_id;
                    $scope.Ins.inspection_obj.machine.img = AppSettings.BASE_URL +
                        "imgtmb/" + $scope.Ins.inspection_obj.machine.main_image_id + "/";
                    $scope.Ins.inspection_obj.machine.img_full = AppSettings.BASE_URL +
                        "/img/" + $scope.Ins.inspection_obj.machine.main_image_id + "/";
                }
            });
        });
    }
]);