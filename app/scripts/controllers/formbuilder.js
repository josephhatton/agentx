/*global Modustri,$,moment,angular,google*/
/**
 * @fileOverview Controller for viewing and analyzing inspection data.
 * @author Joseph Hatton
 * @author Ma Chen
 */

Modustri.controller('FormBuilderCtrl', ['$log', '$scope', '$routeParams',
    '$location', '$http', '$timeout' ,'CustomerServices', 'MachineServices', 'TemplateServices',
    'UserServices', 'AuthServices', 'Utilities', 'AppSettings', 'DealerServices',
    'InsServices', '$filter','$q','$modal',
    function ($log, $scope, $routeParams, $location, $http, $timeout, CustomerServices,
        MachineServices, TemplateServices, UserServices, AuthServices, Utilities,
        AppSettings, DealerServices, InsServices, $filter, $q, $modal) {

        "use strict";
        $scope.Debug = function(){
            console.dir($scope.NewTask);
        };
        
        $scope.TS = function()
        {
            var d = new Date().getTime() + Math.random() * (9999 - 1000) + 1000;
            return d;
        };
        
        $scope.UUID = function()
        {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c==='x' ? r : (r&0x7|0x8)).toString(16);
            });
            return uuid;
        };
        
        
        $scope.TemplateBlank = function(){
            return {
                'id': $scope.UUID(),
                'title': '',
                'dealer_id': 0,
                'model_id': 0,
                'modified': '',
                'description': ''
            };
        };
        
        $scope.InspectionTypeBlank = function(){
            return {
                'id': $scope.UUID(),
                'title': '',
                'tasks': [],
            };
        };
        
        $scope.TemplateInspectionTypeBlank = function(){
            return {
                'id': $scope.UUID(),
                'template_id': '',
                'inspection_type_id': '',
            };
        };
        
        $scope.TaskBlank = function(){
            return {
                'id': $scope.UUID(),
                'component_id': 0,
                'user_id': 0,
                'sort_order': 0,
                'modified': 0,
                'required': 0,
                'parent_id': 0,
                'instructions': {},
                'inspection_type_id': 0,
                'name': '',
            };
        };
        
        
        $scope.Spin = $('#spinner').css('width','24px').css('height','24px');
        $scope.Spin.show();
               
        $scope.Loaded = false;
        $scope.$watch('Loaded',function(newval, oldval){
            if(newval){
            	$scope.Spin.hide();
            }else{
                $scope.Spin.show();
            }
        });
        
        
        AuthServices.checkUserCreds();
        $scope.UserSettings = AuthServices.getUserSettings();
        // set the dealer logo to the header bar
        DealerServices.getDealerImg(AuthServices.getDealerID())
        .then(function(obj){
            if("image_id" in obj.data.results && obj.data.results.obj !== null && obj.data.results.image_id !== null)
            {
                var img = AppSettings.BASE_URL + 'img/' + obj.data.results.image_id + '/';
                $('#logo').css('background-image', 'url(' + img + ')').css('width','250px');
                $('.logo-wrapper').css('width','250px');
            }
        });
        

        $scope.ListTemplates = [];
        $scope.ListInspections = [];
        $scope.TemplateInsTypes = [];
        $scope.ListTasks = [];
        $scope.ListForms = [];
        $scope.ListRecents = [];
        $scope.ListFormsByModustri = [];
        $scope.ListFormsByYou = [];
        $scope.TaskTypes = [
            {'title':'Attention','description':'This allows a call to action notice, of either an Information or Warning type.','type':'attention'},
            {'title':'Yes or No','description':'This allows a True/False type question of several varieties to be created','type':'boolean'},
            {'title':'Comment','description':'This allows for freeform user feedback in a textfield.','type':'comment'},
            {'title':'Goal','description':'This allows for the purpose of this step to be defined','type':'goal'},
            {'title':'Help','description':'Supports multiple types of help media for the current step','type':'help'},
            {'title':'Input field','description':'Multiple formats of single field inputs','type':'input'},
            {'title':'Option Picker','description':'Allows for the creation of multiple option inputs','type':'option'},
            {'title':'Photos','description':'Photo uploading, review','type':'photos'},
            {'title':'Rating','description':'Customizable rating widget','type':'rating'},
        ];
        
        var ajaxGetTemplateInspectionTypes = TemplateServices.getTemplateInspectionTypes();
		var ajaxGetTasks = TemplateServices.getTasks();
		var ajaxGetTemplates = TemplateServices.getTemplates();
		var ajaxGetInspectionTypes = TemplateServices.getInspectionTypes();		
           
        function loadTemplates(obj){
            var els = obj.data.results;
            if(els !== undefined)
            {
                $scope.ListTemplates.length = 0;
                for(var e in els)
                {
                    var el = els[e];
                    var td = new moment.unix(el.modified).format('MMM DD, YY');
                    if(el.modified === 0)
                    {
                        td = "N/A";
                    }
                    el.ts = $scope.TS();
                    el.type = 'template';
                    el.date = td;
                    $scope.ListTemplates.push(el);
                }
                $scope.ListTemplates = _.sortBy($scope.ListTemplates, function(ele) { return ele.title; });
            }
        }   

        ajaxGetTemplates.then(function(obj){ loadTemplates(obj); });
        
        function loadInspectionTypes(obj){
            var els = obj.data.results;
            if(els !== undefined)
            {
                $scope.ListInspections.length = 0;
                for(var e in els)
                {
                    var el = els[e];
                    var t = {   
                        'title': el.label,
                        'description':'',
                        'id': el.id,
                        'type': 'instype',
                        'ts': $scope.TS(),
                    };
                    if(el.modified){
                        t.date = new moment.unix(el.modified).format('MMM DD, YY');
                    }else{
                        t.date = 'N/A';
                    }
                    $scope.ListInspections.push(t);
                }
                $scope.ListInspections = _.sortBy($scope.ListInspections, function(ele) { return ele.title; });
            }
        }

        ajaxGetInspectionTypes.then(function(obj){ loadInspectionTypes(obj); });
        
        function loadTemplateInspectionTypes(obj){
            $scope.TemplateInsTypes = obj.data.results;
        }

        ajaxGetTemplateInspectionTypes.then(function(obj){ loadTemplateInspectionTypes(obj); });

        function loadTasks(obj){
            var els = obj.data.results;
            if(els !== undefined)
            {
                $scope.ListTasks.length = 0;
                for(var e in els)
                {
                    var el = els[e];
                    el.ts = $scope.TS();
                    el.title = el.name;
                    el.type = 'task';
                    el.description = 'Steps: ' + el.instructions.steps.length;
                    $scope.ListTasks.push(el);
                }
                $scope.ListTasks = _.sortBy($scope.ListTasks, function(ele) { return ele.title; });

                for(var i in $scope.ListTasks){
                    var t = $scope.ListTasks[i];
                    var it = _.find($scope.ListInspections, function(ins){
                        return ins.id==t.inspection_type_id;
                    })
                    if(it!=undefined){
                        t.inspection_type = it;
                    }
                }
            }
        }
        
        ajaxGetTasks.then(function(obj){ loadTasks(obj); });
                
        $q.all([ajaxGetTemplates, ajaxGetInspectionTypes, ajaxGetTemplateInspectionTypes, ajaxGetTasks]).then(function(obj){
        	$scope.ListForms = $scope.ListTemplates.concat($scope.ListInspections);
        	$scope.ListForms = _.sortBy($scope.ListForms, function(ele) { return ele.title; });

        	angular.copy($scope.ListForms, $scope.ListRecents);

            for(var i in $scope.ListTasks){
                var t = $scope.ListTasks[i];
                var it = _.find($scope.ListInspections, function(ins){
                    return ins.id==t.inspection_type_id;
                })
                if(it!=undefined){
                    t.inspection_type = it;
                }
            }

            $scope.Loaded = true;
        });
        
        
        $scope.GetElemView = function(data)
        {
            if(data.type === 'template')
            {
                $scope.Template = data;
                return 'views/partials/formbuilder/templates/builder_element.html';
            }
            if(data.type === 'task')
            {
                $scope.Task = data;
                return 'views/partials/formbuilder/tasks/builder_element.html';
            }
            if(data.type === 'instype')
            {
                $scope.Inspection = data;
                return 'views/partials/formbuilder/inspections/builder_element.html';
            }
        };


        // -------- Template Builder ----------

        $scope.NewTemplate = $scope.TemplateBlank();
        $scope.IsNewTemplate = true;
        $scope.DroppedObjs = [];
        
        if($routeParams['ID'] && $location.path().startsWith('/templates')){
        	TemplateServices.getTemplateById($routeParams['ID']).then(function(obj){
        		var el = obj.data.results;
        		$scope.NewTemplate = {
            		'id': el.id,
	                'title': el.title,
	                'dealer_id': el.dealer_id,
	                'model_id': el.model_id,
	                'modified': el.modified,
	                'description': el.description,
            	};
	        	$scope.IsNewTemplate = false;
            	TemplateServices.getTemplateInspectionTypesByTemplate(el.id).then(function(obj){
            		var tits = obj.data.results;
            		tits = tits.sort(function (a, b) {
                        return a.sort_order - b.sort_order;
                    });
                    var gets=[];                    
                    for(var i in tits){
                    	gets.push(TemplateServices.getInspectionType(tits[i].inspection_type_id));
                    	gets.push(TemplateServices.getTasksByInspectionType(tits[i].inspection_type_id));
                    }
                    $q.all(gets).then(function(res){
                    	var instype;
                    	for(i=0; i<res.length/2; i++){
                    		instype = res[i*2].data.results;
                    		instype.title = instype.label;
                    		instype.type = "instype";
                    		instype.tasks = res[i*2+1].data.results;
                    		$scope.DroppedObjs.push(instype);
                    	}
                    });                	
            	});
            	$scope.Template = $scope.NewTemplate;
        	});
        }
        
        $scope.SaveTemplate = function(isNew){
        	if($scope.NewTemplate.title.trim()==''){
        		alert('Inspection Title should be filled!');
        		return;
        	}
            $scope.Loaded = false;
            if(isNew){
                $scope.NewTemplate.id = $scope.UUID();
            }
        	var newtemplate = $scope.NewTemplate;
        	var instypes = [];
        	angular.copy($scope.DroppedObjs, instypes);
        	TemplateServices.saveTemplate(newtemplate).success(function(res){
        		TemplateServices.removeTemplateInspectionTypesByTemplate(newtemplate.id).then(function(res){
        			for(var i in instypes){
		        		if(instypes[i].type=="instype"){
		        			var newtemplateinspectiontype = $scope.TemplateInspectionTypeBlank();
		        			newtemplateinspectiontype.template_id = newtemplate.id;
		        			newtemplateinspectiontype.inspection_type_id = $scope.DroppedObjs[i].id;
		        			newtemplateinspectiontype.sort_order = i;
		        			TemplateServices.saveTemplateInspectionType(newtemplateinspectiontype);
		        		}
		        	}
		        	$scope.IsNewTemplate = false;
                    $location.url('templates/'+newtemplate.id);
                    $scope.Loaded = true;
        		});        		
        	});
        };

        $scope.DropElement = function(data, e)
        {
            TemplateServices.getTasksByInspectionType(data.id).then(function(res){
                data.tasks = res.data.results;
                angular.forEach(data.tasks, function(task, key){
                    task.expanded = false;
                });
            });
            var oi = null;
            oi = _.find($scope.DroppedObjs, function(obj){
                return obj.id == data.id;
            });                     
            if(oi!=null){
                console.log('You are trying to add duplicates');
                return;
            }
            $scope.DroppedObjs.push(data);
        };

        $scope.MoveElement = function(i, data, e)
        {
            var oi = $scope.DroppedObjs.indexOf(data);
            if(oi > -1)
            {
                console.log(data.type);
                var oe = $scope.DroppedObjs[i];
                $scope.DroppedObjs[i] = data;
                $scope.DroppedObjs[oi] = oe;
            }else
            {
                console.log('add');
                $scope.DropElement(data,e);
            }
        };

        $scope.removeInDroppedObjs = function(i){
            $scope.DroppedObjs.splice(i,1);
        };

        $scope.keywordFilterInspectionTypeBox = '';
        $scope.filterInspectionTypeBox = function(instype){
            if($scope.keywordFilterInspectionTypeBox == "") {
                return true;
            }
            if(instype.title.toLowerCase().indexOf($scope.keywordFilterInspectionTypeBox.toLowerCase())>=0) {
                return true;
            } else {
                return false;
            }
        };
        

        // -------- Inspection Type Builder ----------
        
        $scope.NewInspectionType = $scope.InspectionTypeBlank();
        $scope.IsNewInspectionType = true;

        if($routeParams['ID'] && $location.path().startsWith('/inspections')){
            TemplateServices.getInspectionType($routeParams['ID']).then(function(res){
                var t = res.data.results;
                $scope.NewInspectionType = {
                    'id': t.id,
                    'title': t.label,
                    'label': t.label,
                };
                $scope.IsNewInspectionType = false;
                TemplateServices.getTasksByInspectionType(t.id).then(function(res){
                    $scope.NewInspectionType.tasks = res.data.results;
                    $scope.NewInspectionType.tasks = $scope.NewInspectionType.tasks.sort(function (a, b){
                        return a.sort_order - b.sort_order;
                    });
                    angular.forEach($scope.NewInspectionType.tasks, function(task, key){
                        task.expanded = false;
                        task.ts = $scope.TS();
                        task.title = task.name;
                        task.type = 'task';
                        task.description = 'Steps: ' + task.instructions.steps.length;
                    });
                });
                $scope.Inspection = $scope.NewInspectionType;
            });
        }

        $scope.SaveInspectionType = function(isNew)
        {
            if($scope.NewInspectionType.title.trim()==''){
                alert('Section Title should be filled!');
                return;
            }
            $scope.Loaded = false;
            if(isNew){
                $scope.NewInspectionType.id = $scope.UUID();
            }
            var newinspectiontype = $scope.NewInspectionType;
            newinspectiontype.label = newinspectiontype.title;
            TemplateServices.saveInspectionType(newinspectiontype).success(function(res){        
                TemplateServices.removeTasksByInspectionType(newinspectiontype.id).success(function(res){
                    for(var i in newinspectiontype.tasks){
                        if(isNew){
                            newinspectiontype.tasks[i].id = $scope.UUID();
                        }                        
                        newinspectiontype.tasks[i].inspection_type_id = newinspectiontype.id;
                        var newtask = {};
                        angular.copy(newinspectiontype.tasks[i], newtask);                      
                        newtask.instructions = JSON.stringify({'steps': newtask.instructions.steps});
                        newtask.sort_order = i;
                        TemplateServices.saveTask(newtask);                     
                    }
                    $scope.Loaded = true;
                    $scope.IsNewInspectionType = false;
                    $location.url('inspections/'+newinspectiontype.id);
                });
            });
        };

        $scope.DropTask = function(data, e){
            var oi = $scope.NewInspectionType.tasks.indexOf(data);
            if(oi>-1){
                console.log('You are trying to add duplicates');
                return;
            }
            data.id = $scope.UUID();
            $scope.NewInspectionType.tasks.push(data);
        }

        $scope.MoveTask = function(i, data, e)
        {
            var oi = $scope.NewInspectionType.tasks.indexOf(data);
            if(oi > -1)
            {
                console.log(data.type);
                var oe = $scope.NewInspectionType.tasks[i];
                $scope.NewInspectionType.tasks[i] = data;
                $scope.NewInspectionType.tasks[oi] = oe;
            }else
            {
                console.log('add');
                $scope.DropTask(data,e);
            }
        };

        $scope.removeInDroppedTasks = function(i){
            $scope.NewInspectionType.tasks.splice(i,1);
        };

        $scope.keywordFilterTaskBox = '';
        $scope.filterTaskBox = function(task){
            if($scope.keywordFilterTaskBox == "") {
                return true;
            }
            if(task.title.toLowerCase().indexOf($scope.keywordFilterTaskBox.toLowerCase())>=0) {
                return true;
            } else {
                return false;
            }
        };

        
        // --------- Task Builder ---------

        $scope.NewTask = $scope.TaskBlank();
        $scope.NewSteps = [];
        $scope.MyWatches = [];
        $scope.tplstr = 'Test';
        $scope.TempOpt = '';

        $scope.SaveTask = function()
        {
            // logic to build and save task / steps data structure
            console.log("Called save");
            $scope.NewTask.instructions = {'steps': $scope.NewSteps};
            var newtask = $scope.NewTask;
            var steps = $scope.NewSteps;
            for(var i in steps)
            {
                for(var x in steps[i])
                {
                    delete steps[i]['$$hashKey'];
                    delete steps[i]['TempOpt'];
                }
            }
            newtask.instructions = JSON.stringify({'steps': steps});
            console.dir(newtask);
            TemplateServices.saveTask(newtask).success(function(res){
                $scope.NewTask.id = res.results.id;
            });            
        };

        $scope.RemoveStep = function(index)
        {
            $scope.ClearRatingWatches();
            console.log(index + ' - ' + name);
            if(window.confirm('Are you sure?\nThis will delete all parts\nof this step'))
            {
                // !!! TODO Need to clear all the watches for ratings, and re-add
                // them for the ratings widgets, they lose their binding when the
                // steps are re-ordered
                $timeout(function(){$scope.NewSteps.splice(index,1);},0,true);
                // console.dir($scope.NewSteps);
                //$scope.RebuildRatingWatches();
            }
        };

        $scope.AddStep = function()
        {
            // console.log('Adding step: ' + $scope.NewSteps.length +1);
            var MyStep = {};
            $scope.NewSteps.push(MyStep);
        }

        $scope.AppendStep = function(index,MyStep, type)
        {
            if($scope.NewSteps[index] === undefined)
            {
                $scope.NewSteps[index] = {};
            }
            switch(type)
            {
                case 'rating':

                    if(!MyStep.hasOwnProperty('rating_max'))
                    {
                        MyStep.rating_max = 10;
                    };
                    $scope.NewSteps[index][type] = MyStep;
                break;
                case 'boolean':
                    if(!MyStep.hasOwnProperty('boolean_default'))
                    {
                        MyStep.boolean_default = 0;
                    }
                    if(!MyStep.hasOwnProperty('boolean_type'))
                    {
                        MyStep.boolean_type = 'No / Yes';
                    }
                break;
            }
            console.log(index,type, MyStep);
            $scope.NewSteps[index][type] = MyStep;
            //console.log('calling rebuild rating watches in append');
            //$scope.ClearRatingWatches();
            //$scope.RebuildRatingWatches();
        };

        $scope.DropStep = function(index,data)
        {
            // If we don't have a step, or we've dropped on the task, set the
            // index to 0 and potentially add the step
            if(index === undefined)
            {
                if($scope.NewSteps.length === 0){
                    $scope.AddStep();
                }
                index = 0;
            }
            console.log(index, data);            
            if(data.hasOwnProperty('instructions'))
            {
                for(var s in data.instructions.steps)
                {
                    var newstep = {};
                    var idx = $scope.NewSteps.push(newstep) - 1;
                    for(var wi in data.instructions.steps[s])
                    {
                        var wdgt = data.instructions.steps[s][wi];
                        if(!$scope.NewSteps.hasOwnProperty(idx))
                        {
                            $scope.NewSteps[idx] = {};
                        }
                        $scope.AppendStep(idx, wdgt, wi);
                    }
                }
            }else
            {
                var MyStep={};
                angular.copy($scope.StepBlanks[data.type],MyStep);
                if(data.type=='goal'){
                    $scope.AppendStep(index,$scope.StepBlanks[data.type], data.type);
                }else{
                    $scope.AppendStep(index,MyStep, data.type); 
                }
            }            
        };

        $scope.MoveStep = function(i, x)
        {
            var bi = i + x;
            console.log('bi:' + bi + ' i ' + i + ' x ' + x);
            if($scope.NewSteps.length > 0)
            {
                if(bi >= 0 && bi < $scope.NewSteps.length)
                {
                    var a = $scope.NewSteps[i];
                    var b = $scope.NewSteps[bi];
                    $scope.NewSteps[i] = b;
                    $scope.NewSteps[bi] = a;
                }
            }
        };

        $scope.GetInsByID = function(id)
        {
            for(var ins in $scope.ListInspections)
            {
                var ti = $scope.ListInspections[ins];
                if(ti.id === id)
                {
                    return ti.title;
                }
            }
            return 'Not set';
        };
        
        $scope.AddOpt = function(Step)
        {
            console.dir(Step);
            if(Step.TempOpt === '')
            {
                console.log('no tempopt');
                return;
            }else
            {
                var t = Step.TempOpt;
                console.log(t);
                Step.option.option_choices.push(t);
                Step.TempOpt = '';
            }
        }

        $scope.RemoveWidget = function(index, name)
        {
            console.log(index + ' - ' + name);
            if(window.confirm('Are you sure?'))
            {
                $timeout(function(){delete($scope.NewSteps[index][name]);},0,true);
            }
        };

        $scope.RemoveOption = function(index, Step)
        {
            console.log(index);
            console.dir(Step);

            if(window.confirm('Are you sure?'))
            {
                $timeout(function(){Step.option.option_choices.splice(index,1);},0,true);
            }

        };

        $scope.RebuildRatingWatches = function()
        {
            for(var i in $scope.NewSteps)
            {
                if($scope.NewSteps[i].hasOwnProperty('rating'))
                {
                    console.log("adding watch to rating in step " +i);
                    $scope.WatchRating(i);  // add watch back
                }
            }
        }

        $scope.ClearRatingWatches = function()
        {
            for(var i in $scope.MyWatches)
            {
                console.log('clearing watch ' + i);
                $scope.MyWatches[i]();  // clear the watch
                $scope.MyWatches.splice(i,1);
            }
        };

        $scope.WatchRating = function(index)
        {
            var type='rating';
            //var myidx = index + "" + type;
            console.dir($scope.NewSteps[index][type]);
            $scope.MyWatches.push($scope.$watch(function(val){return $scope.NewSteps[index][type].rating_max;},
            function(newVal, oldVal){
                if(newVal !== oldVal){
                    $scope.NewSteps[index][type].RateRender = false;
                    $timeout(function(){
                        $scope.NewSteps[index][type].RateRender=true;
                    }, 0, true);
                }
            }));
            $timeout(function(){
                $scope.NewSteps[index][type].RateRender=true;
            }, 0, true);
        };

        $scope.ImgPath = function(img)
        {
            console.log(img)
        };

        $scope.BuildTestBlank = function()
        {
            console.log('build test blank');
            var MyStep = {};
            MyStep.goal = 'Test Step building';
            MyStep.help = {'help_text': 'Try to build an individual step of an inspection'};
            MyStep.rating = {
                'directions': 'This is a rating widget', // text label
                'rating_min': 1,
                'rating_max': 10,
                'rating_increment': 0.5,
                'value': 1,
            };
            $scope.RateRender = true;

            MyStep.photos = {
                'directions': 'Photo carousel / uploader',
                'photos_numreq': 0, // Number of photos required to complete step
                'value': false, // should be an array if populated
            },
            MyStep.boolean = {
                'directions': 'True or False input', // text label
                'boolean_default': 0, // default to false
                'boolean_req': 0, // required or not
                'boolean_type': 0, // 0 [Incomplete/Complete] 1 [No/Yes], 2 [Off/On]
                'value': 0,
            };
            MyStep.option = {
                'directions':'Select Box input',
                'option_choices': ['Excellent', 'Acceptable', 'Poor'],
                'option_default': 0,
                'option_size': 'default', // accepts 'default' and 'wide'
                'option_select': 'single', // accepts 'single' and 'multiple'
                'value': 0,
            };
            MyStep.attention = {
                'attention_text': 'Call to action / warning',
                'attention_type': 'info', // info / warning
            };
            MyStep.comment = {
                'directions':'Please provide a comment',
                'value': '',
            };
            MyStep.input = {
                'directions':'Enter a number',
                'input_type': 'decimal', // mix-all chars, mix-safe:nospaces, integer, decimal (float)
                'input_max': 99.99, // max val for dec/int vals
                'input_min': -99.99, // min val for dec/int vals
                'input_length': false, // max bytes, overrides l_int/l_dec
                'input_length_int': 4, // max bytes before decimal
                'input_length_dec': 2, // total decimal points allowed
                'input_req': 0, // required or not
                'input_regex': '', // Not used yet
                'input_size': 'default', // default / wide
                'input_units': 'inches',
                'value': false,
            }
            console.dir(MyStep);
            $scope.NewSteps.push(MyStep);
        };
        // blank core data structures

        $scope.StepBlanks = {
            // High level objective task represents
            'goal': ' ', // text label
            // Help info for specific task
            'help': {
                'help_text': '', // text label
                'help_photos': [], // array of UUIDs
                'help_videos': [], // array of UUIDs
            },
            // Rating widget
            'rating':{
                'directions': ' ', // text label
                'rating_min': 1,
                'rating_max': 10,
                'rating_increment': 1,
            },
            // Photos Widget
            'photos':{
                'directions': '', // text label
                'photos_numreq': 0, // Number of photos required to complete step
            },
            // Undercarriage Measurement Widget
            'uci':
            {
                'directions': '', // text label
                'uci_tool': 'ultrasonic', // caliper, depth_gage, etc
                'uci_units': 'inches', // Unit measurement was taken with
            },
            'boolean':{
                'directions': '', // text label
                'boolean_default': 0, // default to false
                'boolean_req': 0, // required or not
                'boolean_type': '0', // 0 [Incomplete/Complete] 1 [No/Yes], 2 [Off/On]
            },
            'option':{
                'directions':'',
                'option_choices': [],
                'option_default': 0,
                'option_size': 'default', // accepts 'default' and 'wide'
                'option_select': 'single', // accepts 'single' and 'multiple'
            },
            'attention':{
                'attention_text': '',
                'attention_type': 'info', // info / warning
            },
            'comment':{
                'directions':'',
            },
            'input':{
                'directions':'',
                'input_type': 'decimal', // mix-all chars, mix-safe:nospaces, integer, decimal (float)
                'input_max': 99.99, // max val for dec/int vals
                'input_min': -99.99, // min val for dec/int vals
                'input_length': false, // max bytes, overrides l_int/l_dec
                'input_length_int': 4, // max bytes before decimal
                'input_length_dec': 2, // total decimal points allowed
                'input_req': 0, // required or not
                'input_regex': '', // Not used yet
                'input_size': 'default', // default / wide
                'input_units': 'inches',
            }
        };


        $scope.open_createform = function(){
        	var modalInstance = $modal.open({
		      templateUrl: 'views/partials/formbuilder/CreateFormModal.html',
		      controller: 'CreateFormModalCtrl',
		      size: 'sm',
		      resolve: {
		      },
		      windowClass: 'createform-modal',
		    });
		    modalInstance.result.then(function(formType){
		    	if(formType=='template'){
		    		$location.path('templates');
		    	}else if(formType=='inspectiontype'){
		    		$location.path('inspections');
		    	}
		    });
        }
        
        $scope.open_taskmodal = function(id){
        	var modalInstance = $modal.open({
		      templateUrl: 'views/partials/formbuilder/task.html',
		      controller: 'TaskModalCtrl',
		      resolve: {
		      	taskid: function() {
		      		return id;
		      	},
                instypes: function() {
                    return $scope.ListInspections;
                }
		      },
		      windowClass: 'fb-taskbuilder-modal',
		    });
		    modalInstance.result.then(function(obj){
		    	if(obj=='ok'){
                    TemplateServices.getTasks().then(function(obj){ loadTasks(obj); });
                }
		    });
        }

        $scope.isActiveNav = function(locationPattern) {
            var currentUri = $location.path();
            var regM1 = currentUri.match(/[^/].*[^/]/g);
            var regM2 = locationPattern.match(/[^/].*[^/]/g);

            if (regM1 !== null && regM1.length > 0) {
                currentUri = '/' + regM1[0]; //cut slashes, and put again
            }
            if (regM2 !== null && regM2.length > 0) {
                locationPattern = '/' + regM2[0]; //cut slashes, and put again
            }

            if (currentUri.indexOf(locationPattern) !== -1) {
                return true;
            }
            else {
                return false;
            }
        };
    }
]);


Modustri.controller('CreateFormModalCtrl', function ($scope, $location, $modalInstance) {
	$scope.formType = {
		selected: '',
	}

	$scope.ok = function () {
	  	$modalInstance.close($scope.formType.selected);
	};

  	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
  	};
});


// ---------- Task Builder Modal -----------

Modustri.controller('TaskModalCtrl', function ($scope, $location, $timeout, $modalInstance, TemplateServices, taskid, instypes) {
        
	$scope.task_id = taskid;
	$scope.mode;
    $scope.instypes = instypes;

    $scope.TS = function(){
        var d = new Date().getTime() + Math.random() * (9999 - 1000) + 1000;
        return d;
    };

    $scope.UUID = function(){
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c==='x' ? r : (r&0x7|0x8)).toString(16);
        });
        return uuid;
    };

	$scope.task_blank = function(){
        return {
            'id': $scope.UUID(),
            'component_id': 0,
            'user_id': 0,
            'sort_order': 0,
            'modified': 0,
            'required': 0,
            'parent_id': 0,
            'instructions': { 'steps':[] },
            'inspection_type_id': 0,
            'name': '',
        };
    };

    $scope.task_types = [
        {'type':'attention','title':'Attention',    'description':'This allows a call to action notice, of either an Information or Warning type.'},
        {'type':'goal',     'title':'Goal',         'description':'This allows for the purpose of this step to be defined'},
        {'type':'help',     'title':'Help',         'description':'Supports multiple types of help media for the current step'},
        {'type':'rating',   'title':'Rating',       'description':'Customizable rating widget'},
        {'type':'photos',   'title':'Photos',       'description':'Photo uploading, review'},
        {'type':'boolean',  'title':'Yes or No',    'description':'This allows a True/False type question of several varieties to be created'},
        {'type':'option',   'title':'Option Picker','description':'Allows for the creation of multiple option inputs'},
        {'type':'comment',  'title':'Comment',      'description':'This allows for freeform user feedback in a textfield.'},
        {'type':'input',    'title':'Input field',  'description':'Multiple formats of single field inputs'},
	];

    $scope.task_type_blank = function(type) {
        if(type=='attention'){
            return {
                'attention_text': '',
                'attention_type': 'info', // info / warning
            };
        }else if(type=='goal'){
            return ''; // text label
        }else if(type=='help'){
            return {
                'help_text': '', // text label
                'help_photos': [], // array of UUIDs
                'help_videos': [], // array of UUIDs
            };
        }else if(type=='rating'){
            return {
                'directions': ' ', // text label
                'rating_min': 1,
                'rating_max': 10,
                'rating_increment': 1,
            };
        }else if(type=='photos'){
            return {
                'directions': '', // text label
                'photos_numreq': 0, // Number of photos required to complete step
            };
        }else if(type=='boolean'){
            return {
                'directions': '', // text label
                'boolean_default': 0, // default to false
                'boolean_req': 0, // required or not
                'boolean_type': '0', // 0 [Incomplete/Complete] 1 [No/Yes], 2 [Off/On]
            };
        }else if(type=='option'){
            return {
                'directions':'',
                'option_choices': [],
                'option_default': 0,
                'option_size': 'default', // accepts 'default' and 'wide'
                'option_select': 'single', // accepts 'single' and 'multiple'
            };
        }else if(type=='comment'){
            return {
                'directions':'',
            };
        }else if(type=='input'){
            return {
                'directions':'',
                'input_type': 'decimal', // mix-all chars, mix-safe:nospaces, integer, decimal (float)
                'input_max': 99.99, // max val for dec/int vals
                'input_min': -99.99, // min val for dec/int vals
                'input_length': false, // max bytes, overrides l_int/l_dec
                'input_length_int': 4, // max bytes before decimal
                'input_length_dec': 2, // total decimal points allowed
                'input_req': 0, // required or not
                'input_regex': '', // Not used yet
                'input_size': 'default', // default / wide
                'input_units': 'inches',
            };
        }
    };

	
	if($scope.task_id){
		$scope.mode = 'edit';
	}else{
		$scope.mode = 'new';
	}
	
	if($scope.mode=='edit'){
		TemplateServices.getTaskById($scope.task_id).then(function(res){
			$scope.task = res.data.results;
		});
	}else{
		$scope.task = $scope.task_blank();
	}


    $scope.task_save = function () {
        var newtask = {};
        angular.copy($scope.task, newtask);
        var steps = newtask.instructions.steps;
        for(var i in steps)
        {
            for(var x in steps[i])
            {
                delete steps[i]['$$hashKey'];
                delete steps[i]['TempOpt'];
            }
        }
        newtask.instructions = JSON.stringify({'steps': steps});        
        TemplateServices.saveTask(newtask).success(function(res){
        	$scope.ok();
        });
    };
    

    $scope.step_add = function () {
    	$scope.task.instructions.steps.push({'show':true});
    };
    
    $scope.step_remove = function (index) {
    	if(window.confirm('Are you sure?\nThis will delete all parts of this step.')) {
            $timeout(function(){
            	$scope.task.instructions.steps.splice(index,1);
            },0,true);
        }
    };
    
    $scope.step_move = function(i, x) {
        var bi = i + x;
        if($scope.task.instructions.steps.length > 0) {
            if(bi >= 0 && bi < $scope.task.instructions.steps.length) {
                var a = $scope.task.instructions.steps[i];
                var b = $scope.task.instructions.steps[bi];
                $scope.task.instructions.steps[i] = b;
                $scope.task.instructions.steps[bi] = a;
            }
        }
    };


    $scope.step_type_remove = function(step, tasktype) {        
        if(window.confirm('Are you sure?\nThis will delete task type permanently.')) {
            $timeout(function(){
                delete step[tasktype];
            },0,true);
        }
    };

    $scope.step_type_new = function(step, tasktype) {
        step[tasktype] = $scope.task_type_blank(tasktype);
    };


    $scope.step_option_add = function(step) {
        if(step.optiontemp==null || step.optiontemp.trim()==''){
            return;
        }else{
            var t = step.optiontemp;
            step.option.option_choices.push(t);
            step.optiontemp = '';
        }
    };

    $scope.step_option_remove = function(step, index) {
        if(window.confirm('Are you sure?')){
            $timeout(function(){
                step.option.option_choices.splice(index,1);
            },0,true);
        }
    };


	$scope.ok = function () {
	  	$modalInstance.close('ok');
	};

  	$scope.cancel = function () {
	    $modalInstance.dismiss('cancel');
  	};
  	
});