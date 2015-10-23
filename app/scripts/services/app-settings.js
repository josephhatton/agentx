/*global ModustriServices*/
/**
 * @fileOverview Settings for the app and its services
 * @author Tim Snyder <tim.snyder@modustri.com>
 */

ModustriServices.factory('AppSettings', function(){
	// Hey I know, lets figure out what api to use dynamically!
	var base_url = "default";
	var winurl = window.location.host.toLowerCase();
	switch(winurl)
	{
		case "demo.modustri.com":
			base_url = "demo.modustri.com:5000/v1/";
		break;
		case "volvo.modustri.com":
			base_url = 'vapi.modustri.com/v1/';
		break;
		case "berco.modustri.com":
			base_url = 'bapi.modustri.com/v1/';
		break;
		case "dev.modustri.com":
			base_url = "devapi.modustri.com/v1/";
		break;
		case "devportal.modustri.com":
			base_url = "api.modustri.com/v2/";
		break;
		case "local.modustri.com":
		case "jrmbp.local:5757":
		case "jesses-macbook-pro.local:5757":
			// base_url = '0.0.0.0:5000/v2/';
			base_url = 'api.modustri.com/v2/';
			// base_url = 'bapi.modustri.com/v1/';
			// base_url = 'api.modustri.com:5000/v2/';
		break;
		default:
			base_url = "api.modustri.com/v2/";
		break;
	}
	var retval = {
        "BASE_URL" : "http://" + base_url,
        "ITEMS_PER_PAGE" : 30,
        "SUPPORT_EMAIL": "cs@modustri.com",
        "SUPPORT_PHONE": "844-226-5800"
    };
    //console.dir(retval);
    return retval;
});
