/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Password services.
 * @author Tim Snyder <tim.snyder@modustri.com>
 */

Modustri.factory('PasswordServices', ['$log', '$http', 'AuthServices', 'AppSettings',
    function($log, $http, AuthServices, AppSettings){

    "use strict";

    console.log("password-srvc::PasswordServices");

    var svc = {};

    svc.changePassword =  function(userId, token, cb){
        $http.get(AppSettings.BASE_URL + 'password/' + token + '/' + userId + '/').success(cb).error(errorCb);
    };
    
    svc.resetPassword =  function(email, cb){
        
        var data = {email: email, cache: false};
        $http.post(AppSettings.BASE_URL + 'password/reset/', data).success(cb).error(errorCb);
        
    };

    svc.acceptInvite = function(inviteID, payload){
      return $http.post(AppSettings.BASE_URL + 'invite/accept/' + inviteID + '/', payload)
          .success(function(obj){
          return obj;
         })
         .error(errorCb);
    };

    function errorCb (data, status, headers, config) {
        var url = config.url;
        // Remove query string.
        var index = url.indexOf('?');
        if (index !== -1) url = url.substring(0, index);

        if (status === 403) {
            $location.path('/404');
        } else {
            var msg = status === 404 ? 'No service found at ' + url + '.' :
                status === 500 ? 'Error in service at ' + url + '.' : data;
            console.log(msg);
        }
    }

    return svc;
}]);