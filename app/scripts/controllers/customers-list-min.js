Modustri.controller("CustomersListCtrl",["$log","$scope","$routeParams","$location","CustomerServices","MachineServices","InsServices","AuthServices","UserServices","Utilities","AppSettings",function(e,t,s,i,n,a,r,o,u,c,d){"use strict";o.checkUserCreds(),t.UserSettings=o.getUserSettings();var m=[],g=[],l=s.page?s.page:1;n.getNumberOfCustomers().then(function(e){if("results"in e.data==!1)console.error("problem getting number of customers.");else if(parseInt(e.data.results[0].dealer_customers,10)<=200)t.big_list=!1,l=1>l?1:l,n.getByFirstLetters(i,l,200).then(function(e){t.Customers=e.data.results,_.each(t.Customers,function(e,t,s){e.image_id>0&&(e.img=d.BASE_URL+"imgtmb/"+e.image_id+"/",e.img_full=d.BASE_URL+"img/"+e.image_id+"/",g[t]=setTimeout(function(){m[t]=document.createElement("img"),m[t].src=e.img_full},0)),null!==e.primary_contact_id&&0!==e.primary_contact_id?u.getContactById(e.primary_contact_id).then(function(t){e.email=t.data.results.email}):e.email="",a.getByCustomerId(e.id,1,1).then(function(t){e.number_of_machines=t.data.pages}),r.getByCustomerId(e.id).then(function(t){e.number_of_inspections=t.data.results.length}),n.get(e.id).then(function(t){e.name=t.data.results.name}),e.last_inspected>0&&(e.last_inspected=c.getDatestring(e.last_inspected)),r.getNewestInspectionByCustomerId(e.id).then(function(t){t.data.results[0]&&t.data.results[0].inspection_obj.user&&(e.last_inspectorid=t.data.results[0].inspection_obj.user.id,e.last_inspector=t.data.results[0].inspection_obj.user.username)})})});else{t.big_list=!0;var i=s.index?s.index:"%";l=1>l?1:l,n.getByFirstLetters(i,l).then(function(e){t.pages=e.data.pages,_.each(e.data.results,function(e,t,s){e.image_id>0&&(e.img=d.BASE_URL+"imgtmb/"+e.image_id+"/",e.img_full=d.BASE_URL+"img/"+e.image_id+"/",g[t]=setTimeout(function(){m[t]=document.createElement("img"),m[t].src=e.img_full},0)),u.getContactById(e.primary_contact_id).then(function(t){e.email=t.data.results.email}),a.getByCustomerId(e.id,1,1).then(function(t){e.number_of_machines=t.data.pages}),r.getByCustomerId(e.id).then(function(t){e.number_of_inspections=t.data.results.length}),e.last_inspected>0&&(e.last_inspected=c.getDatestring(e.last_inspected)),r.getNewestInspectionByCustomerId(e.id).then(function(t){t.data.results[0]&&t.data.results[0].inspection_obj.user&&(e.last_inspectorid=t.data.results[0].inspection_obj.user.id,e.last_inspector=t.data.results[0].inspection_obj.user.username)})}),t.Customers=e.data.results,t.PageVars={},t.PageVars.pages="undefined"==typeof e.data.pages?"":_.range(1,e.data.pages),t.PageVars.page=parseInt(l,10),t.PageVars.index=i})}})}]);
//# sourceMappingURL=./customers-list-min.js.map