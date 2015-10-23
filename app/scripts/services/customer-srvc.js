/**
 * @fileOverview Services for both customer and customer list objects.
 * @author Tim Snyder <tim.snyder@agent-x.com>
 */

ModustriServices.factory("CustomerServices", ['$log', '$http', '$q', 'AuthServices', 'ServicesSettings',
    function($log, $http, $q, AuthServices, ServicesSettings) {

        "use strict";

        var svc = {};

        //get single customer from server
        svc.get = function(customerID) {
            return $http.get(ServicesSettings.BASE_URL + 'customer/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/' + customerID + '/', {
                    cache: false
                })
                .success(function(data, status, headers) {
                    return data;
                })
                .error(function(data, status, headers) {
                    $log.error(data);
                    $log.error(status);
                    $log.error(headers);
                });
        };

        svc.getAll = function() {
            return $http.get(ServicesSettings.BASE_URL + 'customers/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/')
                .success(function(data, status, headers) {
                    return data;
                })
                .error(function(data, status, headers) {
                    $log.error(data);
                    $log.error(status);
                    $log.error(headers);
                });
        };

        svc.getByName = function(name) {
            return $http.get(ServicesSettings.BASE_URL + 'customers/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/?name=' + name)
                .success(function(data, status, headers) {
                    return data;
                })
                .error(function(data, status, headers) {
                    $log.error(data);
                    $log.error(status);
                    $log.error(headers);
                });
        };

        //get all customers for a dealer
        svc.getDealerCustomers = function() {
            var data = {};
            if (AuthServices.getUserLevel() >= 2) {
                data = {
                    "dealer_id": AuthServices.getDealerID()
                };
            }
            return $http.post(ServicesSettings.BASE_URL + 'customers/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/', data)
                .success(function(data, status, headers) {
                    return data;
                })
                .error(function(data, status, headers) {
                    $log.error(data);
                    $log.error(status);
                    $log.error(headers);
                });
            /*
            return $http.post(ServicesSettings.BASE_URL + 'dealercustomers/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/', {
                "dealer_id": AuthServices.getDealerID()
            })
                .success(function (data, status, headers) {
                })
                .error(function (data, status, headers) {
                    $log.error(data);
                    $log.error(status);
                    $log.error(headers);
                });
            */
        };

        //get number of inspections by dealer id
        svc.getNumberOfCustomers = function() {
            var data = {
                    "type": "dealercustomers"
                };
            if (AuthServices.getUserLevel() >= 2) {
                data["id"] = AuthServices.getDealerID();
            }
            return $http.post(ServicesSettings.BASE_URL + 'stats/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/', data)
                .success(function(data, status, headers) {
                    return data.results;
                })
                .error(function(data, status, headers) {
                    $log.error(data);
                    $log.error(status);
                    $log.error(headers);
                });
        };

        svc.getByFirstLetters = function(letters, page) {
            var data = {
                    "name": letters,
                    "page": page,
                    "perpage": 52
                };
            if (AuthServices.getUserLevel() >= 2) {
                data["dealer_id"] = AuthServices.getDealerID();
            }
            return $http.post(ServicesSettings.BASE_URL + 'customers/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/', data)
                .success(function(data, status, headers) {
                    return data;
                })
                .error(function(data, status, headers) {
                    $log.error(data);
                    $log.error(status);
                    $log.error(headers);
                });
        };

        //update a current customer
        svc.save = function(payload) {
            return $http.post(ServicesSettings.BASE_URL + 'customer/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/' + payload.id + '/', payload)
                .success(function(data, status, headers) {
                    return data;
                })
                .error(function(data, status, headers) {
                    $log.error(data);
                    $log.error(status);
                    $log.error(headers);
                });
        };

        svc.saveNew = function(payload) {
            return $http.post(ServicesSettings.BASE_URL + 'customer/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/', payload)
                .success(function(customer_data, status, headers) {
                    //associate this customer with a dealer by adding to dealercustomers
                    $http.post(ServicesSettings.BASE_URL + 'dealercustomer/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/', {
                        customer_id: customer_data.results.id,
                        dealer_id: AuthServices.getDealerID()
                    });
                    return customer_data;
                })
                .error(function(data, status, headers) {
                    $log.error(data);
                    $log.error(status);
                    $log.error(headers);
                });
        };

        svc.getEmptyCustomer = function() {
            return {
                name: "",
                city: "",
                address: "",
                country: "",
                email: "",
                id: "",
                phone: "",
                zip: "",
                state: "",
                primary_contact_id: ""
            };
        };

        svc.savePhoto = function(payload) {
            var deferred = $q.defer();
            var fd = new FormData();
            var this_customer = payload.customer_obj;
            delete this_customer.archived;
            fd.append('customer_obj', payload.customer_obj);
            fd.append("file", payload.file);
            fd.append("customer_id", payload.customer_obj.id);
            fd.append("description", "Customer image");
            fd.append("user_id", payload.user_id);

            //the api doesn't like when angular uses the formData api so we will use plain ol xhr.
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    //resolve promise with success
                    var resp = JSON.parse(xhr.response);
                    this_customer.image_id = resp.results.id;
                    svc.save(this_customer).then(function(obj) {
                        //console.log("Customer saved with new image.");
                        //angular's pub/sub
                        //$scope.$emit("obj_saved", "Machine");
                        //$location.path('/machines/' + this_machine.id);
                    });
                    deferred.resolve(true);
                } else if (xhr.readyState === 4 && xhr.status !== 200) {
                    //resolve promise with error
                    deferred.resolve(false);
                    console.warn('problem uploading customer image');
                }
            };
            xhr.open('post', ServicesSettings.BASE_URL + 'image/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/');
            xhr.send(fd);
            return deferred.promise;
        };


        svc.del = function(customerID) {
            return $http.delete(ServicesSettings.BASE_URL + 'customer/' + AuthServices.getUserHash() + '/' + AuthServices.getUserID() + '/' + customerID + '/')
                .success(function(data, status, headers) {
                    return data;
                })
                .error(function(data, status, headers) {
                    $log.error(data);
                    $log.error(status);
                    $log.error(headers);
                });
        };

        svc.getCustomerTest = function(input) {
            return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    address: input,
                    sensor: false
                }
            }).then(function(res) {
                var addresses = [];
                angular.forEach(res.data.results, function(item) {
                    addresses.push(item.formatted_address);
                });
                return addresses;
            });
        };

        return svc;
    }
]);