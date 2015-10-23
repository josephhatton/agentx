/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview eclare our main angular module and include module dependencies. Set up filters.
 * @author Tim Snyder <tim.snyder@modustri.com>
 */

//http://usejsdoc.org/
//http://speakingjs.com/es5/ch29.html

//note - modules can be loaded after they are called as a dependency. angular will wait until everything is
//loaded before bootstrapping the app.
var Modustri = angular.module('Modustri', ['ngRoute', 'ngAnimate', 'ngSanitize', 'ngCookies', 'xeditable',
    'ModustriServices', 'ModustriDirectives', 'Mac', 'ui.bootstrap','google-maps',
    'ui-rangeSlider','ngDraggable', 'ui.sortable', 'angular-carousel']);


angular.module('Modustri')
    .filter('truncate', function () {
        return function (text, length, end) {
            if(text){
                if (isNaN(length)){
                    length = 18;
                }
                if (end === undefined){
                    end = "...";
                }
                if (text.length <= length || text.length - end.length <= length) {
                    return text;
                }
                else {
                    return String(text).substring(0, length - end.length) + end;
                }
            }
        };
    })
    .filter('unit', function(){
        var _math = mathjs();
        return function (input, unit, show_metric){
            if(input){
                if(show_metric === 'true'){
                    switch(unit){
                        case "inches":
                            input = input * 25.4;
                            input = _math.round(input, 2);
                            input += 'mm';
                            break;
                    }
                }
                else{
                    switch(unit){
                        case "inches":
                            input += 'in';
                            break;
                    }
                }
                return input;
            };
        }
    });

//This is for Angular Xeditable
Modustri.run(function(editableOptions) {
    editableOptions.theme = 'bs3';
});

Modustri.run(['$rootScope', '$location', 'AuthServices', 'DealerServices', 'AppSettings', function ($rootScope, $location, AuthServices, DealerServices, AppSettings) {
    $rootScope.$on('$routeChangeStart', function (event) {

        if(localStorage.getItem('username')){
            //Everything is ok

            DealerServices.getDealerImg(AuthServices.getDealerID())
            .then(function(obj){
                if("image_id" in obj.data.results && obj.data.results.image_id !== null)
                {
                    var img = AppSettings.BASE_URL + 'img/' + obj.data.results.image_id + '/';
                    $('#logo').css('background-image', 'url(' + img + ')').css('width','250px');
                    $('.logo-wrapper').css('width','250px');
                }
            });

        } else {
            //If you are not logged in, then redirect you except reset password page

            if (
                $location.$$path.match(/password\/reset-request/) ||
                $location.$$path.match(/password\/reset/)
            ) {
                //Password reset page
            } else if (	$location.$$path.match(/perm\/inspections/) ){

            }
            else {
                $location.path('/');
            }
        }
    });
}]);