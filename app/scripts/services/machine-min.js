ModustriServices.factory("MachineServices",["$http","$q","AuthServices","Utilities","AppSettings",function(e,r,t,s,a){"use strict";var n={},i=function(e,r,t){console.error(e),console.error(r),console.error(t)};return n.query=function(r,s){if(r||(r=1),s)return e.post(a.BASE_URL+"machines/"+t.getUserHash()+"/"+t.getUserID()+"/?page="+r,{customer_id:s,perpage:a.ITEMS_PER_PAGE}).success(function(e,r,t){return e}).error(i);var n={dealer_id:t.getDealerID(),perpage:a.ITEMS_PER_PAGE};return t.getUserLevel()<2&&(n={perpage:a.ITEMS_PER_PAGE}),e.post(a.BASE_URL+"machines/"+t.getUserHash()+"/"+t.getUserID()+"/?page="+r,n).success(function(e,r,t){return e}).error(i)},n.get=function(r,s){return"undefined"==typeof s&&(s=!0),e.get(a.BASE_URL+"machine/"+t.getUserHash()+"/"+t.getUserID()+"/"+r+"/",{cache:s}).success(function(e,r,t){return e}).error(i)},n.getProjections=function(r){return e.get(a.BASE_URL+"machineratings/"+t.getUserHash()+"/"+t.getUserID()+"/"+r+"/",{cache:!0}).success(function(e,t,s){return e.machine_id=r,e}).error(i)},n.getByCustomerId=function(r,s,n){var c={customer_id:r};return void 0==n&&(n=a.ITEMS_PER_PAGE),void 0!==s&&(c.perpage=n,c.page=s),e.post(a.BASE_URL+"machines/"+t.getUserHash()+"/"+t.getUserID()+"/",c).success(function(e,r,t){return e}).error(i)},n.getByModelId=function(r,s){return e.post(a.BASE_URL+"machines/"+t.getUserHash()+"/"+t.getUserID()+"/",{model_id:r,dealer_id:s}).success(function(e,r,t){return e}).error(i)},n.getBySerial=function(r){return e.post(a.BASE_URL+"machines/"+t.getUserHash()+"/"+t.getUserID()+"/",{serial:r}).success(function(e,r,t){return e}).error(i)},n.save=function(r){return e.post(a.BASE_URL+"machine/"+t.getUserHash()+"/"+t.getUserID()+"/"+r.id+"/",r).success(function(e,r,t){return e}).error(i)},n.saveNew=function(r){return e.post(a.BASE_URL+"machine/"+t.getUserHash()+"/"+t.getUserID()+"/",r).success(function(e,r,t){return e}).error(i)},n.queryManufacturers=function(){return e.get(a.BASE_URL+"manufacturers/"+t.getUserHash()+"/"+t.getUserID()+"/",{cache:!0}).success(function(e,r,t){return e}).error(i)},n.getManufacturerById=function(r){return e.get(a.BASE_URL+"manufacturer/"+t.getUserHash()+"/"+t.getUserID()+"/"+r+"/",{cache:!0}).success(function(e,r,t){return e}).error(i)},n.queryModels=function(r,s){return r?e.post(a.BASE_URL+"models/"+t.getUserHash()+"/"+t.getUserID()+"/",{manufacturer_id:r}).success(function(e,r,t){return e}).error(i):e.get(a.BASE_URL+"models/"+t.getUserHash()+"/"+t.getUserID()+"/").success(function(e,r,t){return e}).error(i)},n.getEmptyMachine=function(){return{id:"",main_image_id:"",manufacturer_id:"",serial:"",dealer_id:"",hour_meter_operational:"",under_carriage_brand:"",equipment_id:"",hour_meter_reading:"",customer_id:"",model:"",under_carriage_code:"",sales_rep:"",product_support_sales_rep:"",image_upload:""}},n.queryPhotos=function(r){return e.get(a.BASE_URL+"images/?machine_id="+r).success(function(e,r,t){return e}).error(i)},n.getPhoto=function(r){return e.get(a.BASE_URL+"image/"+t.getUserHash()+"/"+t.getUserID()+"/"+r+"/").success(function(e,r,t){return e}).error(i)},n.savePhoto=function(e){var s=r.defer(),i=new FormData,c=e.machine_obj;delete c.archived,i.append("machine_obj",e.machine_obj),i.append("machine_id",e.machine_id),i.append("file",e.file),i.append("customer_id",e.customer_id),i.append("description","Machine image"),i.append("user_id",e.user_id);var o=new XMLHttpRequest;return o.onreadystatechange=function(){if(4===o.readyState&&200===o.status){var e=o.response+"",r=JSON.parse(e);c.main_image_id=r.results.id,n.save(c).then(function(e){console.log("Machine saved with new image.")}),s.resolve(!0)}else 4===o.readyState&&200!==o.status&&(s.resolve(!1),console.warn("problem uploading image"))},o.open("post",a.BASE_URL+"image/"+t.getUserHash()+"/"+t.getUserID()+"/"),o.send(i),s.promise},n.getPhotoThumb=function(r){return e.get(a.BASE_URL+"imagetmb/"+r+"/").success(function(e,r,t){return e}).error(i)},n.getInspectionPhotos=function(r){return e.get(a.BASE_URL+"images/?inspection_id="+r).success(function(e,r,t){return e}).error(i)},n.del=function(r){return e.delete(a.BASE_URL+"machine/"+t.getUserHash()+"/"+t.getUserID()+"/"+r+"/").success(function(e,r,t){return e}).error(i)},n.getComponentsByMachineModel=function(r,s){e.post(a.BASE_URL+"componentmodels/"+t.getUserHash()+"/"+t.getUserID()+"/",{model_id:r}).success(s).error(i)},n.getComponentData=function(r){return e.get(a.BASE_URL+"component/"+t.getUserHash()+"/"+t.getUserID()+"/"+r+"/").success(function(e,r,t){return e}).error(i)},n.getComponentTypes=function(){return e.get(a.BASE_URL+"componenttypes/"+t.getUserHash()+"/"+t.getUserID()+"/").success(function(e,r,t){var s=[];return angular.forEach(e.results,function(e,r){s.push(e.type)}),s.push("Idlers Rear"),s.push("Idlers Front"),s})},n.getComponentTypesMachineNames=function(){var s=r.defer();return e.get(a.BASE_URL+"componenttypes/"+t.getUserHash()+"/"+t.getUserID()+"/").then(function(e,r,t){var a=[],n;angular.forEach(e.data.results,function(e,r){n=e.type.toLowerCase(),n=n.replace(/\s/g,"_"),n.match(/s$/)||(n+="s"),a.push(n)}),a.push("idlers_front"),a.push("idlers_rear"),s.resolve(a)}),s.promise},n.getPartManufacturers=function(){return e.get(a.BASE_URL+"partmanufacturers/"+t.getUserHash()+"/"+t.getUserID()+"/",{cache:!0}).success(function(e,r,t){return e}).error(i)},n.createComponentObj=function(e,t){function s(){Object.defineProperties(this,{component_id:{configurable:!1,enumerable:!0,writeable:!0,get:function(){return this._component_id},set:function(e){this._component_id=e}},description:{configurable:!1,enumerable:!0,writeable:!0,get:function(){return this._description},set:function(e){this._description=e}},label:{configurable:!1,enumerable:!0,writeable:!0,get:function(){return this._label},set:function(e){this._label=e}},manufacturer_id:{configurable:!1,enumerable:!0,writeable:!0,get:function(){return this._manufacturer_id},set:function(e){this._manufacturer_id=e}},type:{configurable:!1,enumerable:!0,writeable:!0,get:function(){return this._type},set:function(e){this._type=e}},component_type_id:{configurable:!1,enumerable:!0,writeable:!0,get:function(){return this._component_type_id},set:function(e){this._component_type_id=e}},wear_maps:{configurable:!1,enumerable:!1,writeable:!0,get:function(){return this._wear_maps},set:function(e){this._wear_maps=e}}})}if(null===t){var a=r.defer();return console.error("bad component id: "+t),a.resolve(!1),a.promise}s.prototype.getWearPercentages=function(e,r,t){var s=null,a,i,c,o,u,p,l=[];n.getComponentTypes().then(function(e){l=e}),e=parseFloat(e);for(i in this.wear_maps.measures)if(this.wear_maps.measures[i].keyname===t)break;for(c in this.wear_maps.measures[i].values)if(u=this.wear_maps.measures[i].values[c],p=this.wear_maps.measures[i].values[parseInt(c,10)+1],u=parseFloat(u),p=void 0===p?null:parseFloat(p),null===p){if(null===s)switch(this.component_type_id){case 1:s="greater"==r.link_allowable_wear&&"Greater Wear Percent"==this.wear_maps.percents[0].label?this.wear_maps.percents[0].values[c]:"greater"==r.link_allowable_wear&&void 0!==typeof this.wear_maps.percents[1]&&"Greater Wear Percent"==this.wear_maps.percents[1].label?this.wear_maps.percents[1].values[c]:"lesser"==r.link_allowable_wear&&"Lesser Wear Percent"==this.wear_maps.percents[0].label?this.wear_maps.percents[0].values[c]:"lesser"==r.link_allowable_wear&&void 0!==typeof this.wear_maps.percents[1]&&"Lesser Wear Percent"==this.wear_maps.percents[1].label?this.wear_maps.percents[1].values[c]:this.wear_maps.percents[0].values[c];break;case 2:s="greater"==r.bushing_allowable_wear&&"Greater Wear Percent"==this.wear_maps.percents[0].label?this.wear_maps.percents[0].values[c]:"greater"==r.bushing_allowable_wear&&void 0!==typeof this.wear_maps.percents[1]&&"Greater Wear Percent"==this.wear_maps.percents[1].label?this.wear_maps.percents[1].values[c]:"lesser"==r.bushing_allowable_wear&&"Lesser Wear Percent"==this.wear_maps.percents[0].label?this.wear_maps.percents[0].values[c]:"lesser"==r.bushing_allowable_wear&&void 0!==typeof this.wear_maps.percents[1]&&"Lesser Wear Percent"==this.wear_maps.percents[1].label?this.wear_maps.percents[1].values[c]:this.wear_maps.percents[0].values[c];break;case 3:s=("High Impact Wear Percent"===this.wear_maps.percents[0].label||"Low/Moderate Impact Wear Percent"===this.wear_maps.percents[0].label)&&"high"===r.impact?this.wear_maps.percents[1].values[c]:this.wear_maps.percents[0].values[c];break;default:s=this.wear_maps.percents[0].values[c]}}else if(u>=e&&e>p)switch(this.component_type_id){case 1:s="greater"==r.link_allowable_wear&&"Greater Wear Percent"==this.wear_maps.percents[0].label?this.wear_maps.percents[0].values[c]:"greater"==r.link_allowable_wear&&void 0!==typeof this.wear_maps.percents[1]&&"Greater Wear Percent"==this.wear_maps.percents[1].label?this.wear_maps.percents[1].values[c]:"lesser"==r.link_allowable_wear&&"Lesser Wear Percent"==this.wear_maps.percents[0].label?this.wear_maps.percents[0].values[c]:"lesser"==r.link_allowable_wear&&void 0!==typeof this.wear_maps.percents[1]&&"Lesser Wear Percent"==this.wear_maps.percents[1].label?this.wear_maps.percents[1].values[c]:this.wear_maps.percents[0].values[c];break;case 2:s="greater"==r.bushing_allowable_wear&&"Greater Wear Percent"==this.wear_maps.percents[0].label?this.wear_maps.percents[0].values[c]:"greater"==r.bushing_allowable_wear&&void 0!==typeof this.wear_maps.percents[1]&&"Greater Wear Percent"==this.wear_maps.percents[1].label?this.wear_maps.percents[1].values[c]:"lesser"==r.bushing_allowable_wear&&"Lesser Wear Percent"==this.wear_maps.percents[0].label?this.wear_maps.percents[0].values[c]:"lesser"==r.bushing_allowable_wear&&void 0!==typeof this.wear_maps.percents[1]&&"Lesser Wear Percent"==this.wear_maps.percents[1].label?this.wear_maps.percents[1].values[c]:this.wear_maps.percents[0].values[c];break;case 3:s=("High Impact Wear Percent"===this.wear_maps.percents[0].label||"Low/Moderate Impact Wear Percent"===this.wear_maps.percents[0].label)&&"high"===r.impact?this.wear_maps.percents[1].values[c]:this.wear_maps.percents[0].values[c];break;default:s=this.wear_maps.percents[0].values[c]}return s};var a=r.defer(),i=this.getComponentTypes,c=this.getComponentData;return r.all([c(t),i()]).then(function(e){var r=new s,t=e[1].data.results;r.component_id=e[0].data.results.id,r.manufacturer_id=e[0].data.results.part_manufacturer_id,r.component_name=e[0].data.results.name,r.component_type_id=e[0].data.results.component_type_id,r.description=e[0].data.results.description,r.wear_maps=e[0].data.results.wear_map,r.type=t[e[0].data.results.component_type_id-1].type,r.label=r.component_name+" - "+r.description,a.resolve(r)}),a.promise},n}]);
//# sourceMappingURL=./machine-min.js.map