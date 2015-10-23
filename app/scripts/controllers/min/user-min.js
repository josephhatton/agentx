Modustri.controller("UserCtrl",["$scope","UserServices","AuthServices","$filter","DealerServices","CustomerServices","Utilities",function(e,r,t,s,n,i,a){"use strict";function l(){r.getUserList().then(function(r){e.users=r.data.results})}var u="uiusers";e.users={},e.ids={},e.dealers={},t.checkUserCreds(),e.UserSettings=t.getUserSettings(),n.getDealerList(function(r){e.dealers=r.results,e.userlevels=[{value:0,text:"Modustri Administrator"},{value:1,text:"Modustri Manager"},{value:2,text:"Dealer Administrator"},{value:3,text:"Dealer Manager"},{value:4,text:"Dealer User"},{value:5,text:"Customer Manager"}],0===t.getUserLevel()&&(e.isAdmin=1),e.uiShow=function(e){return t.uiToggle(t.getUserLevel(),u,e)},e.showUserLevel=function(r){var t=[];return null!==r&&(t=s("filter")(e.userlevels,{value:r})),t.length?t[0].text:"Not set"},e.showDealer=function(r){console.log(r);var t=[];if(null!==r)for(var s in e.dealers)e.dealers[s].id===r&&t.push(e.dealers[s]);return t.length?t[0].name:"Not set"},e.editableName=function(e,r){(void 0===r||null===r)&&$("#username").prop("readonly","")},l(),e.getCustomers=function(e){var r=[];return e.length>=3?i.getByName(e).then(function(e){return angular.forEach(e.data.results,function(e){r.push(e.name)}),r}):void 0}}),e.addUser=function(){e.inserted={username:"",id:null,email:null,dealer_id:t.getDealerID(),customer_id:null,userlevel:null},e.users.unshift(e.inserted)},e.userEditableValidation=function(e,r){switch(e){case"email":var t=/^[A-Za-z0-9_.-]{2}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-].{1}[A-Za-z0-9_.-]+$/;if(void 0==r||""==r)return"Email is required.";if(!t.test(r))return"Email is invalid.";if(r.length>200)return"Email cannot be longer than 200 characters.";break;case"username":var t=/^[A-Za-z0-9_]+[a-zA-Z0-9\s_.\-]*[A-Za-z0-9_]+$/;if(void 0==r||""==r)return"Name is required.";if(r.length<3)return"Name is required to be at least 3 characters.";if(!t.test(r))return"Name is invalid.";if(r.length>200)return"Name cannot be longer than 200 characters."}},e.saveUser=function(e,t,s){null!==t?r.updateUser(t,e.username,e.email,e.userlevel,e.dealer_id,e.customer_id,function(e){void 0!==e&&l()}):r.addUser(e.username,e.email,e.userlevel,e.dealer_id,e.customer_id,function(e){void 0!==e&&l()})},e.removeUser=function(e){e&&r.removeUser(e,function(){l()})},e.cancelUser=function(r,t){null==e.users[r].id?e.users.splice(r,1):t.$cancel()},e.removeChecked=function(){angular.forEach(e.ids,function(t,s){t&&r.removeUser(s,function(){angular.forEach(e.users,function(r,t){r.id==s&&(e.users.splice(t,1),delete e.ids[s])})})})},e.toggleCheckUser=function(r){-1===e.selectedUsers.indexOf(r)?e.selectedUsers.push(r):e.selectedUsers.splice(e.selectedUsers.indexOf(r),1)}}]);