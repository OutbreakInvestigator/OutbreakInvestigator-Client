'use strict';

angular.module('obiUiApp')
    .directive('loading', function () {
        return {
            restrict: 'E',
            replace:true,
            template: '<div class="loading"><img src="http://www.nasa.gov/multimedia/videogallery/ajax-loader.gif" width="20" height="20" />LOADING...</div>',
            link: function (scope, element, attr) {
                scope.$watch('complete', function (val) {
                    if (!val())
                        $(element).show();
                    else
                    {
                        $(element).hide();
                    }
                });
            }
        }
    })
  .controller('MainCtrl', function ($scope, $modal, $http, eventService, graphService) {
        $(document).ready(function () {
            $('#ui-layout-container').layout({
                center__paneSelector:	".outer-center"
                //,	west__paneSelector:		".outer-west"
                //,	east__paneSelector:		".outer-east"
                ,   north__paneSelector:	".outer-north"
                ,   south__paneSelector:	".outer-south"
                //,	east__paneSelector:		".outer-east"
                //,	west__size:				125
                //,	east__size:				125
                //,	spacing_open:			8  // ALL panes
                //,	spacing_closed:			12 // ALL panes
                //,	north__spacing_open:	0
                //,	south__spacing_open:	0
                //,	north__maxSize:			200
                //,	south__maxSize:			200
                ,	north__maxSize:			80
                ,	south__maxSize:			50
                ,   resizable:              false
                ,   closable:               false
                ,   spacing_open:           0

                // MIDDLE-LAYOUT (child of outer-center-pane)
                ,	center__childOptions: {
                    center__paneSelector:	".middle-center"
                    ,	south__paneSelector:	".middle-south"
                    //,	east__paneSelector:		".middle-east"
                    //,	west__size:				100
                    //,	east__size:				100
                    ,	spacing_open:			8  // ALL panes
                    ,	spacing_closed:			8  // ALL panes
                    ,   south__size:            100
                    ,   resizable:              false

                    // INNER-LAYOUT (child of middle-center-pane)
                    ,	center__childOptions: {
                        center__paneSelector:	".inner-center"
                        //,	west__paneSelector:		".inner-west"
                        ,	east__paneSelector:		".inner-east"
                        ,	center__size:				'50%'
                        ,	east__size:				'50%'
                        ,	spacing_open:			8 // ALL panes
                        ,	spacing_closed:			8  // ALL panes
                        //,	west__spacing_closed:	12
                        //,	east__spacing_closed:	12

                        // content pane layout (child of inner-center)
                        ,	center__childOptions: {
                            center__paneSelector:	".vis-panel"
                            ,	north__paneSelector:	".button-panel"
                            ,	north__maxSize:			90
                            //,	east__size:				'50%'
                            ,   resizable:              false
                            ,   closable:               false
                            ,	spacing_open:			0 // ALL panes
                        }
                        ,   center__onresize_end: function (pane, $pane, state) {$scope.$broadcast('visPanelResize',['left'],state.outerWidth,state.outerHeight);}

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
                        ,	east__childOptions: {
                            center__paneSelector:	".vis-panel"
                            ,	north__paneSelector:	".button-panel"
                            ,	north__maxSize:			90
                            //,	east__size:				'50%'
                            ,   resizable:              false
                            ,   closable:               false
                            ,	spacing_open:			0 // ALL panes
                        }
                        ,   east__onresize_end: function (pane, $pane, state) {$scope.$broadcast('visPanelResize',['right'],state.outerWidth,state.outerHeight);}
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
            });

            $(function() {
                $( "#fetch" ).button()
                    .click(function() {
                        $scope.open();
                    });
                $( "#about" ).button()
                    .click(function() {
                        $scope.openAbout();
                });
                $( "#contact" ).button()
                    .click(function() {
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

        $scope.$watch("mode", function(newVal, oldVal)
        {
            if(newVal)
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


        // modal info dialogs
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
        $scope.content = ["[Select Content]","table","network","network fixed on time line","map (dot)","map (choropleth)"];

        if($scope.leftPanel==null)
        {
            $scope.leftPanel = $scope.content[0];
        }
        if($scope.rightPanel==null)
        {
            $scope.rightPanel = $scope.content[0];
        }

        $scope.setLeft = function(item)
        {
            $scope.leftPanel=item;
        };
        $scope.setRight = function(item)
        {
            $scope.rightPanel=item;
        };


  })


var ModalInstanceCtrl = function ($scope, $modalInstance, $http, graphService) {
    $scope.queries = graphService.getQueries();
    $scope.url = graphService.getQueryURL();
    $scope.complete = function(){return graphService.isLoadingComplete()};


    $scope.close = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.setSelectedQuery = function (query) {
        $scope.$parent.selectedQuery = query;
    };

    $scope.getClass= function(currQuery){
        if($scope.$parent.selectedQuery===currQuery)
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

    $scope.query = function(template)
    {
        var inputs = $(".queryarg");
        var querystring = template;
        for (var i = 0; i < inputs.length; i++)
        {
            //console.log("arg #"+i+" = "+inputs[i].getAttribute("name"));
            var placeholder = inputs[i].getAttribute("name");
            var value = inputs[i].value;
            querystring = querystring.replace(placeholder,value);
        }

        console.log("query string =  "+querystring);

        // build query string
        graphService.executeQuery(querystring);
    }
};

angular.module('obiUiApp').directive('queryComplete', function (graphService) {
    return {
        restrict: 'E',
        replace:true,
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