Modustri.controller("SettingsCtrl",["$log","$scope","$routeParams","$location","AuthServices","DealerServices","AppSettings",function(e,a,i,t,l,r,s){"use strict";l.checkUserCreds(),a.image_upload="",r.getDealerImg(l.getDealerID()).then(function(e){a.Dealer=e.data.results,"image_id"in a.Dealer&&null!==a.Dealer.obj&&null!==a.Dealer.image_id&&(a.Dealer.img=s.BASE_URL+"imgtmb/"+a.Dealer.image_id+"/",a.Dealer.img_full=s.BASE_URL+"img/"+a.Dealer.image_id+"/")}),a.saveSettings=function(){if(""!=a.image_upload){var e={};e={dealer_obj:a.Dealer,file:a.image_upload,user_id:l.getUserID()},r.saveDealerImg(e).then(function(e){a.$emit("settings_saved"),alert("Settings saved.")})}}}]);