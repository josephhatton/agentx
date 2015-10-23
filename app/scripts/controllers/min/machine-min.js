Modustri.controller("MachineCtrl",["$log","$scope","$routeParams","$location","MachineServices","InsServices","CustomerServices","Utilities","AuthServices","AppSettings",function(e,i,t,a,n,s,c,r,o,d){"use strict";o.checkUserCreds(),i.UserSettings=o.getUserSettings();var u=a.url(),h=u.match(/edit/),m,l,M=o.getDealerID();i.image_upload="",i.customer_changed=!1,i.state=_.isArray(h)&&"edit"===h[0]?"edit":"view",n.get(t.machineID).then(function(e){i.Machine=e.data.results,i.Machine.serial=i.Machine.serial.trim().length>0?i.Machine.serial:"N/A",i.Machine.equipment_id=i.Machine.equipment_id.trim().length>0?i.Machine.equipment_id:"N/A",i.Machine.hide_upload="edit"===i.state?!1:!0,i.Inspections=[],""!==i.Machine.main_image_id&&i.Machine.main_image_id>0&&(i.Machine.img=d.BASE_URL+"imgtmb/"+i.Machine.main_image_id+"/",i.Machine.img_full=d.BASE_URL+"img/"+i.Machine.main_image_id+"/",m=setTimeout(function(){l=document.createElement("img"),l.src=i.Machine.img_full},0)),c.get(e.data.results.customer_id).then(function(e){i.Customer=e.data.results,i.Machine.customer_name=e.data.results.name,i.Customer.url="#/customers/"+e.data.results.id+"/",s.getByMachineId(i.Machine.id).then(function(e){i.Inspections=e.data.results,_.each(i.Inspections,function(e,i,t){e.datestring=r.getDatestring(e.timestamp),e.update_datestamp=r.getDatestring(e.modified)}),_.each(i.Inspections,function(e,i,t){e.inspector=e.inspection_obj.hasOwnProperty("user")&&void 0!==e.inspection_obj.user.username?e.inspection_obj.user.username:"NA"})})}),n.queryManufacturers().then(function(e){i.ManufacturerList=e.data.results;var t=_.where(e.data.results,{id:i.Machine.manufacturer_id}),a=t[0].company.trim();a=a.length>0?a:"N/A",i.Machine.manufacturer_name=a,n.queryModels(i.Machine.manufacturer_id).then(function(e){i.ModelList=e.data.results})}),i.updateMachineModels=function(e){n.queryModels(i.Machine.manufacturer_id).then(function(e){i.ModelList=e.data.results})},i.$watch("Machine.model_id",function(e,t){if(e!==t){var a=_.where(i.ModelList,{id:e});i.Machine.model=a[0].model}})}),i.$watch("image_upload",function(e,i){}),i.saveMachine=function(){var e={},t=function(){n.save(i.Machine).then(function(t){alert("Machine saved."),i.$emit("machine_saved",t),""!==i.image_upload?(console.log("uploading image"),e={machine_obj:t.data.results,machine_id:t.data.results.id,file:i.image_upload,customer_id:t.data.results.customer_id,description:"",user_id:o.getUserID()},n.savePhoto(e).then(function(e){console.log("saved image"),console.dir(e),a.path("/machines/"+i.Machine.id)})):a.path("/machines/"+i.Machine.id)})};if(delete i.Machine.archived,i.customer_changed){var c;s.getByMachineId(i.Machine.id).then(function(e){e.data.results.length>0&&angular.forEach(e.data.results,function(e){e.customer_id=i.Machine.customer_id,c=e.id,delete e.id,delete e.archived,delete e.modified,e.inspection_obj=JSON.stringify(e.inspection_obj),s.save(e,c)}),t()})}else t()},i.deleteMachine=function(){confirm("Are you sure you want to delete this machine?")&&n.del(i.Machine.id).then(function(e){a.path("/machines/list/")})}}]);