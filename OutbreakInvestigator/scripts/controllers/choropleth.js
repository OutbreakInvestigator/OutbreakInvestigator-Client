/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/
'use strict';

angular.module('obiUiApp')
        .controller("ChoroplethCtrl", function ($scope, $http, graphService, eventService, timelineService) {
            $scope.uid;
            //  $scope.map;
            $scope.cases;


            angular.extend($scope, {
                seattle: {
                    lat: 47.6097,
                    lng: -122.3331,
                    zoom: 11
                },
                layers: {
                    baselayers: {
                        googleRoadmap: {
                            name: 'Google Streets',
                            layerType: 'ROADMAP',
                            type: 'google'
                        }
                        ,
                        googleTerrain: {
                            name: 'Google Terrain',
                            layerType: 'TERRAIN',
                            type: 'google'
                        },
                        googleHybrid: {
                            name: 'Google Hybrid',
                            layerType: 'HYBRID',
                            type: 'google'
                        }
                    }
                },
                defaults: {
                    scrollWheelZoom: false
                }
                ,
                events: {
                    map: {
                        enable: ['drag', 'click', 'mouseover'], //'zoomstart', 
                        logic: 'emit'
                    }
                }
            });

            $scope.$watch(graphService.getGraph, function (newVal, oldVal)
            {
                if (newVal !== oldVal)
                    reloadGraph(newVal);
            });



            $scope.$on('leftFilterUpdate', function (evt, filter) {
                var timeline = timelineService.getTimeline();
                if (timeline)
                {
                    var filters = timeline.filters()[0];
                    if (filters)
                    {
                        var filteredCase = {};
                        filteredCase.nodes = graphService.getGraph().nodes.filter(function (cif) {
                            return ((new Date(cif.REPORT_DT)).getTime() >= filters[0].getTime() &&
                                    (new Date(cif.REPORT_DT)).getTime() <= filters[1].getTime());
                        });
                         reloadGraph(filteredCase);
                    }
                }
            });
//            $scope.$on('rightFilterUpdate', function (evt, filter) {
//                //scope.filter = filter;
//                if (getPosition(elem[0]) == "right")
//                {
//                    //updateMapFilter(filter);
//                }
//            });
//            $scope.$on('selCasesUpdate', function (evt, selCases, requestModuleID)
//            {
//                if (requestModuleID != uid)
//                {
//                    setSelected(selCases);
//                }
//            });

            function mouseover(feature, leafletEvent) {
                var layer = leafletEvent.target;
                layer.setStyle({
                    weight: 2,
                    color: '#666',
                    fillColor: 'white'
                });
                layer.bringToFront();
                $scope.selectedZip = layer.feature;
                $scope.numberCases = filterCases(layer.feature.properties.ZIPCODE).length;
//                console.log(feature);
            }
            ;

            $scope.$on("leafletDirectiveMap.geojsonMouseover", function (ev, leafletEvent, feature) {
                if (leafletEvent !== undefined)
                    mouseover(feature, leafletEvent);
            });

// Mouse over function, called from the Leaflet Map Events

            function filterCases(zipcode)
            {
             var filteredCases = {};
                filteredCases = $scope.cases.nodes.filter(function (cif) {
                    var streetAddr = cif.STREETADDRESS;
                    var zipregex = /(\d+)$/;
                    var zipmatch = zipregex.exec(streetAddr);
                    var zip = zipmatch[0];
                    return (zip == zipcode);
                });
               return  filteredCases;
            }

            function featureClick(featureSelected, event) {
//                console.log(featureSelected.properties.ZIPCODE);
                eventService.setSelCases(filterCases(featureSelected.properties.ZIPCODE), $scope.uid);

            }
            ;

            $scope.$on("leafletDirectiveMap.geojsonClick", function (ev, featureSelected, leafletEvent) {
                featureClick(featureSelected, leafletEvent);
            });


            var graph = graphService.getGraph();
            if (graph != null)
                reloadGraph(graph);



            function reloadGraph(newGraph)
            {
                $scope.cases = {};
                angular.copy(newGraph, $scope.cases);
//                $scope.cases = newGraph;

                var ndx = new crossfilter($scope.cases.nodes);
                var zipDimension = ndx.dimension(function (d) {
                    var streetAddr = d.STREETADDRESS;

                    var zipregex = /(\d+)$/;
                    var zipmatch = zipregex.exec(streetAddr);
                    var zip = zipmatch[0];

                    return zip;
                });

                $scope.zipCounts = zipDimension.group().reduceCount().all();
                var minCount = 0;
                var maxCount = 0;
                for (var i = 0; i < $scope.zipCounts.length; i++)
                {
                    var currCount = $scope.zipCounts[i].value
                    if (currCount > maxCount)
                    {
                        maxCount = currCount;
                    }
                }

                var color = d3.scale.linear()
                        .domain([minCount, maxCount])
                        .range(["white", "red"]);

                function style(feature)
                {
                    var featureZip = feature.properties.ZIPCODE;
                    var matchingCounts = $scope.zipCounts.filter(function (entry) {
                        return entry.key == featureZip;
                    });

                    var zipCount = matchingCounts.length > 0 ? matchingCounts[0].value : 0;
                    return {
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.5,
                        fillColor: color(zipCount)
                    };

                }



                // Get the countries geojson data from a JSON
                $http.get("data/KC_zip.geo.json").success(function (data, status) {


//                    var geojson;

//                    if($scope.map==undefined)
//                        $scope.map = L.map('map').setView([37.8, -96], 4);

//                    function zoomToFeature(e) {
//                        $scope.map.fitBounds(e.target.getBounds());
//                    }
//
//                    function onEachFeature(feature, layer) {
//                        layer.on({
//                            mouseover: highlightFeature,
//                            mouseout: resetHighlight,
//                            click: zoomToFeature
//                        });
//                    }
//                     geojson =L.geoJson(data, {
//                            style: style,
//                            onEachFeature: onEachFeature
//                        }).addTo($scope.map);

                    angular.extend($scope, {
//                        geojson : geojson
                        geojson: {
                            data: data,
                            style: style,
                            resetStyleOnMouseout: true

//                            ,
//                            onEachFeature: onEachFeature
                        }
                    });

//                    function resetHighlight(e) {
//                        geojson.resetStyle(e.target);
//                    }


                });
            }
            ;
        })
        // directive extension
        .directive('leafletVis', function () {
            return {
                restrict: 'A',
//                require: [
//                    '?leaflet'
//                ],
//                scope: true,
                link: function (scope, iElm, iAttrs, controllers) {
                    scope.uid = iElm.uniqueId();
                    console.log("unique element id = " + scope.uid);
//                    if(scope.map==undefined)
//                        scope.map = L.map('map');                    

//                    scope.$on('resetUI', function (evt, filter) {
//                        cope.$evalAsync(attrs.resetui);
//                        reloadGraph(graphService.getGraph());
//                        
//                    });

                }

            };

        });

