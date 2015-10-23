/*global Modustri, angular, $*/
/**
 * @fileOverview Controller for user management
 * @author Joseph Hatton
 */
Modustri.controller('UserCtrl', ['$scope', 'UserServices', 'AuthServices', '$filter', 'DealerServices', 'CustomerServices', 'Utilities',
    function($scope, UserServices, AuthServices, $filter, DealerServices, CustomerServices, Utilities) {

        "use strict";

        var ui_const = 'uiusers';
        $scope.users = {};
        $scope.ids = {};
        $scope.dealers = {};

        AuthServices.checkUserCreds();
        $scope.UserSettings = AuthServices.getUserSettings();

        function getUserList() {
            UserServices.getUserList().then(function(obj) {
                $scope.users = obj.data.results;
            });
        }

        DealerServices.getDealerList(function(data) {
            $scope.dealers = data.results;
            $scope.userlevels = [{
                value: 0,
                text: 'Modustri Administrator'
            }, {
                value: 1,
                text: 'Modustri Manager'
            }, {
                value: 2,
                text: 'Dealer Administrator'
            }, {
                value: 3,
                text: 'Dealer Manager'
            }, {
                value: 4,
                text: 'Dealer User'
            }, {
                value: 5,
                text: 'Customer Manager'
            }];

            if (AuthServices.getUserLevel() === 0) {
                $scope.isAdmin = 1;
            }
            //$scope.isAdmin = AuthServices.getUserLevel() === 0 || AuthServices.setUserLevel(1);

            $scope.uiShow = function(f) {
                return AuthServices.uiToggle(AuthServices.getUserLevel(), ui_const, f);
            };

            $scope.showUserLevel = function(userlevel) {
                var selected = [];
                if (userlevel !== null) {
                    selected = $filter('filter')($scope.userlevels, {
                        value: userlevel
                    });
                }
                return selected.length ? selected[0].text : 'Not set';
            };

            $scope.showDealer = function(id) {
                console.log(id);
                var selected = [];
                if (id !== null) {
                    for(var i in $scope.dealers)
                    {
                        if($scope.dealers[i].id === id)
                        {
                            selected.push($scope.dealers[i]);
                        }
                    }
                }
                return selected.length ? selected[0].name : 'Not set';
            };

            $scope.editableName = function(data, id) {
                if (id === undefined || id === null) {
                    $('#username').prop('readonly', '');
                } else {
                    /*$('#username').prop('readonly', 'readonly');*/
                }
            };

            getUserList();

            $scope.getCustomers = function(val) {
                var customers = [];
                if (val.length >= 3) {
                    return CustomerServices.getByName(val).then(function(obj) {
                        angular.forEach(obj.data.results, function(customer) {
                            customers.push(customer.name);
                        });
                        return customers;
                    });
                }
            };
        });

        // add user
        $scope.addUser = function() {
            $scope.inserted = {
                username: '',
                id: null,
                email: null,
                dealer_id: AuthServices.getDealerID(),
                customer_id: null,
                userlevel: null
            };
            $scope.users.unshift($scope.inserted);
        };

        //Inline edit validation
        $scope.userEditableValidation = function(type, data) {

            switch(type) {
                case 'email':
                    var reg = /^[A-Za-z0-9_.-]{2}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-].{1}[A-Za-z0-9_.-]+$/;
                    if (data == undefined || data == '') {
                        return 'Email is required.';
                    }
                    else if (!reg.test(data)){
                        return 'Email is invalid.';
                    }
                    else if (data.length > 200){
                        return 'Email cannot be longer than 200 characters.';
                    }
                    break;

                case 'username':
                    var reg = /^[A-Za-z0-9_]+[a-zA-Z0-9\s_.\-]*[A-Za-z0-9_]+$/;
                    if (data == undefined || data == '') {
                        return 'Name is required.';
                    }
                    else if (data.length < 3){
                        return 'Name is required to be at least 3 characters.';
                    }
                    else if (!reg.test(data)){
                        return 'Name is invalid.';
                    }
                    else if (data.length > 200){
                        return 'Name cannot be longer than 200 characters.';
                    }

                    break;
            }

        }

        $scope.saveUser = function(data, id, rowform) {

            //find primary contact id

            if (id !== null) {
                UserServices.updateUser(id, data.username, data.email, data.userlevel,
                    data.dealer_id, data.customer_id, function(data) {
                        if(data !== undefined) {
                            getUserList();
                        }
                    });
            } else {
                UserServices.addUser(data.username, data.email, data.userlevel, data.dealer_id, data.customer_id, function(data) {
                    if(data !== undefined) {
                        getUserList();
                    }
                });
            }
        };

        $scope.removeUser = function(id) {
            if (id) {
                UserServices.removeUser(id, function() {
                    getUserList();
                });
            }
        };

        $scope.cancelUser = function(index, rowform) {
            if($scope.users[index].id == null) {
                $scope.users.splice(index, 1);
            } else {
                rowform.$cancel();
            }
        };

        $scope.removeChecked = function() {
            angular.forEach($scope.ids, function(value, key) {
                if(value) {
                    // remove api
                    UserServices.removeUser(key, function() {
                        // remove user from users
                        angular.forEach($scope.users, function(user, index) {
                            if(user.id == key) {
                                $scope.users.splice(index, 1);
                                delete $scope.ids[key];
                            }
                        });
                    });
                }
            });
        };

        $scope.toggleCheckUser = function(userId) {
            if ($scope.selectedUsers.indexOf(userId) === -1) {
                $scope.selectedUsers.push(userId);
            } else {
                $scope.selectedUsers.splice($scope.selectedUsers.indexOf(userId), 1);
            }
        }
    }
]);
