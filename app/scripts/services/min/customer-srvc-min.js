ModustriServices.factory("CustomerServices",["$log","$http","$q","AuthServices","ServicesSettings",function(e,r,t,s,o){"use strict";var n={};return n.get=function(t){return r.get(o.BASE_URL+"customer/"+s.getUserHash()+"/"+s.getUserID()+"/"+t+"/",{cache:!1}).success(function(e,r,t){return e}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.getAll=function(){return r.get(o.BASE_URL+"customers/"+s.getUserHash()+"/"+s.getUserID()+"/").success(function(e,r,t){return e}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.getByName=function(t){return r.get(o.BASE_URL+"customers/"+s.getUserHash()+"/"+s.getUserID()+"/?name="+t).success(function(e,r,t){return e}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.getDealerCustomers=function(){var t={};return s.getUserLevel()>=2&&(t={dealer_id:s.getDealerID()}),r.post(o.BASE_URL+"customers/"+s.getUserHash()+"/"+s.getUserID()+"/",t).success(function(e,r,t){return e}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.getNumberOfCustomers=function(){var t={type:"dealercustomers"};return s.getUserLevel()>=2&&(t.id=s.getDealerID()),r.post(o.BASE_URL+"stats/"+s.getUserHash()+"/"+s.getUserID()+"/",t).success(function(e,r,t){return e.results}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.getByFirstLetters=function(t,n){var u={name:t,page:n,perpage:52};return s.getUserLevel()>=2&&(u.dealer_id=s.getDealerID()),r.post(o.BASE_URL+"customers/"+s.getUserHash()+"/"+s.getUserID()+"/",u).success(function(e,r,t){return e}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.save=function(t){return r.post(o.BASE_URL+"customer/"+s.getUserHash()+"/"+s.getUserID()+"/"+t.id+"/",t).success(function(e,r,t){return e}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.saveNew=function(t){return r.post(o.BASE_URL+"customer/"+s.getUserHash()+"/"+s.getUserID()+"/",t).success(function(e,t,n){return r.post(o.BASE_URL+"dealercustomer/"+s.getUserHash()+"/"+s.getUserID()+"/",{customer_id:e.results.id,dealer_id:s.getDealerID()}),e}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.getEmptyCustomer=function(){return{name:"",city:"",address:"",country:"",email:"",id:"",phone:"",zip:"",state:"",primary_contact_id:""}},n.savePhoto=function(e){var r=t.defer(),u=new FormData,c=e.customer_obj;delete c.archived,u.append("customer_obj",e.customer_obj),u.append("file",e.file),u.append("customer_id",e.customer_obj.id),u.append("description","Customer image"),u.append("user_id",e.user_id);var a=new XMLHttpRequest;return a.onreadystatechange=function(){if(4===a.readyState&&200===a.status){var e=JSON.parse(a.response);c.image_id=e.results.id,n.save(c).then(function(e){}),r.resolve(!0)}else 4===a.readyState&&200!==a.status&&(r.resolve(!1),console.warn("problem uploading customer image"))},a.open("post",o.BASE_URL+"image/"+s.getUserHash()+"/"+s.getUserID()+"/"),a.send(u),r.promise},n.del=function(t){return r.delete(o.BASE_URL+"customer/"+s.getUserHash()+"/"+s.getUserID()+"/"+t+"/").success(function(e,r,t){return e}).error(function(r,t,s){e.error(r),e.error(t),e.error(s)})},n.getCustomerTest=function(e){return r.get("http://maps.googleapis.com/maps/api/geocode/json",{params:{address:e,sensor:!1}}).then(function(e){var r=[];return angular.forEach(e.data.results,function(e){r.push(e.formatted_address)}),r})},n}]);
//# sourceMappingURL=./customer-srvc-min.js.map