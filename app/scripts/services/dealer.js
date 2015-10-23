/*global Modustri*/
/**
 * @fileOverview
 * @author Tim Snyder <tim.snyder@modustri.com>
 */

Modustri.factory('DealerServices', ['$log', '$http', 'AuthServices', 'AppSettings', '$q',
    function($log, $http, AuthServices, AppSettings, $q){

    "use strict";

    var svc = {};

    svc.getDealerList =  function(cb){
        $http.get(AppSettings.BASE_URL + 'dealers/' + AuthServices.getUserHash() + '/' +
            AuthServices.getUserID() + '/', { "cache": true }).success(cb).error(errorCb);
    };

    //these two are not finished!
    svc.getDealerImg = function(dealerID){
        return $http.get(AppSettings.BASE_URL + 'dealer/' + AuthServices.getUserHash() + '/' +
            AuthServices.getUserID() + '/' + dealerID + '/').then(function(obj){
                return obj;
        });
    };
    
    svc.save = function(payload) {
        return $http.post(AppSettings.BASE_URL + 'dealer/' +
                AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/' + payload.id + '/', payload)
            .success(function(data, status, headers) {
                return data;
            })
            .error(function(data, status, headers) {
                $log.error(data);
                $log.error(status);
                $log.error(headers);
            });
        
    };

    svc.saveDealerImg = function(payload){
        
        var dealerID = payload.dealer_id;
        
        var deferred = $q.defer();
        var fd = new FormData();
        var this_dealer = payload.dealer_obj;
        delete this_dealer.archived;
        fd.append('dealer_obj', payload.dealer_obj);
        fd.append("file", payload.file);
        fd.append("dealer_id", payload.dealer_obj.id);
        fd.append("description", "Dealer Image");
        fd.append("user_id", payload.user_id);

        //the api doesn't like when angular uses the formData api so we will use plain ol xhr.
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                //resolve promise with success
                var resp = JSON.parse(xhr.response);
                this_dealer.image_id = resp.results.id;
                svc.save(this_dealer).then(function(obj) {
                });
                deferred.resolve(true);
            } else if (xhr.readyState === 4 && xhr.status !== 200) {
                //resolve promise with error
                deferred.resolve(false);
                console.warn('problem uploading dealer image');
            }
        };
        xhr.open('post', AppSettings.BASE_URL + 'image/' +
            AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/');
        xhr.send(fd);
        return deferred.promise;
        
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
