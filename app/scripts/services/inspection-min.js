ModustriServices.factory("InsServices",["$log","$q","$http","AuthServices","MachineServices","Utilities","AppSettings",function(e,t,n,r,i,s,o){"use strict";var a={},c=function(t,n,r){e.error(t),e.error(n),e.error(r)};return a.query=function(e){var t=r.getUserCreds();return r.getDealerID()&&t.level>=2?n.post(o.BASE_URL+"inspections/"+r.getUserHash()+"/"+r.getUserID()+"/",{dealer_id:r.getDealerID(),perpage:o.ITEMS_PER_PAGE,page:e}).success(function(e,t,n){return e}).error(c):n.post(o.BASE_URL+"inspections/"+r.getUserHash()+"/"+r.getUserID()+"/",{perpage:o.ITEMS_PER_PAGE,page:e}).success(function(e,t,n){return e}).error(c)},a.get=function(e){return n.get(o.BASE_URL+"inspection/"+r.getUserHash()+"/"+r.getUserID()+"/"+e+"/").success(function(e,t,n){return e}).error(c)},a.getForPermalink=function(e){return n.get(o.BASE_URL+"direct/inspection/"+e+"/").success(function(e,t,n){return e}).error(c)},a.getByMachineId=function(e){return n.get(o.BASE_URL+"inspections/"+r.getUserHash()+"/"+r.getUserID()+"/?machine_id="+e).success(function(e,t,n){return e}).error(c)},a.getByCustomerId=function(e){return n.get(o.BASE_URL+"inspections/"+r.getUserHash()+"/"+r.getUserID()+"/?customer_id="+e).success(function(e,t,n){return e}).error(c)},a.getByDealerIdStartEnd=function(e,t,i){var s=r.getUserLevel(),a={};return a=2>s?{start:t,end:i}:{dealer_id:r.getDealerID(),start:t,end:i},n.post(o.BASE_URL+"inspections/"+r.getUserHash()+"/"+r.getUserID()+"/",a).success(function(e,t,n){return e}).error(c)},a.getNewestInspectionByCustomerId=function(e){return n.post(o.BASE_URL+"inspections/"+r.getUserHash()+"/"+r.getUserID()+"/",{customer_id:e,page:1,perpage:1}).success(function(e,t,n){return e}).error(c)},a.getNewestInspectionByMachineId=function(e){return n.post(o.BASE_URL+"inspections/"+r.getUserHash()+"/"+r.getUserID()+"/",{machine_id:e,page:1,perpage:2}).success(function(e,t,n){return e}).error(c)},a.getByUserId=function(e){return n.get(o.BASE_URL+"inspections/"+r.getUserHash()+"/"+r.getUserID()+"/?user_id="+e).success(function(e,t,n){return e}).error(c)},a.getByUserIdCustomerId=function(e,t){return n.get(o.BASE_URL+"inspections/"+r.getUserHash()+"/"+r.getUserID()+"/?user_id="+e+"&customer_id="+t).success(function(e,t,n){return e}).error(c)},a.getByDateRange=function(e,t,i){return n.post(o.BASE_URL+"inspections/"+r.getUserHash()+"/"+r.getUserID()+"/",{dealer_id:r.getDealerID(),perpage:o.ITEMS_PER_PAGE,page:e,start:t,end:i}).success(function(e,t,n){return e}).error(c)},a.setMeasurementToolNames=function(e,t){var n=function(){"undefined"!=typeof a.tool_names[t.left.tool-1]&&(t.left.tool_name=a.tool_names[t.left.tool-1].label),"undefined"!=typeof a.tool_names[t.right.tool-1]&&(t.right.tool_name=a.tool_names[t.right.tool-1].label)};"undefined"==typeof a.tool_names?a.getToolTypes().then(function(t){a.tool_names=t.data.results,e.Tools=t.data.results,n()}):n()},a.setPercentages=function(e,t,n,r,i){console.log("called?");var o=!1,c,_,u,p,l=r.Ins.inspection_obj.results,m=l[e][t].left.id,d=l[e][t];r.Components[e].forEach(function(t,n){r.Components[e][n].component_id===m&&(o=r.Components[e][n])}),a.setMeasurementToolNames(r,d),o&&(i?(c=s.mmToIn(d.left.measured),_=s.mmToIn(d.right.measured)):(c=d.left.measured,_=d.right.measured),u=r.Tools[parseInt(d.left.tool,10)-1],p=r.Tools[parseInt(d.right.tool,10)-1],d.left.percentage=u?o.getWearPercentages(c,n,u.keyname):"",d.right.percentage=p?o.getWearPercentages(_,n,p.keyname):"",a.setCondition(l,e,t))},a.setMainPhoto=function(e){var n,r;if(""!==e.Ins.inspection_obj.machine.main_image_id){var s=e.Ins.inspection_obj.machine.main_image_id;if(0===s||"0"===s||null===s||void 0===s){var a=t.defer();return a.resolve({error:"bad image id"}),a.promise}e.Ins.inspection_obj.machine.img=o.BASE_URL+"imgtmb/"+e.Ins.inspection_obj.machine.main_image_id+"/",e.Ins.inspection_obj.machine.img_full=o.BASE_URL+"img/"+e.Ins.inspection_obj.machine.main_image_id+"/",r=setTimeout(function(){n=document.createElement("img"),n.src=e.Ins.inspection_obj.machine.img_full},0)}else i.get(e.Ins.machine_id).then(function(s){""!==s.data.results.main_image_id&&i.getPhoto(s.data.results.main_image_id).then(function(i){var s=i.data.results.id;if(0===s||"0"===s||null===s||void 0===s){var a=t.defer();return a.resolve({error:"bad image id"}),a.promise}e.Ins.inspection_obj.machine.img=o.BASE_URL+"imgtmb/"+s+"/",e.Ins.inspection_obj.machine.img_full=o.BASE_URL+"img/"+s+"/",r=setTimeout(function(){n=document.createElement("img"),n.src=e.Ins.inspection_obj.machine.img_full},0)})})},a.cleanUpNulls=function(e){if("(null)"===e.Ins.inspection_obj.machine.equipment_id&&(e.Ins.inspection_obj.machine.equipment_id="N/A"),e.Ins.inspection_obj.machine.hasOwnProperty("hour_meter_reading")){var t=e.Ins.inspection_obj.machine.hour_meter_reading,n=e.Ins.inspection_obj.hour_meter_reading;n>t&&(e.Ins.inspection_obj.machine.hour_meter_reading=n)}else e.Ins.inspection_obj.machine.hour_meter_reading=e.Ins.inspection_obj.hour_meter_reading;if(e.Ins.inspection_obj.machine.hasOwnProperty("hour_meter_operational")){var r=e.Ins.inspection_obj.machine.hour_meter_operational,i=e.Ins.inspection_obj.hour_meter_operational;i>r&&(e.Ins.inspection_obj.machine.hour_meter_operational=i)}else e.Ins.inspection_obj.machine.hour_meter_operational=e.Ins.inspection_obj.hour_meter_operational;if(e.Ins.inspection_obj.machine.hasOwnProperty("odometer_reading")){var s=e.Ins.inspection_obj.machine.odometer_reading,o=e.Ins.inspection_obj.odometer_reading;o>s&&(e.Ins.inspection_obj.machine.odometer_reading=o)}else e.Ins.inspection_obj.machine.odometer_reading=e.Ins.inspection_obj.odometer_reading;if(e.Ins.inspection_obj.machine.hasOwnProperty("hours_per_week")){var a=e.Ins.inspection_obj.machine.hours_per_week,c=e.Ins.inspection_obj.hours_per_week;c>a&&(e.Ins.inspection_obj.machine.hours_per_week=c)}else e.Ins.inspection_obj.machine.hours_per_week=e.Ins.inspection_obj.hours_per_week},a.getInspectionCount=function(){return n.post(o.BASE_URL+"stats/"+r.getUserHash()+"/"+r.getUserID()+"/",{type:"dealerinspections",id:r.getDealerID()}).success(function(e,t,n){return e}).error(c)},a.getInspectionCountByRange=function(e,t){return n.post(o.BASE_URL+"stats/"+r.getUserHash()+"/"+r.getUserID()+"/",{type:"inspectionsbyuserlevel",id:r.getUserID(),start:e,end:t}).success(function(e,t,n){return e}).error(c)},a.FailCalc=function(e,t,n){var r=e.hours-t.hours,i=e.pct-t.pct,s=r/i,o=n-e.pct;if(0===r)return 0;var a=o*s;return a},a.buildSummariesTable=function(e){var t=[];t[1]="Ultrasonic",t[2]="Depth Gauge",t[3]="Tape Measure",t[4]="Caliper";var n=[],r=e.Ins.machine_id,s=e.Ins.id;e.Ins.inspection_obj.hasOwnProperty("maintenance_date")&&(e.Ins.inspection_obj.maintenance_datestring=new moment.unix(e.Ins.inspection_obj.maintenance_date).format("MM/DD/YYYY")),i.getProjections(r).then(function(t){if(e.Ins.inspection_obj.hasOwnProperty("remaining_life")||(e.Ins.inspection_obj.remaining_life=""),t.data.results.length>0)for(var r in t.data.results){var i=t.data.results[r];for(var o in i){var a=i[o];if(a.a_ins_id===s){var c=e.Ins.inspection_obj.results[o],_=""+a.am.lm,u=""+a.am.rm;if("string"!=typeof c)for(var p in c)"model_id"!==p&&(_==c[p].left.measured&&(c[p].left.hours_left=Math.round(a.l_h[70],0),c[p].left.hours_left_100=Math.round(a.l_h[100],0),c[p].left.hours_left_120=Math.round(a.l_h[120],0),c[p].left.comp=o,c[p].left.comp_type=o.replace("_"," "),c[p].left.dir="L",c[p].left.full_wear_date=new moment.unix(a.adate).add(a.l_date[100],"seconds").format("MMM DD, YYYY"),c[p].left.over_wear_date=new moment.unix(a.adate).add(a.l_date[120],"seconds").format("MMM DD, YYYY"),c[p].left.measured=a.am.lm,c[p].left.percentage=a.am.lpct+"%",n.push(c[p].left)),u==c[p].right.measured&&(c[p].right.hours_left=Math.round(a.r_h[70],0),c[p].right.hours_left_100=Math.round(a.r_h[100],0),c[p].right.hours_left_120=Math.round(a.r_h[120],0),c[p].right.comp=o,c[p].right.comp_type=o.replace("_"," "),c[p].right.dir="R",c[p].right.full_wear_date=new moment.unix(a.adate).add(a.r_date[100],"seconds").format("MMM DD, YYYY"),c[p].right.over_wear_date=new moment.unix(a.adate).add(a.r_date[120],"seconds").format("MMM DD, YYYY"),c[p].right.measured=a.am.rm,c[p].right.percentage=a.am.rpct+"%",n.push(c[p].right)))}}}n.sort(function(e,t){return-1*(parseInt(e.percentage,10)-parseInt(t.percentage,10))}),e.Summaries=n,e.$emit("summaries_table_built")})},a.getFailureDates=function(e){var t,n,r=1e3*e.Ins.timestamp,i=6048e5,s,o,a,c,u,p,l,m,d,g=parseInt(e.Ins.inspection_obj.hour_meter_reading,10),h="",f=parseInt(e.Ins.inspection_obj.hours_per_week,10);e.Ins.inspection_obj.machine.hasOwnProperty("remaining_life")||(e.Ins.inspection_obj.machine.remaining_life=""),"undefined"!=typeof e.Prev_ins&&e.Prev_ins!==!1&&(h=parseInt(e.Prev_ins.inspection_obj.hour_meter_reading,10),_.forEach(e.Ins.inspection_obj.results,function(I,b,U){_.forEach(I,function(_,I,b){_.hasOwnProperty("left")&&_.left.hasOwnProperty("percentage")&&g>0&&(p=g-h,p>0&&(""===_.left.percentage||isNaN(_.left.percentage)||0===parseInt(_.left.percentage,10)||(m=100*p/parseInt(_.left.percentage,10),d=120*p/parseInt(_.left.percentage,10),m=parseInt(m,10),d=parseInt(d,10),l=m,_.left.hours_left=l-p,(_.left.hours_left<e.Ins.inspection_obj.machine.remaining_life||""===e.Ins.inspection_obj.machine.remaining_life)&&(e.Ins.inspection_obj.machine.remaining_life=_.left.hours_left),_.left.hours_left_100=m-p,_.left.hours_left_120=d-p,e.Ins.timestamp>0&&f>0&&(t=parseInt(_.left.hours_left_100/f,10),t?(n=parseInt(t*i,10),s=r+n,o=new Date(s),a=o.getDate(),c=o.getMonth(),u=o.getFullYear(),c++,_.left.full_wear_date=c+"/"+a+"/"+u,t=parseInt(_.left.hours_left_120/f,10),n=parseInt(t*i,10),s=r+n,o=new Date(s),a=o.getDate(),c=o.getMonth(),u=o.getFullYear(),c++,_.left.over_wear_date=c+"/"+a+"/"+u):(_.left.full_wear_date=0,_.left.over_wear_date=0))),""===_.right.percentage||isNaN(_.right.percentage)||0===parseInt(_.right.percentage,10)||(m=100*p/parseInt(_.right.percentage,10),d=120*p/parseInt(_.right.percentage,10),m=parseInt(m,10),d=parseInt(d,10),l=m,_.right.hours_left=l-p,(_.right.hours_left<e.Ins.inspection_obj.machine.remaining_life||""===e.Ins.inspection_obj.machine.remaining_life)&&(e.Ins.inspection_obj.machine.remaining_life=_.right.hours_left),_.right.hours_left_100=m-p,_.right.hours_left_120=d-p,e.Ins.timestamp>0&&f>0&&(t=parseInt(_.right.hours_left_100/f,10),t?(n=parseInt(t*i,10),s=r+n,o=new Date(s),a=o.getDate(),c=o.getMonth(),u=o.getFullYear(),c++,_.right.full_wear_date=c+"/"+a+"/"+u,t=parseInt(_.right.hours_left_120/f,10),n=parseInt(t*i,10),s=r+n,o=new Date(s),a=o.getDate(),c=o.getMonth(),u=o.getFullYear(),c++,_.right.over_wear_date=c+"/"+a+"/"+u):(_.right.full_wear_date=0,_.right.over_wear_date=0)))))})}))},a.renderInspectionPhotos=function(e,t){var n,r,i=e.Ins.inspection_obj,s=[],a=[];t.data.hasOwnProperty("results")&&t.data.results.length>0&&(i.imgs=[],_.each(t.data.results,function(e,t,n){_.each(i.results,function(t,n,r){if("string"!=typeof t){var c=t.length;if(c>0)for(var _=0;c>_;_++)t[_].hasOwnProperty("left")&&t[_].left.hasOwnProperty("image_timestamp")&&e.timestamp===t[_].left.image_timestamp&&(i.results[n][_].left.image_url=o.BASE_URL+"imgtmb/"+e.id,i.results[n][_].left.image_full_url=o.BASE_URL+"img/"+e.id,s[_]=document.createElement("img"),s[_].src=o.BASE_URL+"img/"+e.id+"/"),t[_].hasOwnProperty("right")&&t[_].right.hasOwnProperty("image_timestamp")&&e.timestamp===t[_].right.image_timestamp&&(i.results[n][_].right.image_url=o.BASE_URL+"imgtmb/"+e.id,i.results[n][_].right.image_full_url=o.BASE_URL+"img/"+e.id,a[_]=document.createElement("img"),a[_].src=o.BASE_URL+"img/"+e.id+"/")}})}))},a.save=function(e,t){return n.post(o.BASE_URL+"inspection/"+r.getUserHash()+"/"+r.getUserID()+"/"+t+"/",e).success(function(e,t,n){return e}).error(c)},a.saveNew=function(e){return n.post(o.BASE_URL+"inspection/"+r.getUserHash()+"/"+r.getUserID()+"/",e).success(function(e,t,n){return e}).error(c)},a.del=function(e){return n.delete(o.BASE_URL+"inspection/"+r.getUserHash()+"/"+r.getUserID()+"/"+e+"/").success(function(e,t,n){return e}).error(c)},a.queryJobSites=function(){return n.get(o.BASE_URL+"jobsites/"+r.getUserHash()+"/"+r.getUserID()+"/").success(function(e,t,n){return e}).error(c)},a.getJobSite=function(e){return n.get(o.BASE_URL+"jobsite/"+r.getUserHash()+"/"+r.getUserID()+"/?id="+e+"/").success(function(e,t,n){return e}).error(c)},a.getToolTypes=function(){return n.get(o.BASE_URL+"measuretypes/"+r.getUserHash()+"/"+r.getUserID()+"/",{cache:!0}).success(function(e,t,n){return e}).error(c)},a.setComponentDescription=function(e){"id"in e.left&&i.getComponentData(e.left.id).then(function(t){e.description=t.data.results.description})},a.setCondition=function(e,t,n){var r="",i="";"undefined"!=typeof e[t][n].left&&"undefined"!=typeof e[t][n].left.percentage&&(r=parseInt(e[t][n].left.percentage,10),e[t][n].left.condition=r>25&&75>r?"fair":25>=r?"good":r>=75?"poor":"poor"),"undefined"!=typeof e[t][n].right&&"undefined"!=typeof e[t][n].right.percentage&&(i=parseInt(e[t][n].right.percentage,10),e[t][n].right.condition=i>25&&75>i?"fair":25>=i?"good":i>=75?"poor":"poor")},a.getEmptyInspection=function(){return{inspection_obj:{jobsite:{id:"",lon:"",lat:"",contact_id:"",address:"",customer_id:"",name:"",modified:"",archived:""},dealer:{id:"",phone:"",city:"",address:"",name:"",zip:"",primary_contact_id:"",state:"",archived:"",image_id:""},manufacturer:{id:"",us_dealers:"",company:""},machine:{id:"",customer_id:"",dealer_id:"",model:"",serial:"",equipment_id:"",manufacturer_id:"",hour_meter_operational:"",under_carriage_code:"",under_carriage_brand:"",hour_meter_reading:"",main_image_id:"",model_id:"",note:"",modified:"",archived:"",last_inspected:"",track_type_id:"",sales_rep:"",product_support_sales_rep:"",lat:"",lon:""},results:{track_links:[],track_sag:{left:"",right:""},dry_joints:{left:"",right:""},frame_extension:{left:"",right:""},shoe_width:{left:"",right:""},hour_meter_reading:"",bushing_allowable_wear:"greater",carrier_rollers:[],underfoot_conditions:{impact:"med",packing:"med",abrasive:"med",moisture:"med"},track_rollers:[],link_allowable_wear:"greater",sprockets:[],bushings:[],idlers_front:[],idlers_rear:[],track_shoes:[]},customer:{id:"",name:"",address:"",city:"",state:"",zip:"",country:"",phone:"",primary_contact_id:"",note:"",image_id:"",modified:"",archived:"",last_inspected:""},user:{id:"",username:"",password:"",customer_id:"",email:"",dealer_id:"",salt:"",modified:"",userlevel:"",archived:""},inspector:"",hours_per_week:"",maintenance_date:"",inspectionTypeGET:"",inspectionTypeGeneral:"",inspectionTypeUCI:""},job_site_id:"",dealer_id:"",user_id:"",timestamp:"",customer_id:"",machine_id:"",completed:0}},a.saveGeneralPhotos=function(e){var n=t.defer(),i=new FormData;i.append("file",e.file),i.append("description",e.description),i.append("user_id",e.user_id);var s=new XMLHttpRequest;return s.onreadystatechange=function(){if(4===s.readyState&&200===s.status){var e=s.response+"",t=JSON.parse(e);n.resolve(t.results)}else 4===s.readyState&&200!==s.status&&(n.resolve(!1),console.warn("problem uploading image"))},s.open("post",o.BASE_URL+"image/"+r.getUserHash()+"/"+r.getUserID()+"/"),s.send(i),n.promise},a}]);
//# sourceMappingURL=./inspection-min.js.map