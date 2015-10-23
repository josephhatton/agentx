Modustri.factory("ScoreBoardServices",["$log","$http","$location","$q","AuthServices","AppSettings",function(e,r,t,o,s,c){"use strict";function n(e,r,o,s){var c=s.url,n=c.indexOf("?");if(-1!==n&&(c=c.substring(0,n)),403===r)t.path("/404");else{var a=404===r?"No service found at "+c+".":500===r?"Error in service at "+c+".":e;console.log(a)}}var a={};return a.getScoreBoardActions=function(e,t){return r.get(c.BASE_URL+e+"/"+s.getUserHash()+"/"+localStorage.getItem("user_id")+"/").success(t).error(n)},a.getAllScoreBoardData=function(e,t){return r.get(c.BASE_URL+e+"/"+s.getUserHash()+"/"+localStorage.getItem("user_id")+"/").success(t).error(n)},a.getScoreBoardByMachine=function(e,t,o){return r.get(c.BASE_URL+e+"/"+s.getUserHash()+"/"+localStorage.getItem("user_id")+"/?machine_id="+t+"/").success(o).error(n)},a.putScoreBoardByMachine=function(e,t,o){return r.put(c.BASE_URL+e+"/"+s.getUserHash()+"/"+localStorage.getItem("user_id")+"/?machine_id="+t+"/").success(o).error(n)},a.saveAction=function(e){return r.post(c.BASE_URL+"machineactiondate/"+s.getUserHash()+"/"+s.getUserID()+"/",e).success(function(e){return e}).error(n)},a.deleteAction=function(e){return r.delete(c.BASE_URL+"machineactiondate/"+s.getUserHash()+"/"+s.getUserID()+"/"+e+"/").success(function(e){return e}).error(n)},a.deleteScoreBoardByMachine=function(e,t,o){return r.delete(c.BASE_URL+e+"/"+s.getUserHash()+"/"+localStorage.getItem("user_id")+"/?machine_id="+t+"/").success(o).error(n)},a.queryAllScoreBoard=function(e,t){return r.get(c.BASE_URL+e+"/"+s.getUserHash()+"/"+localStorage.getItem("user_id")+"/").success(t).error(n)},a}]);
//# sourceMappingURL=./scoreboard-min.js.map