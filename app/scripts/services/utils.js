/*global moment, angular, $, alert,confirm,_, mathjs*/
/**
 * @fileOverview Misc helper functions.
 * @author Tim Snyder <tim.snyder@modustri.com>
 */

ModustriServices.factory('Utilities', ['$http', function($http){

    var svc = {};

    svc.getDatestring = function(unix_timestamp){
        return moment.unix(unix_timestamp).utc().format('MM/DD/YYYY');
    };

    svc.getTimestamp = function(datestring){
      //attaching time to the date is a hack.
      //we'll use it until the uid has been implemented as a unique identifier
      var time = moment.utc().format('hh:mm:ss');
      return moment.utc(datestring + ' ' +  time, 'MM/DD/YYYY hh:mm:ss').unix();

      //this is the proper format
      //return moment.utc(datestring).unix();
    };

    //takes a string and returns it in snake_case plural format.
    svc.snakeCase = function(s){
        var temp = s.toLowerCase();
        temp = temp.replace(/\s/g, "_");
        if(!temp.match(/s$/)){
			temp = temp + 's';
        }
        return temp;
    };

    svc.mmToIn = function(mm){
        var _math = mathjs();
        return _math.round(parseFloat(mm) * 0.0393701, 2);
    };

    svc.inToMm = function(inches){
        var _math = mathjs();
        return _math.round(parseFloat(inches) * 0.0393701, 2);
    };

    svc.showLoading = function() {
        if (angular.element('.ajax-loading-mask').length === 0)
        {
            angular.element('body').append('<div class="ajax-loading-mask"></div>');
        }
        angular.element('.ajax-loading-mask').show();
    };

    svc.hideLoading = function() {
        angular.element('.ajax-loading-mask').hide();
    };

    svc.validateForm = function(curForm) {
        if (curForm !== undefined && curForm.$invalid) {
            curForm.$setDirty(true);
            if (curForm.$error.required.length > 0) {
                for (var idx = 0; idx < curForm.$error.required.length; idx ++) {
                    curForm.$error.required[idx].$dirty = true;
                }
            }
            //Invalid
            alert("Oops! Change a few things up and try submitting again.");
            return false;
        }

        return true;
    };

    return svc;
}]);