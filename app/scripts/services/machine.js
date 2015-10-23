/*global ModustriServices, angular*/
/**
 * @fileOverview Fns for both machine and machine list obj - talking to the api, creating new machine obj and component obj.
 * @author Tim Snyder <tim.snyder@modustri.com>
 */

ModustriServices.factory('MachineServices', ['$http', '$q', 'AuthServices', 'Utilities', 'AppSettings',
    function($http, $q, AuthServices, Utilities, AppSettings) {

        "use strict";
        var svc = {};

        var errorcb = function(data, status, headers) {
            console.error(data);
            console.error(status);
            console.error(headers);
        };

        //get a list of machines from server
        svc.query = function(page, c_id) {
            if(!page){
                page = 1;
            }
            if(c_id){
                return $http.post(AppSettings.BASE_URL + 'machines/' + AuthServices.getUserHash() + '/' +
                        AuthServices.getUserID() + '/?page=' + page,
                    { "customer_id": c_id, "perpage": AppSettings.ITEMS_PER_PAGE })
                    .success(function(data, status, headers) {
                        return data;
                    })
                    .error(errorcb);
            }
            else{
                var data = { 'dealer_id': AuthServices.getDealerID(), 'perpage' : AppSettings.ITEMS_PER_PAGE };
                if (AuthServices.getUserLevel() < 2) {
                    data = { 'perpage' : AppSettings.ITEMS_PER_PAGE };
                }
                return $http.post(AppSettings.BASE_URL + 'machines/' + AuthServices.getUserHash() + '/' +
                    AuthServices.getUserID() + '/?page=' + page, data)
                    .success(function(data, status, headers) {
                        return data;
                    })
                    .error(errorcb);
            }
        };

        svc.get = function(machineID, cache) {

            if (typeof cache == 'undefined') {
                cache = true;
            }

            return $http.get(AppSettings.BASE_URL + 'machine/' + AuthServices.getUserHash() + '/' +
                AuthServices.getUserID() + '/' + machineID + '/',{cache: cache})
                .success(function(data, status, headers) {
                    return data;
                })
                .error(errorcb);

        };

        svc.getProjections = function(machine_id)
        {
            return $http.get(AppSettings.BASE_URL + 'machineratings/' + AuthServices.getUserHash() + '/' +
                AuthServices.getUserID() + '/' + machine_id +'/', {cache: true})
            .success(function(data,status,headers)
            {
                data['machine_id'] = machine_id;
                return data;
            }).error(errorcb);
        };

        svc.getByCustomerId = function(customerID, page, perPage) {
            var params = { "customer_id": customerID};
            if (perPage == undefined) {
                perPage = AppSettings.ITEMS_PER_PAGE;
            }
            if (page !== undefined) {
                params.perpage = perPage;
                params.page = page;
            }

            return $http.post(AppSettings.BASE_URL + 'machines/' + AuthServices.getUserHash() + '/' +
                    AuthServices.getUserID() + '/',
            params)
                .success(function(data, status, headers) {
                    return data;
                })
                .error(errorcb);
        };

        svc.getByModelId = function(modelID, dealerID) {
            return $http.post(AppSettings.BASE_URL + 'machines/' + AuthServices.getUserHash() + '/' +
                AuthServices.getUserID() + '/', { "model_id" : modelID, "dealer_id" : dealerID})
                .success(function(data, status, headers) {
                    return data;
                })
                .error(errorcb);
        };

        svc.getBySerial = function(serial) {
            return $http.post(AppSettings.BASE_URL + 'machines/' + AuthServices.getUserHash() + '/' +
                AuthServices.getUserID() + '/', {
                'serial': serial
            })
                .success(function(data, status, headers) {
                    return data;
                })
                .error(errorcb);
        };

        svc.save = function(payload) {
            return $http.post(AppSettings.BASE_URL + 'machine/' + AuthServices.getUserHash() + '/' +
                AuthServices.getUserID() + '/' + payload.id + '/', payload)
                .success(function(data, status, headers) {
                    return data;
                })
                .error(errorcb);
        };

        svc.saveNew = function(payload) {
            return $http.post(AppSettings.BASE_URL + 'machine/' + AuthServices.getUserHash() + '/' +
                AuthServices.getUserID() + '/', payload)
                .success(function(data, status, headers) {
                    return data;
                })
                .error(errorcb);
        };

        svc.queryManufacturers = function() {
            return $http.get(AppSettings.BASE_URL + 'manufacturers/' + AuthServices.getUserHash() + '/' +
                AuthServices.getUserID() + '/', { cache : true })
                .success(function(data, status, headers) {
                    return data;
                })
                .error(errorcb);
        };

        svc.getManufacturerById = function(manufacturer_id) {
            return $http.get(AppSettings.BASE_URL + 'manufacturer/' + AuthServices.getUserHash() + '/' +
                AuthServices.getUserID() + '/' + manufacturer_id + '/',{cache: true})
                .success(function(data, status, headers) {
                    return data;
                })
                .error(errorcb);
        };

        //todo: machine type is hardcoded to bulldozer for now. need to make it dynamic.
        svc.queryModels = function(manufacturer_id, machine_type) {
            if (manufacturer_id) {
                return $http.post(AppSettings.BASE_URL + 'models/' + AuthServices.getUserHash() + '/' +
                    AuthServices.getUserID() + '/', { 'manufacturer_id' : manufacturer_id })
                    .success(function(data, status, headers) {
                        return data;
                    })
                    .error(errorcb);
            } else {
                return $http.get(AppSettings.BASE_URL + 'models/' + AuthServices.getUserHash() + '/' +
                    AuthServices.getUserID() + '/')
                    .success(function(data, status, headers) {
                        return data;
                    })
                    .error(errorcb);
            }
        };

        svc.getEmptyMachine = function() {
            return {
                id: "",
                main_image_id: "",
                manufacturer_id: "",
                serial: "",
                dealer_id: "",
                hour_meter_operational: "",
                under_carriage_brand: "",
                equipment_id: "",
                hour_meter_reading: "",
                customer_id: "",
                model: "",
                under_carriage_code: "",
                sales_rep: "",
                product_support_sales_rep: "",
                image_upload: ""
            };
        };

        svc.queryPhotos = function(machine_id) {
            return $http.get(AppSettings.BASE_URL + 'images/?machine_id=' + machine_id)
                .success(function(data, status, headers) {
                    return data;
                })
                .error(errorcb);
        };

        svc.getPhoto = function(image_id) {
            return $http.get(AppSettings.BASE_URL + 'image/' + AuthServices.getUserHash() + '/' +
                AuthServices.getUserID() + '/' + image_id + '/')
                .success(function(data, status, headers) {
                    return data;
                })
                .error(errorcb);
        };

        svc.savePhoto = function(payload){
            var deferred = $q.defer();
            var fd = new FormData();
            var this_machine = payload.machine_obj;
            delete this_machine.archived;
            fd.append('machine_obj', payload.machine_obj);
            fd.append("machine_id", payload.machine_id);
            fd.append("file", payload.file);
            fd.append("customer_id", payload.customer_id);
            fd.append("description", "Machine image");
            fd.append("user_id", payload.user_id);

            //the api doesn't like when angular uses the formData api so we will use plain ol xhr.
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(){
                if(xhr.readyState === 4 && xhr.status === 200){
                    //resolve promise with success
                    var xhr_response = xhr.response + '';
                    var resp = JSON.parse(xhr_response);
                    this_machine.main_image_id = resp.results.id;
                    svc.save(this_machine).then(function(obj){
                        console.log("Machine saved with new image.");
                    });
                    deferred.resolve(true);
                }
                else if(xhr.readyState === 4 && xhr.status !== 200){
                    //resolve promise with error
                    deferred.resolve(false);
                    console.warn('problem uploading image');
                }
            };
            xhr.open('post', AppSettings.BASE_URL + 'image/' + AuthServices.getUserHash() + '/' +
                AuthServices.getUserID() + '/');
            xhr.send(fd);
            return deferred.promise;
        };

        svc.getPhotoThumb = function(image_id) {
            return $http.get(AppSettings.BASE_URL + 'imagetmb/' + image_id + '/')
                .success(function(data, status, headers) {
                    return data;
                })
                .error(errorcb);
        };

        //todo: move this to inspection services
        svc.getInspectionPhotos = function(inspection_id) {
            return $http.get(AppSettings.BASE_URL + 'images/?inspection_id=' + inspection_id)
                .success(function(data, status, headers) {
                    return data;
                })
                .error(errorcb);
        };

        svc.del = function(machine_id) {
            return $http.delete(AppSettings.BASE_URL + 'machine/' + AuthServices.getUserHash() + '/' +
                AuthServices.getUserID() + '/' + machine_id + '/')
                .success(function(data, status, headers) {
                    return data;
                })
                .error(errorcb);
        };

        svc.getComponentsByMachineModel = function(model_id, cb) {
            $http.post(AppSettings.BASE_URL + 'componentmodels/' + AuthServices.getUserHash() + '/' +
                AuthServices.getUserID() + '/', {
                "model_id": model_id
            }).success(cb).error(errorcb);
        };

        svc.getComponentData = function(component_id) {
            return $http.get(AppSettings.BASE_URL + 'component/' + AuthServices.getUserHash() + '/' +
                AuthServices.getUserID() + '/' + component_id + '/')
                .success(function(data, status, headers) {
                    return data;
                })
                .error(errorcb);
        };

        /**
         * @desc Gets a list of types of components and their IDs
         */

        svc.getComponentTypes = function() {
            return $http.get(AppSettings.BASE_URL + 'componenttypes/' + AuthServices.getUserHash() + '/' +
                AuthServices.getUserID() + '/')
                .success(function(data, status, headers) {
                    var component_types = [];
                    angular.forEach(data.results, function(value, key) {
                        component_types.push(value.type);
                    });
                    component_types.push('Idlers Rear');
                    component_types.push('Idlers Front');
                    return component_types;
                });
        };

        /**
         * @desc
         * @returns {promise|Promise.promise|Q.promise}
         */

        svc.getComponentTypesMachineNames = function() {
            var deferred = $q.defer();
            $http.get(AppSettings.BASE_URL + 'componenttypes/' + AuthServices.getUserHash() + '/' +
                AuthServices.getUserID() + '/')
                .then(function(obj, status, headers) {
                    //convert to snake case
                    var machine_names = [];
                    var temp;
                    angular.forEach(obj.data.results, function(value, key) {
                        temp = value.type.toLowerCase();
                        temp = temp.replace(/\s/g, "_");
                        if(!temp.match(/s$/)){
							temp = temp + 's';
                        }
                        machine_names.push(temp);
                    });
                    machine_names.push('idlers_front');
                    machine_names.push('idlers_rear');
                    deferred.resolve(machine_names);
                });
            return deferred.promise;
        };

        svc.getPartManufacturers = function(){
            return $http.get(AppSettings.BASE_URL + 'partmanufacturers/' + AuthServices.getUserHash() +
                '/' + AuthServices.getUserID() + '/', { cache : true })
                .success(function(data, status, headers){
                    return data;
                })
                .error(errorcb);
        };

        /**
         * @desc
         * @param $scope
         * @param {number} component_id (int)
         * @returns {promise|Promise.promise|Q.promise}
         || component_id.constructor !== ""
         */
        svc.createComponentObj = function($scope, component_id) {
            if (component_id === null) {
                var deferred = $q.defer();
                console.error('bad component id: ' + component_id);
                deferred.resolve(false);
                return deferred.promise;  //should return a promise?
            }

            //create our base 'class'
            function Component(){
                Object.defineProperties(this, {

                    component_id: {
                        configurable: false,
                        enumerable: true,
                        writeable: true,
                        get: function() {
                            return this._component_id;
                        },
                        set: function(v) {
                            this._component_id = v;
                        }
                    },

                    description: {
                        configurable: false,
                        enumerable: true,
                        writeable: true,
                        get: function() {
                            return this._description;
                        },
                        set: function(v) {
                            this._description = v;
                        }
                    },

                    label: {
                        configurable: false,
                        enumerable: true,
                        writeable: true,
                        get: function() {
                            return this._label;
                        },
                        set: function(v) {
                            //there's probably a more elegant way to do this, since this
                            //is just component name + component description.
                            this._label = v;
                        }
                    },

                    manufacturer_id: {
                        configurable: false,
                        enumerable: true,
                        writeable: true,
                        get: function() {
                            return this._manufacturer_id;
                        },
                        set: function(v) {
                            this._manufacturer_id = v;
                        }
                    },

                    type: {
                        configurable: false,
                        enumerable: true,
                        writeable: true,
                        get: function() {
                            return this._type;
                        },
                        set: function(v) {
                            this._type = v;
                        }
                    },

                    component_type_id: {
                        configurable: false,
                        enumerable: true,
                        writeable: true,
                        get: function() {
                            return this._component_type_id;
                        },
                        set: function(v) {
                            this._component_type_id = v;
                        }
                    },

                    wear_maps: {
                        configurable: false,
                        enumerable: false,
                        writeable: true,
                        get: function() {
                            return this._wear_maps;
                        },
                        set: function(v) {
                            this._wear_maps = v;
                        }
                    }
                });
            }

            /**
             * @desc
             * @param {number} measured
             * @param {object} wear_options
             * @param {string} tool_type
             */

            Component.prototype.getWearPercentages = function(measured, wear_options, tool_type) {
                var percentage = null;
                var out_keys, z, i, percent, curr, next;
                //note - this is not asynchronous, but will be when we move this data to the server.
                var component_types = [];
                svc.getComponentTypes().then(function(obj){
                    component_types = obj;
                });

                measured = parseFloat(measured);

                //find the right table for this measurement type.
                for (z in this.wear_maps.measures) {
                    if (this.wear_maps.measures[z].keyname === tool_type) {
                        break;
                    }
                }

                //find the appropriate percentage that goes with the measured value.
                for (i in this.wear_maps.measures[z].values) {
                    curr = this.wear_maps.measures[z].values[i];
                    next = this.wear_maps.measures[z].values[parseInt(i, 10) + 1];
                    curr = parseFloat(curr);
                    if (next === undefined) {
                        next = null;
                    } else {
                        next = parseFloat(next);
                    }
                    //if we have hit the end of the list
                    if (next === null) {
                        if (percentage === null) {
                            //these default to lesser wear.

                            switch (this.component_type_id) {
                                case 1:
                                    //link

                                    if (wear_options.link_allowable_wear == "greater" && this.wear_maps.percents[0].label == "Greater Wear Percent") {
                                        percentage = this.wear_maps.percents[0].values[i];
                                    }
                                    else if (wear_options.link_allowable_wear == "greater" && typeof this.wear_maps.percents[1] !== undefined && this.wear_maps.percents[1].label == "Greater Wear Percent") {
                                        percentage = this.wear_maps.percents[1].values[i];
                                    }
                                    else if (wear_options.link_allowable_wear == "lesser" && this.wear_maps.percents[0].label == "Lesser Wear Percent") {
                                        percentage = this.wear_maps.percents[0].values[i];
                                    }
                                    else if (wear_options.link_allowable_wear == "lesser" && typeof this.wear_maps.percents[1] !== undefined && this.wear_maps.percents[1].label == "Lesser Wear Percent") {
                                        percentage = this.wear_maps.percents[1].values[i];
                                    }
                                    else {
                                        percentage = this.wear_maps.percents[0].values[i];
                                    }
                                    break;

                                case 2:
                                    //bushing

                                    if (wear_options.bushing_allowable_wear == "greater" && this.wear_maps.percents[0].label == "Greater Wear Percent") {
                                        percentage = this.wear_maps.percents[0].values[i];
                                    }
                                    else if (wear_options.bushing_allowable_wear == "greater" && typeof this.wear_maps.percents[1] !== undefined && this.wear_maps.percents[1].label == "Greater Wear Percent") {
                                        percentage = this.wear_maps.percents[1].values[i];
                                    }
                                    else if (wear_options.bushing_allowable_wear == "lesser" && this.wear_maps.percents[0].label == "Lesser Wear Percent") {
                                        percentage = this.wear_maps.percents[0].values[i];
                                    }
                                    else if (wear_options.bushing_allowable_wear == "lesser" && typeof this.wear_maps.percents[1] !== undefined && this.wear_maps.percents[1].label == "Lesser Wear Percent") {
                                        percentage = this.wear_maps.percents[1].values[i];
                                    }
                                    else {
                                        percentage = this.wear_maps.percents[0].values[i];
                                    }
                                    break;

                                case 3:
                                    //shoe
                                    if ((this.wear_maps.percents[0].label === "High Impact Wear Percent") ||
                                        (this.wear_maps.percents[0].label === "Low/Moderate Impact Wear Percent")) {
                                        if (wear_options.impact === "high") {
                                            percentage = this.wear_maps.percents[1].values[i];
                                        } else {
                                            percentage = this.wear_maps.percents[0].values[i];
                                        }
                                    } else {
                                        percentage = this.wear_maps.percents[0].values[i];
                                    }
                                    break;

                                default:
                                    percentage = this.wear_maps.percents[0].values[i];
                            }

                        }
                    }
                    //otherwise we continue on...
                    else {

                        if ((curr >= measured) && (next < measured)) {
                            switch (this.component_type_id) {
                                case 1:
                                    //link
                                    if (wear_options.link_allowable_wear == "greater" && this.wear_maps.percents[0].label == "Greater Wear Percent") {
                                        percentage = this.wear_maps.percents[0].values[i];
                                    }
                                    else if (wear_options.link_allowable_wear == "greater" && typeof this.wear_maps.percents[1] !== undefined && this.wear_maps.percents[1].label == "Greater Wear Percent") {
                                        percentage = this.wear_maps.percents[1].values[i];
                                    }
                                    else if (wear_options.link_allowable_wear == "lesser" && this.wear_maps.percents[0].label == "Lesser Wear Percent") {
                                        percentage = this.wear_maps.percents[0].values[i];
                                    }
                                    else if (wear_options.link_allowable_wear == "lesser" && typeof this.wear_maps.percents[1] !== undefined && this.wear_maps.percents[1].label == "Lesser Wear Percent") {
                                        percentage = this.wear_maps.percents[1].values[i];
                                    }
                                    else {
                                        percentage = this.wear_maps.percents[0].values[i];
                                    }
                                    break;

                                case 2:
                                    //bushing

                                    if (wear_options.bushing_allowable_wear == "greater" && this.wear_maps.percents[0].label == "Greater Wear Percent") {
                                        percentage = this.wear_maps.percents[0].values[i];
                                    }
                                    else if (wear_options.bushing_allowable_wear == "greater" && typeof this.wear_maps.percents[1] !== undefined && this.wear_maps.percents[1].label == "Greater Wear Percent") {
                                        percentage = this.wear_maps.percents[1].values[i];
                                    }
                                    else if (wear_options.bushing_allowable_wear == "lesser" && this.wear_maps.percents[0].label == "Lesser Wear Percent") {
                                        percentage = this.wear_maps.percents[0].values[i];
                                    }
                                    else if (wear_options.bushing_allowable_wear == "lesser" && typeof this.wear_maps.percents[1] !== undefined && this.wear_maps.percents[1].label == "Lesser Wear Percent") {
                                        percentage = this.wear_maps.percents[1].values[i];
                                    }
                                    else {
                                        percentage = this.wear_maps.percents[0].values[i];
                                    }
                                    break;

                                case 3:
                                    //shoe
                                    if ((this.wear_maps.percents[0].label === "High Impact Wear Percent") ||
                                        (this.wear_maps.percents[0].label === "Low/Moderate Impact Wear Percent")) {
                                        if (wear_options.impact === "high") {
                                            percentage = this.wear_maps.percents[1].values[i];
                                        } else {
                                            percentage = this.wear_maps.percents[0].values[i];
                                        }
                                    } else {
                                        percentage = this.wear_maps.percents[0].values[i];
                                    }
                                    break;

                                default:
                                    percentage = this.wear_maps.percents[0].values[i];
                            }
                        }
                    }
                }
                return percentage;
            };

            //this function makes async calls so it needs to return a promise.
            var deferred = $q.defer();

            var getComponentTypes = this.getComponentTypes;
            var getComponentData = this.getComponentData;

            //add properties
            $q.all([getComponentData(component_id), getComponentTypes()])
                .then(function(obj) {

                    //instantiate our object
                    var Comp = new Component();

                    var component_types = obj[1].data.results;
                    Comp.component_id = obj[0].data.results.id;
                    Comp.manufacturer_id = obj[0].data.results.part_manufacturer_id;
                    Comp.component_name = obj[0].data.results.name;
                    Comp.component_type_id = obj[0].data.results.component_type_id;
                    Comp.description = obj[0].data.results.description;
                    Comp.wear_maps = obj[0].data.results.wear_map;
                    //component types start with 0 index
                    Comp.type = component_types[obj[0].data.results.component_type_id - 1].type;
                    Comp.label = Comp.component_name + " - " + Comp.description;

                    //Object.preventExtensions(Component);
                    //Object.seal(Component);
                    deferred.resolve(Comp);
                });

            return deferred.promise;
        };

        return svc;

    }
]);
