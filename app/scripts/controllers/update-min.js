Modustri.controller("UpdateCtrl",["$log","$scope","$location","$routeParams","$rootScope","PasswordServices","AppSettings",function(s,o,e,t,r,p,n){"use strict";function a(){i=window.setTimeout(function(){r.$apply(function(){e.path("/")})},5e3)}function c(){1==t.status?(o.msg="<h1>Success!</h1>",o.msg+="<p>Your invite has been <strong>confirmed</strong>.</p><p>You will now be forwarded to the login screen...</p>",a()):(o.msg="<h1>Uh oh.</h1>",o.msg+="<p>Your invite was not processed succesfully. Please contact Modustri Customer Support.</p>",o.msg+="<p><a href='mailto:"+n.SUPPORT_EMAIL+"'>"+n.SUPPORT_EMAIL+"</a></p>",o.msg+="<p>"+n.SUPPORT_PHONE+"</p>")}function u(){1==t.status?(o.msg="<h1>Success!</h1>",o.msg+="<p>Your password has been <strong>updated</strong>.</p><p>You will now be forwarded to the login screen...</p>",a()):(o.msg="<h1>Uh oh.</h1>",o.msg+="<p>Your password was not processed succesfully. Please contact Modustri Customer Support.</p>",o.msg+="<p><a href='mailto:"+n.SUPPORT_EMAIL+"'>"+n.SUPPORT_EMAIL+"</a></p>",o.msg+="<p>"+n.SUPPORT_PHONE+"</p>")}o.msg="";var i;switch(t.type){case"invite":c();break;case"password-reset":u()}}]);
//# sourceMappingURL=./update-min.js.map