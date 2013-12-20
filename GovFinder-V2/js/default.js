// For an introduction to the Split template, see the following documentation:

(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;
    var selectedIndex = 0;
    www.checkmap = 0;
    www.ismaploadedfirst = 0;
    www.allcityloaded = 0;
    www.cityitemslist = [];
    www.loadedgroups = [];
    www.refreshcompleted = 0;
    www.list = new WinJS.Binding.List();
    www.chicagocity = new WinJS.Binding.List();
    www.edmontoncity = new WinJS.Binding.List();
    www.newyorkcity = new WinJS.Binding.List();
    www.dynamiccitylist = new WinJS.Binding.List();
    www.checkfortileclick = 0;
    www.citybindlist = new WinJS.Binding.List();
    www.latitude = 41.84637377214374;
    www.longitude = -87.72440020024562;

    // Include your Microsoft Bing map key here
    www.mapkey = '[mapkey]';

    //production URL
    www.citygroupurl = 'https://govfinder.socrata.com/api/views/rqrg-e5jx/rows.xml?accessType=DOWNLOAD';
    //Testing URL
    //www.citygroupurl = 'https://govfinder.socrata.com/api/views/vef6-vqfd/rows.xml?accessType=DOWNLOAD';
    www.sharelink = 'http://www.bing.com/favicon.ico';
    www.commentcounturl = 'http://poshsocratacommentservice.cloudapp.net/api/comment/GetComments?key=POSHSocrataComments&Id=';
    www.commenturl = 'http://poshsocratacommentservice.cloudapp.net/api/comment/GetComments?key=POSHSocrataComments&Id=';
    www.addcommenturl = 'http://poshsocratacommentservice.cloudapp.net/api/comment/addcomment?key=POSHSocrataComments';
   www.productiongetnotification = 'http://poshsocratacommentservice.cloudapp.net/api/comment/GetNotifications?key=POSHSocrataComments';
  //  www.testinggetnotification = "http://socratacommentcloudservice.cloudapp.net/api/comment/GetNotifications?key=POSHSocrataComments";
    www.backgroundTaskEntryPoint = 'GovFinderBackgroundTask.ScheduleTask';
    www.backgroundTaskName = "GovFinderBackgroundTask";
    www.notificationmessage = "item updated";
    www.mapzoom = 12;
    var isdataloaded = 0;
    www.iscommentscounstloaded = 0;

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            var localSettings = Windows.Storage.ApplicationData.current.localSettings;
            if (localSettings.values["savedcity"] == null) {
                //localSettings.values["savedcity"] = www.defaultselectedcity;
            }
            else {
                www.defaultselectedcity = localSettings.values["savedcity"];
            }
            if (args.detail.previousExecutionState == activation.ApplicationExecutionState.terminated) {

                init();
            } else {
                init();


            }
            www.arguments = args.detail.arguments;

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (www.arguments == "") {
                    if (nav.location) {

                        nav.history.current.initialPlaceholder = true;
                        if (nav.location == "/pages/mapview/map.html") {
                            GetFullMapData();


                        }
                        else if (nav.location == "/pages/split/split.html") {
                            GetSplitPageData();
                        }
                        else {
                            return nav.navigate(nav.location, nav.state);
                        }
                    } else {
                        if (www.arguments) {
                            GetData();
                        }
                        else {

                            return WinJS.Navigation.navigate(Application.navigator.home);
                        }
                    }
                }
                else {
                    GetData();
                }

            }));
        }
    });


    function GetData() {
        WinJS.Promise.timeout(1000).then(
          function (complete) {
              if (isdataloaded == 1) {
                  //www.isdataloaded = 0;
                  www.checkfortileclick = 1;
                  www.group = www.arguments;
                  return WinJS.Navigation.navigate("/pages/split/split.html", { groupKey: www.arguments });
              }
              else {
                  GetData();
              }
          });

    };
    //getsplitpagemap data
    function GetSplitPageData() {
        WinJS.Promise.timeout(1000).then(
          function (complete) {
              if (isdataloaded == 1) {
                  //www.checkmap = 1;
                  www.group = nav.state.groupKey;
                  return nav.navigate("/pages/split/split.html", { groupKey: nav.state.groupKey });
              }
              else {
                  GetSplitPageData();
              }
          });

    };
    //getfullmap data
    function GetFullMapData() {
        WinJS.Promise.timeout(1000).then(
          function (complete) {
              if (isdataloaded == 1) {
                  www.group = nav.state.groupKey;
                //  www.checkmap = 1;
                  nav.back();
              }
              else {
                  GetFullMapData();
              }
          });

    };
    app.oncheckpoint = function (args) {

        // that needs to persist across suspensions here. If you need to 
        // complete an asynchronous operation before your application is 
        // suspended, call args.setPromise().
        app.sessionState.history = nav.history;
    };

    www.init = function () {

        www.items = [];
        www.pinLists = [];
        www.list = [];
        www.list = new WinJS.Binding.List();
 
        www.dynamiccitylist = new WinJS.Binding.List();
        www.chicagocity = new WinJS.Binding.List();
        www.infoLayer.clear();
        www.Pins = [];

        selectedIndex = www.selectedIndex;
        init();
    };

    app.start();
    var init = function () {

        www.sort = function () {
            www.list.sort(function (a, b) {
                var distance = a.dist - b.dist;
                if (distance == 0) {
                    return (a.title < b.title) ? -1 : (a.title > b.title) ? 1 : 0;
                }
                else {
                    return distance;
                }
            });

        };
        (function () {
            var both = function (one, another, done) {
                if (one && another) {
                    done();
                }
            };
            (function () {
                var skip = true;
                www.setCurrentPin = function (point) {
                    point = point || www.location.current;
                    var location = new Microsoft.Maps.Location(point.latitude, point.longitude);
                    var pin = new Microsoft.Maps.Pushpin(location, { draggable: false, icon: 'images/currentpin.png', height: 55, width: 55 });
                    var layer = new Microsoft.Maps.EntityCollection();
                    layer.push(pin);

                    www.map.entities.push(layer);
                    Microsoft.Maps.Events.addHandler(pin, 'dragend', function () {
                        www.list.forEach(function (item) {
                            var d = item.dist = www.distance(pin.getLocation(), item.where);
                            item.distance = d > 1 ? d + ' miles' : d ? d + ' mile' : 'less than a mile';
                        });
                        www.sort();

                        if (!skip) {

                            www.listView.forceLayout();
                            www.listView.selection.set(0);
                            setTimeout(function () {

                            }, 300);
                        }
                        www.listView.selection.set(0);
                        (function () {
                            var max = 16;
                            var attempt = function () {
                                var selected = www.listView.element.querySelector('div.win-selected');
                                if (max-- > 0) {
                                    www.listView.selection.set(0);
                                    www.listView.ensureVisible(0);
                                    setTimeout(attempt, 100);
                                }
                            };
                            attempt();
                        })();
                        skip = false;
                    });
                };

            })();
            var map = null;
            www.layers = {};
            www.Pins = [];

            Microsoft.Maps.loadModule('Microsoft.Maps.Themes.BingTheme', {
                callback: function () {
                    var t = map && (map.theme = new Microsoft.Maps.Themes.BingTheme());
                }
            })
            //function for getting the map object
            function getMap() {
                if (!document.getElementById('map')) {

                    setTimeout(getMap, 200);
                    return;
                }

                map = new Microsoft.Maps.Map(document.getElementById('map'), {
                    credentials: www.mapkey,
                    center: new Microsoft.Maps.Location(www.latitude, www.longitude),
                    zoom: www.mapzoom,
                    mapTypeId: Microsoft.Maps.MapTypeId.Road,
                    theme: new Microsoft.Maps.Themes.BingTheme()

                });
                www.map = map;
                www.selectedIndex = 0;

                www.setmapcenter = function (lat, long) {
                    www.map.setView({ center: new Microsoft.Maps.Location(lat, long) });
                };

                both(www.map, www.location && www.location.current, www.setCurrentPin);
                var t = map;
                var addPin;


                //Function for adding pin and pin info
                (function () {
                    (function () {
                        www.pinClicker = function (item, location, done) {
                            function GetCommentsCounts() {
                                try {

                                    var commenturl = www.commentcounturl + item.compositeKey + '&cityName=' + www.maincity + '&reportName=' + www.reportName + '&IsCommentCount=true';
                                    WinJS.xhr({ url: commenturl }).then(function (commentresult) {
                                        if (commentresult.status === 200) {

                                            var commentcount = JSON.parse(commentresult.responseText);
                                            if (commentcount != null) {
                                                (function () {
                                                    www.commentcounts = commentcount;
                                                    if (item.type == "Representitive's Office") {
                                                        item.backgroundImage = "images/250/w/" + "Representitive" + '.png';
                                                    }
                                                    var descriptionshare = ('<b>{{address}}<br>\n{{city_state_zip}}</b><br>\n<br>\nphone: <b>{{phone}}</b><br>\nhours: <b>{{hours}}</b><br>\n<br>\n<b>{{code}}</b>' + (item.website ? '<br><br><a href="{{website}}">Website</a>' : '')).replace(/\{\{([^\}]+)\}\}/g, replacer(item));
                                                    var description = "";
                                                    var image = "<div data-win-control='WinJS.UI.ViewBox'><img width='110' height='90'  style='background-color:black; margin-left:25px;margin-top:15px' src=" + "'" + item.backgroundImage + "'" + "<br><h3  style='margin-left:10px; margin-right:10px; text-align:center; color:white; font-weight:bold;font-family: Myfont;font-size: 14.04px;'>" + item.title + "</h3></div>";
                                                    var line = "<hr width='160' align=left style='background:white; border:0; height:1px;opacity:0.5;'>";
                                                    var distance = "<table><tr><td style='width:5px'></td><td><img   src='../../images/distance.png'  width='20' height='20'/><td><td> <label style='text-align:left; margin-left:10px; font-size:smaller; color:white; font-weight:bold;font-family: Myfont;font-size: 10.04px;'>Distance</label>" + "<h3 style='text-align:left; margin-left:10px; font-size:small; color:white; font-weight:lighter'>" + item.distance + "</h3>" + "</td></tr></table>";
                                                    var phone = "<table><tr><td style='width:5px'></td><td><img   src='../../images/Phone.png'  width='20' height='20'/><td><td> <label style='text-align:left; margin-left:10px; font-size:smaller; color:white; font-weight:bold;font-family: Myfont;font-size: 10.04px;'>Phone Number</label>" + "<h3 style='text-align:left; margin-left:10px;  font-size:small; color:white; font-weight:lighter'>" + item.phone + "</h3>" + "</td></tr></table>";

                                                    var comments = "<table><tr><td style='width:5px;'></td><td><label  style='text-align:left; font-size:small; color:white; font-weight:bold;'>" + www.commentcounts + " " + "</label ></td>" + "<td><label  style='text-align:left; font-size:smaller; font-weight:lighter; color:white; text-decoration: underline;'><a id='cmtPushpin' title=" + item.compositeKey + ">comments</a></label ></td>" + "</tr><tr style=height:10px></tr><table> ";
                                                    (function () {
                                                        var html = '<h1>' + item.name + '</h1>\n<h4>' + item.type + '</h4>\n' + descriptionshare;
                                                        var text = html.replace(/\<\/?[bh][r14]?\>/g, '').replace(/\<\/?a[^>]*?\>(Website)?/g, '');
                                                        var map = ' <a href="{{map}}">Bing Map</a>'.replace(/\{\{([^\}]+)\}\}/g, replacer(item));
                                                        html += map;
                                                        descriptionshare += map;
                                                        description = "<Div style=background-color:#E92434;width:160px;height:auto>" + image + line + distance + phone + line + comments + "</Div>";
                                                        www.share = {
                                                            title: item.name,
                                                            description: item.type,
                                                            html: html,
                                                            text: text,
                                                            image: item.photo || www.sharelink
                                                        };
                                                    })();
                                                    www.infoLayer.clear();
                                                    var options = {
                                                        width: 160,
                                                        height: 187,
                                                        showCloseButton: false,
                                                        zIndex: 0,
                                                        offset: new Microsoft.Maps.Point(-140, 14),
                                                        showPointer: true,
                                                        htmlContent: description

                                                    };
                                                    try{
                                                        var box = new Microsoft.Maps.Infobox(location, options);
                                                        www.infoLayer.push(box);
                                                        var d = done && done()
                                                    }
                                                    catch (ex) { }
                                                })();

                                            }

                                        }
                                    });
                                }
                                catch (ex)
                                { }
                            }

                            var replacer = function (item) {
                                return function (string, p1) {
                                    return item[p1] === undefined ? 'n/a' : item[p1];
                                };
                            };

                            location = location || new Microsoft.Maps.Location(item.latitude, item.longitude);
                            return function () {

                                if (www.iscommentscounstloaded == 1) {
                                    GetCommentsCounts();
                                }
                                if (item.type == "Representitive's Office") {
                                    item.backgroundImage = "images/250/w/" + "Representitive" + '.png';
                                }
                                var descriptionshare = ('<b>{{address}}<br>\n{{city_state_zip}}</b><br>\n<br>\nphone: <b>{{phone}}</b><br>\nhours: <b>{{hours}}</b><br>\n<br>\n<b>{{code}}</b>' + (item.website ? '<br><br><a href="{{website}}">Website</a>' : '')).replace(/\{\{([^\}]+)\}\}/g, replacer(item));
                                var description = "";
                                var image = "<div data-win-control='WinJS.UI.ViewBox'><img width='110' height='90'  style='background-color:black; margin-left:25px;margin-top:15px' src=" + "'" + item.backgroundImage + "'" + "<br><h3  style='margin-left:10px; margin-right:10px; text-align:center; color:white; font-weight:bold;font-family: Myfont;font-size: 14.04px;'>" + item.title + "</h3></div>";
                                var line = "<hr width='160' align=left style='background:white; border:0; height:1px;opacity:0.5;'>";
                                var distance = "<table><tr><td style='width:5px'></td><td><img   src='../../images/distance.png'  width='20' height='20'/><td><td> <label style='text-align:left; margin-left:10px; font-size:smaller; color:white; font-weight:bold;font-family: Myfont;font-size: 10.04px;'>Distance</label>" + "<h3 style='text-align:left; margin-left:10px; font-size:small; color:white; font-weight:lighter'>" + item.distance + "</h3>" + "</td></tr></table>";
                                var phone = "<table><tr><td style='width:5px'></td><td><img   src='../../images/Phone.png'  width='20' height='20'/><td><td> <label style='text-align:left; margin-left:10px; font-size:smaller; color:white; font-weight:bold;font-family: Myfont;font-size: 10.04px;'>Phone Number</label>" + "<h3 style='text-align:left; margin-left:10px;  font-size:small; color:white; font-weight:lighter'>" + item.phone + "</h3>" + "</td></tr></table>";

                                var comments = "<table><tr><td style='width:5px;'></td><td><label  style='text-align:left; font-size:small; color:white; font-weight:bold;'>" + www.commentcounts + " " + "</label ></td>" + "<td><label  style='text-align:left; font-size:smaller; font-weight:lighter; color:white; text-decoration: underline;'><a id='cmtPushpin' title=" + item.compositeKey + ">comments</a></label ></td>" + "</tr><tr style=height:10px></tr><table> ";
                                (function () {
                                    var html = '<h1>' + item.name + '</h1>\n<h4>' + item.type + '</h4>\n' + descriptionshare;
                                    var text = html.replace(/\<\/?[bh][r14]?\>/g, '').replace(/\<\/?a[^>]*?\>(Website)?/g, '');
                                    var map = ' <a href="{{map}}">Bing Map</a>'.replace(/\{\{([^\}]+)\}\}/g, replacer(item));
                                    html += map;
                                    descriptionshare += map;
                                    description = "<Div style=background-color:#E92434;width:160px;height:auto>" + image + line + distance + phone + line + comments + "</Div>";
                                    www.share = {
                                        title: item.name,
                                        description: item.type,
                                        html: html,
                                        text: text,
                                        image: item.photo || www.sharelink
                                    };
                                })();
                                www.infoLayer.clear();
                                var options = {
                                    width: 160,
                                    height: 187,
                                    showCloseButton: false,
                                    zIndex: 0,
                                    offset: new Microsoft.Maps.Point(-140, 14),
                                    showPointer: true,
                                    htmlContent: description

                                };
                                try{
                                    var box = new Microsoft.Maps.Infobox(location, options);
                                    www.infoLayer.push(box);
                                    var d = done && done()
                                }
                                catch (ex) { }
                            };
                        };
                        www.pinindex = 0;
                        var base = 'images/32/';
                        www.addPin = addPin = function (item) {
                        
                            if (item.pinAdded) {
                                return;
                            }
                            item.pinAdded = true;
                            if (!item || !item.type) {

                                return;
                            }
                            www.pinindex = www.pinindex + 1;
                            var location = new Microsoft.Maps.Location(item.latitude, item.longitude);
                            var pin = new Microsoft.Maps.Pushpin(location,
                            {
                                icon: 'images/pushpin.png',
                                width: 40,
                                id: item.id,
                                height: 69,
                                text: www.pinindex.toString(),
                                textOffset: new Microsoft.Maps.Point(5, 20)
                            });

                            function PushpinItem(pushpin, item) {
                                this.pushpinitem = pushpin;
                                this.item = item;
                            }
                            try{
                                www.Pins.push(new PushpinItem(pin, item));
                                Microsoft.Maps.Events.addHandler(pin, 'click', www.pinClicker(item, location, function () {

                                    var index = www.listView.indexOfElement(document.querySelector('img[alt="' + item.index + '"]'));
                                    if (index != -1) {
                                        www.listView.ensureVisible(index);
                                        www.listView.selection.set(index);
                                        www.listView.indexOfFirstVisible = index;
                                        www.selectedIndex = index;
                                    }
                                    index = Math.max(index, 0);

                                }));

                                var type = item.type;
                                var a = www.layers["all"] && www.layers["all"].push && www.layers["all"].push(pin);

                                item.pinAdded = true;
                            }
                            catch (ex) { }
                        };
                    })();
                    var names = [];
                    www.addGroupLayers = function () {
                        var layer = www.layers["all"] = new Microsoft.Maps.EntityCollection();
                        map.entities.push(layer);
                        names.push("all");
                        www.addGroupLayers = function () { };
                    };

                    www.infoLayer = new Microsoft.Maps.EntityCollection();
                    map.entities.push(www.infoLayer);
                    www.layers.visit = function (func) {
                        names.forEach(function (name) {
                            func(www.layers[name], name);
                        });
                    };
                    www.layers.others = function (name, func) {
                        www.layers.visit(function (layer, n) {
                            if (name !== n) {
                                func(layer, n);
                            }
                        });
                    };
                })();

                //function for adding group layer
                (function () {
                    www.only = function (name) {
                        if (www.layers[name]) {
                            www.layers[name].setOptions({ visible: true });
                            www.layers.others(name, function (layer) {
                                layer.setOptions({ visible: false });
                            });
                        }
                    };
                })();

                //function for getting all the data
                (function () {

                    var distance;
                    (function () {
                        var rad = function (deg) {
                            return deg * Math.PI / 180;
                        };
                        distance = www.distance = function (to, from) {
                            var r = 6371;
                            var lat1 = rad(to.latitude);
                            var lon1 = rad(to.longitude);
                            var lat2 = rad(from[0]);
                            var lon2 = rad(from[1]);
                            var dLat = lat2 - lat1;
                            var dLon = lon2 - lon1;
                            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                Math.cos(lat1) * Math.cos(lat2) *
                                Math.sin(dLon / 2) * Math.sin(dLon / 2);
                            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                            var d = r * c;
                            return Math.round((d / 1.609344) * 10) / 10;
                        };

                    })();
                    var progress = www.isdataloaded = document.querySelector('progress#results_progress');
                    var contains = function (box, point) {
                        var latitude = point.latitude;
                        var longitude = point.longitude;
                        var r = latitude < box.getNorth() && latitude > box.getSouth()
                            && longitude > box.getWest() && longitude < box.getEast();
                        return r;
                    };
                    var from;
                    var cityStateZip = function (a) {
                        return (a && a.city && a.city + ', ' + a.state + ' ' + a.zip) || '';
                    };
                    www.pinLists = {};
                    var dupes = {};
                    www.searchText = function (item) {
                        return (item.searchText = [
                            item.code,
                            item.phone,
                            item.name,
                            item.type,
                            item.description
                        ].join('\n').toLowerCase());
                    };

                    //function for adding group item
                    var addItem = function (item) {
                        var location = item['location' in item ? 'location' : 'location_1'];
                        var address = (JSON.parse(location.human_address || '{ "address": "" }') || { address: '' });
                        var details = {
                            id: item[':id'],
                            code: item.sub_category || item.building_code || '',
                            phone: item.phone || item.main_phone_number || 'n/a',
                            name: item.name || item.building_,
                            type: /library/i.test(item.sub_category || '') ? 'Libraries' : item.category || item.type_of_service,
                            hours: item.hours || 'n/a',
                            features: item.features || '',
                            description: item.description || '',
                            where: item.location || item.location_1,
                            address: address.address,
                            city: address.city,
                            city_state_zip: cityStateZip(address),
                            title: item.name || item.building_,
                            website: item.website || '',
                            item: item
                        };
                        details.map = www.citygroupurl +
                            details.where.latitude + '~' +
                            details.where.longitude +
                            details.where.latitude + '_' +
                            details.where.longitude + '_' +
                            encodeURIComponent(details.name);
                        var key = details.name.replace(/\s?\-.*?$/, '');
                        details.title = details.name = key;
                        if (!dupes[key + details.type]) {
                            dupes[key + details.type] = 1;
                            if (item.photo) {
                                details.photo = item.photo;
                            }
                            var comments = www.comments[details.id];
                            details.commentCount = comments ? comments.length : 0;
                            details.plural = details.commentCount > 1 || details.commentCount === 0 ? 's' : '';
                            if (/^C/.test(details.type)) {
                                details.type = details.type.replace(/^Cook County /, '');
                            }
                            var d;
                            (function () {
                                d = distance(from, details.where);
                                details.dist = d;
                                details.distance = d > 1 ? d + ' miles' : d ? d + ' mile' : 'less than a mile';
                            })();
                            details.group = www.groups[details.type];
                            www.items = www.items || [];
                            www.items[details.type] = www.items[details.type] || [];
                            www.items.push(details);
                            www.items[details.type].push(details);
                            www.items[details.type][details.id] = details;
                            if (www.groups[details.type]) {
                                details.backgroundImage = details.photo || 'images/250/w/' + details.type + '.png'
                                www.list.push(details);
                                www.pinLists[details.type] = www.pinLists[details.type] || [];
                                www.pinLists[details.type].push(details);
                            }

                        }
                    };

                    www.groups = [];
                    //function for adding group
                    var addGroup = function (item) {
                        var name;
                        var city;
                        if (inneritem.nodeName == "city") {
                            city = inneritem.innerText.trim();
                        }
                        if (inneritem.nodeName == "dataset_name") {
                            name = inneritem.innerText.trim();
                        }
                        if (inneritem.nodeName == "api_url") {
                            url = inneritem.innerText.trim();
                        }
                        var base = 'images/250new/Community Centers.png';

                        if (name && !www.groups[name]) {
                            var c = { key: city, title: city };
                            var g = { key: name, title: name, subtitle: ' ', description: ' ', backgroundImage: base, tileindex: www.groups.length, citygroup: c };
                            www.groups.push(g);
                            www.groups[name] = g;
                        }
                    };
                    var baseUrl = www.citygroupurl;
                    var url = baseUrl;
                    //method for check file is exists or not ?
                    var isfileExits = function () {
                        try {
                            progress.classList.add('shown');
                            WinJS.Application.local.exists('GovFinderData.xml').done(
                            function (result) {
                                if (result == true) {
                                    isdataloaded = 0;
                                    loadXmlFile();
                                }
                                else {
                                    www.downloadxmloninstall();
                                }
                            });
                        }
                        catch (ex) { }
                        finally {
                            awaitmethod();
                        }
                    };
                    function awaitmethod() {
                        WinJS.Promise.timeout(100).then(
                          function (complete) {
                              if (isdataloaded == 1) {
                                  downloadxmldata();
                              }
                              else {
                                  awaitmethod();
                              }
                          });
                    }
                    //method for download xml data from uri and save into a local file(every time when app launch)
                    var downloadxmldata = function () {
                        try {
                            var isNetAvailable = www.checknetwork();
                            if (isNetAvailable) {

                                var uri = new Windows.Foundation.Uri(www.citygroupurl);
                                Windows.Data.Xml.Dom.XmlDocument.loadFromUriAsync(uri).then(function (doc) {
                                    var folder = Windows.Storage.ApplicationData.current.localFolder;
                                    folder.createFileAsync("GovFinderData.xml", Windows.Storage.CreationCollisionOption.replaceExisting).done(function (file) {
                                        doc.saveToFileAsync(file).done(function () {

                                        });
                                    });
                                });
                            }
                        }
                        catch (ex) { }
                    };
                    //method for download xml data from uri and save into a local file(when app first time install)
                    www.downloadxmloninstall = function () {
                        try {
                             var isNetAvailable = www.checknetwork();
                             if (isNetAvailable) {
                                 progress.classList.add('shown');
                                var uri = new Windows.Foundation.Uri(www.citygroupurl);
                                Windows.Data.Xml.Dom.XmlDocument.loadFromUriAsync(uri).then(function (doc) {
                                    var folder = Windows.Storage.ApplicationData.current.localFolder;
                                    folder.createFileAsync("GovFinderData.xml", Windows.Storage.CreationCollisionOption.replaceExisting).done(function (file) {
                                        doc.saveToFileAsync(file).done(function () {
                                            //isfileExits();
                                            isdataloaded = 0;
                                            loadXmlFile();
                                        });
                                       
                                    });
                                });
                            }
                        }
                        catch (ex) { }
                    };
                    //method for load data from URL 
                     www.loadXmlFormURL = function () {
                         try {
                             progress.classList.add('shown');
                             www.refreshcompleted = 0;
                            var allCitiesList = [];
                            var from;
                            var checkcity = '';
                            var uri = new Windows.Foundation.Uri(www.citygroupurl);
                                var loadSettings = new Windows.Data.Xml.Dom.XmlLoadSettings;
                                loadSettings.prohibitDtd = false;
                                loadSettings.resolveExternals = false;
                                Windows.Data.Xml.Dom.XmlDocument.loadFromUriAsync(uri, loadSettings).then(function (doc) {
                                    if (www.location != null && www.location.current != null) {
                                        from = www.location.current;
                                    }
                                    else {
                                        from = map.getCenter();
                                    }
                                    if (!from || !contains(map.getBounds(), from)) {
                                        www.setCurrentPin(from);
                                    }
                                    www.citygrouplist = new WinJS.Binding.List();
                                    www.list = new WinJS.Binding.List();
                                    www.dynamiccitylist = new WinJS.Binding.List();
                                    var value = doc.getElementsByTagName("response");
                                    var y = doc.getElementsByTagName("row");
                                    var xmlData = [];
                                    var tileIndex = 0;
                                    y.forEach(function (item) {
                                        var innerNodes = item.childNodes;
                                        var cityname;
                                        var datasetname;
                                        var isvalid;
                                        var url;
                                        var name;
                                        var phone;
                                        var subtitle;
                                        var image;
                                        var latitude;
                                        var longitude;
                                        innerNodes.forEach(function (inneritem) {
                                            if (inneritem.nodeName == "isvalid") {
                                                isvalid = inneritem.innerText.trim().toLowerCase();
                                            }
                                            if (inneritem.nodeName == "city") {
                                                cityname = inneritem.innerText.trim();
                                            }
                                            if (inneritem.nodeName == "dataset_name") {
                                                datasetname = inneritem.innerText.trim();
                                            }
                                            if (inneritem.nodeName == "api_url") {
                                                url = inneritem.innerText.trim();
                                            }
                                            if (inneritem.nodeName == "name") {
                                                name = inneritem.innerText.trim().toLowerCase();
                                            }
                                            if (inneritem.nodeName == "phone") {
                                                phone = inneritem.innerText.trim();
                                            }
                                            if (inneritem.nodeName == "subtitle") {
                                                subtitle = inneritem.innerText.trim();
                                            }
                                            if (inneritem.nodeName == "image") {
                                                image = inneritem.innerText.trim();
                                            }
                                            if (inneritem.nodeName == "latitude") {
                                                latitude = inneritem.innerText.trim();
                                            }
                                            if (inneritem.nodeName == "longitude") {
                                                longitude = inneritem.innerText.trim();
                                            }

                                        });
                                        var citygroup = { key: cityname, title: cityname };
                                        var base = 'images/250new/Community Centers.png';
                                        var base1 = 'images/250/w/Community Centers.png';

                                        if (datasetname) {
                                            if (datasetname.toLowerCase().indexOf("community") != "-1") {
                                                base = 'images/250new/Community Centers.png';
                                                base1 = 'images/250/w/Community Centers.png';
                                            }
                                            else if (datasetname.toLowerCase().indexOf("fire") != "-1") {
                                                base = 'images/250new/Fire Department.png';
                                                base1 = 'images/250/w/Fire Department.png';
                                            }
                                            else if (datasetname.toLowerCase().indexOf("libraries") != "-1") {
                                                base = 'images/250new/Libraries.png';
                                                base1 = 'images/250/w/Libraries.png';
                                            }
                                            else if (datasetname.toLowerCase().indexOf("health") != "-1") {
                                                base = 'images/250new/Health Clinic.png';
                                                base1 = 'images/250/w/Health Clinic.png';
                                            }
                                            else if (datasetname.toLowerCase().indexOf("police") != "-1") {
                                                base = 'images/250new/Police Station.png';
                                                base1 = 'images/250/w/Police Station.png';
                                            }
                                            else if (datasetname.toLowerCase().indexOf("recreation") != "-1") {
                                                base = 'images/250new/Recreation.png';
                                                base1 = 'images/250/w/Recreation.png';
                                            }
                                            else if (datasetname.toLowerCase().indexOf("office") != "-1") {
                                                base = 'images/250new/Representitives Office.png';
                                                base1 = 'images/250/w/Representitives Office.png';
                                            }
                                            else if (datasetname.toLowerCase().indexOf("school") != "-1") {
                                                base = 'images/250new/School.png';
                                                base1 = 'images/250/w/School.png';
                                            }
                                            else if (datasetname.toLowerCase().indexOf("technology") != "-1") {
                                                base = 'images/250new/Technology Centers.png';
                                                base1 = 'images/250/w/Technology Centers.png';
                                            }
                                            else if (datasetname.toLowerCase().indexOf("workforce") != "-1") {
                                                base = 'images/250new/Workforce Center.png';
                                                base1 = 'images/250/w/Workforce Center.png';
                                            }
                                            else {
                                                base = 'images/250new/Community Centers.png';
                                                base1 = 'images/250/w/Community Centers.png';
                                            }
                                        }

                                        var data = {
                                            key: datasetname, City: cityname, citygroup: citygroup,
                                            title: datasetname, backgroundImage: base, backgroundImageSearch: base1,
                                            DataSetName: datasetname, Url: url, tileIndex: tileIndex, isvalid: isvalid, name: name,
                                            phone: phone, subtitle: subtitle, image: image, latitude: latitude, longitude: longitude
                                        };
                                        if (url && isvalid == "1" || isvalid == "true") {
                                            xmlData.push(data);
                                            www.citygrouplist.push(data);
                                            www.groups.push(data);
                                            www.groups[name] = data;
                                            allCitiesList.push(data.City);
                                        }


                                    });

                                    function GetUnique(inputArray) {
                                        var outputArray = [];
                                        var returnArray = [];
                                        for (var i = 0; i < inputArray.length; i++) {
                                            if (outputArray[inputArray[i]] == null) {
                                                outputArray[inputArray[i]] = [];
                                                returnArray.push(inputArray[i]);
                                            }
                                            else {

                                            }
                                        }
                                        return returnArray;
                                    }

                                    var hist = GetUnique(allCitiesList);
                                    hist.forEach(function (item) {
                                        www.dynamiccitylist.push(item.toUpperCase());
                                    });
                                    www.dynamiccitylist.sort(function (a, b) {
                                        return (a < b) ? -1 : (a > b) ? 1 : 0;
                                    });

                                    var localSettings = Windows.Storage.ApplicationData.current.localSettings;
                                    if (localSettings.values["savedcity"] == null) {
                                        localSettings.values["savedcity"] = www.dynamiccitylist._keyMap[1].data;
                                        www.defaultselectedcity = localSettings.values["savedcity"];
                                    }                                    

                                    www.allcityloaded = 1;
                                    www.citygrouplist.sort(function (a, b) {
                                        return (a.title < b.title) ? -1 : (a.title > b.title) ? 1 : 0;
                                    });
                                    //if (www.arguments == "") {
                                        www.citygrouplist.forEach(function (item) {
                                            if (www.defaultselectedcity != null) {
                                                if (item.City.toLowerCase() == www.defaultselectedcity.toLocaleLowerCase()) {
                                                    www.citybindlist.push(item);
                                                }
                                            }
                                            else {
                                                www.citygrouplist.forEach(function (item) {
                                                    if (www.dynamiccitylist._keyMap[1].data.toLowerCase() == item.City.toLowerCase()) {
                                                        if (www.dynamiccitylist._keyMap[1].data.toLowerCase() == item.City.toLowerCase()) {
                                                            www.citybindlist.push(item);
                                                        }
                                                    }
                                                });

                                            }
                                        });
                                    //}
                                    if (www.groups) {
                                        www.addGroupLayers();
                                    }
                                    progress.classList.remove('shown');
                                    isdataloaded = 1;
                                    www.refreshcompleted = 1;
                                });
                          
                        }
                        catch (ex) { }
                    };
                    //method for load data from xml file
                    var loadXmlFile = function () {
                        try {
                            var allCitiesList = [];
                            www.refreshcompleted = 0;
                            var from;
                            var checkcity = '';
                         
                            var folder = Windows.Storage.ApplicationData.current.localFolder;
                            folder.getFileAsync("GovFinderData.xml").done(function (file) {
                                var loadSettings = new Windows.Data.Xml.Dom.XmlLoadSettings;
                                loadSettings.prohibitDtd = false;
                                loadSettings.resolveExternals = false;
                                Windows.Data.Xml.Dom.XmlDocument.loadFromFileAsync(file, loadSettings).then(function (doc) {
                                    if (www.location != null && www.location.current != null) {
                                        from = www.location.current;
                                    }
                                    else {
                                        from = map.getCenter();
                                    }
                                    if (!from || !contains(map.getBounds(), from)) {
                                        www.setCurrentPin(from);
                                    }
                                   
                                    www.list = new WinJS.Binding.List();
                                    www.dynamiccitylist = new WinJS.Binding.List();                                 
                                    var value = doc.getElementsByTagName("response");
                                    var y = doc.getElementsByTagName("row");
                                    var xmlData = [];
                                    var tileIndex = 0;
                                    y.forEach(function (item) {
                                        var innerNodes = item.childNodes;
                                        var cityname;
                                        var datasetname;
                                        var isvalid;
                                        var url;
                                        var name;
                                        var phone;
                                        var subtitle;
                                        var image;
                                        var latitude;
                                        var longitude;
                                        innerNodes.forEach(function (inneritem) {
                                            if (inneritem.nodeName == "isvalid") {
                                                isvalid = inneritem.innerText.trim().toLowerCase();
                                            }
                                            if (inneritem.nodeName == "city") {
                                                cityname = inneritem.innerText.trim();
                                            }
                                            if (inneritem.nodeName == "dataset_name") {
                                                datasetname = inneritem.innerText.trim();
                                            }
                                            if (inneritem.nodeName == "api_url") {
                                                url = inneritem.innerText.trim();
                                            }
                                            if (inneritem.nodeName == "name") {
                                                name = inneritem.innerText.trim().toLowerCase();
                                            }
                                            if (inneritem.nodeName == "phone") {
                                                phone = inneritem.innerText.trim();
                                            }
                                            if (inneritem.nodeName == "subtitle") {
                                                subtitle = inneritem.innerText.trim();
                                            }
                                            if (inneritem.nodeName == "image") {
                                                image = inneritem.innerText.trim();
                                            }
                                            if (inneritem.nodeName == "latitude") {
                                                latitude = inneritem.innerText.trim();
                                            }
                                            if (inneritem.nodeName == "longitude") {
                                                longitude = inneritem.innerText.trim();
                                            }

                                        });
                                        var citygroup = { key: cityname, title: cityname };
                                        var base = 'images/250new/Community Centers.png';
                                        var base1 = 'images/250/w/Community Centers.png';

                                        if (datasetname) {
                                            if (datasetname.toLowerCase().indexOf("community") != "-1") {
                                                base = 'images/250new/Community Centers.png';
                                                base1 = 'images/250/w/Community Centers.png';
                                            }
                                            else if (datasetname.toLowerCase().indexOf("fire") != "-1") {
                                                base = 'images/250new/Fire Department.png';
                                                base1 = 'images/250/w/Fire Department.png';
                                            }
                                            else if (datasetname.toLowerCase().indexOf("libraries") != "-1") {
                                                base = 'images/250new/Libraries.png';
                                                base1 = 'images/250/w/Libraries.png';
                                            }
                                            else if (datasetname.toLowerCase().indexOf("health") != "-1") {
                                                base = 'images/250new/Health Clinic.png';
                                                base1 = 'images/250/w/Health Clinic.png';
                                            }
                                            else if (datasetname.toLowerCase().indexOf("police") != "-1") {
                                                base = 'images/250new/Police Station.png';
                                                base1 = 'images/250/w/Police Station.png';
                                            }
                                            else if (datasetname.toLowerCase().indexOf("recreation") != "-1") {
                                                base = 'images/250new/Recreation.png';
                                                base1 = 'images/250/w/Recreation.png';
                                            }
                                            else if (datasetname.toLowerCase().indexOf("office") != "-1") {
                                                base = 'images/250new/Representitives Office.png';
                                                base1 = 'images/250/w/Representitives Office.png';
                                            }
                                            else if (datasetname.toLowerCase().indexOf("school") != "-1") {
                                                base = 'images/250new/School.png';
                                                base1 = 'images/250/w/School.png';
                                            }
                                            else if (datasetname.toLowerCase().indexOf("technology") != "-1") {
                                                base = 'images/250new/Technology Centers.png';
                                                base1 = 'images/250/w/Technology Centers.png';
                                            }
                                            else if (datasetname.toLowerCase().indexOf("workforce") != "-1") {
                                                base = 'images/250new/Workforce Center.png';
                                                base1 = 'images/250/w/Workforce Center.png';
                                            }
                                            else {
                                                base = 'images/250new/Community Centers.png';
                                                base1 = 'images/250/w/Community Centers.png';
                                            }
                                        }

                                        var data = {
                                            key: datasetname, City: cityname, citygroup: citygroup,
                                            title: datasetname, backgroundImage: base, backgroundImageSearch: base1,
                                            DataSetName: datasetname, Url: url, tileIndex: tileIndex, isvalid: isvalid, name: name,
                                            phone: phone, subtitle: subtitle, image: image, latitude: latitude, longitude: longitude
                                        };
                                        if (url && isvalid == "1" || isvalid=="true") {
                                            xmlData.push(data);
                                            www.citygrouplist.push(data);
                                       
                                            www.groups.push(data);
                                            www.groups[name] = data;
                                            allCitiesList.push(data.City);
                                        }


                                    });

                                    function GetUnique(inputArray) {
                                        var outputArray = [];
                                        var returnArray = [];
                                        for (var i = 0; i < inputArray.length; i++) {
                                            if (outputArray[inputArray[i]] == null) {
                                                outputArray[inputArray[i]] = [];
                                                returnArray.push(inputArray[i]);
                                            }
                                            else {

                                            }
                                        }
                                        return returnArray;
                                    }

                                    var hist = GetUnique(allCitiesList);
                                    hist.forEach(function (item) {
                                        www.dynamiccitylist.push(item.toUpperCase());
                                    });
                                    www.dynamiccitylist.sort(function (a, b) {
                                        return (a < b) ? -1 : (a > b) ? 1 : 0;
                                    });

                                    var localSettings = Windows.Storage.ApplicationData.current.localSettings;
                                    if (localSettings.values["savedcity"] == null) {
                                        localSettings.values["savedcity"] = www.dynamiccitylist._keyMap[1].data;
                                        www.defaultselectedcity = localSettings.values["savedcity"];
                                    }

                                    www.allcityloaded = 1;
                                    www.citygrouplist.sort(function (a, b) {
                                        return (a.title < b.title) ? -1 : (a.title > b.title) ? 1 : 0;
                                    });
                                   // if (www.arguments == "") {
                                        www.citygrouplist.forEach(function (item) {
                                            if (www.defaultselectedcity != null) {
                                                if (item.City.toLowerCase() == www.defaultselectedcity.toLocaleLowerCase()) {
                                                    www.citybindlist.push(item);
                                                }
                                            }
                                            else {
                                                www.citygrouplist.forEach(function (item) {
                                                    if (www.dynamiccitylist._keyMap[1].data.toLowerCase() == item.City.toLowerCase()) {
                                                        if (www.dynamiccitylist._keyMap[1].data.toLowerCase() == item.City.toLowerCase()) {
                                                            www.citybindlist.push(item);
                                                        }
                                                    }
                                                });

                                            }
                                        });
                                    //}
                                    if (www.groups) {
                                        www.addGroupLayers();
                                    }
                                    progress.classList.remove('shown');
                                    isdataloaded = 1;
                                    www.refreshcompleted = 1;
                                });
                            });
                        }
                        catch (ex) { }
                    };
                    www.loaditems = function (group) {
                        www.isdataloaded = document.querySelector('progress#results_progress');
                        www.isdataloaded.classList.add('shown');
                        www.isitemloaded = 0;
                        var id = 0;
                        var check = 0;
                        var results = [];
                        var from;
                        var list = [];
                        var latitude;
                        var longitude;
                        for (var i = 1; i <= www.list.length; i++) {
                            if (www.list._keyMap[i].data.type == group.DataSetName) {
                                check = 1;
                                break;
                            }
                        }
                        function CheckIfExist(arg) {
                            if (arg.type == group.DataSetName) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                        var baseUrl = new Windows.Foundation.Uri(group.Url);
                        // var baseUrl = group.Url;
                        var fetchItems = function (offset, next) {
                            url = baseUrl;
                            try {
                                //  if (check == 0) {
                             
                                    var loadSettings = new Windows.Data.Xml.Dom.XmlLoadSettings;
                                    Windows.Data.Xml.Dom.XmlDocument.loadFromUriAsync(url, loadSettings).then(function (doc1) {
                                        if (www.location != null && www.location.current != null) {
                                            from = www.location.current;
                                        }
                                        else {
                                            from = map.getCenter();
                                        }
                                        if (!from || !contains(map.getBounds(), from)) {
                                            www.setCurrentPin(from);
                                        }
                                        var value = doc1.getElementsByTagName("response");

                                        var y = doc1.getElementsByTagName("row");
                                        y.forEach(function (item1) {
                                            var innerNodes1 = item1.childNodes;

                                            var name = "";
                                            var phone = "";
                                            var subtitle = "";
                                            var image = "";
                                            var latitude = 0;
                                            var latlog = [];
                                            var longitude = 0;
                                            var location1 = 0;
                                            innerNodes1.forEach(function (inneritem1) {

                                                if (inneritem1.nodeName == group.name) {
                                                    name = inneritem1.innerText.trim().toLowerCase();
                                                }
                                                if (inneritem1.nodeName == group.phone) {
                                                    phone = inneritem1.innerText.trim();
                                                }
                                                if (inneritem1.nodeName == group.image) {
                                                    image = inneritem1.innerText.trim();
                                                }
                                                if (inneritem1.nodeName == group.subtitle) {
                                                    subtitle = inneritem1.innerText.trim();
                                                }
                                                if (inneritem1.nodeName == group.latitude) {
                                                    latitude = inneritem1.innerText.trim();
                                                    latlog.push(latitude);
                                                }
                                                if (inneritem1.nodeName == group.longitude) {
                                                    longitude = inneritem1.innerText.trim();
                                                    latlog.push(longitude);
                                                }
                                                if (inneritem1.nodeName == "location") {
                                                    latlog = [];
                                                 
                                                    inneritem1.attributes.forEach(function (item) {
                                                        if (item.nodeName == "latitude") {
                                                             latitude = 0;                     
                                                            latitude = item.innerText.trim();
                                                            latlog.push(latitude);
                                                        }
                                                        if (item.nodeName == "longitude") {
                                                             longitude = 0;
                                                            longitude = item.innerText.trim();
                                                            latlog.push(longitude);
                                                        }
                                                    });

                                                }

                                            });

                                            try {
                                                id = id + 1;
                                                var loc = '';
                                                var address = '';
                                                var city = '';
                                                var d = 0
                                                var lat = latitude || 0;
                                                var log = longitude || 0;
                                                if (latlog.length != 0) {
                                                    d = distance(from, latlog);
                                                }
                                                else {
                                                    var currentloc = map.getCenter();
                                                    latlog[0] = currentloc.latitude;
                                                    latlog[1] = currentloc.longitude;
                                                    lat = currentloc.latitude;
                                                    log = currentloc.longitude;
                                                    d = distance(from, latlog);
                                                   
                                                }
                                                var mainname = name || '';
                                               
                                                var subtitle = subtitle || '';
                                                var phone = phone || '';
                                                var compositeKey = mainname + '|' + group.DataSetName + '|' + lat.toString() + '|' + log.toString() + '|' + phone + '|' + subtitle;
                                                var key = compositeKey.replace(/\s+/g, '');
                                                var details = {
                                                    id: '',
                                                    code: subtitle,
                                                    backgroundImage: image || 'images/250new/Community Centers.png',
                                                    phone: phone,
                                                    name: mainname,
                                                    type: group.DataSetName,
                                                    hours: item.hours || 'NA',
                                                    features: item.features || '',
                                                    description: item.description || '',
                                                    where: loc,
                                                    compositeKey: key,
                                                    maincity: group.City,
                                                    address: '',
                                                    latitude: lat || 0,
                                                    longitude: log || 0,
                                                    city: city || '',
                                                    city_state_zip: cityStateZip(address),
                                                    title: mainname,
                                                    website: item.website || '',
                                                    item: item,
                                                    dist: d,
                                                    commentCount: 0,
                                                    index: "",
                                                    distance: d > 1 ? d + ' miles' : d ? d + ' mile' : 'less than a mile',
                                                    site_name: mainname,
                                                    tileIndex: 1
                                                };

                                                list.push(details);
                                                if (check == 0) {
                                                    www.list.push(details);
                                                }
                                            }
                                            catch (ex) { }
                                        });

                                        www.cityitemslist = list.sort(function (a, b) {
                                            var distance = a.dist - b.dist;
                                            if (distance == 0) {
                                                return (a.title < b.title) ? -1 : (a.title > b.title) ? 1 : 0;
                                            }
                                            else {
                                                return distance;
                                            }
                                        });
                                        www.cityitemslist.splice(0, 1);
                                        www.loadedgroups.push(group.DataSetName);
                                        www.isitemloaded = 1;
                                    },
                                    function complete() {
                                        if (www.iserror == 0) {
                                            www.isdataloaded.classList.remove('shown');
                                            Windows.UI.Popups.MessageDialog(" The service is not available for this report.").showAsync().done(
                                            function complete() {
                                                WinJS.Navigation.back();
                                            });
                                        }
                                    });
                            }
                            catch (ex) { }
                        };

                        fetchItems(0, function () {

                            fetchItems(10, function () {
                                fetchItems(20);
                            });
                        });
                    };
                    try {
                        var results = [];
                        isfileExits();

                    } catch (ex) {

                    }

                })();
            };

            var isNetAvailable = www.checknetwork();
            if (!isNetAvailable) {
                try {
                    Windows.UI.Popups.MessageDialog("No internet connection available. Please check your internet connection and try again.").showAsync();
                }
                catch (e) {

                }
            }
            //function for setting current location in the map
            (function () {
                var isNetAvailable = www.checknetwork();
                if (isNetAvailable) {
                    try {
                        www.location = {
                            current: null,
                            fetch: function () {
                                try {
                                    var geolocator = Windows.Devices.Geolocation.Geolocator();
                                    geolocator.desiredAccuracy =
                                        Windows.Devices.Geolocation.PositionAccuracy.high;
                                    geolocator.getGeopositionAsync().then(function (loc) {
                                        www.location.current = loc.coordinate;
                                        both(www.map, www.location.current, www.setCurrentPin);
                                    });
                                }
                                catch (ex) { }
                            }
                        };
                        www.location.fetch();
                    }
                    catch (e) {
                    }
                }
            })();

            //load map module and call other data functions
            Microsoft.Maps.loadModule('Microsoft.Maps.Map', { callback: getMap, culture: 'en-US', homeRegion: 'US' });
            (function () {
                function showShareUI() {
                    Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
                }

                function shareLinkHandler(e) {

                    var request = e.request;
                    var s = www.share;

                    request.data.properties.title = 'title';
                    request.data.properties.description = 'description';

                    if (false && s) {

                        request.data.properties.title = s.title;
                        request.data.properties.description = s.description;


                        request.data.setText(s.text);


                    }
                }
                function registerForShare() {
                    var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();

                }
                registerForShare();
            })();
        })();

        var login;
        (function () {
            var date;
            (function () {
                var d = new Date();
                date = d.toDateString().replace(/\w{3}\s/, '').replace(/\s(\d{4})$/, ', $1');
            })();

            (function () {
                try {
                    var isNetAvailable = www.checknetwork(); 
                    if (isNetAvailable) {
                    
                        var item;
                        var id = '';
                        WinJS.xhr({ url: www.productiongetnotification }).then(function (result) {
                            if (result.status === 200) {
                                if (result.responseText) {
                                    if (result.responseText != '[]') {
                                        item = JSON.parse(result.responseText);
                                        var count = item.UpdatedList.length;
                                        if (count != 0) {
                                            var localSettings = Windows.Storage.ApplicationData.current.localSettings;
                                            if (localSettings.values["uniqueId"] == null) {
                                                localSettings.values["uniqueId"] = item.uniqueId;
                                            }
                                            else {
                                                id = localSettings.values["uniqueId"];
                                            }
                                            localSettings.values["TotalUpdatedItems"] = 10;
                                            if (id != item.uniqueId) {
                                                if (id != "") {
                                                    for (var i = 0; i < localSettings.values["TotalUpdatedItems"]; i++) {
                                                        if (localSettings.values["DatasetName" + i] != null) {
                                                            localSettings.values.remove("DatasetName" + i);
                                                            localSettings.values.remove("City" + i);
                                                        }
                                                    }
                                                    localSettings.values.remove("UpdatedItems");
                                                    localSettings.values.remove("TotalUpdatedItems");
                                                }

                                                for (var i = 0; i < count; i++) {
                                                    localSettings.values["DatasetName" + i] = item.UpdatedList[i].DatasetName;
                                                    localSettings.values["City" + i] = item.UpdatedList[i].city
                                                }
                                                localSettings.values["UpdatedItems"] = count;
                                                localSettings.values["TotalUpdatedItems"] = count;
                                                localSettings.values["uniqueId"] = item.uniqueId;

                                                var Notifications = Windows.UI.Notifications;
                                                var tileType = Notifications.TileTemplateType.tileWideBlockAndText01;
                                                var tileXML = Notifications.TileUpdateManager.getTemplateContent(tileType);
                                                var text1Node = tileXML.getElementsByTagName("text")[0];
                                                text1Node.innerText = " ";
                                                var text2Node = tileXML.getElementsByTagName("text")[1];
                                                text2Node.innerText = count;
                                                var text3Node = tileXML.getElementsByTagName("text")[2];
                                                text3Node.innerText = www.notificationmessage;
                                                var tileNotification = new Notifications.TileNotification(tileXML);
                                                var TileUpdater = Notifications.TileUpdateManager.createTileUpdaterForApplication();
                                                TileUpdater.clear();
                                                TileUpdater.enableNotificationQueue(true);
                                                TileUpdater.update(tileNotification);
                                            }
                                            else {
                                                var Notifications = Windows.UI.Notifications;
                                                var tileType = Notifications.TileTemplateType.tileWideBlockAndText01;
                                                var tileXML = Notifications.TileUpdateManager.getTemplateContent(tileType);
                                                var text1Node = tileXML.getElementsByTagName("text")[0];
                                                text1Node.innerText = " ";
                                                var text2Node = tileXML.getElementsByTagName("text")[1];
                                                text2Node.innerText = localSettings.values["UpdatedItems"];
                                                var text3Node = tileXML.getElementsByTagName("text")[2];
                                                text3Node.innerText = www.notificationmessage;
                                                var tileNotification = new Notifications.TileNotification(tileXML);
                                                var TileUpdater = Notifications.TileUpdateManager.createTileUpdaterForApplication();
                                                TileUpdater.clear();
                                                TileUpdater.enableNotificationQueue(true);
                                                TileUpdater.update(tileNotification);
                                            }
                                        }
                                      
                                    }
                                    if (localSettings.values["UpdatedItems"] == 0) {
                                        try {
                                            var Notifications = Windows.UI.Notifications;
                                            var TileUpdater = Notifications.TileUpdateManager.createTileUpdaterForApplication();
                                            TileUpdater.clear();
                                        }
                                        catch (ex) { }
                                    }
                                }
                            }
                        }, function () {
                            var error = "";
                        });
                    }
                } catch (e) {

                }
            })();
        })();

    };
    (function () {
        www.checknetwork = function isConnected() {
            var connectivity = Windows.Networking.Connectivity;
            var profile = connectivity.NetworkInformation.getInternetConnectionProfile();
            if (profile) {
                return (profile.getNetworkConnectivityLevel() != Windows.Networking.Connectivity.NetworkConnectivityLevel.none);
            }
            else {
                return false;
            }
        };
    })();
})();


