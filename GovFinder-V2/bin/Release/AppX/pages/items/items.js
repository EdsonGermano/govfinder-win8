(function () {
    "use strict";

    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var ui = WinJS.UI;
    var listView;
    var tileIndex;
    var selectedcity = '';
    
    ui.Pages.define("/pages/items/items.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
         
       
            listView = element.querySelector(".itemslist").winControl;       
            document.getElementById("cityname").addEventListener("change", changecity, false);
            listView.itemTemplate = element.querySelector(".itemtemplate");
            listView.groupHeaderTemplate = element.querySelector(".headertemplate");
         var localSettings = Windows.Storage.ApplicationData.current.localSettings;
            if (localSettings.values["savedcity"] == null) {
                localSettings.values["savedcity"] = www.defaultselectedcity;
            }
            else {
                www.defaultselectedcity = localSettings.values["savedcity"];
            }

            if (www.defaultselectedcity.toLowerCase()== 'chicago') {
                listView.itemDataSource = www.chicagocity.dataSource;
                selectedcity = 'Chicago';
                document.getElementById("cityname").selectedIndex = 0;
            }
            else if (www.defaultselectedcity.toLowerCase() == 'edmonton') {
                document.getElementById("backgroundimage").style.background = "url('../../images/edBackground.png')";
                listView.itemDataSource = www.edmontoncity.dataSource;
                selectedcity = 'Edmonton';
                document.getElementById("cityname").selectedIndex = 1;
                }
            else if (www.defaultselectedcity.toLowerCase() == 'new york') {
                document.getElementById("backgroundimage").style.background = "url('../../images/nyBackground.png')";
                listView.itemDataSource = www.newyorkcity.dataSource;
                selectedcity = 'New York';
                document.getElementById("cityname").selectedIndex = 2;
                }       
         
            listView.oniteminvoked = this._itemInvoked.bind(this);
            document.getElementById("searchPage").addEventListener("click", ShowSearchPage, false);
            this._initializeLayout(listView, Windows.UI.ViewManagement.ApplicationView.value);
            listView.element.focus();
            addSettingCharm();
        },
        unload: function () {
            www.defaultselectedcity = selectedcity;
        },
        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {
            var listView = element.querySelector(".itemslist").winControl;
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    var handler = function (e) {
                        listView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    }
                    listView.addEventListener("contentanimating", handler, false);
                    var firstVisible = listView.indexOfFirstVisible;
                    this._initializeLayout(listView, viewState);
                    if (firstVisible >= 0 && listView.itemDataSource.list.length > 0) {
                        listView.indexOfFirstVisible = firstVisible;
                    }
                }
            }
        },

        // This function updates the ListView with new layouts
        _initializeLayout: function (listView, viewState) {
            if (viewState === appViewState.snapped) {
                listView.layout = new ui.ListLayout({ groupHeaderPosition: "top" });
            } else {
                listView.layout = new ui.GridLayout({ groupHeaderPosition: "top" });
            }
        },

        _itemInvoked: function (args) {
      
            var group;
         
            if (selectedcity.toLowerCase() == 'chicago') {
                 group = www.chicagocity.getAt(args.detail.itemIndex);
            }
            else if (selectedcity.toLowerCase() == 'edmonton') {
                group = www.edmontoncity.getAt(args.detail.itemIndex);
            }
            else if (selectedcity.toLowerCase() == 'new york') {
                 group = www.newyorkcity.getAt(args.detail.itemIndex);
            }
            www.group = group.key;
            if (www.loadedgroups) {
                var groupfound = 0;
                www.loadedgroups.forEach(function (grp) {
                    if (grp == group.key) {
                        groupfound = 1;                  
                            WinJS.Navigation.navigate("/pages/split/split.html", { groupKey: group.key });
                            return;                                       
                    }
                });
                if (groupfound == 0) {
                    var isNetAvailable = www.checknetwork();
                    if (isNetAvailable) {
                        WinJS.Navigation.navigate("/pages/split/split.html", { groupKey: group.key });
                    }
                    else {
                        Windows.UI.Popups.MessageDialog("No internet connection available. Please check your internet connection and try again.").showAsync();
                    }
                }
            }
            else {
                var isNetAvailable = www.checknetwork();
                if (isNetAvailable) {
                    WinJS.Navigation.navigate("/pages/split/split.html", { groupKey: group.key });
                }
                else {
                    Windows.UI.Popups.MessageDialog("No internet connection available. Please check your internet connection and try again.").showAsync();
                }
            }
          
     
        }
    });

    (function () {
        try {
            var builder = new Windows.ApplicationModel.Background.BackgroundTaskBuilder();
            builder.name = www.backgroundTaskName;
            builder.taskEntryPoint = www.backgroundTaskEntryPoint;
            builder.setTrigger(new Windows.ApplicationModel.Background.TimeTrigger(15, false));
            var result = IsRegistered();
            if (result != null) {
                result.unregister(true);
            }
            var accessStatus = Windows.ApplicationModel.Background.BackgroundExecutionManager.requestAccessAsync();
            if (accessStatus) {
                builder.register();
            }
        } catch (e) {

        }        
    })();

    function IsRegistered() {
        var regTask = null;
        var _registeredTasks = Windows.ApplicationModel.Background.BackgroundTaskRegistration.allTasks.first();

        while (_registeredTasks.hasCurrent) {
            var task = _registeredTasks.current.value;
            if (task.name === www.backgroundTaskName) {
                regTask = task;
                break;
            }
            _registeredTasks.moveNext();
        }
        return regTask;
    };

    function ShowSearchPage() {
        WinJS.UI.SettingsFlyout.showSettings("search", "/pages/search/Search.html");

    }

    /*method to add links in setting charm*/
    function addSettingCharm() {
        WinJS.Application.onsettings = function (e) {
            e.detail.applicationcommands = {
                "privacyPolicy": { title: "Privacy Policy", href: "/pages/privacy_policy/PrivacyPolicy.html" },
                "aboutUs": { title: "About Socrata", href: "/pages/about/about_us.html" }
            };
            WinJS.UI.SettingsFlyout.populateSettings(e);
        };
    }
   
    function changecity() {
        var e = document.getElementById("cityname");
        var localSettings = Windows.Storage.ApplicationData.current.localSettings;
        var city = e.options[e.selectedIndex].text;
        if (city.toLowerCase() == 'chicago')
        {
            document.getElementById("backgroundimage").style.background = "url('../../images/BackgroundImage.png')";
            tileIndex = 0;
            www.chicagocity = new WinJS.Binding.List();
            www.list = new WinJS.Binding.List();
            www.loadedgroups = [];
            www.citygrouplist.forEach(function (item) {
                if (item.City == 'Chicago') {
                    tileIndex = tileIndex + 1;
                    item.tileIndex = tileIndex;
                    www.chicagocity.push(item);
                }
            });
            www.defaultselectedcity = 'Chicago';
            selectedcity = 'Chicago';
            localSettings.values["savedcity"] = www.defaultselectedcity;
            listView.itemDataSource = www.chicagocity.dataSource;
        }
        else if (city.toLowerCase() == 'edmonton') {
            document.getElementById("backgroundimage").style.background = "url('../../images/edBackground.png')";
            tileIndex = 0;
            www.edmontoncity = new WinJS.Binding.List();
            www.loadedgroups = [];
            www.list = new WinJS.Binding.List();     
            www.citygrouplist.forEach(function (item) {
                if (item.City == 'Edmonton') {
                    tileIndex = tileIndex + 1;
                    item.tileIndex = tileIndex;
                    www.edmontoncity.push(item);
                }
            });
            www.defaultselectedcity = 'Edmonton';
            selectedcity = 'Edmonton';
            localSettings.values["savedcity"] = www.defaultselectedcity;
            listView.itemDataSource = www.edmontoncity.dataSource;
        }
        else if (city.toLowerCase() == 'new york') {
            document.getElementById("backgroundimage").style.background = "url('../../images/nyBackground.png')";
            tileIndex = 0;
            www.newyorkcity = new WinJS.Binding.List();
            www.loadedgroups = [];
            www.list = new WinJS.Binding.List();        
            www.citygrouplist.forEach(function (item) {
                if (item.City == 'New York') {
                    tileIndex = tileIndex + 1;
                    item.tileIndex = tileIndex;
                    www.newyorkcity.push(item);
                }
            });
            www.defaultselectedcity = 'New York';
            selectedcity = 'New York';
            localSettings.values["savedcity"] = www.defaultselectedcity;
            listView.itemDataSource = www.newyorkcity.dataSource;
        }
        
    }
})();
