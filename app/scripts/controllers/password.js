/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Controller for handling passwords.
 * @author Joseph Hatton
 */

Modustri.controller('PasswordCtrl', ['$log', '$scope', '$location', 'PasswordServices',
    function($log, $scope, $location, PasswordServices) {

        "use strict";

        console.log("password::PasswordCtrl");
        var checkParam = false;

        var user =  ($location.search()).userid;
        var e =  ($location.search()).e;

        if (user === null || user === undefined ) {
            checkParam = true;

        }
        if (e === null || e === undefined ) {
            checkParam = true;
        }

        $scope.checkUrlParams = function(){
            return checkParam;
        };

        $scope.changePassword = function() {
            if (!checkParam) {
                PasswordServices.changePassword(user, e,  function(data) {
                });
            }
        };
    }
]);