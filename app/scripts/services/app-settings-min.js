ModustriServices.factory("AppSettings",function(){var o="default",m=window.location.host.toLowerCase();switch(m){case"demo.modustri.com":o="demo.modustri.com:5000/v1/";break;case"volvo.modustri.com":o="vapi.modustri.com/v1/";break;case"berco.modustri.com":o="bapi.modustri.com/v1/";break;case"dev.modustri.com":o="devapi.modustri.com/v1/";break;case"devportal.modustri.com":o="api.modustri.com/v2/";break;case"local.modustri.com":case"jrmbp.local:5757":o="api.modustri.com/v2/";break;default:o="api.modustri.com/v2/"}var r={BASE_URL:"http://"+o,ITEMS_PER_PAGE:30,SUPPORT_EMAIL:"cs@modustri.com",SUPPORT_PHONE:"844-226-5800"};return r});
//# sourceMappingURL=./app-settings-min.js.map