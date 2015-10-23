/*global console, moment, angular, $, alert,confirm,_*/
/**
* @fileOverview Controller for adding customers.
* @author Tim Snyder <tim.snyder@modustri.com>
*/

Modustri.controller('CustomerAddCtrl', ['$log', '$scope', '$routeParams', '$location', 'CustomerServices', 'AuthServices', 'UserServices', 'Utilities',
    function($log, $scope, $routeParams, $location, CustomerServices, AuthServices, UserServices, Utilities){

        "use strict";

        AuthServices.checkUserCreds();
        $scope.UserSettings = AuthServices.getUserSettings();

        $scope.new_customer = true;
        $scope.image_upload = '';

        $scope.Customer = CustomerServices.getEmptyCustomer();

        $scope.cancelCustomer = function() {
            $location.path('/customers/list');
        }

        $scope.saveCustomer = function(){

            //Form validation
            if (!Utilities.validateForm($scope.customer_form)) {
                return false; //validation false;
            }
            
            
            var duplicateNameFlag = true;
            CustomerServices.getByName($scope.Customer.name).then(function (obj) {
                if(obj.data.results.length > 0) {
                    for (var idx = 0; idx < obj.data.results.length; idx++) {
                        if (obj.data.results[idx].id != $scope.Customer.id && $scope.Customer.name == obj.data.results[idx].name) {
                            duplicateNameFlag = false;
                            break;
                        }
                    }
                }
                
                if (!duplicateNameFlag) {
                    //Duplicate Name exists
                    alert('Duplicate name exists.')
                    return false;
                }
                
                
                //Add this user.
                //Create new customer
                var img_payload = {};
                delete $scope.Customer.archived;
                UserServices.saveContact($scope.Customer.email).then(function(obj){
                    //then get new new primary contact id
                    //console.dir(obj);
                    if(!obj.hasOwnProperty('data'))
                    {
                        $scope.Customer.primary_contact_id = 0;
                    }else
                    {
                        $scope.Customer.primary_contact_id = obj.data.results.id;
                    }
                    CustomerServices.saveNew($scope.Customer)
                    .then(function (obj) {
                        if ($scope.image_upload !== '') {
                            //now upload and save photo
                            img_payload = {
                                customer_obj: obj.data.results,
                                file: $scope.image_upload,
                                description: "Customer photo",
                                user_id: AuthServices.getUserID()
                            };
                            CustomerServices.savePhoto(img_payload).then(function (obj) {
                                $scope.$emit("obj_saved", 'Customer');
                                alert('Customer saved.');
                                $location.path('/customers/list');
                            });
                        } else {
                            $scope.$emit("obj_saved", 'Customer');
                            alert('Customer saved.');
                            $location.path('/customers/list');
                        }
                    });
                });
                
            });
                    
        };

        $scope.deleteCustomer = function(){
            alert('There is no customer to delete.');
        };

}]);