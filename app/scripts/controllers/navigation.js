/*global Modustri*/
/**
* @fileOverview Controller for top-most navigation.
* @author Tim Snyder <tim.snyder@modustri.com>
*/

Modustri.controller('NavigationCtrl', ['$log', '$scope', '$location', 'AuthServices', 'DealerServices','AppSettings',
    function($log, $scope, $location, AuthServices, DealerServices, AppSettings) {

        "use strict";
        DealerServices.getDealerImg(AuthServices.getDealerID())
        .then(function(obj){
            if("image_id" in obj.data.results && obj.data.results.image_id !== null)
            {
                var img = AppSettings.BASE_URL + 'img/' + obj.data.results.image_id + '/';
                $('#logo').css('background-image', 'url(' + img + ')').css('width','250px');
                $('.logo-wrapper').css('width','250px');
            }
        });
        $scope.uiShow = function(ui,f){
            //username is set in the login controller.
            $scope.username = localStorage.getItem('username');
            return AuthServices.uiToggle(AuthServices.getUserLevel(), ui, f);
        };

        $scope.logout = function() {
            $scope.username = false;
            AuthServices.logout();
        };

        //we're altering dom elements from within a controller here, which goes against
        //the 'angular way' but for the sake of expediency it will have to do.
        $scope.toggleActiveMenuItem = function(class_suffix) {
            $('#main-wrapper').attr('class', '').addClass('page-' + class_suffix);
        };

        /**
        * Check if this menu is active (compare the URI)
        * @param: locationPattern : This should be URI pattern, let's say '/machines/'.
        */
        $scope.isActiveNav = function(locationPattern) {

            var currentUri = $location.path();

            var regM1 = currentUri.match(/[^/].*[^/]/g);
            var regM2 = locationPattern.match(/[^/].*[^/]/g);

            if (regM1 !== null && regM1.length > 0) {
                currentUri = '/' + regM1[0]; //cut slashes, and put again
            }

            if (regM2 !== null && regM2.length > 0) {
                locationPattern = '/' + regM2[0]; //cut slashes, and put again
            }

            if (currentUri.indexOf(locationPattern) !== -1) {
                return true;
            }
            else {
                return false;
            }

        };
    }
]);


Modustri.controller('FooterNavigationCtrl', ['$scope',
    function($scope) {

        "use strict";

        $scope.copyrightYear = new Date();
    }
]);
