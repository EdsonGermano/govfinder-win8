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
            DataHold();
            function DataHold() {
                WinJS.Promise.timeout(200).then(
                  function (complete) {
                      try {
                          if (www.allcityloaded == 1) {
                              document.getElementById("btnappbarRefresh").addEventListener("click", RefreshMainData, false);
                              document.getElementById("btnappbarRefresh").disabled = false;
                              www.citybindlist = new WinJS.Binding.List();
                              www.dynamiccitylist.forEach(function (value, i) {
                                  var newOption = document.createElement("option");
                                  newOption.text = value;
                                  newOption.value = value;
                                  document.getElementById("cityname").add(newOption);
                              });
                              var localSettings = Windows.Storage.ApplicationData.current.localSettings;
                              if (localSettings.values["savedcity"] == null) {
                                  localSettings.values["savedcity"] = www.defaultselectedcity;
                              }
                              else {
                                  www.defaultselectedcity = localSettings.values["savedcity"];
                              }

                              var e = document.getElementById("cityname");                          
                              for (var i = 0, j = e.options.length; i < j; ++i) {
                                  if (e.options[i].innerHTML === www.defaultselectedcity) {
                                      e.selectedIndex = i;
                                      break;
                                  }
                              }
                              var city = e.options[e.selectedIndex].text;
                              www.citygrouplist.forEach(function (item) {
                                  if (item.City.toLowerCase() == city.toLowerCase()) {
                                      www.citybindlist.push(item);

                                  }
                              });
                              listView.itemDataSource = www.citybindlist.dataSource;
                          }
                          else {
                              DataHold();
                          }
                      }
                      catch(ex){}
                  });
            }
               
            listView = element.querySelector(".itemslist").winControl;       
            document.getElementById("cityname").addEventListener("change", changecity, false);
            listView.itemTemplate = element.querySelector(".itemtemplate");
            listView.groupHeaderTemplate = element.querySelector(".headertemplate");

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
      
            var group = args.detail.itemPromise._value.data.DataSetName;
       
            www.loadedgroups = [];
            www.group = group;
            if (www.loadedgroups) {
                var groupfound = 0;
                www.loadedgroups.forEach(function (grp) {
                    if (grp == group) {
                        groupfound = 1;                  
                        WinJS.Navigation.navigate("/pages/split/split.html", { groupKey: group });
                            return;                                       
                    }
                });
                if (groupfound == 0) {
                    var isNetAvailable = www.checknetwork();
                    if (isNetAvailable) {
                        WinJS.Navigation.navigate("/pages/split/split.html", { groupKey: group });
                    }
                    else {
                        Windows.UI.Popups.MessageDialog("No internet connection available. Please check your internet connection and try again.").showAsync();
                    }
                }
            }
            else {
                var isNetAvailable = www.checknetwork();
                if (isNetAvailable) {
                    WinJS.Navigation.navigate("/pages/split/split.html", { groupKey: group });
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
        www.citybindlist = new WinJS.Binding.List();
        var e = document.getElementById("cityname");
        var localSettings = Windows.Storage.ApplicationData.current.localSettings;
        var city = e.options[e.selectedIndex].text;
        www.list = new WinJS.Binding.List();
        www.loadedgroups = [];
        www.defaultselectedcity = city;
        selectedcity = city;
        localSettings.values["savedcity"] = www.defaultselectedcity;
        www.citygrouplist.forEach(function (item) {
            if (city.toLowerCase() == 'chicago') {
                document.getElementById("backgroundimage").style.background = "url('../../images/BackgroundImage.png')";
            }
            else if (city.toLowerCase() == 'edmonton') {
                document.getElementById("backgroundimage").style.background = "url('../../images/edBackground.png')";
            }
            else if (city.toLowerCase() == 'new york') {
                document.getElementById("backgroundimage").style.background = "url('../../images/nyBackground.png')";
            }
            else {
                document.getElementById("backgroundimage").style.background = "url('../../images/BackgroundImage.png')";
            }
            if (item.City.toLowerCase() == city.toLowerCase()) {
                www.citybindlist.push(item);
               
            }
        });
        listView.itemDataSource = www.citybindlist.dataSource;
        
    }

    function RefreshMainData() {
        try
        {
            var isNetAvailable = www.checknetwork();
            if (isNetAvailable) {
                www.citygrouplist = [];
                www.refreshcompleted = 0;
                document.getElementById("btnappbarRefresh").disabled = true;
                www.downloadxmloninstall();
                RefreshDataHold();
           
            }
        }
        catch (ex) { }
        function RefreshDataHold() {
            WinJS.Promise.timeout(200).then(
              function (complete) {
                  try {
                      if (www.refreshcompleted == 1)
                      {
                          www.refreshcompleted = 0;
                          var dropdown = document.getElementById("cityname");                    
                          while (dropdown.hasChildNodes()) {
                              dropdown.removeChild(dropdown.lastChild);
                          }
                         
                          www.dynamiccitylist.forEach(function (value, i) {
                              var newOption = document.createElement("option");
                              newOption.text = value;
                              newOption.value = value;
                              document.getElementById("cityname").add(newOption);
                          });
                          www.citybindlist = new WinJS.Binding.List();                       
                    
                          document.getElementById("appbaritempage").winControl.hide();
                          var localSettings = Windows.Storage.ApplicationData.current.localSettings;
                          if (localSettings.values["savedcity"] == null) {
                              localSettings.values["savedcity"] = www.defaultselectedcity;
                          }
                          else {
                              www.defaultselectedcity = localSettings.values["savedcity"];
                          }

                          var e = document.getElementById("cityname");                          
                          for (var i = 0, j = e.options.length; i < j; ++i) {
                              if (e.options[i].innerHTML === www.defaultselectedcity) {
                                  e.selectedIndex = i;
                                  break;
                              }
                          }
                          var city = e.options[e.selectedIndex].text;
                          www.citygrouplist.forEach(function (item) {
                              if (item.City.toLowerCase() == city.toLowerCase()) {
                                  www.citybindlist.push(item);

                              }
                          });
                          listView.itemDataSource = www.citybindlist.dataSource;
                          document.getElementById("btnappbarRefresh").disabled = false;
                      }
                      else {
                          RefreshDataHold();
                      }
                  }
                  catch (ex) {
                      document.getElementById("btnappbarRefresh").disabled = false;
                  }
              });
        }

    };
})();
