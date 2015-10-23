/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Controller for viewing a list of customers.
 * @author Tim Snyder <tim.snyder@modustri.com>
 */

Modustri.controller('CustomersListCtrl', ['$log', '$scope', '$routeParams', '$location',
    'CustomerServices', 'MachineServices', 'InsServices', 'AuthServices', 'UserServices', 'Utilities', 'AppSettings',
    function ($log, $scope, $routeParams, $location, CustomerServices,
              MachineServices, InsServices, AuthServices, UserServices, Utilities, AppSettings) {

        "use strict";

        AuthServices.checkUserCreds();
        $scope.UserSettings = AuthServices.getUserSettings();

        var caches = [];
        var t_ids = [];
        var page = ($routeParams.page ? $routeParams.page : 1);


        /**
         * @desc If we have less than 200 customers, we show them as a simple list.
         */

        CustomerServices.getNumberOfCustomers().then(function (obj) {
            if ("results" in obj.data === false) {
                console.error("problem getting number of customers.");
            }
            else if (parseInt(obj.data.results[0].dealer_customers, 10) <= 200) {
                //toggles the alphabetical tabs in the ui.
                $scope.big_list = false;
                page = (page < 1 ? 1 : page);
                CustomerServices.getByFirstLetters(index, page, 200).then(function (obj) {
                    $scope.Customers = obj.data.results;

                    _.each($scope.Customers, function (customer, i, list) {
                        if (customer.image_id > 0) {
                            customer.img = AppSettings.BASE_URL + 'imgtmb/' + customer.image_id + '/';
                            customer.img_full = AppSettings.BASE_URL + 'img/' + customer.image_id + '/';
                            t_ids[i] = setTimeout(function(){
                                caches[i] = document.createElement('img');
                                caches[i].src = customer.img_full;
                            }, 0);

                        }
                        if(customer.primary_contact_id !== null && customer.primary_contact_id !== 0)
                        {
                            UserServices.getContactById(customer.primary_contact_id).then(function(obj){
                               customer.email = obj.data.results.email;
                            });
                        }else
                        {
                            customer.email = '';
                        }

                        MachineServices.getByCustomerId(customer.id, 1, 1).then(function (obj) {
                            customer.number_of_machines = obj.data.pages;
                        });
                        InsServices.getByCustomerId(customer.id).then(function (obj) {
                            customer.number_of_inspections = obj.data.results.length;
                        });
                        CustomerServices.get(customer.id).then(function (obj) {
                            customer.name = obj.data.results.name;
                        });

                        if(customer.last_inspected > 0){
                            customer.last_inspected = Utilities.getDatestring(customer.last_inspected);
                        }
                        
                        InsServices.getNewestInspectionByCustomerId(customer.id).then(function(obj){
                        	if(obj.data.results[0] && obj.data.results[0].inspection_obj.user){
                        		customer.last_inspectorid = obj.data.results[0].inspection_obj.user.id;
                        		customer.last_inspector = obj.data.results[0].inspection_obj.user.username;
                        	}
                        });

                    });
                });
            }

            /**
             * @desc If we have more than 200 customers, we implement special pagination.
             */
            else {
                $scope.big_list = true;
                var index = ($routeParams.index ? $routeParams.index : '%');

                page = (page < 1 ? 1 : page);
                CustomerServices.getByFirstLetters(index, page).then(function (obj) {
                    $scope.pages = obj.data.pages;
                    _.each(obj.data.results, function (customer, i, list) {
                        if (customer.image_id > 0) {
                            customer.img = AppSettings.BASE_URL + 'imgtmb/' + customer.image_id + '/';
                            customer.img_full = AppSettings.BASE_URL + 'img/' + customer.image_id + '/';
                            t_ids[i] = setTimeout(function(){
                                caches[i] = document.createElement('img');
                                caches[i].src = customer.img_full;
                            }, 0);
                        }
                        UserServices.getContactById(customer.primary_contact_id).then(function(obj){
                            customer.email = obj.data.results.email;
                        });
                        MachineServices.getByCustomerId(customer.id, 1, 1).then(function (obj) {
                            customer.number_of_machines = obj.data.pages;
                        });
                        InsServices.getByCustomerId(customer.id).then(function (obj) {
                            customer.number_of_inspections = obj.data.results.length;
                        });
                        if(customer.last_inspected > 0){
                            customer.last_inspected = Utilities.getDatestring(customer.last_inspected);
                        }
                        InsServices.getNewestInspectionByCustomerId(customer.id).then(function(obj){
                        	if(obj.data.results[0] && obj.data.results[0].inspection_obj.user){
                        		customer.last_inspectorid = obj.data.results[0].inspection_obj.user.id;
                        		customer.last_inspector = obj.data.results[0].inspection_obj.user.username;
                        	}
                        });
                    });

                    $scope.Customers = obj.data.results;
                    $scope.PageVars = {};
                    $scope.PageVars.pages = (typeof obj.data.pages === "undefined" ? "" : _.range(1, obj.data.pages));
                    $scope.PageVars.page = parseInt(page, 10);
                    $scope.PageVars.index = index;
                });
            }
        });

    }
]);
