ModustriServices.factory("CustomerServices",["$log","$http","$q","AuthServices","AppSettings",function(e,r,t,s,o){"use strict";var n={};return n.get=function(t,n){return void 0===n&&(n=!1),r.get(o.BASE_URL+"customer/"+s.getUserHash()+"/"+s.getUserID()+"/"+t+"/",{cache:n}).success(function(e,r,t){return e}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.getAll=function(){return r.get(o.BASE_URL+"customers/"+s.getUserHash()+"/"+s.getUserID()+"/",{cache:!0}).success(function(e,r,t){return e}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.getByName=function(t){var n={name:t,dealer_id:s.getDealerID()};return r.post(o.BASE_URL+"customers/"+s.getUserHash()+"/"+s.getUserID()+"/",n).success(function(e,r,t){return e}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.getDealerCustomers=function(){var t={};return s.getUserLevel()>=2&&(t={dealer_id:s.getDealerID()}),r.post(o.BASE_URL+"customers/"+s.getUserHash()+"/"+s.getUserID()+"/",t).success(function(e,r,t){return e}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.getNumberOfCustomers=function(){var t={type:"dealercustomers"};return s.getUserLevel()>=2&&(t.id=s.getDealerID()),r.post(o.BASE_URL+"stats/"+s.getUserHash()+"/"+s.getUserID()+"/",t).success(function(e,r,t){return e.results}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.getByFirstLetters=function(t,n,u){void 0===u&&(u=52);var c={name:t,page:n,perpage:u};return s.getUserLevel()>=2&&(c={name:t,page:n,perpage:u,dealer_id:s.getDealerID()}),r.post(o.BASE_URL+"customers/"+s.getUserHash()+"/"+s.getUserID()+"/",c).success(function(e,r,t){return e}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.addAction=function(t,n,u,c,a,i){var g={model:t,serial:n,type:u,note:c,value:a,converted:i};return r.post(o.BASE_URL+"customers/"+s.getUserHash()+"/"+s.getUserID()+"/",g).success(function(){}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.save=function(t){return r.post(o.BASE_URL+"customer/"+s.getUserHash()+"/"+s.getUserID()+"/"+t.id+"/",t).success(function(e,r,t){return e}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.saveNew=function(t){return r.post(o.BASE_URL+"customer/"+s.getUserHash()+"/"+s.getUserID()+"/",t).success(function(e,t,n){return r.post(o.BASE_URL+"dealercustomer/"+s.getUserHash()+"/"+s.getUserID()+"/",{customer_id:e.results.id,dealer_id:s.getDealerID()}),e}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.getEmptyCustomer=function(){return{name:"",city:"",address:"",country:"",email:"",phone:"",zip:"",state:"",primary_contact_id:""}},n.savePhoto=function(e){var r=t.defer(),u=new FormData,c=e.customer_obj;delete c.archived,u.append("customer_obj",e.customer_obj),u.append("file",e.file),u.append("customer_id",e.customer_obj.id),u.append("description","Customer image"),u.append("user_id",e.user_id);var a=new XMLHttpRequest;return a.onreadystatechange=function(){if(4===a.readyState&&200===a.status){var e=JSON.parse(a.response);c.image_id=e.results.id,n.save(c).then(function(e){}),r.resolve(!0)}else 4===a.readyState&&200!==a.status&&(r.resolve(!1),console.warn("problem uploading customer image"))},a.open("post",o.BASE_URL+"image/"+s.getUserHash()+"/"+s.getUserID()+"/"),a.send(u),r.promise},n.del=function(t){return r.delete(o.BASE_URL+"customer/"+s.getUserHash()+"/"+s.getUserID()+"/"+t+"/").success(function(e,r,t){return e}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.getCustomerTest=function(e){return r.get("http://maps.googleapis.com/maps/api/geocode/json",{params:{address:e,sensor:!1}}).then(function(e){var r=[];return angular.forEach(e.data.results,function(e){r.push(e.formatted_address)}),r})},n}]);
//# sourceMappingURL=./customer-min.js.map