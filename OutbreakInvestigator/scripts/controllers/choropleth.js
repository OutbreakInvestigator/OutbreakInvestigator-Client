/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/
'use strict';

angular.module('obiUiApp')
        .controller("ChoroplethCtrl", function ($scope, $timeout, $http, leafletData, graphService, eventService, timelineService, filterService) {
            $scope.uid;
            //  $scope.map;
            $scope.loaded;
            $scope.cases;
            $scope.geojsonZip;


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
                        enable: ['resize', 'drag', 'click', 'mouseover', 'mouseout'], //'zoomstart', 
                        //logic: 'emit'
                    }
                }
            });

        })
        // directive extension
        .directive('leafletVis', function ($timeout, $http, leafletData, graphService, eventService, choroplethService, filterService, publishSubscribeService) {
            return {
                restrict: 'A',
//                require: [
//                    '?leaflet'
//                ],
                scope: true,
                link: function (scope, elem, attrs, controllers) {
                    scope.uid = elem.uniqueId();
                    scope.id = scope.uid[0].id;
                    scope.selectedLayers = {};
                    scope.selectedZipcodes = {};
                    scope.map;


                    scope.$watch(graphService.getGraph, function (newVal, oldVal)
                    {
                        if (newVal !== oldVal)
                            reloadGraph(newVal);
                    });
                    scope.$on('selCasesUpdate', function (evt, selCases, requestModuleID)
                    {
                        if (requestModuleID !== scope.uid)
                        {
                            updateMapSelections(selCases);
                        }
                    });
//                    scope.$on('selZipcodesUpdate', function (evt, selZipcodes, requestModuleID)
//                    {
//                        if (requestModuleID !== scope.uid)
//                        {
//                            updateSelZipcodes(selZipcodes);
//                            selectMap();
//                        }
//                    });


                    scope.$on('leftFilterEndUpdate', function (evt, filter) {
                        if (getPosition(elem[0]) == "left")
                        {
                            showLoading(true);
                            reloadFilteredCases(getPosition(elem[0]));
                        }
                    });
                    scope.$on('rightFilterEndUpdate', function (evt, filter) {
                        if (getPosition(elem[0]) == "right")
                        {
                            showLoading(true);
                            reloadFilteredCases(getPosition(elem[0]));
                        }
                    });
                    scope.$on('filterUpdate', function (evt, filter, value)
                    {
                        reloadFilteredCases(getPosition(elem[0]));
                    });
                    scope.$on("leafletDirectiveMap.zoomend", function (ev, featureSelected, leafletEvent) {
                        if ((getPosition(featureSelected.leafletEvent.target.getContainer()) === getPosition(elem[0])) && (scope.loaded))
                            showLoading(false);
                    });
                    scope.$on("leafletDirectiveMap.viewreset", function (ev, featureSelected, leafletEvent) {
                        if (getPosition(featureSelected.leafletEvent.target.getContainer()) === getPosition(elem[0]))
                            showLoading(true);
                    });
                    scope.$on("leafletDirectiveMap.layeradd", function (ev, featureSelected, leafletEvent) {
                        if (getPosition(featureSelected.leafletEvent.target.getContainer()) === getPosition(elem[0]))
                        {
                            if ((scope.geojsonZip !== undefined) &&
                                    (scope.geojsonZip.features[scope.geojsonZip.features.length - 1] === featureSelected.leafletEvent.layer.feature))
                            {
                                scope.loaded = true;
                                $timeout(function () {
                                    updateMapSelections(eventService.getSelCases());
                                    showLoading(false);
                                });
                            }
                        }
                    });
                    scope.$on("leafletDirectiveMap.geojsonMouseover", function (ev, leafletEvent, feature) {
                        if ((leafletEvent !== undefined) && (getPosition(leafletEvent.originalEvent.currentTarget) === getPosition(elem[0])))
                            mouseover(feature, leafletEvent);
                    });
                    scope.$on("leafletDirectiveMap.geojsonMouseout", function (ev, leafletEvent, feature) {
                        if ((leafletEvent !== undefined) && (getPosition(leafletEvent.originalEvent.currentTarget) === getPosition(elem[0])))
//                            highlightSelectedLayers();
                            selectMap();
                    });
                    scope.$on("leafletDirectiveMap.resize", function (ev, leafletEvent) {
                        if ((leafletEvent !== undefined) && (getPosition(leafletEvent.originalEvent.currentTarget) === getPosition(elem[0])))
                        {
//                        leafletData.getMap().then(function (map) {
                            scope.map.invalidateSize({debounceMoveend: true});
                            $timeout(function () {
                                scope.map.invalidateSize({debounceMoveend: true});
                            }, 2000);
//                        });
                        }
                    });
                    scope.$on("leafletDirectiveMap.geojsonClick", function (ev, featureSelected, leafletEvent) {
                        if (getPosition(leafletEvent.originalEvent.currentTarget) === getPosition(elem[0]))
                            featureClick(featureSelected, leafletEvent);
                    });

                    function showLoading(loading)
                    {
                        if (loading)
                        {
                            if (getPosition(elem[0]) == "right")
                            {
                                $("div.vis-panel[pos='right'] .loading").show();
                                $("div.vis-panel[pos='right'] .leaflet-container").css('opacity', 0.5);
                            }
                            else
                            {
                                $("div.vis-panel[pos='left'] .loading").show();
                                $("div.vis-panel[pos='left'] .leaflet-container").css('opacity', 0.5);
                            }
                        }
                        else
                        {
                            if (getPosition(elem[0]) == "right")
                            {
                                $("div.vis-panel[pos='right'] .loading").hide();
                                $("div.vis-panel[pos='right'] .leaflet-container").css('opacity', "");
                            }
                            else
                            {
                                $("div.vis-panel[pos='left'] .loading").hide();
                                $("div.vis-panel[pos='left'] .leaflet-container").css('opacity', "");
                            }
                        }
                    }
                    ;

                    function updateSelZipcodes(zipcodes)
                    {
                        scope.selectedZipcodes = {};
                        angular.forEach(zipcodes, function (z) {
                            scope.selectedZipcodes[z] = z;
                        });
                    }
                    ;
                    function filterCases(zipcodes)
                    {
                        var filteredCases = {};
                        filteredCases = scope.cases.filter(function (cif) {
                            var streetAddr = cif.STREETADDRESS;
                            var zipregex = /(\d+)$/;
                            var zipmatch = zipregex.exec(streetAddr);
                            var zip = zipmatch[0];
                            return ($.inArray(zip, zipcodes) >= 0);
                        });
                        return  filteredCases;
                    }
                    ;
                    function reloadFilteredCases(filterTimeline)
                    {
                        var cases = filterService.getFilteredCases(filterTimeline);
                        reloadGraph(cases);

                    }
                    ;
                    function featureClick(featureSelected, event) {
                        var currUIMode = eventService.getUIMode();
                        if ((currUIMode === "manipulate") || (filterCases([featureSelected.properties.ZIPCODE]).length === 0))
                            return;

                        resetSelectedLayersStyle();

                        if (scope.selectedZipcodes[featureSelected.properties.ZIPCODE] === undefined)
                        {
                            if (currUIMode === "select")
                            {
                                scope.selectedZipcodes = {};
                            }
                            scope.selectedZipcodes[featureSelected.properties.ZIPCODE] = featureSelected.properties.ZIPCODE;
                        }
                        else
                        {
                            delete scope.selectedZipcodes[featureSelected.properties.ZIPCODE];
                        }

                        selectMap();
                        var zipcodes = Object.keys(scope.selectedZipcodes);
                        var cases = filterCases(zipcodes);
                        eventService.setSelCases(cases, scope.uid);

//                        if (cases.length > 0)
//                            eventService.rebroadcastSelZipcodes(zipcodes, scope.uid);
//                        else if (unselect)
//                            eventService.rebroadcastSelZipcodes([], scope.uid);
//                        else
//                            eventService.rebroadcastSelZipcodes([featureSelected.properties.ZIPCODE], scope.uid);
                    }
                    ;

                    function resetSelectedLayersStyle()
                    {
                        angular.forEach(Object.keys(scope.selectedLayers), function (key) {
                            var layer = scope.selectedLayers[key];
                            if (layer.options)
                                layer.setStyle(layer.options.style(layer.feature));
                            else if (layer._options)
                                layer.setStyle(layer._options.style(layer.feature));
                        });
                    }
                    ;
                    function highlightSelectedLayers()
                    {
                        angular.forEach(Object.keys(scope.selectedLayers), function (key) {
                            var layer = scope.selectedLayers[key];
                            layer.setStyle({
                                weight: 3,
                                dashArray: '0.9',
                                color: 'blue',
                            });
                            layer.bringToFront();

                        })

                    }
                    ;
                    function mouseover(feature, leafletEvent) {
                        var layer = leafletEvent.target;
                        layer.setStyle({
                            weight: 2,
                            color: '#666',
                            fillColor: 'white'
                        });
                        layer.bringToFront();
                        scope.selectedZip = layer.feature;
                        scope.numberCases = filterCases([layer.feature.properties.ZIPCODE]).length;
                        highlightSelectedLayers();
//                        selectMap();
                    }
                    ;
                    function reloadGraph(newGraph)
                    {
                        showLoading(true);
                        resetSelectedLayersStyle();
                        scope.selectedLayers = {};
                        scope.cases = [];
//                angular.copy(newGraph, scope.cases);
                        scope.cases = newGraph;
                        var ndx = new crossfilter(scope.cases);
                        var zipDimension = ndx.dimension(function (d) {
                            var streetAddr = d.STREETADDRESS;
                            var zipregex = /(\d+)$/;
                            var zipmatch = zipregex.exec(streetAddr);
                            var zip = zipmatch[0];
                            return zip;
                        });
                        scope.zipCounts = zipDimension.group().reduceCount().all();
                        var minCount = 0;
                        var maxCount = 0;
                        for (var i = 0; i < scope.zipCounts.length; i++)
                        {
                            var currCount = scope.zipCounts[i].value
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
                            var matchingCounts = scope.zipCounts.filter(function (entry) {
                                return entry.key === featureZip;
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


                        if (scope.geojsonZip !== undefined)
                        {
//                            $timeout(function () {
                            scope.geojson = {
                                data: scope.geojsonZip,
                                style: style,
                                resetStyleOnMouseout: true
                            };
//                            });
                        }
                        else
                        {
                            // Get the countries geojson data from a JSON

                            scope.geojsonZip = choroplethService.getGeoJson();
                            angular.extend(scope, {
                                geojson: {
                                    data: scope.geojsonZip,
                                    style: style,
                                    resetStyleOnMouseout: true
                                }
                            });
                        }

                        leafletData.getMap('leaflet-' + scope.id).then(function (map) {
                            scope.map = map;
                        });

                    }
                    ;
                    var graph = filterService.getFilteredCases(getPosition(elem[0]));
                    if (graph !== null)
                        reloadGraph(graph);


                    function selectMap()
                    {
                        var zipcodes = Object.keys(scope.selectedZipcodes);

                        if (filterCases(zipcodes).length > 0)
                        {
                            resetSelectedLayersStyle();

                            if (zipcodes.length > 0)
                            {
                                scope.selectedLayers = {};
                                scope.map.eachLayer(function (layer)
                                {
                                    if ((layer.feature) && $.inArray(layer.feature.properties.ZIPCODE, zipcodes) >= 0)
                                    {
                                        scope.selectedLayers[layer.feature.properties.ZIPCODE] = layer;
                                    }
                                });
                                highlightSelectedLayers();
                            }
                            else
                            {
                                scope.selectedLayers = {};
                            }
                        }
                    }
                    ;

                    function updateMapSelections(cases)
                    {

                        var zipcodes = [];
                        angular.forEach(cases, function (selCase) {
                            var zipmatch = /(\d+)$/.exec(selCase.STREETADDRESS);
                            zipcodes.push(zipmatch[0]);
                        });
                        updateSelZipcodes(zipcodes);
                        selectMap();

                    }
                    ;
                }

            };
        });

