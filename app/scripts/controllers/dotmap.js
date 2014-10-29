'use strict';

angular.module('obiUiApp')
        .controller('DotmapCtrl', function ($scope, graphService) {
            $scope.getGraph = graphService.getGraph;

            //$scope.minTime = graphService.getLeftFilter[0];
            //$scope.maxTime = graphService.getLeftFilter[1];

        })
        .directive('dotmapVis', function ($window, $document, $timeout, graphService, eventService, displayService) {
            //alert("performing networkVis2 directive");
            return {
                restrict: 'A',
                scope: {},
                link: function (scope, elem, attrs) {
                    var uid = elem.uniqueId();
                    scope.$on('leftFilterUpdate', function (evt, filter) {
                        //scope.filter = filter;
                        if (getPosition(elem[0]) == "left")
                        {
                            updateMapFilter(filter);
                        }
                    });
                    scope.$on('rightFilterUpdate', function (evt, filter) {
                        //scope.filter = filter;
                        if (getPosition(elem[0]) == "right")
                        {
                            updateMapFilter(filter);
                        }
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

                    var graph_data;
                    var w = elem[0].clientWidth;//$document[0].body.clientWidth;
                    var h = elem[0].clientHeight;//$document[0].body.clientHeight;

                    var markerBounds = new google.maps.LatLngBounds();
                    createMap();
                    //setupRectSelect();

                    //TEST
                    /*
                     var graph = graphService.getGraph();
                     if(graph!=null)
                     graph.nodes.forEach(addMarker);
                     */

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
                        //console.log("a[" + index + "] = " + element);

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
                            content: createInfoWindowText(element)
                        });

                        google.maps.event.addListener(marker, 'click', function (event) {
                            var ui_mode = eventService.getUIMode();
                            if (ui_mode == 'select')
                            {
                                setSelected([marker.case]);
                                eventService.setSelCases([marker.case], uid);
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


                        /*
                         var marker = new google.maps.Marker({
                         map:        scope.leftMap,
                         position:   latlng,
                         title:      label,
                         visible:    true,
                         case:       element
                         });
                         */
                        markerArray.push(marker);

                    }

                    scope.$watch(graphService.getGraph, function (newVal, oldVal) {


                        if (newVal)
                        {
                            /*
                             graph_data = newVal;
                             
                             // redo markers
                             clearOverlays();
                             var graph = graphService.getGraph();
                             graph.nodes.forEach(addMarker);
                             */
                            //updateMap(scope.leftFilter);
                            rebuildMap();
                            prepareForSelect(eventService.getUIMode());
                        }
                    });

                    function createInfoWindowText(element)
                    {
                        /*
                         { "id": "#11:1170", "dbid": 1171, "DOB": "Sun Apr 05 00:00:00 PST 1953", "ONSET_DT": "Sat Dec 19 00:00:00 PST 2009", "FIRST_NM": "756", "HOSPITALIZED": 2, "TYPEDX": 1, "SUSPECTED_EXP": 6, "CDAYCARE": 2, "ZIP": "98057-0000", "ADDRESS1": "710", "INTERP": 2, "OTHERCONTACT_FIRST_NAME": "843", "INVESTIGATION_START_DT": "Tue Jan 05 00:00:00 PST 2010", "DISEASE": "PER", "FOODHANDLER": 2, "HOME_PHONE": "206-555-0710", "EXPIRED": 2, "WORK_PHONE": "206-555-0306-00", "CLUSTER_ID": 6, "LNG": -122.3008259, "OTHERCONTACT_LAST_NAME": "843", "IMMUNE_STATUS": 1, "REPORTED_BY": "CIT", "DISEASE_NAME": "PER", "PDAYCARE": 2, "CITY": "Skykomish", "BATCH_DT": "Sun Jan 03 00:00:00 PST 2010", "RACE": 3, "HOMELESS": 8, "ZIPCODE4": "98057-0000", "STATE": "WA", "COUNTY": 17, "EXPOSED_IN_KC": 1, "SEX": 1, "LAST_NM": "175", "PAT_CARE": 2, "REPORT_DT": "Tue Dec 29 00:00:00 PST 2009", "LAT": 47.7336519, "IMMUNE_NU": 1, "AGEYEARS": 60, "_id": "#11:1170", "_type": "vertex" }
                         */

                        //return JSON.stringify(element, null, 4);

                        var infoText = '<div class="map-info-window">';
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

                        return '</div>' + infoText;

                        /*
                         var message = "<p>";
                         message+="db id: "+element.dbid+"<br />";
                         message+="age: "+element.AGEYEARS+"<br />";
                         message+="report date: "+element.REPORT_DT;
                         return message;
                         */
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

                        //YOU are HERE!!!!!!!!!!!!!!!!!
                        /*
                         google.maps.event.addListenerOnce(scope.map, 'click', function(){
                         scope.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
                         });
                         */

                        /*
                         var graph = graphService.getGraph();
                         if(graph)
                         {
                         graph.nodes.forEach(addMarker);
                         
                         // apply existing filter, request broadcast
                         graphService.rebroadcastFilters();
                         }
                         */
                    }

                    /*
                     var dragging = false;
                     var pos1, pos2;
                     var latlng1, latlng2;
                     var rect;
                     
                     function setupRectSelect()
                     {
                     // rectangular selection test
                     rect = new google.maps.Rectangle({
                     map: scope.map,
                     editable: true,
                     draggable: true
                     
                     });
                     
                     //google.maps.event.addListener(rect, 'bounds_changed',
                     //    function(event){console.log("bounds changed");});
                     
                     
                     google.maps.event.addListener(scope.map, 'mousedown', function(mEvent) {
                     var currUIMode = eventService.getUIMode();
                     if(currUIMode!="manipulate")
                     {
                     scope.map.draggable = false;
                     }
                     if(currUIMode=="multiselect")
                     {
                     latlng1 = mEvent.latLng;
                     dragging = true;
                     pos1 = mEvent.pixel;
                     }
                     });
                     google.maps.event.addListener(scope.map, 'mousemove', function(mEvent) {
                     var currUIMode = eventService.getUIMode();
                     if(currUIMode=="multiselect")
                     {
                     latlng2 = mEvent.latLng;
                     showRect();
                     }
                     });
                     
                     google.maps.event.addListener(scope.map, 'mouseup', function(mEvent) {
                     var currUIMode = eventService.getUIMode();
                     if(currUIMode!="manipulate")
                     {
                     scope.map.draggable = true;
                     }
                     if(currUIMode=="multiselect")
                     {
                     //scope.map.draggable = true;
                     //showRect();
                     selectBoundsChanged();
                     dragging = false;
                     }
                     });
                     }
                     */

                    scope.$watch(eventService.getUIMode, function (newVal, oldVal) {
                        prepareForSelect(newVal);
                        /*
                         if(newVal=="multiselect")
                         {
                         scope.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.RECTANGLE);
                         }
                         else
                         {
                         scope.drawingManager.setDrawingMode(null);
                         if(rect!=null)
                         rect.setMap(null);
                         //rect.setMap(scope.map);
                         }
                         */
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

                    /*
                     function showRect() {
                     if(dragging){
                     
                     
                     var minLat, maxLat, minLng, maxLng;
                     if(latlng1.lng() < latlng2.lng())
                     {
                     minLng = latlng1.lng();
                     maxLng = latlng2.lng();
                     }
                     else
                     {
                     minLng = latlng2.lng();
                     maxLng = latlng1.lng();
                     }
                     
                     if(latlng1.lat() < latlng2.lat())
                     {
                     minLat = latlng1.lat();
                     maxLat = latlng2.lat();
                     }
                     else
                     {
                     minLat = latlng2.lat();
                     maxLat = latlng1.lat();
                     }
                     
                     var sw = new google.maps.LatLng(minLat,minLng);
                     var ne = new google.maps.LatLng(maxLat,maxLng);
                     
                     
                     var latLngBounds = new google.maps.LatLngBounds(sw,ne);
                     rect.setBounds(latLngBounds);
                     
                     // Add an event listener on the rectangle.
                     //google.maps.event.addListener(rect, 'bounds_changed',
                     //    function(event){console.log("bounds changed");});
                     
                     // select markers
                     
                     //selectMarkers(minLat,maxLat,minLng,maxLng);
                     }
                     }
                     
                     
                     function selectBoundsChanged()
                     {
                     var sw = rect.getBounds().getSouthWest();
                     var ne = rect.getBounds().getNorthEast();
                     var minLat = sw.lat();
                     var minLng = sw.lng();
                     var maxLat = ne.lat();
                     var maxLng = ne.lng();
                     selectMarkers(minLat,maxLat,minLng,maxLng);
                     }
                     */

                    function selectBoundsChanged()
                    {

                        /*
                         var sw = rect.getBounds().getSouthWest();
                         var ne = rect.getBounds().getNorthEast();
                         var minLat = sw.lat();
                         var minLng = sw.lng();
                         var maxLat = ne.lat();
                         var maxLng = ne.lng();
                         selectMarkers(minLat,maxLat,minLng,maxLng);
                         */


                        selectMarkers();

                    }

                    function selectMarkers()
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
                            /*
                             var marker = markerArray[i];
                             var pos = marker.getPosition();
                             var lat = pos.lat();
                             var lng = pos.lng();
                             if(lat>minLat&&lat<maxLat&&lng>minLng&&lng<maxLng)
                             {
                             selCases.push(marker.case);
                             marker.setIcon(redDot);
                             selMarkerArray.push(marker);
                             }*/

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

                    /*
                     function selectMarkers(minLat,maxLat,minLng,maxLng)
                     {
                     // deselect all currently selected markers
                     for (var i in selMarkerArray) {
                     selMarkerArray[i].setIcon(blueDot);
                     }
                     selMarkerArray = [];
                     
                     var selCases = [];
                     
                     for (var i in markerArray) {
                     var marker = markerArray[i];
                     var pos = marker.getPosition();
                     var lat = pos.lat();
                     var lng = pos.lng();
                     if(lat>minLat&&lat<maxLat&&lng>minLng&&lng<maxLng)
                     {
                     selCases.push(marker.case);
                     marker.setIcon(redDot);
                     selMarkerArray.push(marker);
                     }
                     }
                     
                     // announce selected cases to other vis modules
                     eventService.setSelCases(selCases);
                     }
                     */


                    function rebuildMap()
                    {
                        /*
                         if(!scope.map)
                         {
                         createMap();
                         }
                         */

                        // redo markers
                        clearOverlays();
                        var graph = graphService.getGraph();
                        if (graph)
                        {
                            graph.nodes.forEach(addMarker);

                            // apply existing filter, request broadcast
                            //graphService.rebroadcastFilters();
                            eventService.rebroadcastFilters();

                            scope.map.fitBounds(markerBounds);
                        }

                        setSelected(eventService.getSelCases());
                    }

                    function updateMapFilter(filter)
                    {
                        if (filter)
                        {
                            var position = getPosition(elem[0]);

                            for (var i = 0; i < markerArray.length; i++)
                            {
                                var marker = markerArray[i];
                                if ((new Date(marker.case.REPORT_DT)).getTime() < filter[0].getTime() ||
                                        (new Date(marker.case.REPORT_DT)).getTime() > filter[1].getTime())
                                {
                                    marker.setVisible(false);
                                }
                                else
                                {
                                    marker.setVisible(true);
                                }
                            }
                        }
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
/*
 .service('googleMaps', function() {
 
 //var map_id  = 'map';
 var lat     = 46.87916;
 var lng     = -3.32910;
 var zoom    = 15;
 var map     = null;//initialize(map_id, lat, lng, zoom);
 
 return {
 getMap: function (elem) {
 
 return initialize(elem, lat, lng, zoom);//map;
 }
 };
 });
 
 function initialize(elem, lat, lng, zoom) {
 var myOptions = {
 zoom : 8,
 center : new google.maps.LatLng(lat, lng),
 mapTypeId : google.maps.MapTypeId.ROADMAP
 };
 var result;
 //var map_elem = document.getElementById(map_id);
 if(elem!=null)
 {
 result = new google.maps.Map(elem, myOptions);
 }
 return result;
 }
 
 //dotMapCtrl.$inject = ['$scope','GoogleMaps'];
 */