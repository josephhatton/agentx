Modustri.controller("PasswordSetResetCtrl",["$log","$scope","$location","$routeParams","PasswordServices",function(t,e,s,a,r){"use strict";e.password="";var n={};s.$$path.match(/reset/)?e.handlePasswordReset=function(){"resetID"in a?r.acceptInvite(a.resetID,n).then(function(t){s.path(0===t.data.errors.length?"/update/password-reset/1":"/update/password-reset/0")}):s.path("/")}:s.$$path.match(/set/)?"inviteID"in a?e.handleInvite=function(){""!==e.password&&(n.password=e.password),r.acceptInvite(a.inviteID,n).then(function(t){s.path(0===t.data.errors.length?"/update/invite/1":"/update/invite/0")})}:s.path("/"):s.$$path.match(/reset-request/)?e.handleResetRequest=function(){}:s.path("/")}]);