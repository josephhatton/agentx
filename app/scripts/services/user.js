/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Services for User management
 * @author Tim Snyder <tim.snyder@modustri.com>
 */


Modustri.factory('UserServices', ['$log', '$http', '$location', '$q', 'AuthServices', 'AppSettings',
    function($log, $http, $location, $q, AuthServices, AppSettings){

    "use strict";

    var svc = {};

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
            console.log(msg);
        }
    }

    svc.getUserList = function(){
        var ulevel = AuthServices.getUserLevel();
        var apiStr = AppSettings.BASE_URL + 'users/' + AuthServices.getUserHash() + '/' +
            AuthServices.getUserID() + '/' + '?dealer_id=' + AuthServices.getDealerID();
        if (ulevel < 2) {
            apiStr = AppSettings.BASE_URL + 'users/' + AuthServices.getUserHash() + '/' +
            AuthServices.getUserID() + '/';
        }
        return $http.get(apiStr)
            .success(function(data){
                return data;
            });
    };

    svc.addUser = function(user, email, role, dealerId, customerId, cb){
        var data = {
            'username': user,
            'email': email,
            'userlevel': role,
            'dealer_id': dealerId,
            'customer_id': customerId
        };

        $http.post(AppSettings.BASE_URL + 'user/'  + AuthServices.getUserHash() + '/' +
            AuthServices.getUserID() + '/', data)
            .success(cb).error(errorCb);
    };

    svc.updateUser = function(id, user, email, role, dealerId, customerId, cb){
        var data = {
            'username': user,
            'email': email,
            'userlevel': role,
            'dealer_id': dealerId,
            'customer_id': "0"
        };

        $http.post(AppSettings.BASE_URL + 'user/' + AuthServices.getUserHash() + '/' +
                AuthServices.getUserID() + '/' + id + '/', data)
            .success(cb).error(errorCb);
    };

    svc.removeUser = function(id, cb){
        $http.delete(AppSettings.BASE_URL + 'user/' + AuthServices.getUserHash() + '/' +
            AuthServices.getUserID() + '/' + id + '/')
            .success(cb).error(errorCb);
    };

    svc.getContactById = function(id){
        //console.log('called get contact by id ' + id);
        if(id === 0 || id === null || id==="0")
        {
            var deferred = $q.defer();
            deferred.resolve({'data':{'results': false}});
            return deferred.promise;
            //return false;
        }
        return $http.get(AppSettings.BASE_URL + 'contact/' + AuthServices.getUserHash() + '/' +
            AuthServices.getUserID() + '/' + id + '/')
            .success(function(obj){
                return obj;
            })
            .error(errorCb);
    };

    //updates contact or saves new, returns contact id
    svc.saveContact = function(contact_email){
        var contacts = [];
        var found_contact = false;
        var deferred = $q.defer();
        //see if contact email exists already
        if(contact_email === undefined || contact_email.trim() === '')
        {
            deferred.resolve({'data':{'results':{'id':0}}});
            return deferred.promise;//{ 'label': '', 'value':0};
        }
        return $http.get(AppSettings.BASE_URL + 'js/contacts/' + AuthServices.getUserHash() + '/'
            + AuthServices.getUserID() + '/?term=' + contact_email)
            .then(function(obj){
                found_contact = _.find(obj.data, function(curr_contact){
                    return curr_contact.value === contact_email;
                });
                //console.log("found contact");
                //console.dir(found_contact);
                //if so, return contact id
                if(found_contact !== undefined){
                    //console.log('found contact');
                    //deferred.resolve(found_contact);
                    deferred.resolve(obj);
                    return deferred.promise;
                }
                //else save a NEW contact
                else{
                    return $http.post(AppSettings.BASE_URL + 'contact/' + AuthServices.getUserHash() + '/' +
                    AuthServices.getUserID() + '/', { "email": contact_email, "first" : " ", "last" : " " })
                        .success(function(obj){
                            //console.log('new contact');
                            //console.dir(obj);
                            return obj;
                            //return { 'value': obj.results.email, 'label': obj.results.id };
                        })
                        .error(errorCb);
                }
            }
        );
    };

    //TODO: need this to get lists of inspectors for dropdown in inspection form.
    //duplicates above functionality so we should probably update the controllers
    //that use this function.
    svc.query = function(){
        return $http.get(AppSettings.BASE_URL + 'users/' + AuthServices.getUserHash() + '/' +
            AuthServices.getUserID() + '/').then(function(result){
            return result.data;
        });
    };

    svc.getUsersByDealer = function(cb){
        var ulevel = AuthServices.getUserLevel();
        var data = {};
        if (ulevel >= 2) {
            data = {'dealer_id' : AuthServices.getDealerID()};
        }
        $http.post(AppSettings.BASE_URL + 'users/' + AuthServices.getUserHash() + '/' +
            AuthServices.getUserID() + '/', data )
            .success(cb).error(errorCb);
    };

    svc.saveSettings = function(){
        return $http.post(AppSettings.BASE_URL + 'users/' + AuthServices.getUserHash() + '/' +
            AuthServices.getUserID() + '/', {}).then(function(result){
            return result.data;
        });

    };

    return svc;
}]);