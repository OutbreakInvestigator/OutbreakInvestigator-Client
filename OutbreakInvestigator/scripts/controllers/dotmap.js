/***** Copyright 2014 University of Washington (Neil Abernethy, Wilson Lau, Todd Detwiler)***/
/***** http://faculty.washington.edu/neila/ ****/
'use strict';

angular.module('obiUiApp')
        .controller('DotmapCtrl', function ($scope, graphService) {
            $scope.getGraph = graphService.getGraph;

        })
        .directive('dotmapVis', function ($window, $document, $timeout, graphService, eventService, displayService, filterService, timelineService) {
            return {
                restrict: 'A',
                // scope: {},
                link: function (scope, elem, attrs) {
                    var uid = elem.uniqueId();

                    scope.$on('resetUI', function (evt, filter) {
                        rebuildMap();
                    });

                    scope.$on('leftFilterUpdate', function (evt, filter) {
                        if (getPosition(elem[0]) == "left")
                        {
                            updateAllFilters(getPosition(elem[0]));
                        }

                    });
                    scope.$on('rightFilterUpdate', function (evt, filter) {
                        if (getPosition(elem[0]) == "right")
                        {
                            updateAllFilters(getPosition(elem[0]));
                        }

                    });
                    scope.$on('filterUpdate', function (evt, filter, value1, value2)
                    {//getPosition(elem[0]) === eventService.getFilterSel()
                        updateAllFilters(getPosition(elem[0]));
                    });
                    scope.$on('selCasesUpdate', function (evt, selCases, requestModuleID)
                    {
                        if (requestModuleID != uid)
                        {
                            setSelected(selCases);
                        }
                    });

                    var caseInfoFields = displayService.getCaseInfoFields();

                    var blueDot = {url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'};
                    var redDot = {url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'};

                    function displayInfo(marker)
                    {
                        scope.map.set('disableDoubleClickZoom', true);
                        marker.infowindow.open(scope.map, marker);
                    }

                    scope.$on('visPanelResize', function (event, position, width, height) {
                        var resize_pos = position[0];
                        var curr_pos = getPosition(elem[0]);

                        if (resize_pos != curr_pos)
                        {
                            return;     // noop if this event is from another pane
                        }

                        // resize and recenter map

                        // timeout is a hack, otherwise map does not always correctly fill div
                        setTimeout(function () {
                            var center = scope.map.getCenter();
                            google.maps.event.trigger(scope.map, "resize");
                            scope.map.panTo(center);
                        }, 10);
                    });

                    var markerBounds = new google.maps.LatLngBounds();
                    createMap();

                    var markerArray = [];
                    var selMarkerArray = [];
                    function clearOverlays() {
                        if (markerArray) {
                            for (var i in markerArray) {
                                markerArray[i].setMap(null);
                            }
                        }
                        markerArray = [];
                        markerBounds = new google.maps.LatLngBounds();

                        if (rect)
                        {
                            rect.setMap(null);

                        }
                    }

                    //var infowindow;
                    function setSelected(selCases)
                    {
                        // deselect all currently selected markers
                        for (var i in selMarkerArray) {
                            selMarkerArray[i].setIcon(blueDot);
                        }
                        selMarkerArray = [];

                        // set selected
                        for (var i in markerArray) {
                            var marker = markerArray[i];
                            if (isSelected(selCases, marker.case))
                            {
                                marker.setIcon(redDot);
                                selMarkerArray.push(marker);
                            }
                        }
                    }

                    function addMarker(element, index, array)
                    {
                        var lat = element.LAT;
                        var lng = element.LNG;
                        var latlng = new google.maps.LatLng(lat, lng);

                        var label = element.dbid.toString();
                        var bullet = {
                            url: 'images/bullet.gif',
                            size: new google.maps.Size(10, 10),
                            // The origin for this image is 0,0.
                            origin: new google.maps.Point(0, 0),
                            // The anchor for this image is the center 5,5.
                            anchor: new google.maps.Point(5, 5)
                        };


                        // test
                        var marker = new google.maps.Marker({
                            map: scope.map,
                            position: latlng,
                            icon: blueDot,
                            title: label,
                            visible: true,
                            case: element
                        });

                        markerBounds.extend(latlng);

                        marker.infowindow = new google.maps.InfoWindow({
                            content: createInfoWindowText(element),
                            disableAutoPan: true
                        });

                        google.maps.event.addListener(marker, 'click', function (event) {
                            var ui_mode = eventService.getUIMode();
                            var selectedCases = eventService.getSelCases();
                            if (ui_mode === 'select')
                            {
//                                var selectedCases = eventService.getSelCases();
                                if (selectedCases.length === 1 && selectedCases[0].dbid === marker.case.dbid)
                                {
                                    setSelected([]);
                                    eventService.setSelCases([], uid);
                                }
                                else
                                {
                                    setSelected([marker.case]);
                                    eventService.setSelCases([marker.case], uid);
                                }
                            }
                            else if (ui_mode === 'multiselect')
                            { 
                                var ind = $.inArray(marker.case, selectedCases);
                                if (ind >= 0)
                                {
                                    selectedCases.splice(ind, 1); 
                                }
                                else
                                {
                                    selectedCases.push(marker.case); 
                                }
                                setSelected(selectedCases);
                                eventService.setSelCases(selectedCases, uid);
                          }
                            else if (ui_mode == 'information')
                            {
                                displayInfo(marker);
                            }
                        });
                        /*
                         google.maps.event.addListener(marker, "rightclick", function(event) {
                         scope.map.set('disableDoubleClickZoom', true);
                         marker.infowindow.open(scope.map,marker);
                         });
                         */
                        google.maps.event.addListener(marker, "mouseover", function (event) {
                            scope.map.set('disableDoubleClickZoom', true);
                            marker.infowindow.open(scope.map, marker);
                        });
                        google.maps.event.addListener(marker, "mouseout", function (event) {
                            scope.map.set('disableDoubleClickZoom', true);
                            marker.infowindow.close();
                        });

                        /*
                         google.maps.event.addListener(marker, "mouseout", function(event) {
                         scope.map.set('disableDoubleClickZoom', true);
                         infowindow.close(scope.map,marker);
                         });*/

                        markerArray.push(marker);
                    }

                    scope.$watch(graphService.getGraph, function (newVal, oldVal) {
                        if (newVal)
                        {
                            rebuildMap();
                            prepareForSelect(eventService.getUIMode());
                        }
                    });

                    function createInfoWindowText(element)
                    {
                        /*
                         { "id": "#11:1170", "dbid": 1171, "DOB": "Sun Apr 05 00:00:00 PST 1953", "ONSET_DT": "Sat Dec 19 00:00:00 PST 2009", "FIRST_NM": "756", "HOSPITALIZED": 2, "TYPEDX": 1, "SUSPECTED_EXP": 6, "CDAYCARE": 2, "ZIP": "98057-0000", "ADDRESS1": "710", "INTERP": 2, "OTHERCONTACT_FIRST_NAME": "843", "INVESTIGATION_START_DT": "Tue Jan 05 00:00:00 PST 2010", "DISEASE": "PER", "FOODHANDLER": 2, "HOME_PHONE": "206-555-0710", "EXPIRED": 2, "WORK_PHONE": "206-555-0306-00", "CLUSTER_ID": 6, "LNG": -122.3008259, "OTHERCONTACT_LAST_NAME": "843", "IMMUNE_STATUS": 1, "REPORTED_BY": "CIT", "DISEASE_NAME": "PER", "PDAYCARE": 2, "CITY": "Skykomish", "BATCH_DT": "Sun Jan 03 00:00:00 PST 2010", "RACE": 3, "HOMELESS": 8, "ZIPCODE4": "98057-0000", "STATE": "WA", "COUNTY": 17, "EXPOSED_IN_KC": 1, "SEX": 1, "LAST_NM": "175", "PAT_CARE": 2, "REPORT_DT": "Tue Dec 29 00:00:00 PST 2009", "LAT": 47.7336519, "IMMUNE_NU": 1, "AGEYEARS": 60, "_id": "#11:1170", "_type": "vertex" }
                         */

                        var infoText = '';
                        for (var i = 0; i < caseInfoFields.length; i++)
                        {
                            var currField = caseInfoFields[i];
                            var dataField = {};
                            if (currField['type'] && currField['type'] === 'date')
                            {
                                dataField = new Date(element[currField['data_field']]);
                                dataField = dataField.toLocaleDateString("en-US");
                            }
                            else
                                dataField = element[currField['data_field']];

                            infoText += currField['display_text'] + ": " + dataField;
                            if (i != caseInfoFields.length - 1)
                            {
                                infoText += "<br/>";
                            }
                        }
                        // Create temporary div off to the side, containing infotext, just to get the size dynamically
                        var $cloneInfotext = $('<div>' + infoText + '</div>')
                                .css({marginLeft: '-9999px', position: 'absolute'})
                                .appendTo($('body'));


                        var infoWindowText = '<div style="width: ' + ($cloneInfotext.width() + 10) + 'px; ' +
                                'height: ' + ($cloneInfotext.height()) + 'px">' + infoText +
                                '</div>';

                        // Delete the temporary div:
                        $cloneInfotext.remove();

                        return infoWindowText;

                    }

                    var rect

                    function createMap()
                    {
                        var mapOptions = {
                            zoom: 11,
                            center: new google.maps.LatLng(47.6097, -122.3331),
                            mapTypeId: google.maps.MapTypeId.ROADMAP,
                            draggable: true
                        }
                        scope.map = new google.maps.Map(elem[0], mapOptions);

                        scope.drawingManager = new google.maps.drawing.DrawingManager({
                            drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
                            drawingControl: false, /*true,
                             drawingControlOptions: {
                             position: google.maps.ControlPosition.TOP_CENTER,
                             drawingModes: [google.maps.drawing.OverlayType.RECTANGLE,
                             google.maps.drawing.OverlayType.POLYLINE]
                             }*/
                            rectangleOptions: {
                                editable: true,
                                draggable: true,
                                zIndex: 1
                            }
                        });
                        scope.drawingManager.setMap(scope.map);
                        google.maps.event.addListener(scope.drawingManager, 'rectanglecomplete', function (rectangle) {
                            scope.drawingManager.setDrawingMode(null);
                            // clear previous selection box
                            if (rect != null)
                                rect.setMap(null);

                            rect = rectangle;
                            google.maps.event.addListener(rectangle, 'bounds_changed', function () {
                                selectBoundsChanged();
                            });
                            selectBoundsChanged();

                        });


                        google.maps.event.addListenerOnce(scope.map, 'idle', function () {
                            rebuildMap();
                        });

                        google.maps.event.addListener(scope.map, 'click', function () {
                            prepareForSelect(eventService.getUIMode());
                        });

                    }


                    scope.$watch(eventService.getUIMode, function (newVal, oldVal) {
                        prepareForSelect(newVal);
                    });

                    function prepareForSelect(mode)
                    {
                        if (rect != null)
                            rect.setMap(null);
                        if (mode == "multiselect")
                        {
                            scope.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
                        }
                        else
                        {
                            scope.drawingManager.setDrawingMode(null);
                        }
                    }

                    function selectBoundsChanged()
                    {
                        /*
                         // deselect all currently selected markers
                         for (var i in selMarkerArray) {
                         selMarkerArray[i].setIcon(blueDot);
                         }
                         */
                        selMarkerArray = [];

                        var selCases = [];

                        for (var i in markerArray) {

                            var marker = markerArray[i];
                            var pos = marker.getPosition();
                            var bounds = rect.getBounds();
                            if (bounds.contains(pos))
                            {
                                selCases.push(marker.case);
                                marker.setIcon(redDot);
                                selMarkerArray.push(marker);
                            }
                            else
                            {
                                if (marker.getIcon() != blueDot)
                                {
                                    marker.setIcon(blueDot);
                                }
                            }
                        }

                        // announce selected cases to other vis modules
                        eventService.setSelCases(selCases, uid);
                    }


                    function rebuildMap()
                    {
                        // redo markers
                        clearOverlays();
                        var graph = graphService.getGraph();
                        if (graph)
                        {
                            graph.nodes.forEach(addMarker);

                            // apply existing filter, request broadcast
                            eventService.rebroadcastFilters();

                            scope.map.fitBounds(markerBounds);
                        }

                        setSelected(eventService.getSelCases());
                    }

                    function updateMapFilter(filter, checkFn, timelineFilter)
                    {
                        if (filter)
                        {
                            var position = getPosition(elem[0]);

                            for (var i = 0; i < markerArray.length; i++)
                            {
                                var marker = markerArray[i];
                                if (marker.visible)
                                    marker.setVisible(checkFn(marker.case, timelineFilter, filterService, filter));
                            }
                        }
                    }
                    function updateAllFilters(timelineFilter)
                    {
                        //reset first
                        markerArray.forEach(function (marker) {
                            marker.setVisible(true);
                        });

                        if (timelineFilter)
                        {
                            updateMapFilter('time', filterService.filterTimeline, timelineFilter);

//                            var timeline = timelineService.getTimeline();
//                            if (timeline)
//                            {
//                                updateMapFilter('time', function (markerCase) {
////                                    var filters = timelineService.getTimeline().filters()[0];
//                                    var filters;
//                                    if (filterTimeline === 'left')
//                                        filters = eventService.getLeftFilter();
//                                    if (filterTimeline === 'right')
//                                        filters = eventService.getRightFilter();
//                                    if (filterTimeline === 'linked')
//                                        filters = timeline.filters()[0];
//                                    if (filters)
//                                    {
//                                        return (new Date(markerCase.REPORT_DT)).getTime() >= filters[0].getTime() &&
//                                                (new Date(markerCase.REPORT_DT)).getTime() <= filters[1].getTime();
//                                    }
//                                    return true;
//                                });
//                            }
                        }
                        angular.forEach(filterService.getAllFilterData(), function (value, key) {
                            updateMapFilter(key, filterService.filter);
                        });
//                        updateMapFilter('age', filterService.filterAge);
//                        if (filterService.isRange(filterService.getAge()))
//                        {
//                            updateMapFilter('age', filterService.filterAgeRange);
//                        } else if (filterService.isList(filterService.getAge()))
//                        {
//                            updateMapFilter('age', filterService.filterAgeList);
//                        }
//                        updateMapFilter('gender', filterService.filterGender);
//                        if (filterService.isList(filterService.getGender()))
//                        {
//                            updateMapFilter('gender', filterService.filterGenderList);
//                        } else if (filterService.isRange(filterService.getGender()))
//                        {
//                            updateMapFilter('gender', filterService.filterGenderRange);
//                        }
//updateMapFilter('disease', filterService.filterDisease);
//                        if (filterService.isList(filterService.getDisease()))
//                        {
//                            updateMapFilter('disease', filterService.filterDiseaseList);
//                        }

//                        if (filterService.getAgeFrom() !== undefined)
//                        {
//                            updateMapFilter('age', function (marker) {
//                                return   marker.case.AGEYEARS >= filterService.getAgeFrom() && marker.case.AGEYEARS <= filterService.getAgeTo();
//                            });
//                        }
//                        if (filterService.getGender() !== undefined)
//                        {
//                            updateMapFilter('gender', function (marker)
//                            {
//                                return filterService.getGender() == 0 || marker.case.SEX == filterService.getGender();
//                            });
//                        }
//                        if (filterService.getDisease() !== undefined)
//                        {
//                            updateMapFilter('disease', function (marker)
//                            {
//                                return $.inArray(marker.case.DISEASE_NAME, filterService.getDisease()) >= 0;
//                            });
//                        }
                    }

                    function isSelected(selCases, currCase)
                    {
                        var selected = false;
                        selected = selCases.some(function (currSelCase)
                        {
                            if (currCase.dbid == currSelCase.dbid)
                                return true;
                        });

                        return selected;
                    }
                }
            };
        });

function getElementsByClassName(className) {
    if (document.getElementsByClassName) {
        return document.getElementsByClassName(className);
    }
    else {
        return document.querySelectorAll('.' + className);
    }
}

function getPosition(el) {
    // class="vis-panel"
    var panelAncestor = findAncestor(el, "vis-panel");
    var position = null;
    if (panelAncestor != null)
    {
        position = panelAncestor.getAttribute("pos");
    }

    return position;
}

function findAncestor(el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls))
        ;
    return el;
}
 