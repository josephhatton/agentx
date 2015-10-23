/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Controller for handling passwords.
 * @author Tim Snyder <tim.snyder@modustri.com>
 */

Modustri.controller('PasswordSetResetCtrl', ['$log', '$scope', '$location', '$routeParams', 'PasswordServices', 'Utilities',
    function($log, $scope, $location, $routeParams, PasswordServices, Utilities) {

        "use strict";

        $scope.password = '';
        $scope.reset_pass_email = '';
        var payload = {};
        
        //reset a password
        if($location.$$path.match(/reset/)){
            $scope.handlePasswordReset = function(){
                if('resetID' in $routeParams){
                    PasswordServices.acceptInvite($routeParams.resetID, payload).then(function(obj){
                        //if everything is ok, fwd to success screen...
                        if(obj.data.errors.length === 0){
                            $location.path('/update/password-reset/1');
                        }
                        else{
                            $location.path('/update/password-reset/0');
                        }
                    });
                }
                else{
                    $location.path('/');
                }
            };
        }
        //accept an invite and optionally set a new password
        else if($location.$$path.match(/set/)){
            if('inviteID' in $routeParams){
                $scope.handleInvite = function(){
                    if($scope.password !== ''){
                        payload.password = $scope.password;
                    }
                    PasswordServices.acceptInvite($routeParams.inviteID, payload).then(function(obj){
                        //if everything is ok, fwd to success screen...
                        if(obj.data.errors.length === 0){
                            $location.path('/update/invite/1');
                        }
                        else{
                            $location.path('/update/invite/0');
                        }
                    });
                };
            }
            else{
                $location.path('/');
            }
        }
        else if($location.$$path.match(/reset-request/)){
            $scope.handleResetRequest = function(){
                //check if email is in db


                //submit email to endpoint
            }
        }
        else{
            $location.path('/');
        }
        
        
        /**
        * Password reset
        * 
        */
        $scope.handlePasswordResetRequest = function() {
            //Form validation
            if (!Utilities.validateForm($scope.password_reset_form)) {
                return false; //validation false;
            }
            
            PasswordServices.resetPassword($scope.reset_pass_email, function(data) {
                alert("An email has been sent. Please check your mail box.")
            });
        }
        
    }
]);