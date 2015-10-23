/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Controller settings view.
 * @author Tim Snyder <tim.snyder@modustri.com>
 */

Modustri.controller('SettingsCtrl', ['$log', '$scope', '$routeParams', '$location', 'AuthServices', 'DealerServices', 'AppSettings',
	function($log, $scope, $routeParams, $location, AuthServices, DealerServices, AppSettings) {

        "use strict";

        AuthServices.checkUserCreds();
        

        $scope.image_upload = '';
        
        
        //Get dealer Images
        
        DealerServices.getDealerImg(AuthServices.getDealerID())
        .then(function(obj){
            $scope.Dealer = obj.data.results;
            
            if("image_id" in $scope.Dealer && $scope.Dealer.obj !== null && $scope.Dealer.image_id !== null) {
                $scope.Dealer.img = AppSettings.BASE_URL + 'imgtmb/' + $scope.Dealer.image_id + '/';
                $scope.Dealer.img_full = AppSettings.BASE_URL + 'img/' + $scope.Dealer.image_id + '/';
            }
            
        });
        
        
        
        
        $scope.saveSettings = function () {
            
            if ($scope.image_upload != '') {
                var img_payload = {};
                img_payload = {
                    dealer_obj: $scope.Dealer,
                    file: $scope.image_upload,
                    user_id: AuthServices.getUserID()
                };
                
                DealerServices.saveDealerImg(img_payload).then(function (obj) {
                    //$scope.$emit("obj_saved", 'Setting');
                    $scope.$emit('settings_saved');
                    alert("Settings saved.");
                });
            }
                
        };
    }
]);