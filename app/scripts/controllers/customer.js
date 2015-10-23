/*global moment, angular, $, alert,confirm,_, Modustri*/
/**
 * @fileOverview Controller for viewing and editing customers.
 * @author Tim Snyder <tim.snyder@agent-x.com>
 */

Modustri.controller('CustomerCtrl', ['$log', '$scope', '$routeParams',
    '$location', 'CustomerServices','MachineServices', 'UserServices',
    'InsServices', 'AuthServices', 'Utilities', 'AppSettings',
    'ScoreBoardServices', '$position', '$modal','$q',
    function ($log, $scope, $routeParams, $location, CustomerServices,
              MachineServices, UserServices, InsServices, AuthServices, Utilities,
              AppSettings,ScoreBoardServices,$position, $modal, $q)
    {

        "use strict";
        var Spin = $('#spinner');
        Spin.show();
        AuthServices.checkUserCreds();

        $scope.UserSettings = AuthServices.getUserSettings();

        $scope.SelectedAll = false;
        $scope.Months = {};
        // Populate the month headers / column containers
        $scope.past = 12;
        $scope.fut = 12;
        $scope.Customer = {};
        $scope.CustInsCache = [];
        $scope.PartManufCache = [];
        $scope.ReportSummary = [];
        $scope.new_customer = false;
        $scope.machine_page = '';
        $scope.num_pages = '';
        $scope.image_upload = '';
        $scope.badges = {};
        $scope.MachineActions = {};
        $scope.MachineWearDates = {};
        $scope.MachinesByID = {};
        $scope.machine_page = 1;
        //Report type definition
        $scope.ReportTypeList = [{id:'fleet', label: 'Fleet Summary'},
            {id: 'fleet_2', label: 'Fleet Summary 2'}];
        $scope.ReportSummary = [];

        var t_id, cache;
        var url = $location.url();
        var match = url.match(/edit/);
        //var dealer_id = AuthServices.getDealerID();
        //to hide / show items in the ui based on state
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
        $scope.UpdateScoreboardRange = function()
        {
            Spin.show();
            $scope.Months = {}; // Reset Months
            $scope.MachineActions = {}; // Reset actions
            var now = moment().startOf('month');
            var i = $scope.past;
            var fut = $scope.fut;
            fut = fut^-1;
            while(i > fut)
            {
                var tm = moment().subtract(i,'months').startOf('month');
                var lbl = tm.format('MMM YY');
                var idp = tm.format('MMM_YYYY');
                var ts = tm.unix();
                $scope.Months[ts] = {};
                $scope.Months[ts].timestamp = ts;
                $scope.Months[ts].label = lbl;
                $scope.Months[ts].idp = idp.toLowerCase();
                if(ts === now.unix())
                {
                    $scope.Months[ts].active = true;
                }else
                {
                    $scope.Months[ts].active = false;
                }
                i--;
            }
            Spin.hide();
        };

        $scope.FmtMonth = function(str) {
            str = str.replace('_',' ');
            return str.charAt(0).toUpperCase() + str.slice(1);
        };

        $scope.DeleteAction = function(action_id)
        {
            //console.log(action_id);
            if(confirm('Are you sure you want to delete this action?')) {
                ScoreBoardServices.deleteAction(action_id).then(function(){
                    $scope.RefreshScoreboard();
                    $('#action_'+action_id).remove();
                });
            }
        };

        var $wa;
        $scope.MachineSummaryModal = function(machine_id, month)
        {
            //console.dir($scope.badges);
            var $mydiv = $('<div></div>');
            $mydiv.attr('id', 'hover_' + machine_id+month);
            var machine = $scope.MachinesByID[machine_id];
            //console.dir(machine);
            var d_title = machine.model + ' ' + machine.serial + ' - ' + $scope.FmtMonth(month);
            $mydiv.attr('title', d_title);
            var AllWearDates = $scope.MachineWearDates[machine_id]; // get wear dates from cache
            var Actions = $scope.MachineActions[machine_id];
            //console.log(machine_id);
            //console.dir(AllWearDates);
            var sev_text = "n/a";
            var hun_text = "n/a";
            var huntwn_text = "n/a";
            // Add wear dates to dialog
            var last_id = false;
            for(var i in AllWearDates)
            {
                if(last_id < i || last_id === false)
                {
                    last_id = i;
                }
            }

            var WearDates = AllWearDates[last_id];

            if(WearDates !== undefined && WearDates.hasOwnProperty('70'))
            {
                var last_perc = 'n/a';
                if(machine.hasOwnProperty('rating'))
                {
                    sev_text = "Past";
                    hun_text = "Past";
                    huntwn_text = "Past";
                    last_perc = machine.rating;
                    d_title += ' - ' + last_perc;
                    $mydiv.attr('title', d_title);
                    var rv = parseInt(machine.rating_value, 10);
                    var last_class = '';
                    if(rv > 69)
                    {
                        last_class = 'bgred';
                    }else if(rv < 70 && rv > 30)
                    {
                        last_class = 'bgyellow';
                    }else if(rv < 30)
                    {
                        last_class = 'bggreen';
                    }
                    last_perc = '<span class="' + last_class + '">' + last_perc + '</span>';
                    if(rv < 69)
                    {
                        sev_text = new moment.unix(WearDates.adate).add(WearDates['70'], 'seconds').format('MMM YYYY');
                    }
                    if(rv < 99)
                    {
                        hun_text = new moment.unix(WearDates.adate).add(WearDates['100'], 'seconds').format('MMM YYYY');
                    }
                    if(rv < 119)
                    {
                        huntwn_text = new moment.unix(WearDates.adate).add(WearDates['120'], 'seconds').format('MMM YYYY');
                    }
                }
                var $wd = $('<fieldset><legend>Wear Estimates</legend></fieldset>');
                $wd.addClass('wear_dates');
                // ratings div
                var $rat_div = $('<div></div>').addClass('cal_modal_rating');
                $rat_div.append($('<span><img src="/images/formbuilder/green-arrow.svg" style="height: 10px;width: auto;"> 70% ' + sev_text + '</span><br>'));
                $rat_div.append($('<span><img src="/images/formbuilder/orange-arrow.svg" style="height: 10px;width: auto;"> 100% ' + hun_text + '</span><br>'));
                $rat_div.append($('<span><img src="/images/formbuilder/red-arrow.svg" style="height: 10px;width: auto;"> 120% '+ huntwn_text + '</span><br>'));
                // img div
                var $img_div = $('<div></div>').addClass('cal_modal_img');
                var full = false;
                var tmb = 'images/tmp.png';
                if(machine.main_image_id > 0)
                {
                    full = AppSettings.BASE_URL + 'img/' + machine.main_image_id + '/';
                    tmb = AppSettings.BASE_URL + 'imgtmb/' + machine.main_image_id + '/';
                }
                $img_div.append('<img src="' + tmb + '" width="100" height="100"/>');
                $wd.append($img_div);
                $wd.append($rat_div); // append wear dates fieldset
                $mydiv.append($wd);
            }
            // Add current badges to dialog
            var tma = 0;    // this months actions
            $wa = $('<fieldset><legend>Actions</legend></fieldset>').css('clear','both');
            for(var mo in Actions)
            {
                console.dir(Actions);
                for(var act in Actions[mo])
                {
                    var ta = Actions[mo][act];
                    if(month === ta.month)
                    {
                        var $btn = $('<button value="' + ta.id + '">Delete</button>');
                        $btn.click(function(e){
                            $scope.DeleteAction($(this).val());
                        })
                        //$wa.append($btn);
                        var $aspn = $('<div class="action_modal" id="action_'+ ta.id+'"><p><span><b>' + $scope.FmtMonth(ta.month) + '</b> ' + ta.description + '</span><br>' + ta.notes + '</p></div>');
                        $aspn.append($btn);
                        $aspn.append($('<br>'));
                        $wa.append($aspn);

                        tma++;
                    }
                }

            }
            if(tma === 0)
            {
                $wa.append($('<div class="action_modal" id="action_item"><p><span>No actions for this machine this month</span></p><br></div>'));
            }
            $mydiv.append($wa);
            // Add create badge form to dialog
            var relid = machine_id + month;
            // Create fieldset
            var $aaf = $('<fieldset style="margin-top: 10px;"></fieldset>').css('clear','both');
            // Create legend, make it toggle the add form
            $aaf.append($('<legend></legend>').append($('<button>Add Action</button>'))
                .click(function(){
                    $('#add_actions_' + relid).toggle();
                }));
            // Container div for add form that can be toggled
            var $aafd = $('<div id="add_actions_' + relid +'" style="display: none;"></div>');
            // Create Label / Select for action types
            $aafd.append('<label for="new_action_type_' + relid + '">Action Type</label>');
            var $aaslkt = $('<select id="new_action_type_' + relid + '"></select>');
            $aaslkt.append($('<option value="" selected>Please select Action type</option>'));
            for(var b in $scope.badges)
            {
                var tb = $scope.badges[b];
                $aaslkt.append($('<option value="' + tb.id + '">' + tb.abr + ' - ' + tb.description + '</option>'));
            }
            // Add the select to the add div
            $aafd.append($aaslkt);
            var $txt_lbl = $('<label for="new_action_note_' + relid + '">Note</label>');
            var $txt = $('<textarea></textarea>');
            $txt.attr('id', 'new_action_note_' + relid);
            $txt.attr('rows','3').attr('cols','30');
            // Add the label and textarea to the fieldset
            $aafd.append($txt_lbl);
            $aafd.append($txt);
            // Add converted boolean
            var $cvtd_lbl = $('<label for="cvtd_'+relid+'">Converted to Sale</label>');
            var $cvtd = $('<input type="checkbox" value="1"></input>');
            $cvtd.attr('id','cvtd_' + relid);
            $aafd.append($cvtd_lbl);
            $aafd.append($cvtd);
            $aafd.append($('<br>'));
            // Add a submit button
            var $val_lbl = $('<label for="val_'+relid+'">Value</label>');
            var $val = $('<input type="number"></input>');
            $val.attr('id', 'val_' + relid);
            $aafd.append($val_lbl);
            $aafd.append($val);
            $aafd.append('<input type="hidden" id="ac_mon_'+relid+'" value="'+month+'">');
            $aafd.append($('<br>'));

            var $sbmt = $('<input type="submit" value="Submit"></input>');
            $sbmt.click(function(e)
            {
                $scope.AddAction(relid);
            });
            $sbmt.attr('id', 'submit_' + relid);
            $aafd.append($sbmt);

            // Add the Add Form container to the Add Action fieldset
            $aaf.append($aafd);
            // Add Action Form - append to mydiv
            $mydiv.append($aaf);
            $mydiv.dialog(
                {
                    position: {
                        of: $('#mon_ac_' + machine_id +'_' + month),
                        my: 'top left',
                        at: 'top left'
                    }
                }
            );    // Show dialog
        };

        $scope.AddAction = function(relid)
        {
            if ($('#new_action_type_'+relid).val()=== 0) {
                alert("Action Type was not selected.");
                return;
            }
            // console.dir($('#new_action_type_'+relid+ "  option:selected").text());
            // console.dir($('#new_action_note_' + relid).val());
            // console.dir($('#val_' + relid).val());

            var converted = $('#cvtd_' + relid).val();
            var value = $("#val_" + relid).val();
            var acmon = $("#ac_mon_" + relid).val();
            var acmon_splt = acmon.split("_");
            var ac_id = $('#new_action_type_' + relid).val();
            var description = $('#new_action_type_'+relid+ "  option:selected").text();
            var note = $('#new_action_note_' + relid).val();
            var machine_id = relid.replace(acmon,'');
            // Need to add the date, which must be parsed from the acmon
            var mdate = moment(acmon).unix();
            var id = $scope.UUID();
            var action = {
                'machine_id': machine_id,
                'action_id': ac_id,
                'notes': note,
                'converted': converted,
                'value': value + '',
                'date': mdate,
                'id': $scope.UUID()
            }
            ScoreBoardServices.saveAction(action).then(function(obj){
                $scope.RefreshScoreboard();
                // Reset the form
                $('#cvtd_' + relid).val('');
                $("#val_" + relid).val('');
                $('#new_action_type_' + relid).val('');
                $('#new_action_note_' + relid).val('');
                alert('Action saved');

                /* ---------------------------------------------------
                 * Write the existing Action onto the Modal box!
                ----------------------------------------------------*/
                var $action_text = $('#action_item').text();
                // Clear text if there is no action
                if ($action_text.contains("No actions for this machine")) {
                    $('#action_item').remove();
                }
                //Add the existing information on the Modal.
                var $btn = $('<button value="' + id + '">Delete</button>');
                $btn.click(function(e){
                    $scope.DeleteAction($(this).val());
                });
                var $aspn = $('<div class="action_modal" id="action_'+ id+'"><p><span><b>' + acmon_splt[0] + " " + acmon_splt[1] + '</b> ' + description + '</span><br>' + note + '</p>');
                $aspn.append($btn);
                $aspn.append($('<br>'));
                $wa.append($aspn);
            });
        };

        $scope.CheckAll = function(){
            if($scope.SelectedAll === false)
            {
                $scope.SelectedAll = true;
            }else
            {
                $scope.SelectedAll = false;
            }

            angular.forEach($scope.Customer.MachineData, function(item){
                var $el = $('#mach_' + item.id);
                $el.prop('checked' , $scope.SelectedAll);
            });
        };

        function parsePercent(val) {
            var arr = [];
            if(typeof(val) === 'number')
            {
                val = "" + val + "%";
            }
            if (typeof val === 'undefined' ||
                val === null ||
                val === "Hi" ||
                val === "Lo" ||
                val === "NA" ||
                val === ""){return;}
            try
            {
                arr = val.split('%');
            }catch(e)
            {
                // do nothing
            }
            return arr[0];
        }

        if (_.isArray(match) && match[0] === 'edit') {
            $scope.state = "edit";
        }
        else {
            $scope.state = "view";
        }


        /**
         * @desc Show machines owned by this customer along with their inspection data.
         * @param {int} page
         */

        var updatePartManufList = function()
        {
            MachineServices.getPartManufacturers().then(function(obj){
                if(obj !== undefined)
                {
                    angular.forEach(obj.data.results,function(pm)
                    {
                        $scope.PartManufCache[pm.id] = pm.name;
                    });

                }
            });
        };

        $scope.RefreshScoreboard = function()
        {
            //console.log('refresh scoreboard');
            Spin.show();
            updateMachinesList();
        };


        $scope.getScoreBoardActions = function() {
            ScoreBoardServices.getAllScoreBoardData('actions', function(obj){
                angular.forEach(obj.results,function(action){
                    $scope.badges[action.id] = action;
                });
            });
        };

        $scope.updateMachineActions = function()
        {
            //This is filtering by machine_id.
            ScoreBoardServices.getAllScoreBoardData('machineactiondates', function(obj)
            {
                //console.log('Getting machine actions');
                //console.dir(obj);
                angular.forEach(obj.results, function (data)
                {
                    var badge_type = $scope.badges[data.action_id];
                    var badge = data;
                    badge.abr = badge_type.abr;
                    badge.description = badge_type.description;
                    badge.show =true;
                    badge.month = moment.unix(data.date).format('MMM_YYYY').toLowerCase();
                    if(!$scope.MachineActions.hasOwnProperty(badge.machine_id))
                    {
                        $scope.MachineActions[badge.machine_id] = {};
                        $scope.MachineActions[badge.machine_id][badge.month] = {};
                    }
                    if(!$scope.MachineActions[badge.machine_id].hasOwnProperty(badge.month))
                    {

                        $scope.MachineActions[badge.machine_id][badge.month] = {};
                    }
                    $scope.MachineActions[badge.machine_id][badge.month][badge.id] = badge;

                });

                for(var mid in $scope.MachineActions)
                {
                    for(var mo in $scope.MachineActions[mid])
                    {
                        var $bspan = $('<span class="scorbrd_act_badge" id="'+$scope.UUID()+'">' + (Object.keys($scope.MachineActions[mid][mo]).length) + '</span>');
                        var acts = '';
                        for(var ac in $scope.MachineActions[mid][mo])
                        {
                            var tac = $scope.MachineActions[mid][mo][ac];
                            acts += '<span class="scorbrd_act_badge">'+ tac.abr +'</span>';
                        }

                        var $bsp = $('#mon_ac_' + mid + '_' + mo);

                        if($bsp.parent() !== undefined)
                        {
                            //console.log('parent is not undefined');
                            $bsp.append($bspan);
                        }

                        // $bsp.popover({
                        //     title:'Actions',
                        //     content: acts,
                        //     trigger: 'hover',
                        //     viewport: '#scoreboard',
                        // });
                    }

                }
            });
        };

        $scope.FailCalc = function(curr, prev, rate)
        {
            return InsServices.FailCalc(curr, prev, rate);
        };

        var part_results = {};

        $scope.updateMachineFailDates = function()
        {
            for(var machine_id in $scope.MachinesByID)
            {
                MachineServices.getProjections(machine_id).then($scope.HandleProjection);
            }
        };

        $scope.HandleProjection = function(obj)
        {
            var mid = obj.data.machine_id;
            var Machine = $scope.MachinesByID[mid];
            if(!$scope.MachineWearDates.hasOwnProperty(mid))
            {
                $scope.MachineWearDates[mid] = {};
            }
            // this is for one machine, so we need to build an array
            // of date's for this machine, then set the DOM elements accordingly
            var InsDates = [];
            for(var r in obj.data.results)
            {
                var worst = false;
                var res = obj.data.results[r];
                for(var part in res)
                {
                    var p = res[part];  // ref to part obj
                    if(!InsDates.hasOwnProperty(p.adate))
                    {
                        InsDates[p.adate] = p.a_ins_id;
                    }
                    if(!InsDates.hasOwnProperty(p.bdate))
                    {
                        InsDates[p.bdate] = p.b_ins_id;
                    }
                    if(p.apct !== -1 && p.bpct !== -1)
                    {
                        // -1 denotes a non calculable field
                        //console.dir(p);
                        if(worst === false)
                        {
                            // this is the first part to be checked
                            worst = p;
                        }else
                        {
                            // compare this part with the other part
                            var plh = p.l_h['70'];
                            var prh = p.r_h['70'];
                            var wrh = worst.r_h['70'];
                            var wlh = worst.l_h['70'];
                            // make sure that the part we have can be
                            // calculated based on hours on part
                            if(plh !== 0 || prh !==0)
                            {
                                if(plh < wlh || prh < wrh)
                                {
                                    worst = p;  // this is the worst part found
                                }
                            }else
                            {
                                // otherwise see if we can compare by date range
                                var pld = p.l_date['70'];
                                var prd = p.r_date['70'];
                                var wld = worst.l_date['70'];
                                var wrd = worst.r_date['70'];

                                if(pld < wld || prd < wrd)
                                {
                                    worst = p;
                                }
                            }

                        }
                    }else
                    {
                        // non calculable part
                    }
                }
                if(worst !== false)
                {
                    // console.log(mid);
                    //console.dir(worst);
                    var my_part = worst.l_date;  // set to left initially
                    if(worst.l_date['70'] === false && worst.r_date['70'] !== false)
                    {
                        my_part = worst.r_date;
                    }else if(worst.l_date['70'] > worst.r_date['70'])
                    {
                        my_part = worst.r_date;  // Right side has less life remaining
                    }


                    //console.dir(my_part);
                    var BaseDate = new moment.unix(worst.adate);
                    var svty = new moment.unix(worst.adate).add(my_part['70'],'seconds').format('MMM_YYYY').toLowerCase();
                    var ohun = new moment.unix(worst.adate).add(my_part['100'],'seconds').format('MMM_YYYY').toLowerCase();
                    var otwn = new moment.unix(worst.adate).add(my_part['120'],'seconds').format('MMM_YYYY').toLowerCase();
                    if(my_part['70'] > my_part['120'] || my_part['70'] === my_part['120'])
                    {
                        // bad data, this is trending in reverse
                        // or trending flat
                        //console.dir(my_part['70']);
                        //console.dir(worst.r_date['70']);
                        // console.log('negative or flat trend');
                    }else
                    {
                        //console.log('70: ' + new moment.unix(worst.adate).add(my_part['70'],'seconds').format('MMM_YYYY'));
                        //console.log('100: ' + new moment.unix(worst.adate).add(my_part['100'],'seconds').format('MMM_YYYY'));
                        //console.log('120: ' + new moment.unix(worst.adate).add(my_part['120'],'seconds').format('MMM_YYYY'));
                        var mach_sum = my_part;
                        mach_sum['rating'] = worst.apct > worst.bpct ? worst.apct : worst.bpct;
                        mach_sum['adate'] = worst.adate;
                        $scope.MachineWearDates[mid][worst.a_ins_id] = mach_sum;
                        //var insplnk = '<span><img src="/images/formbuilder/ipad-tools.png" style="height: 20px;width: auto;"></span>';
                        $('#stat_' + mid + '_' + svty)
                            .html('<img src="/images/formbuilder/green-arrow.svg" style="height: 15px;width: auto;">')
                            .tooltip({'content':'70% projected date'});
                        $('#stat_' + mid + '_' + ohun)
                            .html('<img src="/images/formbuilder/orange-arrow.svg" style="height: 15px;width: auto;">')
                            .tooltip({'content':'100% projected date'});
                        $('#stat_' + mid + '_' + otwn)
                            .html('<img src="/images/formbuilder/red-arrow.svg" style="height: 15px;width: auto;">')
                            .tooltip({'content':'120% projected date'});
                    }
                }
            }
            if(InsDates.length > 0)
            {
                // console.dir(InsDates);
                for(var i in InsDates)
                {
                    var d = moment.unix(i).format('MMM_YYYY').toLowerCase();
                    var insid = InsDates[i];
                    // console.log('date: ' + d + ' insid: ' + insid);
                    $('#stat_' + mid + '_' + d + '_insp').html('<span class="scorbrd_ins"><img src="/images/formbuilder/ipad-tools.svg" style="height: 20px;width: auto;"></span>');
                }
            }
        };

        var updateMachinesList = function (page) {
            $scope.getScoreBoardActions();
            //grab machines related to this customer id.
            $scope.UpdateScoreboardRange();
            //$scope.updateMachineActions();
            MachineServices.getByCustomerId($scope.Customer.id, 1, 1).then(function (obj) {
                $scope.Customer.total_machines = obj.data.pages;
            });

            MachineServices.getByCustomerId($scope.Customer.id, page).then(function (m_obj)
            {
                /////////////////// Return a deferred ///////////////////
                var dfd = $q.defer();
                $scope.num_pages = m_obj.data.pages;
                var res = m_obj.data.results;
                for(var i in res)
                {
                    for(var k in res[i])
                    {
                        if(res[i][k] === '(null)' || res[i][k] === 'null')
                        {
                            res[i][k] = 'N/A';
                        }
                    }
                }
                $scope.Customer.MachineData = res;
                for(var i in m_obj.data.results)
                {
                    var machine = m_obj.data.results[i];
                    $scope.MachinesByID[machine.id] = machine;
                }
                //$scope.Customer.total_machines = m_obj.data.results.length;
                //format last inspection timestamp - if there is one
                if ($scope.Customer.last_inspected !== 0 && typeof $scope.Customer.last_inspected === 'number') {
                    $scope.Customer.last_inspected = Utilities.getDatestring($scope.Customer.last_inspected);
                }
                else {
                    $scope.Customer.last_inspected = 0;
                }
                //get inspection data for each machine
                var last_id = 0;
                if($scope.Customer.MachineData.length > 0) {
                    last_id = $scope.Customer.MachineData[$scope.Customer.MachineData.length -1].id;
                }

                angular.forEach($scope.Customer.MachineData, function (machine)
                {
                    if(machine.manufacturer_id !== undefined)
                    {
                        machine.part_manuf = $scope.PartManufCache[machine.manufacturer_id];
                    }
                    if (machine.last_inspected === 0) {
                        machine.last_inspected = '';
                    } else {
                        machine.last_inspected = Utilities.getDatestring(machine.last_inspected);
                    }
                    InsServices.getNewestInspectionByMachineId(machine.id).then(function (obj)
                    {
                        if(obj.data.results !== undefined && obj.data.results[0] !== undefined)
                        {
                            machine.last_ispected = obj.data.results[0].inspection_obj.modified;
                            var d = moment.unix(machine.last_inspected).format('MMM_YYYY').toLowerCase();
                            // console.log('date: ' + d + ' insid: ' + insid);
                            $('#stat_' + machine.id + '_' + d + '_insp').html('<span class="scorbrd_ins"><img src="/images/formbuilder/ipad-tools.svg" style="height: 20px;width: auto;"></span>');
                            $scope.CustInsCache[machine.id]= {'newest':obj.data.results[0]};
                            if(obj.data.results.length > 1)
                            {
                                $scope.CustInsCache[machine.id].previous = obj.data.results[1];
                            }
                        }
                        if(machine.id === last_id)
                        {
                            dfd.resolve({'last_id': last_id});
                        }
                    });
                });

                InsServices.getByCustomerId($scope.Customer.id).then(function (obj) {
                    $scope.Customer.total_inspections = obj.data.results.length || 0;
                });
                return dfd.promise;
            }).then(function()
                {
                    var deferred = $q.defer();
                    angular.forEach($scope.Customer.MachineData, function (machine)
                        {
                            var ratings = [];
                            if($scope.CustInsCache[machine.id] !== undefined && $scope.CustInsCache[machine.id].hasOwnProperty('newest'))
                            {
                                var mydata = $scope.CustInsCache[machine.id].newest.inspection_obj.results;
                                angular.forEach(mydata, function (components) {
                                    if (components[0] !== undefined &&
                                        (components[0].left !== undefined || components[0].right !== undefined) &&
                                        (components[0].left.percentage !== undefined || components[0].right.percentage !== undefined)) {
                                        for (var j = 0; j < components.length; j++) {
                                            ratings.push(parsePercent(components[j].left.percentage));
                                            ratings.push(parsePercent(components[j].right.percentage));
                                        }
                                    }
                                });
                            }
                            var ratingArr = ratings.sort(function (a, b) {
                                return b - a;
                            });
                            if (ratingArr[0] === undefined) {
                                machine.rating = 'N/A';
                                machine.rating_value = -1;
                                machine.bgcolor = '';
                            } else {
                                ratingArr[0] = parseInt(ratingArr[0], 10);
                                machine.rating = ratingArr[0].toString() + '%';
                                machine.rating_value = ratingArr[0];

                                if (ratingArr[0] > 69) {
                                    machine.bgcolor = 'bgred';
                                }
                                if (ratingArr[0] > 30 && ratingArr[0] < 70) {
                                    machine.bgcolor = 'bgyellow';
                                }

                                if (ratingArr[0] < 31) {
                                    machine.bgcolor = 'bggreen';
                                }
                            }
                            deferred.resolve(true);
                        }
                    );
                    return deferred.promise;
                }).then(function(){
                    $scope.updateMachineFailDates();
                    $scope.updateMachineActions();
                    Spin.hide();
                });
        };

        CustomerServices.get($routeParams.customerID).then(function (obj) {
            $scope.Customer = obj.data.results;
            if ($scope.Customer.image_id > 0) {
                $scope.Customer.img = AppSettings.BASE_URL + 'imgtmb/' + $scope.Customer.image_id + '/';
                $scope.Customer.img_full = AppSettings.BASE_URL + 'img/' + $scope.Customer.image_id + '/';
                t_id = setTimeout(function () {
                    cache = document.createElement('img');
                    cache.src = $scope.Customer.img_full;
                }, 0);
            }
            //get email address from main contact id endpoint
            if($scope.Customer.primary_contact_id !== null && $scope.Customer.primary_contact_id !== 0)
            {
                UserServices.getContactById($scope.Customer.primary_contact_id)
                    .then(function (obj) {
                        $scope.Customer.email = obj.data.results.email;
                    });
            }else
            {
                $scope.Customer.email = '';
            }
            updatePartManufList();


            updateMachinesList();

            if($scope.state === 'edit')
            {
                $scope.Customer.hide_upload = false;
            }else{
                $scope.Customer.hide_upload = true;
            }
        });

        $scope.cancelCustomer = function() {
            $location.path('/customers/' + $scope.Customer.id);
        };

        $scope.saveCustomer = function () {



            //Form validation
            if (!Utilities.validateForm($scope.customer_form)) {
                return false; //validation false;
            }

            var duplicateNameFlag = true;
            CustomerServices.getByName($scope.Customer.name).then(function (obj) {
                if(obj.data.results.length > 0) {
                    for (var idx = 0; idx < obj.data.results.length; idx++) {
                        if (obj.data.results[idx].id != $scope.Customer.id && $scope.Customer.name == obj.data.results[idx].name) {
                            duplicateNameFlag = false;
                            break;
                        }
                    }
                }

                if (!duplicateNameFlag) {
                    //Duplicate Name exists
                    alert('Duplicate name exists.')
                    return false;
                }

                var img_payload = {};
                delete $scope.Customer.archived;

                //update primary contact id (if needed)
                UserServices.saveContact($scope.Customer.email).then(function (obj) {
                    //console.log('customer controller line 153ish');
                    //console.dir(obj);
                    if(obj !== false)
                    {
                        $scope.Customer.primary_contact_id = obj.data.results.id;
                    }else
                    {
                        $scope.Customer.primary_contact_id = 0;
                    }

                    CustomerServices.save($scope.Customer).then(function (obj) {
                        if ($scope.image_upload !== '') {
                            //now upload and save photo
                            img_payload = {
                                customer_obj: obj.data.results,
                                file: $scope.image_upload,
                                description: "Customer image",
                                user_id: AuthServices.getUserID()
                            };
                            CustomerServices.savePhoto(img_payload).then(function () {
                                $scope.$emit("obj_saved", 'Customer');
                                alert('Customer saved.');
                                $location.path('/customers/' + $scope.Customer.id);
                            });
                        } else {
                            $scope.$emit("obj_saved", 'Customer');
                            alert('Customer saved.');
                            $location.path('/customers/' + $scope.Customer.id);
                        }
                    });
                });
            });
        };

        $scope.deleteCustomer = function () {
            if (confirm("Are you sure you want to delete this customer?")) {
                CustomerServices.del($scope.Customer.id).then(function () {
                    $location.path('/customers/list/');
                });
            }
        };

        $scope.checkMonth = function(ui_date, badge_date){
            var uimonth = moment.unix(ui_date.timestamp).format('MM');
            var badgemonth = moment.unix(badge_date).format('MM');
            var uiyear = moment.unix(ui_date.timestamp).format('YYYY');
            var badgeyear = moment.unix(badge_date).format('YYYY');
            return uimonth === badgemonth && uiyear===badgeyear;
        };


        /**
         * Report Related Parts
         */


        $scope.createReport = function (report_type) {

            var curMachineList = getSelectedIDList();

            //Validation
            if (curMachineList.length === 0) {
                alert('Please choose machines.');
                return;
            }

            if (report_type === null) {
                alert('Please select report type.');
                return;
            }

            //Main logic


            var ii=0;
            angular.forEach(curMachineList, function(machine_id) {
                if($scope.CustInsCache[machine_id] !== undefined)
                {
                    var ins = $scope.CustInsCache[machine_id].newest;
                    MachineServices.get(machine_id).then(function(obj){
                        ins.inspection_obj.machine.serial = obj.data.results.serial;
                        setReportSummaryInfo(ins, report_type);
                        if((++ii)==curMachineList.length){
                            setTimeout(function() {$scope.printReport('report_cont_' + report_type);}, 400);
                        }
                    });
                }
            });

        };

        /**
         * Set report summary obj
         *
         * @param machine_data
         * @param report_type
         */
        function setReportSummaryInfo(machine_data, report_type) {

            if (machine_data === null)
            {
                return;
            }

            //Fill summary data
            var summaryData = {};
            summaryData.customer = machine_data.inspection_obj.customer.name;
            summaryData.model = machine_data.inspection_obj.machine.model;
            summaryData.serial = machine_data.inspection_obj.machine.serial;
            if (machine_data.inspection_obj.machine.equipment_id !== null) {
                summaryData.equipment_id = machine_data.inspection_obj.machine.equipment_id;
            }
            else {
                summaryData.equipment_id = '';
            }

            if (machine_data.inspection_obj.machine.last_inspected === 0) {
                summaryData.last_inspected = '';
            }
            else {
                summaryData.last_inspected = machine_data.inspection_obj.machine.last_inspected;
            }
            summaryData.next_inspection_date = '';
            summaryData.hour_meter_reading = machine_data.inspection_obj.hour_meter_reading;
            summaryData.hours_per_week = machine_data.inspection_obj.hours_per_week;
            if (machine_data.inspection_obj.jobsite !== null) {
                if(machine_data.inspection_obj.jobsite !== undefined)
                {
                    summaryData.jobsite = machine_data.inspection_obj.jobsite.address;
                }
            }
            else {
                summaryData.jobsite = '';
            }

            summaryData.bushing_turned = 'No';



            //Percent worn

            summaryData.percent_worn = {};
            if (machine_data.inspection_obj.results) {

                summaryData.percent_worn.links = getPercentVal(machine_data.inspection_obj.results, 'track_links');
                summaryData.percent_worn.bushings = getPercentVal(machine_data.inspection_obj.results, 'bushings');
                summaryData.percent_worn.shoes = getPercentVal(machine_data.inspection_obj.results, 'track_shoes');
                summaryData.percent_worn.idlers_front = getPercentVal(machine_data.inspection_obj.results, 'idlers_front');
                summaryData.percent_worn.idlers_rear = getPercentVal(machine_data.inspection_obj.results, 'idlers_rear');
                summaryData.percent_worn.carrier_rollers = getPercentVal(machine_data.inspection_obj.results, 'carrier_rollers');
                summaryData.percent_worn.track_rollers = getPercentVal(machine_data.inspection_obj.results, 'track_rollers');
                summaryData.percent_worn.sprockets = getPercentVal(machine_data.inspection_obj.results, 'sprockets');

            }

            //Hours On Wear Surface
            summaryData.hours_on_wear_surface = {};
            if (machine_data.inspection_obj.results) {
                //summaryData.hours_on_wear_surface
                summaryData.hours_on_wear_surface.links = getMeasuredVal(machine_data.inspection_obj.results, 'track_links');
                summaryData.hours_on_wear_surface.bushings = getMeasuredVal(machine_data.inspection_obj.results, 'bushings');
                summaryData.hours_on_wear_surface.shoes = getMeasuredVal(machine_data.inspection_obj.results, 'track_shoes');
                summaryData.hours_on_wear_surface.idlers_front = getMeasuredVal(machine_data.inspection_obj.results, 'idlers_front');
                summaryData.hours_on_wear_surface.idlers_rear = getMeasuredVal(machine_data.inspection_obj.results, 'idlers_rear');
                summaryData.hours_on_wear_surface.carrier_rollers = getMeasuredVal(machine_data.inspection_obj.results, 'carrier_rollers');
                summaryData.hours_on_wear_surface.track_rollers = getMeasuredVal(machine_data.inspection_obj.results, 'track_rollers');
                summaryData.hours_on_wear_surface.sprockets = getMeasuredVal(machine_data.inspection_obj.results, 'sprockets');
            }



            //Need special according to type?
            switch(report_type) {
                case 'fleet':

                    break;
                case 'report2':
                    summaryData.action_required = "OK";
                    summaryData.note = machine_data.note;
                    break;
            }

            if (summaryData !== null) {
                $scope.ReportSummary[$scope.ReportSummary.length] = summaryData;
            }

        }


        function getPercentVal(obj, property) {
            var str = '';
            if (obj && obj[property]) {
                if (obj[property].length > 0) {
                    obj[property] = obj[property][0];
                }

                if (typeof obj[property].left !== 'undefined' && typeof obj[property].left.percentage !== 'undefined') {
                    str += obj[property].left.percentage;
                    if (!isNaN(obj[property].left.percentage)) {
                        str += '%';
                    }
                }

                if (typeof obj[property].right !== 'undefined' && typeof obj[property].right.percentage !== 'undefined') {
                    if (str !== '') {
                        str += ' - ';
                    }
                    str += obj[property].right.percentage;
                    if (!isNaN(obj[property].right.percentage)) {
                        str += '%';
                    }
                }
            }
            return str;
        }


        function getMeasuredVal(obj, property) {
            var str = '';
            if (obj && obj[property]) {
                if (obj[property].length > 0) {
                    obj[property] = obj[property][0];
                }

                if (typeof obj[property].left !== 'undefined' && typeof obj[property].left.measured !== 'undefined') {
                    str += obj[property].left.measured;
                }

                if (typeof obj[property].right !== 'undefined' && typeof obj[property].right.measured !== 'undefined') {
                    if (str !== '') {
                        str += ' - ';
                    }
                    str += obj[property].right.measured;
                }
            }
            return str;
        }

        /**
         * Get selected machine ID list
         *
         */
        function getSelectedIDList() {
            var items = [];
            angular.forEach($scope.Customer.MachineData, function(item){
                var $el = $('#mach_' + item.id);
                if ($el.is(':checked')) {
                    items.push(item.id);
                }
            });
            return items;
        }

        $scope.printReport = function (container_id) {
            var $el = $('#' + container_id);
            var printContents = $el.html();
            var popupWin = window.open('', '_blank', 'width=1024,height=768,scrollbars=yes',true);
            popupWin.document.open();
            popupWin.document.write('<html><head> <link rel="stylesheet" href="styles/resets.css"><link rel="stylesheet" href="styles/formalize.css"><link rel="stylesheet" href="styles/animate.css"><link rel="stylesheet" href="styles/main.css"><link rel="stylesheet" href="styles/misc.css"><link rel="stylesheet" href="styles/print.css" media="print" /></head><body onload="window.print()">' + printContents + '</html>');
            popupWin.document.close();
        };
    }
]);
