/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Controller for viewing a list of inspections.
 * @author Tim Snyder <tim.snyder@modustri.com>
 */

Modustri.controller('InspectionsListCtrl', ['$log', '$scope', '$routeParams', '$location',
    '$modal','InsServices', 'UserServices', 'Utilities',
    'MachineServices', 'CustomerServices', 'AuthServices', 'AppSettings',
    function ($log, $scope, $routeParams, $location, $modal, InsServices, UserServices,
              Utilities, MachineServices, CustomerServices, AuthServices, AppSettings) {

        "use strict";

        AuthServices.checkUserCreds();
        $scope.UserSettings = AuthServices.getUserSettings();

        var ui_const = 'uiinspections';
        var caches = [];
        var t_id;

        //these values will need to persist, as pagination will reload the template
        $scope.sortFromDate = localStorage.getItem('sortFromDate') || '';
        $scope.sortToDate = localStorage.getItem('sortToDate') || '';

        var page = ($routeParams.page ? $routeParams.page : 1);

        /**
         * @desc Utility functions
         */

        var query = function () {

            InsServices.query(page).then(function (obj) {

                $scope.Inspections = obj.data.results;
                $scope.pages = obj.data.pages;
                if ($scope.pages > 0)
                    $scope.paginationShow = true;
                else
                    $scope.paginationShow = false;

                var now = Math.round(new Date().getTime() / 1000);
                //format the timestamps and get the main machine image.
                _.each($scope.Inspections, function (ins, index, list) {
                    //get customer data - the customer data in the inspection obj may not be up to date
                    // JJR - if the inspection is within the last 30 days assume the customer data is correct.
                    if(now - ins.timestamp > 2678400)
                    {
                        CustomerServices.get(ins.customer_id).then(function(obj){
                            var c = obj.data.results;
                            ins.inspection_obj.customer = ins.inspection_obj.customer || {};
                            ins.inspection_obj.customer.name = c.name;
                            ins.inspection_obj.customer.address = c.address;
                            ins.inspection_obj.customer.city = c.city;
                            ins.inspection_obj.customer.state = c.state;
                            ins.inspection_obj.customer.zip = c.zip;
                            ins.inspection_obj.customer.primary_contact_id = c.primary_contact_id;
                        });
                    }

                    ins.datestring = Utilities.getDatestring(ins.timestamp);
                    //get images
                    if ("machine" in ins.inspection_obj) {
                        if (ins.inspection_obj.machine.main_image_id !== false && ins.inspection_obj.machine.main_image_id !== 0 && ins.inspection_obj.machine.main_image_id !== '0') {
                            ins.inspection_obj.machine.img = AppSettings.BASE_URL +
                                "imgtmb/" + ins.inspection_obj.machine.main_image_id + "/";
                            ins.inspection_obj.machine.img_full = AppSettings.BASE_URL +
                                "img/" + ins.inspection_obj.machine.main_image_id + "/";
                            //cache the image for the lightbox
                            t_id = setTimeout(function(){
                                caches[index] = document.createElement('img');
                                caches[index].src = ins.inspection_obj.machine.img_full;
                            }, 0);
                        }
                        else {
                            MachineServices.get(ins.machine_id).then(function (obj) {
                                var mainimg = obj.data.results.main_image_id;
                                if (mainimg !== "" && mainimg > 0 && mainimg !== 0 && mainimg !== '0' ) {
                                    MachineServices.getPhoto(obj.data.results.main_image_id).then(function (obj) {
                                        ins.inspection_obj.machine.img = AppSettings.BASE_URL +
                                            "imgtmb/" + obj.data.results.id + "/";
                                        ins.inspection_obj.machine.img_full = AppSettings.BASE_URL +
                                            "img/" + obj.data.results.id + "/";
                                        //cache the image for the lightbox
                                        t_id = setTimeout(function(){
                                            caches[index] = document.createElement('img');
                                            caches[index].src = ins.inspection_obj.machine.img_full;
                                        }, 0);
                                    });
                                }
                            });
                        }
                        if (ins.inspection_obj.machine.equipment_id === '(null)' ||
                            ins.inspection_obj.machine.equipment_id === null) {
                            ins.inspection_obj.machine.equipment_id = "N/A";
                        }
                    }
                    //make sure machine info is up to date - some data are off
                    if(ins.inspection_obj.manufacturer.company == '' || !ins.inspection_obj.manufacturer.company){
                        MachineServices.get(ins.machine_id).then(function(obj){
                            MachineServices.getManufacturerById(obj.data.results.manufacturer_id).then(function(obj){
                                ins.inspection_obj.manufacturer.company = obj.data.results.company;
                            });
                        });
                    }
                });
            });
        };

        var queryByDateRange = function (page) {
            //needs to be a string?

            var from = Utilities.getTimestamp($scope.sortFromDate);
            var to = Utilities.getTimestamp($scope.sortToDate);
            //need to add 18 hours or subtract 6 - the jquery widget returns the timestamp at 6am for some reason.
            from = from - 21600;
            to = to + 64800;
            InsServices.getByDateRange(page, from, to).then(function (obj) {
                $scope.Inspections = obj.data.results;
                $scope.pages = obj.data.pages;

                if ($scope.pages > 0)
                    $scope.paginationShow = true;
                else
                    $scope.paginationShow = false;

                //format the timestamps and get the main machine image.
                _.each($scope.Inspections, function (ins, index, list) {
                    ins.datestring = Utilities.getDatestring(ins.timestamp);
                    if ("machine" in ins.inspection_obj) {
                        if (ins.inspection_obj.machine.equipment_id === '(null)') {
                            ins.inspection_obj.machine.equipment_id = "N/A";
                        }
                        if (ins.inspection_obj.machine.main_image_id !== false &&
                            ins.inspection_obj.machine.main_image_id > 0 &&
                            ins.inspection_obj.machine.main_image_id != '0') {
                            ins.inspection_obj.machine.img = AppSettings.BASE_URL +
                                "imgtmb/" + ins.inspection_obj.machine.main_image_id + "/";
                            ins.inspection_obj.machine.img_full = AppSettings.BASE_URL +
                                "/img/" + ins.inspection_obj.machine.main_image_id + "/";
                            //cache the image for the lightbox
                            caches[index] = document.createElement('img');
                            caches[index].src = ins.inspection_obj.machine.img_full;
                        }
                    }
                });
            });

            angular.element('.pagination-range').remove();
            angular.element('.pagination').html('');
            //Remove current pagination



        };

        $scope.uiShow = function (f) {
            return AuthServices.uiToggle(AuthServices.getUserLevel(), ui_const, f);
        };

        $scope.clearDatePickers = function () {
            //needs to be a string?
            $scope.paginationShow = true;
            localStorage.setItem('sortFromDate', '');
            localStorage.setItem('sortToDate', '');
            $scope.sortFromDate = '';
            $scope.sortToDate = '';
            $location.path('/inspections/list/');
        };

        $scope.deleteInspection = function (inspection_id, row) {
            if (confirm("Are you sure you want to delete this inspection?")) {
                InsServices.del(inspection_id).then(function (obj) {
                    $scope.Inspections.splice(row.$index, 1);
                    $scope.$emit("inspection_deleted", obj);
                });
            }
        };

        //if we are filtering by date range
        if (localStorage.getItem('sortFromDate')) {
            queryByDateRange(page);
        }
        //if no date range, query like normal
        else {
            query();
        }

        //watch for changes in datepicker ui
        $scope.$watch('sortToDate', function (new_val, old_val) {
            if(validateDateRange()) {
                localStorage.setItem('sortToDate', new_val);
                if (new_val !== old_val && $scope.sortFromDate !== '') {
                    queryByDateRange(1);
                    $location.path('/inspections/list/');
                }
            }
        });

        $scope.$watch('sortFromDate', function (new_val, old_val) {
            if(validateDateRange()) {
                localStorage['sortFromDate'] = new_val;
                if (new_val !== old_val && $scope.sortToDate !== '') {
                    queryByDateRange(1);
                    $location.path('/inspections/list/');
                }
            }
        });

        $scope.img = null;

        $scope.open = function(img1) {
            $scope.img = img1;
            var modalInstance = $modal.open({
                template: $scope.modal_html_template,
                controller: ModalInstanceCtrl,
                resolve: {
                    img: function() {
                        return $scope.img;
                    }
                }
            });
        }

        function validateDateRange() {
            var from_unix = moment($scope.sortFromDate).unix(),
                to_unix = moment($scope.sortToDate).unix();
            if(to_unix < from_unix) {
                alert("From date cannot be later than To date");
                return false;
            }
            return true;
        }
    }
]);

var ModalInstanceCtrl = function($scope, $modalInstance, img) {

    //$scope.selected = { item: img };
    $scope.img = img;
    $scope.close = function() {
        $modalInstance.dismiss('cancel');
    };
};