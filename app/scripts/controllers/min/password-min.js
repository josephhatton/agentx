Modustri.controller("PasswordCtrl",["$log","$scope","$location","PasswordServices",function(o,s,r,c){"use strict";console.log("password::PasswordCtrl");var n=!1,a=r.search().userid,e=r.search().e;(null===a||void 0===a)&&(n=!0),(null===e||void 0===e)&&(n=!0),s.checkUrlParams=function(){return n},s.changePassword=function(){n||c.changePassword(a,e,function(o){})}}]);