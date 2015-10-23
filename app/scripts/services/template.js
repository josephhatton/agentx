/*global ModustriServices,_*/
/**
 * @fileOverview Functions for both inspection templates.
 * @author Ma Chen <ma-chen@outlook.com>
 */

ModustriServices.factory('TemplateServices', ['$log', '$q','$http', 'AuthServices',
    'MachineServices', 'Utilities', 'AppSettings',
    function ($log, $q, $http, AuthServices, MachineServices, Utilities, AppSettings) {

        "use strict";

        var svc = {};

        var errorcb = function (data, status, headers) {
            $log.error(data);
            $log.error(status);
            $log.error(headers);
        };


		svc.saveTemplate = function(template){
        	return $http.post(AppSettings.BASE_URL + 'template/' + AuthServices.getUserHash() +
                '/' + AuthServices.getUserID() + '/' + template.id + '/', template)
            .success(function(data, status, headers)
            {
                return data;
            }).error(errorcb);
        }
        
        //get all templates
        svc.getTemplates = function () {
            return $http.get(AppSettings.BASE_URL + 'templates/' + AuthServices.getUserHash() +
                '/' + AuthServices.getUserID() + '/')
                .success(function (data, status, headers) {
                    return data;
                })
                .error(errorcb);
        };
        
        //get template
        svc.getTemplateById = function (id) {
            return $http.get(AppSettings.BASE_URL + 'template/' + AuthServices.getUserHash() +
                '/' + AuthServices.getUserID() + '/' + id + '/')
                .success(function (data, status, headers) {
                    return data;
                })
                .error(errorcb);
        };


		svc.saveTemplateInspectionType = function(templateinspectiontype){
        	return $http.post(AppSettings.BASE_URL + 'templateinspectiontype/' + AuthServices.getUserHash() +
                '/' + AuthServices.getUserID() + '/' + templateinspectiontype.id + '/', templateinspectiontype)
            .success(function(data, status, headers)
            {
                return data;
            }).error(errorcb);
        }
        
        //get all templates
        svc.getTemplateInspectionTypes = function () {
            return $http.get(AppSettings.BASE_URL + 'templateinspectiontypes/' + AuthServices.getUserHash() +
                '/' + AuthServices.getUserID() + '/')
                .success(function (data, status, headers) {
                    return data;
                })
                .error(errorcb);
        };
                
        svc.removeTemplateInspectionTypesByTemplate = function(id) {
        	return $http.get(AppSettings.BASE_URL + 'removetemplateinspectiontypes/' + AuthServices.getUserHash() +
                '/' + AuthServices.getUserID() + '/?template_id=' + id)
                .success(function (data, status, headers) {
                    return data;
                })
                .error(errorcb);
        };
        
        svc.getTemplateInspectionTypesByTemplate = function(id) {
            return $http.get(AppSettings.BASE_URL + 'templateinspectiontypes/' + AuthServices.getUserHash() +
                '/' + AuthServices.getUserID() + '/?template_id=' + id)
                .success(function (data, status, headers) {
                    return data;
                })
                .error(errorcb);
        }
        
        svc.getTemplateInspectionTypesByInspectionType = function(id) {
            return $http.get(AppSettings.BASE_URL + 'templateinspectiontypes/' + AuthServices.getUserHash() +
                '/' + AuthServices.getUserID() + '/?inspection_type_id=' + id)
                .success(function (data, status, headers) {
                    return data;
                })
                .error(errorcb);
        }
        
                
        svc.saveInspectionType = function(inspectiontype){
        	return $http.post(AppSettings.BASE_URL + 'inspectiontype/' + AuthServices.getUserHash() +
                '/' + AuthServices.getUserID() + '/' + inspectiontype.id + '/', inspectiontype)
            .success(function(data, status, headers)
            {
                return data;
            }).error(errorcb);
        }

        svc.getInspectionTypes = function() {
            return $http.get(AppSettings.BASE_URL + 'inspectiontypes/' + AuthServices.getUserHash() +
                '/' + AuthServices.getUserID() + '/')
            .success(function(data, status, headers){
                return data;
            })
            .error(errorcb);
        };
        
        svc.getInspectionTypesByTemplate = function(id) {
            return $http.get(AppSettings.BASE_URL + 'inspectiontypes/' + AuthServices.getUserHash() +
                '/' + AuthServices.getUserID() + '/?template_id=' + id)
                .success(function (data, status, headers) {
                    return data;
                })
                .error(errorcb);
        }
        
        svc.getInspectionType = function(id) {
            return $http.get(AppSettings.BASE_URL + 'inspectiontype/' + AuthServices.getUserHash() +
                '/' + AuthServices.getUserID() + '/' + id + '/')
            .success(function(data, status, headers){
                return data;
            })
            .error(errorcb);
        };


        svc.saveTask = function(task)
        {
            return $http.post(AppSettings.BASE_URL + 'task/' + AuthServices.getUserHash() +
                '/' + AuthServices.getUserID() + '/' + task.id + '/', task)
            .success(function(data, status, headers)
            {
                return data;
            }).error(errorcb);
        };

        svc.getTasks = function() {
            return $http.get(AppSettings.BASE_URL + 'tasks/' + AuthServices.getUserHash() +
                '/' + AuthServices.getUserID() + '/')
                .success(function (data, status, headers) {
                    return data;
                })
                .error(errorcb);
        }

        svc.getTasksByInspectionType = function(id) {
            return $http.get(AppSettings.BASE_URL + 'tasks/' + AuthServices.getUserHash() +
                '/' + AuthServices.getUserID() + '/?inspection_type_id=' + id)
                .success(function (data, status, headers) {
                    return data;
                })
                .error(errorcb);
        }

        svc.getTaskById = function(id) {
            return $http.get(AppSettings.BASE_URL + 'task/' + AuthServices.getUserHash() +
                '/' + AuthServices.getUserID() + '/' + id + '/')
                .success(function (data, status, headers) {
                    return data;
                })
                .error(errorcb);
        }
        
        svc.removeTasksByInspectionType = function(id) {
        	return $http.get(AppSettings.BASE_URL + 'removetasks/' + AuthServices.getUserHash() +
                '/' + AuthServices.getUserID() + '/?inspection_type_id=' + id)
                .success(function (data, status, headers) {
                    return data;
                })
                .error(errorcb);
        }
        

        return svc;
    }
]);