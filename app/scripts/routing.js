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

        .when('/eula', { templateUrl: 'eula.html' })
        .when('/tos', { templateUrl: 'tos.html' })
        .when('/help', { templateUrl: 'help.html' })

        .when('/dashboard', { controller: 'DashboardCtrl', templateUrl: 'views/dashboard.html' })

        .when('/machines/list', { controller: 'MachinesListCtrl', templateUrl: 'views/machines-list.html' })
        .when('/machines/list/:page', { controller: 'MachinesListCtrl', templateUrl: 'views/machines-list.html' })
        .when('/machines/list-by-customer/:customerID', { controller: 'MachinesListCtrl', templateUrl: 'views/machines-list.html' })
        .when('/machines/list-by-customer/:customerID/:page', { controller: 'MachinesListCtrl', templateUrl: 'views/machines-list.html' })
        .when('/machines/add', { controller: 'MachineAddCtrl', templateUrl: 'views/machine-edit.html' })
        .when('/machines/:machineID', { controller: 'MachineCtrl', templateUrl: 'views/machine.html' })
        .when('/machines/:machineID/edit', { controller: 'MachineCtrl', templateUrl: 'views/machine-edit.html' })

        .when('/inspections/list', { controller: 'InspectionsListCtrl', templateUrl: 'views/inspections-list.html' })
        .when('/inspections/list/:page', { controller: 'InspectionsListCtrl', templateUrl: 'views/inspections-list.html' })
        .when('/inspections/add', { controller: 'InspectionCtrl', templateUrl: 'views/inspection-add.html' })
        .when('/inspections/add/:machineID', { controller: 'InspectionCtrl', templateUrl: 'views/inspection-add.html' })
        .when('/inspections/:inspectionID', { controller: 'InspectionCtrl', templateUrl: 'views/inspection.html' })
        .when('/inspections/:inspectionID/edit', { controller: 'InspectionCtrl', templateUrl: 'views/inspection-edit.html' })

        .when('/perm/inspections/:hash', { controller: 'InspectionPermalinkCtrl', templateUrl: 'views/inspection-permalink.html' })

        .when('/customers/list', { controller: 'CustomersListCtrl', templateUrl: 'views/customers-list.html' })
        .when('/customers/list/:index/:page', { controller: 'CustomersListCtrl', templateUrl: 'views/customers-list.html' })
        .when('/customers/list/:page', { controller: 'CustomersListCtrl', templateUrl: 'views/customers-list.html' })
        .when('/customers/add', { controller: 'CustomerAddCtrl', templateUrl: 'views/customer-edit.html' })
        .when('/customers/:customerID', { controller: 'CustomerCtrl', templateUrl: 'views/customer.html' })
        .when('/customers/:customerID/edit', { controller: 'CustomerCtrl', templateUrl: 'views/customer-edit.html' })

        .when('/settings', { controller: 'SettingsCtrl', templateUrl: 'views/settings.html' })
        .when('/users/list', { controller: 'UserCtrl', templateUrl: 'views/users-list.html' })

        .when('/password', { controller: 'PasswordCtrl', templateUrl: 'views/password-change.html' })

        .when('/password/set/:inviteID', { controller: 'PasswordSetResetCtrl', templateUrl: 'views/password-set.html' })
        .when('/password/reset/:resetID', { controller: 'PasswordSetResetCtrl', templateUrl: 'views/password-reset.html' })
        .when('/password/reset-request', { controller: 'PasswordSetResetCtrl', templateUrl: 'views/password-reset-request.html' })
        .when('/update/:type/:status', { controller: 'UpdateCtrl', templateUrl: 'views/update.html' })

        .when('/reports', { controller: 'ReportCtrl', templateUrl: 'views/reports/reports.html' })
        .when('/drilldowns', { controller: 'DrilldownCtrl', templateUrl: 'views/reports/drilldowns.html' })
        .when('/longranges', { controller: 'LongRangeCtrl', templateUrl: 'views/reports/longranges.html' })

        .when('/scoreboard', { controller: 'ScoreboardCtrl', templateUrl: 'views/scoreboard.html' })

        .otherwise( {redirectTo: '/'} );
}]);
