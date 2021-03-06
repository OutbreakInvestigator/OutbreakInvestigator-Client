/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/
'use strict';

angular.module('obiUiApp')
        .directive('startHere', function (graphService) {
            return {
                restrict: 'E',
                replace: true,
                template: '<div class="glyphicon glyphicon-chevron-right glyphicon-refresh-animate"></div>',
                link: function (scope, element, attr) {
                    scope.$watch(graphService.isLoadingComplete, function (val) {
                        if (!val) {
                            $(element).show();
                        }
                        else
                        {
                            $(element).hide();
                        }
                    });
                }
            }
        })
        .directive('loading', function (eventService) {
            return {
                restrict: 'E',
                replace: true,
                template: '<div class="loading"><img src="http://www.nasa.gov/multimedia/videogallery/ajax-loader.gif" width="20" height="20" />LOADING...</div>',
                link: function (scope, element, attr) {
                    scope.$watch('complete', function (val) {
                        if (val() == false) {
                            $(element).show();
                        }
                        else
                        {
                            $(element).hide();
                        }
                    });
                    scope.$on('queryStatus', function (evt, isComplete) {
                        if (isComplete)
                            $(element).hide();
                        else
                            $(element).show();
                    });
                }
            }
        })
        .controller('MainCtrl', function ($scope, $modal, $http, eventService, choroplethService, graphService, chartService) {
            $(document).ready(function () {
                $('#ui-layout-container').layout({
                    center__paneSelector: ".outer-center"
                            //,	west__paneSelector:		".outer-west"
                            //,	east__paneSelector:		".outer-east"
                    , north__paneSelector: ".outer-north"
                    , south__paneSelector: ".outer-south"
                            //,	east__paneSelector:		".outer-east"
                            //,	west__size:				125
                            //,	east__size:				125
                            //,	spacing_open:			8  // ALL panes
                            //,	spacing_closed:			12 // ALL panes
                            //,	north__spacing_open:	0
                            //,	south__spacing_open:	0
                            //,	north__maxSize:			200
                            //,	south__maxSize:			200
                    , north__maxSize: 80
                    , south__maxSize: 50
                    , resizable: false
                    , closable: false
                    , spacing_open: 0

                            // MIDDLE-LAYOUT (child of outer-center-pane)
                    , center__childOptions: {
                        center__paneSelector: ".middle-center"
                        , south__paneSelector: ".middle-south"
                                //,	east__paneSelector:		".middle-east"
                                //,	west__size:				100
                                //,	east__size:				100
                        , spacing_open: 8  // ALL panes
                        , spacing_closed: 8  // ALL panes
                        , south__size: 100
                        , resizable: false

                                // INNER-LAYOUT (child of middle-center-pane)
                        , center__childOptions: {
                            center__paneSelector: ".inner-center"
                            , west__paneSelector: ".inner-west"
                            , west__size: '16%'
                            , center__size: '84%'
                            , spacing_open: 8 // ALL panes
                            , spacing_closed: 8  // ALL panes
                            , center__childOptions: {
                                center__paneSelector: ".inner-vis-center"
                                , east__paneSelector: ".inner-vis-east"
                                , center__size: '50%'
                                , east__size: '50%'
                                , spacing_open: 8 // ALL panes
                                , spacing_closed: 8  // ALL panes
                                , center__childOptions: {
                                    center__paneSelector: ".vis-panel"
                                    , north__paneSelector: ".button-panel"
                                    , north__maxSize: 90
                                            //,	east__size:				'50%'
                                    , resizable: false
                                    , closable: false
                                    , spacing_open: 0 // ALL panes
                                }
                                , center__onresize_end: function (pane, $pane, state) {
                                    $scope.$broadcast('visPanelResize', ['left'], state.outerWidth, state.outerHeight - 30);  // strange. always about 30 more than actual value
                                }

                                /*
                                 ,   center__onresize_start: function ( pane, $pane, state ){
                                 console.log([
                                 '-------------------------------------------'
                                 ,   'onresize_start'
                                 ,   'state.outerWidth = '+ state.outerWidth
                                 ,   'state.newWidth   = '+ state.newWidth
                                 ].join('\n'));
                                 }
                                 
                                 ,  center__onresize_end: function ( pane, $pane, state ){
                                 console.log([
                                 '-------------------------------------------'
                                 ,   'onresize_end'
                                 ,   'state.outerWidth = '+ state.outerWidth
                                 ,   'state.outerHeight = '+ state.outerHeight
                                 ].join('\n'));
                                 }
                                 */

                                // content pane layout (child of inner-east)
                                , east__childOptions: {
                                    center__paneSelector: ".vis-panel"
                                    , north__paneSelector: ".button-panel"
                                    , north__maxSize: 90
                                            //,	east__size:				'50%'
                                    , resizable: false
                                    , closable: false
                                    , spacing_open: 0 // ALL panes
                                }
                                , east__onresize_end: function (pane, $pane, state) {
                                    $scope.$broadcast('visPanelResize', ['right'], state.outerWidth, state.outerHeight - 30);  // strange. always about 30 more than actual value
                                }
                            }

                            /*
                             // INNER-LAYOUT (child of middle-south-pane)
                             ,	south__childOptions: {
                             center__paneSelector:           ".timeline-panel"
                             ,   north__paneSelector:        ".timeline-controls-panel"
                             ,   north__maxSize:             40
                             ,   resizable:              false
                             ,   closable:               false
                             ,	spacing_open:			0 // ALL panes
                             }
                             */
                        }
                    }
                });

                $(function () {
                    $("#fetch").button()
                            .click(function () {
                                $scope.open();
                            });
                    $("#reset").button()
                            .click(function () {
                                $scope.reset();
                            });
                    $("#about").button()
                            .click(function () {
                                $scope.openAbout();
                            });
                    $("#contact").button()
                            .click(function () {
                                $scope.openContact();
                            });
                    /*
                     $( "#select-pointer" ).click(function() {
                     eventService.setUIMode()
                     });
                     $( "#select-area" ).click(function() {
                     //alert("area mode selected");
                     });
                     $( "#manipulate" ).click(function() {
                     //alert("manipulate mode selected");
                     });*/
                });


            });

            $scope.mode = "select";
            $scope.selectedQuery = null;

            $scope.$watch("mode", function (newVal, oldVal)
            {
                if (newVal)
                    eventService.setUIMode(newVal);
                //alert(newVal);
            });

            //$scope.visOptions = ['Select Content','network','map (dot)','map (choropleth)'];



            /*
             $scope.$on('$includeContentLoaded', function(){
             console.log("What?"+arguments);
             });
             */

            $scope.open = function () {

                var modalInstance = $modal.open({
                    templateUrl: 'views/query_modal.html',
                    backdrop: 'static',
                    controller: ModalInstanceCtrl
                            /*,
                             resolve: {
                             queries: function() {
                             return $scope.queries;
                             },
                             query_url: function() {
                             return $scope.vquery_url;
                             }
                             }*/
                });
            };

            // reset UI
            $scope.reset = function () {

                eventService.rebroadcastResetUI();
            };

            $scope.openAbout = function () {

                var modalInstance = $modal.open({
                    templateUrl: 'views/about_modal.html',
                    backdrop: 'static',
                    controller: InfoInstanceCtrl
                });

            };

            $scope.openContact = function () {

                var modalInstance = $modal.open({
                    templateUrl: 'views/contact_modal.html',
                    backdrop: 'static',
                    controller: InfoInstanceCtrl
                });

            };

            $scope.data = {};
            $scope.loading = 0;
            $scope.content = ["[Select Content]", "table", "network", "network (new)", "network fixed on time line", "network fixed on time line (new)", "map (dot)", "map (choropleth)", "barchart"];

            if ($scope.leftPanel == null)
            {
                $scope.leftPanel = $scope.content[0];
            }
            if ($scope.rightPanel == null)
            {
                $scope.rightPanel = $scope.content[0];
            }

            $scope.setLeft = function (item)
            {
                $scope.leftPanel = item;
            };
            $scope.setRight = function (item)
            {
                $scope.rightPanel = item;
            };

            var promise = $http.get('conf/charts.json')
                    .
                    success(function (data, status) {
                        $scope.charts = data.allCharts.map(function (c) {
                            return c.name;
                        });

                    }).
                    error(function (data, status) {
                        alert("failed to load charts config data");
                    });

            if ($scope.chartSelection === null)
            {
                $scope.chartSelection = $scope.charts[0];
            }

        });


var ModalInstanceCtrl = function ($scope, $modalInstance, graphService, eventService) {
    $scope.myQueryField = {};
    $scope.queries = graphService.getQueries();
    $scope.url = graphService.getQueryURL();
    $scope.queryIndex;

    $scope.$on('queryStatus', function (evt, isComplete) {
        if (isComplete)
            $scope.close(); 
    });

    $scope.complete = function () {
        return graphService.isLoadingComplete();
    };
    $scope.getQueryField = function (name) {
        return graphService.getQueryFields(name);
    };

    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };
    $scope.setSelectedQuery = function (query, index) {
        $scope.$parent.selectedQuery = query;
        $scope.queryIndex = index;
        graphService.setQueryIndex(index);

        // set selected default
        var allQueryFields = graphService.getAllQueryFields();
        if (allQueryFields.length > 0)
        {
            for (var name in allQueryFields[0]) {
                var values = graphService.getQueryFields(name);
                $scope.myQueryField[name] = values[0];
            }
        }

    };

    $scope.getClass = function (currQuery) {
        if ($scope.$parent.selectedQuery === currQuery)
            return "selquery";
        else
            return "query";
    };

    /*
     function objectFindByKey(array, key, value) {
     for (var i = 0; i < array.length; i++) {
     if (array[i][key] === value) {
     return array[i];
     }
     }
     return null;
     };
     */

    $scope.query = function (template)
    {
        var inputs = $(".queryarg");
        var querystring = template;
        for (var i = 0; i < inputs.length; i++)
        {
            //console.log("arg #"+i+" = "+inputs[i].getAttribute("name"));
            var value;
            if (inputs[i].localName === 'select')
            {
                value = inputs[i].options[inputs[i].selectedIndex].label;
            }
            else if (graphService.getAllQueryFields().length === 0)
                value = inputs[i].value;
            else
            {
                // get the data type of this field 
                var type = graphService.getQueryField(inputs[0].options[inputs[0].selectedIndex].label)[0].data_type;
                if (type !== 'numeric')
                    value = '#' + inputs[i].value + '#';
                else
                    value = inputs[i].value;
            }
            var placeholder = inputs[i].getAttribute("name");
            querystring = querystring.replace(placeholder, value);
        }

        console.log("query string =  " + querystring);

        // build query string
        graphService.executeQuery(querystring);
    };
};

angular.module('obiUiApp').directive('queryComplete', function (graphService) {
    return {
        restrict: 'E',
        replace: true,
        template: '<div id="querycomplete"></div>',
        link: function (scope, element, attr) {
            /*
             scope.$watch('$parent.selectedQuery', function (val) {
             console.log("selected query changed to: "+scope.$parent.selectedQuery);
             });
             */
        }
    }
})

var InfoInstanceCtrl = function ($scope, $modalInstance)
{
    $scope.okInfo = function () {
        $modalInstance.dismiss('ok');
    }
};