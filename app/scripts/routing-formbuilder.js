/*global console, moment, angular, $, alert,confirm,_*/
/**
 * @fileOverview Set up routes and load templates
 * @author Tim Snyder <tim.snyder@modustri.com>
 * @see http://weblogs.asp.net/dwahlin/archive/2013/08/14/angularjs-routing-changes.aspx
 */

Modustri.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    //we're sticking with # routing because the history api isn't supported by ie9.
    $locationProvider.html5Mode(false);
    $routeProvider
        .when('/', { controller: 'LoginCtrl', templateUrl: 'views/login.html' })

        .when('/dashboard', { controller: 'FormBuilderCtrl', templateUrl: 'views/partials/formbuilder/dashboard.html' })
        .when('/templates', { controller: "FormBuilderCtrl", templateUrl: 'views/partials/formbuilder/templates.html'})
        .when('/templates/:ID', { controller: "FormBuilderCtrl", templateUrl: 'views/partials/formbuilder/templates.html'})
        .when('/inspections', { controller: "FormBuilderCtrl", templateUrl: 'views/partials/formbuilder/inspections.html'})
        .when('/inspections/:ID', { controller: "FormBuilderCtrl", templateUrl: 'views/partials/formbuilder/inspections.html'})
        .when('/forms', { controller: "FormBuilderCtrl", templateUrl: 'views/partials/formbuilder/forms.html'})
        .when('/tasks', { controller: "FormBuilderCtrl", templateUrl: 'views/partials/formbuilder/tasks.html'})
        .when('/questions', { controller: "FormBuilderCtrl", templateUrl: 'views/partials/formbuilder/questions.html'})
        .when('/settings', { controller: 'SettingsCtrl', templateUrl: 'views/settings.html' })
        .when('/users/list', { controller: 'UserCtrl', templateUrl: 'views/users-list.html' })

        .when('/password', { controller: 'PasswordCtrl', templateUrl: 'views/password-change.html' })

        .when('/password/set/:inviteID', { controller: 'PasswordSetResetCtrl', templateUrl: 'views/password-set.html' })
        .when('/password/reset/:resetID', { controller: 'PasswordSetResetCtrl', templateUrl: 'views/password-reset.html' })
        .when('/password/reset-request', { controller: 'PasswordSetResetCtrl', templateUrl: 'views/password-reset-request.html' })
        .when('/update/:type/:status', { controller: 'UpdateCtrl', templateUrl: 'views/update.html' })

        .otherwise( {redirectTo: '/'} );
}]);
