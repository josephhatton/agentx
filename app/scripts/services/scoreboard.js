/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Services for User management
 * @author Modustri
 */


Modustri.factory('ScoreBoardServices', ['$log', '$http', '$location', '$q', 'AuthServices', 'AppSettings',
    function($log, $http, $location, $q, AuthServices, AppSettings){

    "use strict";

    var svc = {};

    svc.getScoreBoardActions = function(action, cb){
        return $http.get(AppSettings.BASE_URL + action+'/' + AuthServices.getUserHash() + '/' + localStorage.getItem("user_id")+ '/')
            .success(cb).error(errorCb);
    };

    svc.getAllScoreBoardData = function(actiondate, cb){
        return $http.get(AppSettings.BASE_URL + actiondate+'/' + AuthServices.getUserHash() + '/' + localStorage.getItem("user_id")+ '/')
            .success(cb).error(errorCb);
    };

    svc.getScoreBoardByMachine = function(actiondate, machine_id, cb){
        return $http.get(AppSettings.BASE_URL + actiondate+'/' + AuthServices.getUserHash() + '/' + localStorage.getItem("user_id") +'/?machine_id='+machine_id+ '/')
            .success(cb).error(errorCb);
    };

    svc.putScoreBoardByMachine = function(actiondate, machine_id, cb){
        return $http.put(AppSettings.BASE_URL + actiondate+'/' + AuthServices.getUserHash() + '/' + localStorage.getItem("user_id") +'/?machine_id='+machine_id+ '/')
            .success(cb).error(errorCb);
    };

    svc.saveAction = function(action)
    {
        return $http.post(AppSettings.BASE_URL + 'machineactiondate/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() +'/',
            action)
            .success(function(data){return data;})
            .error(errorCb);
    };

    svc.deleteAction = function(action_id)
    {
        return $http.delete(AppSettings.BASE_URL + 'machineactiondate/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/' + action_id +'/')
        .success(function(data){return data;})
        .error(errorCb);
    };

    svc.deleteScoreBoardByMachine = function(actiondate, machine_id, cb){
        return $http.delete(AppSettings.BASE_URL + actiondate+'/' + AuthServices.getUserHash() + '/' + localStorage.getItem("user_id") +'/?machine_id='+machine_id+ '/')
            .success(cb).error(errorCb);
    };

    svc.queryAllScoreBoard = function(actiondate, cb){
        return $http.get(AppSettings.BASE_URL + actiondate+'/' + AuthServices.getUserHash() + '/' + localStorage.getItem("user_id")+ '/')
            .success(cb).error(errorCb);
    };

    function errorCb(data, status, headers, config) {
        var url = config.url;
        // Remove query string.
        var index = url.indexOf('?');
        if (index !== -1) url = url.substring(0, index);
        if (status === 403) {
            $location.path('/404');
        } else {
            var msg = status === 404 ? 'No service found at ' + url + '.' :
                status === 500 ? 'Error in service at ' + url + '.' : data;
            //alert(msg);
            console.log(msg);
        }
    }
    return svc;
}]);