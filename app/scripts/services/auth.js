/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Services for user logins and settings.
 * @author Tim Snyder <tim.snyder@modustri.com>
 */

ModustriServices.factory('AuthServices', ['$log', '$http', '$q', '$location', 'AppSettings',
    function ($log, $http, $q, $location, AppSettings) {

        var svc = {};

        svc.validate = function (user, pass) {
            var deferred = $q.defer();

            //we want the username to be case insensitive
            user = user.toLowerCase();
            $http.post(AppSettings.BASE_URL + 'validate/', { "username": user, "password": pass }).then(
                function (results) {
                    if (results.data.errors.length !== 0) {
                        console.error("bad login");
                        deferred.reject("Incorrect username or password.");
                    }
                    else {
                        svc.authorized = true;
                        //generate user digest, save info to localstorage
                        var user_id = results.data.results[0].id;
                        var dealer_id = results.data.results[0].dealer_id;
                        var salt = results.data.results[0].salt;
                        var digest = svc.generateUserHash(user, pass, salt);
                        var level = results.data.results[0].userlevel;

                        svc.setUserCreds(user, pass, salt, digest, user_id, dealer_id, level);

                        //todo: make api call to get user settings
                        var settings = {
                            show_metric: false
                        };
                        //svc.queryUserSettings(svc.getUserID());
                        svc.setUserSettings(settings);

                        deferred.resolve(svc.authorized);
                    }
                },
                function () {
                    alert('Incorrect user name or password.');
                }
            );

            return deferred.promise;
        };

        /* { user_id: n, pref_obj: { metric: false } } */
        svc.queryUserSettings = function (id) {
            var temp;
            try {
                temp = $http.get(AppSettings.BASE_URL + 'userprefs/' + svc.getUserHash() + '/' + svc.getUserID() + '/?user_id=' + id);
            }
            catch (e) {
                console.dir(e);
            }
        };

        svc.generateUserHash = function (user, pass, salt) {
            //gmt time should be formatted: hour day month yr
            var now = new Date();
            var gmt_time = now.getUTCHours().toString() +
                moment().utc().dayOfYear().toString() + (now.getUTCMonth() + 1).toString() + now.getUTCFullYear().toString();
            var msg = user + gmt_time + pass + salt;
            var digest = CryptoJS.SHA224(msg);
            return digest.toString(CryptoJS.enc.Hex);
        };

        svc.checkUserCreds = function () {
            //get creds from localstorage
            var creds = svc.getUserCreds();
            var new_hash;

        //if user is not logged in, fwd them to the login page
        if (typeof creds.pass === 'undefined' || typeof creds.digest === 'undefined' ||
            "pass" in creds == false || "digest" in creds == false) {
            $location.path('/login/');
        }
        //else create a new hash...
        else {
            new_hash = svc.generateUserHash(creds.user, creds.pass, creds.salt);
            //console.dir(new_hash);
            //console.dir(localStorage["user_id"]);
        }
        svc.saveUserHash(new_hash);
    };

        svc.setUserCreds = function (user, pass, salt, digest, user_id, dealer_id, level) {
            localStorage.setItem("pass",pass);
            localStorage.setItem("salt", salt);
            localStorage.setItem("digest", digest);
            localStorage.setItem("user", user);
            localStorage.setItem("user_id", user_id);
            localStorage.setItem("dealer_id", dealer_id);
            localStorage.setItem("level", level);
        };

        svc.getUserCreds = function () {
            return{
                user: localStorage.getItem("user"),
                pass: localStorage.getItem("pass"),
                salt: localStorage.getItem("salt"),
                digest: localStorage.getItem("digest"),
                user_id: localStorage.getItem("user_id"),
                dealer_id: localStorage.getItem("dealer_id"),
                level: localStorage.getItem("level")
            };
        };

        svc.getUserID = function () {
            return localStorage.getItem("user_id");
        };

        svc.getDealerID = function () {
            return localStorage.getItem("dealer_id");
        };

        svc.getUserHash = function () {
            return localStorage.getItem("digest");
        };

        svc.saveUserHash = function (digest) {
            localStorage.setItem("digest",digest);
        };

        svc.getUserSettings = function () {
            var settings = {
                //need to set this value up so it binds to checkbox correctly
                show_metric: localStorage.getItem('show_metric') === 'false' ? false : 'true'
            };
            return settings;
        };

        svc.setUserSettings = function (settings_obj) {
            localStorage.setItem('show_metric', settings_obj.show_metric);
        };

        svc.saveUserSettings = function (settings_obj) {
            //todo: make call to the api

            //now save to localStorage
            svc.setUserSettings(settings_obj);
        };

        svc.getMetricSetting = function () {
            if (localStorage.getItem('show_metric') === 'false') {
                return false;
            }
            return true;
        };

        svc.setMetricSetting = function (show_metric) {
            console.log('saving settings to localStorage');
            localStorage.setItem('show_metric', show_metric);
        };

        svc.getUserLevel = function () {
            return localStorage.getItem("level");
        };

        svc.setUserLevel = function (level) {
            return localStorage.setItem("level",level);
        };

        svc.logout = function () {
            localStorage.clear();
            $('#logo').css('background-image', 'url(../images/logo-beta.png)').css('width','140px');
            $('.logo-wrapper').css('width', '140px');
            $location.path(AppSettings.BASE_URL);
        };

        svc.uiToggle = function (level, ui, f) {
            var mappings = [
                admin(),
                mgr(),
                dealerAdmin(),
                dealerMgr(),
                dealerUser(),
                custMgr()
            ];
            var actionVal = false;
            mappings.forEach(function (obj) {
                var mapLevel = obj;
                if (mapLevel.uilevel == level) {
                    var action = mapLevel[ui];
                    actionVal = action[f];
                }
            });
            return actionVal;
        };

        function admin() {
            var privMapping = {
                "uilevel": 0,
                uiusers: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uicontacts: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uiinspections: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uidealers: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uisites: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uiimages: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uimachines: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uicustomers: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uireports: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                }
            };
            return privMapping;
        }

        function mgr() {
            var privMapping = {
                "uilevel": 1,
                uiusers: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uicontacts: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uiinspections: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uidealers: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uisites: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uiimages: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uimachines: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uicustomers: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uireports: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                }
            };
            return privMapping;
        }

        function dealerAdmin() {
            var privMapping = {
                "uilevel": 2,
                uiusers: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uicontacts: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uiinspections: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uidealers: {
                    'all': true,
                    'create': false,
                    'edit': false,
                    'delete': false,
                    'view': false
                },
                uisites: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uiimages: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uimachines: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uicustomers: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uireports: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                }
            };
            return privMapping;
        }

        function dealerMgr() {
            var privMapping = {
                "uilevel": 3,
                uiusers: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uicontacts: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uiinspections: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uidealers: {
                    'all': false,
                    'create': false,
                    'edit': false,
                    'delete': false,
                    'view': false
                },
                uisites: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uiimages: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uimachines: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uicustomers: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uireports: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                }
            };
            return privMapping;
        }

        function dealerUser() {
            var privMapping = {
                "uilevel": 4,
                uiusers: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uicontacts: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uiinspections: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uidealers: {
                    'all': false,
                    'create': false,
                    'edit': false,
                    'delete': false,
                    'view': false
                },
                uisites: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uiimages: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uimachines: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uicustomers: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uireports: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                }
            };
            return privMapping;
        }

        function custMgr() {
            var privMapping = {
                "uilevel": 5,
                uiusers: {
                    'all': false,
                    'create': false,
                    'edit': false,
                    'delete': false,
                    'view': false
                },
                uicontacts: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uiinspections: {
                    'all': true,
                    'create': false,
                    'edit': false,
                    'delete': false,
                    'view': true
                },
                uidealers: {
                    'all': false,
                    'create': false,
                    'edit': false,
                    'delete': false,
                    'view': false
                },
                uisites: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': false,
                    'view': true
                },
                uiimages: {
                    'all': true,
                    'create': true,
                    'edit': false,
                    'delete': false,
                    'view': true
                },
                uimachines: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                },
                uicustomers: {
                    'all': false,
                    'create': false,
                    'edit': false,
                    'delete': false,
                    'view': true
                },
                uireports: {
                    'all': true,
                    'create': true,
                    'edit': true,
                    'delete': true,
                    'view': true
                }
            };
            return privMapping;
        }

        return svc;

    }]);
