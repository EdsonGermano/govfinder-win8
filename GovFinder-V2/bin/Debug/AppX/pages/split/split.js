(function () {
    "use strict";
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var binding = WinJS.Binding;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;
    var utils = WinJS.Utilities;
    var pushpinitemlist = [];
    var checkbackbutton;
    var isfirsttimeUI = 0;
    www.checksearch = 0;
    var url;
    var group;
    var _this;
    var timecount;
    var compositeKey = '';
    www.maincity = '';
    www.reportName = '';
    var latestdata;
    www.commentcounts = 0;
    ui.Pages.define("/pages/split/split.html", {

        _items: null,
        _sorteditems: null,
        _group: null,
        _itemSelectionIndex: -1,
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            www.iserror = 0;        
           //www.citygrouplist
            www.citybindlist.forEach(function (item) {
                if (options.groupKey == item.DataSetName) {
                    latestdata = item;
                }
            });
            if (www.checkfortileclick == 0) {
                try{
                    var localSettings = Windows.Storage.ApplicationData.current.localSettings;
                    var count = localSettings.values["TotalUpdatedItems"];
                    if (count != 0) {
                        for (var i = 0; i < count; i++) {
                            if (localSettings.values["DatasetName" + i] == latestdata.DataSetName && localSettings.values["City" + i] == latestdata.City) {
                                localSettings.values["UpdatedItems"] = localSettings.values["UpdatedItems"] - 1;
                                if (localSettings.values["DatasetName" + i] != null) {
                                    localSettings.values.remove("DatasetName" + i);
                                    localSettings.values.remove("City" + i);
                                }
                                var Notifications = Windows.UI.Notifications;
                                var tileType = Notifications.TileTemplateType.tileWideBlockAndText01;
                                var tileXML = Notifications.TileUpdateManager.getTemplateContent(tileType);
                                var text1Node = tileXML.getElementsByTagName("text")[0];
                                text1Node.innerText = " ";
                                var text2Node = tileXML.getElementsByTagName("text")[1];
                                text2Node.innerText = localSettings.values["UpdatedItems"];
                                var text3Node = tileXML.getElementsByTagName("text")[2];
                                text3Node.innerText = "item updated";
                                var tileNotification = new Notifications.TileNotification(tileXML);
                                var TileUpdater = Notifications.TileUpdateManager.createTileUpdaterForApplication();
                                TileUpdater.clear();
                                TileUpdater.enableNotificationQueue(true);
                                TileUpdater.update(tileNotification);

                            }
                        }
                        if (localSettings.values["UpdatedItems"] == 0) {
                            try {
                                var Notifications = Windows.UI.Notifications;
                                var TileUpdater = Notifications.TileUpdateManager.createTileUpdaterForApplication();
                                TileUpdater.clear();
                            }
                            catch (ex) {
                              
                            }
                        }
                    }
                   
                }
                catch (ex) {
                   
                }
                
            }
            //   this._group = (options && options.groupKey) ? Data.resolveGroupReference(options.groupKey) : Data.datasets.getAt(0);
            this._group = latestdata;
            _this = this;
            group = this._group;
            _this._itemSelectionIndex = (options && "selectedIndex" in options) ? options.selectedIndex : -1;
            if (www.checkmap == 0) {
                if (_this._itemSelectionIndex == -1) {
                    www.layers["all"].clear();
                }
            }

            document.getElementById("comments").addEventListener("click", commentslist, false);
            document.getElementById("addnewcomment").addEventListener("click", addnewcomment, false);
            document.getElementById("newcommentadd").addEventListener("click", newcomment, false);
            document.getElementById("cmdPin").addEventListener("click", PinItem, false);
            document.getElementById("cmdUnpin").addEventListener("click", UnPinItem, false);
            document.getElementById("cmdRefresh").addEventListener("click", Refresh, false);
            document.getElementById("cmdMapView").addEventListener("click", SwitchToMapView, false);
            document.getElementById("appbartop").winControl.hide();
            var check = 0;
            timecount = 0;
            checkbackbutton = 0;
            www.checkfortileclick = 0;
            var isNetAvailable = www.checknetwork();
            if (!isNetAvailable) {
              
                document.getElementById("cmdPin").style.visibility = "collapse";
                document.getElementById("cmdUnpin").style.visibility = "collapse";
              
            }
            www.group = options.groupKey;
            if (www.checkmap == 0) {
                www.loaditems(this._group);
                timecount = 300;
            }
            www.checkmap = 0;
            GetDataHold();
            _this._updateVisibility();
            function GetDataHold() {
                WinJS.Promise.timeout(timecount).then(
                  function (complete) {
                      try {
                          if (checkbackbutton == 0) {
                              if (www.isitemloaded == 1) {
                                  www.map.setView({ zoom: www.mapzoom });
                                  var index = 0;
                                  www.cityitemslist.forEach(function (item) {
                                      index++;
                                      item.index = index;
                                      item.id = index;
                                  });
                                
                                  document.getElementById("cmdPin").disabled = false;
                                  document.getElementById("cmdUnpin").disabled = false;
                                  document.getElementById("cmdRefresh").disabled = false;
                                  document.getElementById("cmdMapView").disabled = false;
                                  www.isitemloaded = 0;
                                  isfirsttimeUI = 1;
                                  var list = new WinJS.Binding.List(www.cityitemslist);
                               
                                  document.getElementById("detailsection").style.visibility = 'visible';
                                  var listView = element.querySelector(".itemlist").winControl;
                                  www.listView = listView;
                                  // Set up the ListView.
                                  listView.itemDataSource = list.dataSource;
                                  listView.itemTemplate = element.querySelector(".itemtemplate");
                                  listView.onselectionchanged = _this._selectionChanged.bind(_this);
                                  listView.layout = new ui.ListLayout();

                                  (function () {
                                      var m = www.m = www.m || document.querySelector('div#map');
                                      m.classList.add('shown');
                                      var ac = document.querySelector('div.article-content');
                                      ac.appendChild(m);
                                      if (_this._group) {
                                          www.only(_this._group.title);
                                      }
                                  })();
                                  if (_this._isSingleColumn()) {
                                      if (_this._itemSelectionIndex >= 0) {
                                          // For single-column detail view, load the article.
                                          binding.processAll(element.querySelector(".articlesection"), (_this._itemSelectionIndex));
                                          if (nav.history.backStack.length >= 3 && nav.history.backStack[nav.history.backStack.length - 1].location === "/pages/split/split.html" && nav.history.backStack[nav.history.backStack.length - 2].location === "/pages/split/split.html") {
                                              nav.history.backStack.pop();
                                          }
                                      }
                                  } else {
                                      if (nav.canGoBack && nav.history.backStack[nav.history.backStack.length - 1].location === "/pages/split/split.html") {
                                          // Clean up the backstack to handle a user snapping, navigating
                                          // away, unsnapping, and then returning to this page.
                                          nav.history.backStack.pop();
                                      }
                                      // If this page has a selectionIndex, make that selection
                                      // appear in the ListView.
                                      listView.selection.set(Math.max(_this._itemSelectionIndex, 0));
                                  }
                                  www.isdataloaded.classList.remove('shown');

                              }
                              else {
                                  GetDataHold();
                              }
                          }
                          else {
                              www.isdataloaded.classList.remove('shown');
                          }
                      }
                      catch (ex) { }

                  });
            };

            try {
                var title = this._group.title.toString();
                element.querySelector("header[role=banner] .pagetitle").textContent = title.substring(0,25);
            } catch (ex) { }

        },

        unload: function () {
            www.ismaploadedfirst = 1;
            www.iserror = 1;
            checkbackbutton = 1;
            if (isfirsttimeUI == 1) {
                document.querySelector('div#map').classList.remove('shown');
                document.querySelector('div#map_holder').appendChild(www.m);
                www.Pins = [];
                www.pinLists = [];
            }
            document.getElementById("appbartop").winControl.hide();

        },

        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {

            var listView = element.querySelector(".itemlist").winControl;
            var firstVisible = listView.indexOfFirstVisible;
            this._updateVisibility();

            var handler = function (e) {
                listView.removeEventListener("contentanimating", handler, false);
                e.preventDefault();
            }

            if (this._isSingleColumn()) {
                listView.selection.clear();
                if (this._itemSelectionIndex >= 0) {
                    // If the app has snapped into a single-column detail view,
                    // add the single-column list view to the backstack.
                    nav.history.current.state = {
                        groupKey: this._group.key,
                        selectedIndex: this._itemSelectionIndex
                    };
                    nav.history.backStack.push({
                        location: "/pages/split/split.html",
                        state: { groupKey: this._group.key }
                    });
                    element.querySelector(".articlesection").focus();
                } else {
                    listView.addEventListener("contentanimating", handler, false);
                    if (firstVisible >= 0 && listView.itemDataSource.list.length > 0) {
                        listView.indexOfFirstVisible = firstVisible;
                    }
                    listView.forceLayout();
                }
            } else {
                // If the app has unsnapped into the two-column view, remove any
                // splitPage instances that got added to the backstack.
                if (nav.canGoBack && nav.history.backStack[nav.history.backStack.length - 1].location === "/pages/split/split.html") {
                    nav.history.backStack.pop();
                }
                if (viewState !== lastViewState) {
                    listView.addEventListener("contentanimating", handler, false);
                    if (firstVisible >= 0 && listView.itemDataSource.list.length > 0) {
                        listView.indexOfFirstVisible = firstVisible;
                    }
                    listView.forceLayout();
                }

                listView.selection.set(this._itemSelectionIndex >= 0 ? this._itemSelectionIndex : Math.max(firstVisible, 0));
            }
        },

        // This function checks if the list and details columns should be displayed
        // on separate pages instead of side-by-side.
        _isSingleColumn: function () {
            var viewState = Windows.UI.ViewManagement.ApplicationView.value;
            return (viewState === appViewState.snapped || viewState === appViewState.fullScreenPortrait);
        },

        _selectionChanged: function (args) {
            document.getElementById("selectedimage").style.visibility = 'visible';
            var listView = document.body.querySelector(".itemlist").winControl;
            var details;
            // By default, the selection is restriced to a single item.
            listView.selection.getItems().done(function updateDetails(items) {
                if (items.length > 0) {
                    www.selectedcityarea = item;
                    if (www.checksearch == 0) {
                        this._itemSelectionIndex = items[0].index;
                    }
                    else {
                        
                        www.list.forEach(function (item) {
                            if (item.index == www.itemid && item.type == www.itemtype) {
                                items[0].data = item;
                               
                            }
                        });
                        www.checksearch = 0;
                    }
                    if (this._isSingleColumn()) {
                        // If snapped or portrait, navigate to a new page containing the
                        // selected item's details.
                        nav.navigate("/pages/split/split.html", { groupKey: this._group.key, selectedIndex: this._itemSelectionIndex });
                    } else {
                        // If fullscreen or filled, update the details column with new data.
                        details = document.querySelector(".articlesection");
                        binding.processAll(details, items[0].data);
                        details.scrollTop = 0;
                    }
               
                    www.selecteditem = items[0].data;
                    var ll = items[0].data;
                    www.id = items[0].data.id;
                    www.title = items[0].data.title;
                    compositeKey = items[0].data.compositeKey;
                    www.maincity = items[0].data.maincity;
                    www.reportName = items[0].data.type;

                    www.indexno = items[0].data.index;
                    (function () {
                        WinJS.Namespace.define("ViewModel.Data", { image: "", code: "", title: "", distance: "", phone: "", commentcount: "", plural: "", indexno: "" });
                        ViewModel.Data.image = items[0].data.backgroundImage,
                        ViewModel.Data.code = items[0].data.code,
                        ViewModel.Data.title = items[0].data.name,
                        ViewModel.Data.distance = items[0].data.distance,
                        ViewModel.Data.phone = items[0].data.phone,
                        ViewModel.Data.commentcount = items[0].data.commentCount;
                        ViewModel.Data.plural = "s";
                        ViewModel.Data.indexno = items[0].data.index;
                    })();
                    WinJS.Binding.processAll(document.querySelector(".itemdetailsection"), ViewModel);

                    (function () {

                        www.pinindex = 0;
                        www.addPin(items[0].data);
                        www.pinClicker(items[0].data)();
                        www.setmapcenter(items[0].data.latitude, items[0].data.longitude);
                        if (www.indexno == 1) {


                            var cmdpin = document.getElementById("cmdPin");
                            var cmdUnpin = document.getElementById("cmdUnpin");
                            cmdpin.style.display = "block";
                            cmdUnpin.style.display = "none";
                            var tileid = (items[0].data.maincity).toString() + (items[0].data.type).toString();
                            tileid = tileid.split(" ").join("");
                            Windows.UI.StartScreen.SecondaryTile.findAllForPackageAsync().done(function (tiles) {
                                tiles.forEach(function (tile) {
                                    if (tile.tileId == tileid) {
                                        var cmdpin = document.getElementById("cmdPin");
                                        var cmdUnpin = document.getElementById("cmdUnpin");
                                        cmdpin.style.display = "none";
                                        cmdUnpin.style.display = "block";
                                    }
                                });
                            });
                        }
                    })();

                    (function () {
                        if (www.cityitemslist[ll.code.length < 0]) {
                            var list = www.cityitemslist.sort(function (a, b) {
                                var distance = a.dist - b.dist;
                                if (distance == 0) {
                                    return (a.title < b.title) ? -1 : (a.title > b.title) ? 1 : 0;
                                }
                                else {
                                    return distance;
                                }
                            });

                            list.forEach(www.addPin);

                            list = [];
                        } else {
                            www.cityitemslist.sort(function (a, b) {
                                var distance = a.dist - b.dist;
                                if (distance == 0) {
                                    return (a.title < b.title) ? -1 : (a.title > b.title) ? 1 : 0;
                                }
                                else {
                                    return distance;
                                }
                            }).forEach(function (item, i) {
                                if (i < 40) {
                                    www.addPin(item);
                                }
                            });

                        }

                    })();
                }
                getcommentcount();
            }.bind(this));
            AddCommentEvent();

        },

        // This function toggles visibility of the two columns based on the current
        // view state and item selection.
        _updateVisibility: function () {
            var oldPrimary = document.querySelector(".primarycolumn");
            if (oldPrimary) {
                utils.removeClass(oldPrimary, "primarycolumn");
            }
            if (this._isSingleColumn()) {
                if (this._itemSelectionIndex >= 0) {
                    utils.addClass(document.querySelector(".articlesection"), "primarycolumn");
                    document.querySelector(".articlesection").focus();
                } else {
                    utils.addClass(document.querySelector(".itemlistsection"), "primarycolumn");
                    document.querySelector(".itemlist").focus();
                }
            } else {
                document.querySelector(".itemlist").focus();
            }
        }


    });

    function PinItem() {
        var listView = document.getElementById("itemsList").winControl;
        listView.selection.getItems().done(function updateDetails(items) {
            // Prepare package images for use as the Tile Logo and Small Logo in our tile to be pinned.
            var uriLogo = new Windows.Foundation.Uri("ms-appx:///images/250new/Community Centers.png");
            var uriSmallLogo = new Windows.Foundation.Uri("ms-appx:///images/250new/Community Centers.png");
            var tileid = listView.selection.getItems()._value[0].data.maincity + listView.selection.getItems()._value[0].data.type;
            tileid = tileid.split(" ").join("");
            var tileActivationArguments = listView.selection.getItems()._value[0].data.type;
            var tile = new Windows.UI.StartScreen.SecondaryTile(tileid,
                                                                listView.selection.getItems()._value[0].data.type,
                                                                listView.selection.getItems()._value[0].data.type,
                                                                tileActivationArguments,
                                                                Windows.UI.StartScreen.TileOptions.showNameOnLogo,
                                                                uriLogo);

            tile.foregroundText = Windows.UI.StartScreen.ForegroundText.light;
            tile.smallLogo = uriSmallLogo;
            tile.requestCreateAsync().then(function (isCreated) {
                if (isCreated) {
                    var cmdpin = document.getElementById("cmdPin");
                    var cmdUnpin = document.getElementById("cmdUnpin");
                    cmdpin.style.display = "none";
                    cmdUnpin.style.display = "block";
                    Windows.UI.Popups.MessageDialog(listView.selection.getItems()._value[0].data.type + " tile pinned to start.").showAsync();
                }
            });
        });
    };

    function UnPinItem() {
        var listView = document.getElementById("itemsList").winControl;
        listView.selection.getItems().done(function updateDetails(items) {
            var tileid = listView.selection.getItems()._value[0].data.maincity + listView.selection.getItems()._value[0].data.type;
            tileid = tileid.split(" ").join("");
            var tileToBeDeleted = new Windows.UI.StartScreen.SecondaryTile(tileid);
            tileToBeDeleted.requestDeleteAsync().then(function (isDeleted) {
                if (isDeleted) {
                    var cmdpin = document.getElementById("cmdPin");
                    var cmdUnpin = document.getElementById("cmdUnpin");
                    cmdpin.style.display = "block";
                    cmdUnpin.style.display = "none";
                }
            });
        });
    };

    function Refresh() {
        www.ismaploadedfirst = 1;
        checkbackbutton = 1;
        if (isfirsttimeUI == 1) {
            document.querySelector('div#map').classList.remove('shown');
            document.querySelector('div#map_holder').appendChild(www.m);
        }
        if (group) {
            WinJS.Navigation.navigate("/pages/split/split.html", { groupKey: group.key });
        }

    };

    function SwitchToMapView() {
        WinJS.Navigation.navigate("/pages/mapview/map.html", { groupKey: www.group });
    };

    function AddCommentEvent() {
        WinJS.Promise.timeout(1000).then(
          function (complete) {
              var commentLoaded = document.getElementById("cmtPushpin");
              if (commentLoaded != null) {
                  commentLoaded.addEventListener("click", commentslist, false);
              }
              else {
                  AddCommentEvent();
              }
          });
    };

    function commentslist() {

        WinJS.Navigation.navigate("/pages/comments/Comments.html", compositeKey);

    };
    function addnewcomment() {

        document.getElementById("commenttitle").value = "";
        document.getElementById("commenttext").value = "";
        // Show the flyout
        var addNewCommentButton = document.getElementById("addnewcomment");
        document.getElementById("newcomment").winControl.show(addNewCommentButton);


    };
    function newcomment() {
        var commenttitle = document.getElementById("commenttitle").value;
        var commenttext = document.getElementById("commenttext").value;
        if (commenttitle != "" && commenttext != "") {
            var login;
            var title = '';
            var id;
            var today;
            (function () {
                www.isdataloaded.classList.add('shown');
                login = login || function (done) {
                    var credentialPickerOptions = new Windows.Security.Credentials.UI.CredentialPickerOptions();
                    credentialPickerOptions.targetName = "Gov Finder";
                    credentialPickerOptions.caption = "Gov Finder";
                    credentialPickerOptions.message = "Sign in to Gov Finder";
                    credentialPickerOptions.authenticationProtocol = Windows.Security.Credentials.UI.AuthenticationProtocol.basic;
                    credentialPickerOptions.alwaysDisplayDialog = true;
                    var credentialPicker = Windows.Security.Credentials.UI.CredentialPicker;
                    try {
                        credentialPicker.pickAsync(credentialPickerOptions).done(
                            function complete(result) {

                                www.credentialPickerResults = result;
                                login = function (done) {
                                    var d = done && done(result.credentialUserName, result.credentialPassword);
                                };
                                var d = done && done(result.credentialUserName, result.credentialPassword);
                            }
                        );
                    } catch (ex) { }
                }
            })();

            (function () {
                var date = new Date();
                today = date;

            })();
            login(function (user, pw) {
                id = www.id;
                title = www.title;
                var commenttitle = document.getElementById("commenttitle").value;
                var commenttext = document.getElementById("commenttext").value;
                var comment = { Id: compositeKey, CityName: www.maincity, ReportName: www.reportName, Author: user, CommentMessage: commenttext, CommentTitle: commenttitle, CommentPublishAt: today };

                var body = { body: JSON.stringify(comment) };
                (function () {
                    try {
                        var addcommenturl = www.addcommenturl;
                        WinJS.xhr({
                            type: 'post',
                            url: addcommenturl,
                            headers: { "Content-type": "application/json" },
                            data: JSON.stringify(comment)
                        }).then(function (result) {

                            try {
                                www.commentcounts++;
                                WinJS.Namespace.define("ViewModel.Data", { commentcount: "" });
                                ViewModel.Data.commentcount = www.commentcounts;
                                WinJS.Binding.processAll(document.querySelector(".itemcommentcounts"), ViewModel);
                                www.isdataloaded.classList.remove('shown');
                                www.pinClicker(www.selecteditem)();
                                Windows.UI.Popups.MessageDialog("Comment saved successfully.").showAsync();
                            }
                            catch (ex) { www.isdataloaded.classList.remove('shown'); }
                        }, function (e) {
                            www.isdataloaded.classList.remove('shown');

                        });
                    }
                    catch (ex) { www.isdataloaded.classList.remove('shown'); }
                })();

            });
        }
        else {
            Windows.UI.Popups.MessageDialog("Comment title or text cannot be empty.").showAsync().then(function () {
                // Show the flyout
                var addNewCommentButton = document.getElementById("addnewcomment");
                document.getElementById("newcomment").winControl.show(addNewCommentButton);
            });
        }
    };
    function getcommentcount() {
        try {
            var isNetAvailable = www.checknetwork();
            if (!isNetAvailable) {
                www.commentcounts = 0;                
                www.pinClicker(www.selecteditem)();
                return;
            }
            var commenturl = www.commentcounturl + compositeKey + '&cityName=' + www.maincity + '&reportName=' + www.reportName + '&IsCommentCount=true';
            WinJS.xhr({ url: commenturl }).then(function (commentresult) {
                if (commentresult.status === 200) {
                    var commentcount = JSON.parse(commentresult.responseText);
                    if (commentcount != null) {
                        (function () {
                            WinJS.Namespace.define("ViewModel.Data", { commentcount: "" });
                            ViewModel.Data.commentcount = commentcount;
                            www.commentcounts = commentcount;
                        })();
                        try {
                            if (checkbackbutton == 0) {
                                WinJS.Binding.processAll(document.querySelector(".itemcommentcounts"), ViewModel);
                                www.pinClicker(www.selecteditem)();
                            }
                        }
                        catch (e) {
                        }
                    }
                }
            });
        }
        catch (ex)
        { }
    }

})();
