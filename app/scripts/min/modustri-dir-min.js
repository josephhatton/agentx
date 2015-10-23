var ModustriDirectives=angular.module("ModustriDirectives",["ModustriServices"]);ModustriDirectives.directive("mdPagination",function(e,t,n){return{template:"",restrict:"A",controller:function(e){},scope:!1,link:function(t,n,i){t.$watch("pages",function(r,o){if(r!==o){var a,s,c,l,d=r,u=14,p=n[0].parentElement,m=e.url();if(l=m.match(/\d{1,}$/),null===l?l=1:(l=l[0],m=m.replace(/\/\d{1,}$/,"")),l=parseInt(l,10),u>=d)for(a=0;d>a;a++)s=document.createElement("a"),c=parseInt(a+1,10),$(s).attr("href","#"+m+"/"+c).text(c),c===l&&$(s).addClass("current-page"),n.append(s);else{var f=_.range(1,d),g=Math.ceil(u/2),v,h,b,D,I;for(D=l+g>f.length?f.length:l+g,D===f.length?b=D-u:0>=l-g?(b=1,D=b+u-1):b=l-g,a=b;D>=a;a++)s=document.createElement("a"),$(s).attr("href","#"+m+"/"+a).text(a),a===l&&$(s).addClass("current-page"),n.append(s);l>u&&(h=document.createElement("a"),h.setAttribute("href","#"+m+"/1"),h.setAttribute("class","paginatation-first"),I=document.createTextNode("‹‹"),h.appendChild(I),n.prepend(h)),l<f.length-u&&(v=document.createElement("a"),v.setAttribute("href","#"+m+"/"+f.length),v.setAttribute("class","pagination-last"),I=document.createTextNode("››"),v.appendChild(I),n.append(v))}switch(i.mdPagination){case"inspections":var y="Page "+l+" of "+t.pages,A=document.createTextNode(y),w=document.createElement("div");w.className="pagination-range",w.appendChild(A),p.appendChild(w)}}})}}}),ModustriDirectives.directive("mdMeasurement",function(e,t){return{require:"ngModel",template:"",restrict:"A",priority:5e3,scope:!1,controller:function(e){},link:function(e,t,n,i){}}}),ModustriDirectives.directive("mdAutocompleteSearch",function(e,t,n,i,r,o){return{template:"",restrict:"A",controller:function(e){},scope:!1,link:function(a,s,c){var l;if("customers"===c.mdAutocompleteSearch&&(l=o.BASE_URL+"js/customers/"+r.getUserHash()+"/"+r.getUserID()+"/",$(s).autocomplete({minLength:3,delay:0,source:function(e,t){e.dealer_id=r.getDealerID(),$.ajax({type:"post",url:l,data:e,success:function(e){t(e)}})},select:function(e,i){n.getByName(i.item.value).then(function(e){t.path("/customers/"+e.data.results[0].id)})}})),"inspectors"===c.mdAutocompleteSearch&&(l=o.BASE_URL+"js/customers/"+r.getUserHash()+"/"+r.getUserID()+"/",$(s).autocomplete({minLength:3,delay:0,source:function(e,t){e.dealer_id=r.getDealerID(),$.ajax({type:"post",url:l,data:e,success:function(e){t(e)}})},select:function(e,t){n.getByName(t.item.value).then(function(e){switch($(s).attr("id")){case"total-ins-autocomplete":a.TotalIns.customer_id=e.data.results[0].id;break;case"dispatch-autocomplete":a.Dispatch.customer_id=e.data.results[0].id}})}})),"machines"===c.mdAutocompleteSearch&&(l=o.BASE_URL+"js/machines/"+r.getUserHash()+"/"+r.getUserID()+"/",$(s).autocomplete({minLength:3,delay:0,source:function(e,t){e.dealer_id=r.getDealerID(),$.ajax({type:"post",url:l,data:e,success:function(e){t(e)}})},select:function(n,i){var o=r.getDealerID(),a=!1;e.post(l,{dealer_id:o,term:i.item.value}).then(function(e){a=_.find(e.data,function(e){return e.id=i.item.id}),a&&t.path("/machines/"+a.id)})}})),"inspections"===c.mdAutocompleteSearch&&(l=o.BASE_URL+"js/inspections/"+r.getUserHash()+"/"+r.getUserID()+"/",$(s).autocomplete({minLength:3,delay:0,source:function(e,t){e.dealer_id=r.getDealerID(),$.ajax({type:"post",url:l,data:e,success:function(e){t(e)}})},select:function(e,t){}})),"inspection-machines"===c.mdAutocompleteSearch){l=o.BASE_URL+"js/machines/"+r.getUserHash()+"/"+r.getUserID()+"/";var d;"undefined"!=typeof a.Ins&&a.Ins.inspection_obj.machine.serial&&($(s).val(a.Ins.inspection_obj.machine.serial),i.getBySerial(a.Ins.inspection_obj.machine.serial).then(function(e){a.Ins.inspection_obj.machine=e.data.results[0],a.Ins.machine_id=e.data.results[0].id,n.get(e.data.results[0].customer_id).then(function(e){d=e.data,a.Ins.customer_id=d.results.id,a.Ins.inspection_obj.customer.name=d.results.name,a.Ins.inspection_obj.customer.email=d.results.email,a.Ins.inspection_obj.customer.phone=d.results.phone,a.Ins.inspection_obj.customer.city=d.results.city,a.Ins.inspection_obj.customer.zip=d.results.zip,a.Ins.inspection_obj.customer.primary_contact_id=d.results.primary_contact_id,a.Ins.inspection_obj.customer.state=d.results.state})})),$(s).autocomplete({minLength:3,delay:0,source:function(e,t){e.dealer_id=r.getDealerID(),$.ajax({type:"post",url:l,data:e,success:function(e){t(e)}})},select:function(e,t){i.getBySerial(t.item.value).then(function(e){a.Ins.inspection_obj.machine=e.data.results[0],a.Ins.machine_id=e.data.results[0].id,n.get(e.data.results[0].customer_id).then(function(e){d=e.data,a.Ins.customer_id=d.results.id,a.Ins.inspection_obj.customer.name=d.results.name,a.Ins.inspection_obj.customer.email=d.results.email,a.Ins.inspection_obj.customer.phone=d.results.phone,a.Ins.inspection_obj.customer.city=d.results.city,a.Ins.inspection_obj.customer.zip=d.results.zip,a.Ins.inspection_obj.customer.primary_contact_id=d.results.primary_contact_id,a.Ins.inspection_obj.customer.state=d.results.state})})}})}}}}),ModustriDirectives.directive("mdAutocompleteFormField",function(e,t,n,i,r){return{template:"",restrict:"A",controller:function(e){},scope:!1,link:function(e,t,o){var a;"customers"==o.mdAutocompleteFormField&&(a=r.BASE_URL+"js/customers/"+i.getUserHash()+"/"+i.getUserID()+"/",$(t).autocomplete({minLength:1,delay:0,source:function(e,t){e.dealer_id=i.getDealerID(),$.ajax({type:"post",url:a,data:e,success:function(e){t(e)}})},select:function(t,i){n.getByName(i.item.value).then(function(t){e.Machine.customer_id=t.data.results[0].id,e.Machine.customer_name=i.item.value,e.customer_changed=!0})}})),"customers_for_inspection"===o.mdAutocompleteFormField&&(a=r.BASE_URL+"js/customers/"+i.getUserHash()+"/"+i.getUserID()+"/",$(t).autocomplete({minLength:1,delay:0,source:function(e,t){e.dealer_id=i.getDealerID(),$.ajax({type:"post",url:a,data:e,success:function(e){t(e)}})},select:function(t,i){n.getByName(i.item.value).then(function(t){e.Ins.customer_id=t.data.results[0].id,e.Ins.inspection_obj.customer.id=t.data.results[0].id,e.Ins.inspection_obj.customer.name=i.item.value})}})),"machines"===o.mdAutocompleteFormField&&(a=r.BASE_URL+"machines/"+i.getUserHash()+"/"+i.getUserID()+"/",$(t).autocomplete({minLength:1,delay:0,source:function(e,t){$.ajax({type:"get",url:a,data:e,success:function(e){t(e)}})},select:function(e,t){}}))}}}),ModustriDirectives.directive("mdPermalink",function(e,t){return{template:"",restrict:"A",scope:!1,link:function(e,n,i){var r="ABCDEGHIJKLMNOPQRSTVWXYZabcdeghijklmnopqrstvwxyz",o=document.createElement("a"),a="",s,c;if("inspectionID"in t){for(c=parseInt(t.inspectionID,10);c>0;)s=parseInt(c%r.length,10),c=parseInt(c/r.length,10),a=r[s]+a;o.href="#/perm/inspections/"+t.inspectionID,$(n).addClass("share-permalink"),o.textContent="Permalink",$(o).on("click",function(e){window.open(o),e.preventDefault()}),$(n).append(o)}}}}),ModustriDirectives.directive("mdMap",function(){return{template:"",restrict:"A",scope:!1,link:function(e,t,n){e.$watch("Ins.inspection_obj.jobsite",function(e){if("undefined"!=typeof e)var t={center:new google.maps.LatLng(e.lat,e.lon),zoom:10,mapTypeId:google.maps.MapTypeId.HYBRID},n=new google.maps.Map(document.getElementById("map-canvas"),t),i=new google.maps.LatLng(e.lat,e.lon),r=new google.maps.Marker({position:i,map:n})})}}}),ModustriDirectives.directive("mdImageUpload",function(){return{template:"",restrict:"A",scope:!1,link:function(e,t,n){var r=[],o=new FileReader,a,s=t.parent(),c=document.createElement("div"),l=document.createElement("img"),d=s.find(".remove-image"),u=t.context.attributes.scopevar;c.setAttribute("id","upload-image-wrapper"),c.setAttribute("class","upload-image-wrapper"),$(s).prepend(c),$(t).text("Drop new image here."),t=t[0],o.onload=function(e){l.src=e.target.result,$(c).append(l)},o.onerror=function(e){throw new Error("Problem reading file.")},t.addEventListener("dragover",function(e){e.preventDefault()},!1),t.addEventListener("drop",function(n){n.preventDefault();var r,a=["image/png","image/jpeg","image/gif"],s=function(e){return void 0===a||""===a||a.indexOf(e)>-1?!0:(alert("Invalid file type.  File must be one of following types "+a),!1)};return s(n.dataTransfer.files[0].type)?(o.readAsDataURL(n.dataTransfer.files[0]),e.image_upload=n.dataTransfer.files[0],u&&(e.photouploaded||(e.photouploaded=[]),p=_.find(e.photouploaded,function(e){return e.index==u.value}),void 0==p?e.photouploaded.push({order:e.photouploaded.length,index:u.value,photo:n.dataTransfer.files[0],processed:!1}):e.photouploaded[p.order]={order:p.order,index:u.value,photo:n.dataTransfer.files[0],processed:!1}),$(t).addClass("hidden-img-upload"),l.setAttribute("class",""),void d[0].addEventListener("click",function(n){if(l.setAttribute("class","hidden-preview-img"),$(t).removeClass("hidden-img-upload"),u)for(p=_.find(e.photouploaded,function(e){return e.index==u.value}),void 0!=p&&e.photouploaded.splice(p.order,1),i=0;i<e.photouploaded.length;i++)e.photouploaded[i].order=i})):!1},!1)}}}),ModustriDirectives.directive("mdToggle",function(e){var t=function(t,n,i){var r=n.context.attributes["md-toggle"].nodeValue,o=n.context.attributes.id,a=n.context.attributes.bindtoinspectionobj,s;"show_metric"===r?r="UserSettings."+r:a&&"0"==a.value||(r="Ins.inspection_obj."+r),s='<div class="onoffswitch"><input type="checkbox" name="onoffswitch"ng-model="'+r+'"ng-checked="'+r+'"class="onoffswitch-checkbox" '+(o?'id="'+o.nodeValue+'">':'id="'+r+'">')+'<label class="onoffswitch-label" '+(o?'for="'+o.nodeValue+'">':'for="'+r+'">')+'<div class="onoffswitch-inner"></div><div class="onoffswitch-switch"></div></label></div>';var c=e(s)(t);n.replaceWith(c)};return{restrict:"A",link:t}}),ModustriDirectives.directive("fileChange",function(){var e=function(e,t,n){e.files=[];var i=[];t.bind("change",function(t){for(var n=t.target.files,r=0,o=n.length;o>r;r++)i.push(n[r]);e.files=i})};return{restrict:"A",scope:!1,link:e}}),ModustriDirectives.directive("innerHtmlBind",function(){return{restrict:"A",scope:{inner_html:"=innerHtml"},link:function(e,t,n){e.inner_html=t.html()}}}),ModustriDirectives.directive("sort",function(){return{transclude:!0,template:'<a href="" ng-click="onSortClick()"><span ng-transclude></span><span ng-show="reversed && predicate===by" class="reversed">&uarr;</span><span ng-show="!reversed && predicate===by" class="notreversed">&darr;</span></a>',scope:{predicate:"=",by:"=",reversed:"="},link:function(e,t,n){e.onSortClick=function(){e.predicate===e.by?e.reversed=!e.reversed:(e.by=e.predicate,e.reversed=!1)}}}});var DraggableModule=angular.module("lvl.directives.dragdrop",["lvl.services"]);DraggableModule.directive("lvlDraggable",["$rootScope","uuid",function(e,t){return{restrict:"A",link:function(n,i,r,o){console.log("linking draggable element"),angular.element(i).attr("draggable","true");var a=angular.element(i).attr("id");a||(a=t.new(),angular.element(i).attr("id",a)),i.bind("dragstart",function(t){t.dataTransfer.setData("text",a),e.$emit("LVL-DRAG-START")}),i.bind("dragend",function(t){e.$emit("LVL-DRAG-END")})}}}]),DraggableModule.directive("lvlDropTarget",["$rootScope","uuid",function(e,t){return{restrict:"A",scope:{onDrop:"&"},link:function(n,i,r,o){var a=angular.element(i).attr("id");a||(a=t.new(),angular.element(i).attr("id",a)),i.bind("dragover",function(e){return e.preventDefault&&e.preventDefault(),e.dataTransfer.dropEffect="move",!1}),i.bind("dragenter",function(e){angular.element(e.target).addClass("lvl-over")}),i.bind("dragleave",function(e){angular.element(e.target).removeClass("lvl-over")}),i.bind("drop",function(e){e.preventDefault&&e.preventDefault(),e.stopPropogation&&e.stopPropogation();var t=e.dataTransfer.getData("text"),i=document.getElementById(a),r=document.getElementById(t);n.onDrop({dragEl:r,dropEl:i})}),e.$on("LVL-DRAG-START",function(){var e=document.getElementById(a);angular.element(e).addClass("lvl-target")}),e.$on("LVL-DRAG-END",function(){var e=document.getElementById(a);angular.element(e).removeClass("lvl-target"),angular.element(e).removeClass("lvl-over")})}}}]),ModustriDirectives.directive("showDropdownOnHover",function(){return{link:function(e,t,n){t.bind("mouseenter",function(){var e=160;if(t.css("position","relative"),t.find(".ss-dropdown").length>0)return!1;var i=0,r=0;for(el=t[0];el&&!isNaN(el.offsetLeft)&&!isNaN(el.offsetTop);)i+=el.offsetLeft-el.scrollLeft,r+=el.offsetTop-el.scrollTop,el="webkit"==$.browser?el.parentNode:el.offsetParent;var o=0,a=e/4;angular.element(window).innerWidth()-i<e&&(o=angular.element(window).outerWidth()-i-e-10,a-=o);var s="";s+='<div class="ss-dropdown" style="left:'+o+'px">',s+='<div class="ss-arrow" style="left:'+a+'px"></div>',s+='<div class="ss-dropdown-inner">',s+=angular.element("#"+n.showDropdownOnHover).html(),s+="</div>",s+="</div>",t.append(s)}),t.bind("mouseleave",function(){t.find(".ss-dropdown").remove()})}}}),ModustriDirectives.directive("ngFocus",[function(){var e="ng-focused";return{restrict:"A",require:"ngModel",link:function(t,n,i,r){r.$focused=!1,n.bind("focus",function(i){n.addClass(e),t.$apply(function(){r.$focused=!0})}).bind("blur",function(i){n.removeClass(e),t.$apply(function(){r.$focused=!1})})}}}]);