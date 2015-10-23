/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Controller for logging in. Note actual hash fn, etc are in auth service.
 * @author Tim Snyder <tim.snyder@agent-x.com>
 */

Modustri.controller('LoginCtrl', ['$log', '$scope', '$location', 'AuthServices', function($log, $scope, $location, AuthServices){

    "use strict";

    if(localStorage.getItem('username') && localStorage.getItem('pass')){
        AuthServices.validate(localStorage.getItem('username'), localStorage.getItem('pass')).then(
            function(){
                $location.path('/dashboard');
            },
            function(){
                //user needs to log in
            }
        );
    }

    $scope.login = function(){
        AuthServices.validate($scope.user, $scope.pass).then(
            function(obj){
                $scope.$emit('user_logged_in', obj);
                localStorage.setItem('username',$scope.user);
                $location.path('/dashboard');
            },
            function(){
                alert("Incorrect username or password.");
            }
        );
    };

}]);