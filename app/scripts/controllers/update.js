/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Controller for handling passwords.
 * @author Tim Snyder <tim.snyder@modustri.com>
 */

Modustri.controller('UpdateCtrl', ['$log', '$scope', '$location', '$routeParams', '$rootScope', 'PasswordServices', 'AppSettings',
    function($log, $scope, $location, $routeParams, $rootScope, PasswordServices, AppSettings) {

        "use strict";

        $scope.msg = "";

        var tid;

        function fwdToLogin(){
            tid = window.setTimeout(function(){
               $rootScope.$apply(function(){
                $location.path('/');
               });
            }, 5000);
        }

        function handleInvite(){
            if($routeParams.status == 1){
                $scope.msg = "<h1>Success!</h1>";
                $scope.msg += "<p>Your invite has been <strong>confirmed</strong>.</p><p>You will now be forwarded to the login screen...</p>";
                fwdToLogin();
            }
            else{
                $scope.msg = "<h1>Uh oh.</h1>";
                $scope.msg += "<p>Your invite was not processed succesfully. Please contact Modustri Customer Support.</p>";
                $scope.msg +=  "<p><a href='mailto:" + AppSettings.SUPPORT_EMAIL + "'>" + AppSettings.SUPPORT_EMAIL + "</a></p>";
                $scope.msg += "<p>" + AppSettings.SUPPORT_PHONE + "</p>";
            }
        }

        function handlePasswordReset(){
            if($routeParams.status == 1){
                $scope.msg = "<h1>Success!</h1>";
                $scope.msg += "<p>Your password has been <strong>updated</strong>.</p><p>You will now be forwarded to the login screen...</p>";
                fwdToLogin();
            }
            else{
                $scope.msg = "<h1>Uh oh.</h1>";
                $scope.msg += "<p>Your password was not processed succesfully. Please contact Modustri Customer Support.</p>";
                $scope.msg +=  "<p><a href='mailto:" + AppSettings.SUPPORT_EMAIL + "'>" + AppSettings.SUPPORT_EMAIL + "</a></p>";
                $scope.msg += "<p>" + AppSettings.SUPPORT_PHONE + "</p>";
            }
        }

        switch($routeParams.type){
            case "invite":
                handleInvite();
                break;
            case "password-reset":
                handlePasswordReset();
                break;
        }

    }
]);