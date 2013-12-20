(function () {
    "use strict";
    var utils = WinJS.Utilities;
    var _lastSearch = "";
    var originalResults;
    var filters = [];
    var filters1 = [];
    var _searchingText = "";
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var ui = WinJS.UI;

    var categoryList = new WinJS.Binding.List([

        { title: "Recreation", picture: "images/250/w/Recreation.png" },
        { title: "Libraries", picture: "images/250/w/Libraries.png" },
        { title: "Police Station", picture: "images/250/w/Police Station.png" },
        { title: "Technology Centers", picture: "images/250/w/Technology Centers.png" },
        { title: "Health Centers", picture: "images/250/w/Health Clinic.png" },
        { title: "School", picture: "images/250/w/School.png" },
        { title: "Fire Department", picture: "images/250/w/Fire Department.png" },
        { title: "Community Centers", picture: "images/250/w/Community Centers.png" },
        { title: "Representitive's Office", picture: "images/250/w/Representitive's Office.png" },
        { title: "Workforce Center", picture: "images/250/w/Workforce Center.png" },
    ]);

    WinJS.UI.Pages.define("/pages/fullsearch/fullSearch.html", {
        ready: function (element, options) {
          
            var listView = element.querySelector(".resultslist").winControl;
            if (www.list._currentKey == 0) {
                document.getElementById("txtnoresult").style.visibility = 'visible';
            }
            listView.oniteminvoked = this._itemInvoked;
            var template = document.getElementById("regularListIconTextTemplate");
            var listView1 = document.getElementById("listView").winControl;
            listView1.itemTemplate = template;
      
            if (www.defaultselectedcity.toLowerCase() == 'chicago') {
                listView1.itemDataSource = www.chicagocity.dataSource;        
            }
            else if (www.defaultselectedcity.toLowerCase() == 'edmonton') {
                listView1.itemDataSource = www.edmontoncity.dataSource;              
            }
            else if (www.defaultselectedcity.toLowerCase() == 'new york') {
                listView1.itemDataSource = www.newyorkcity.dataSource;            
            }
            listView1.selection.selectAll();
            _searchingText = options;
            WinJS.Utilities.query("#getSearch").listen("click", GetSearch1);
            WinJS.Utilities.query("#searchText").listen("input", GetSearch1);
            WinJS.Utilities.query("#listView").listen("selectionchanged", GetSearch, false);
            listView.element.focus();
            GetSearch(element, options);
            var newViewState = Windows.UI.ViewManagement.ApplicationView.value;
            var viewStates = Windows.UI.ViewManagement.ApplicationViewState;
            if (newViewState === viewStates.snapped) {
                document.getElementById("searchList").style.width = (window.innerWidth).toString() + "px";
            }
            else {
                document.getElementById("searchList").style.width = (window.innerWidth / 2).toString() + "px";
            }
          
            if (www.lastsearch) {
                document.getElementById("searchText").value = www.lastsearch;
                GetSearch1(element, www.lastsearch);
            }
        },

        _itemInvoked: function (args) {
            args.detail.itemPromise.done(function itemInvoked(item) {              
                www.lastsearch = document.getElementById("searchText").value.trim();
                WinJS.Navigation.navigate("/pages/split/split.html", { groupKey: item.data.type }).done(function () {
                    setTimeout(function () {
                        var index = www.listView.indexOfElement(document.querySelector('img[alt="' + item.data.id + '"]'));
                        index = Math.max(index, 0);
                        www.itemid = item.data.index;
                        www.itemtype = item.data.type;
                        www.checksearch = 1;                      
                        www.listView.ensureVisible(item.data.index-1);
                        www.listView.selection.set(item.data.index-1);
                        www.listView.indexOfFirstVisible = item.data.index-1;
                  
                       
                    }, 1000);
                });
              
            });
        },

        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {
            var newViewState = Windows.UI.ViewManagement.ApplicationView.value;
            var viewStates = Windows.UI.ViewManagement.ApplicationViewState, msg;

            var template = document.getElementById("regularListIconTextTemplate");
            var listView1 = document.getElementById("listView").winControl;


            if (newViewState === viewStates.snapped) {
                listView1.itemTemplate = template;
            
                if (www.defaultselectedcity.toLowerCase() == 'chicago') {
                    listView1.itemDataSource = www.chicagocity.dataSource;
                }
                else if (www.defaultselectedcity.toLowerCase() == 'edmonton') {
                    listView1.itemDataSource = www.edmontoncity.dataSource;
                }
                else if (www.defaultselectedcity.toLowerCase() == 'new york') {
                    listView1.itemDataSource = www.newyorkcity.dataSource;
                }
                listView1.selection.selectAll();
                document.getElementById("searchList").style.width = (window.innerWidth).toString() + "px";

            } else if (newViewState === viewStates.filled || newViewState === viewStates.fullScreenLandscape || newViewState === viewStates.fullScreenPortrait) {

                listView1.itemTemplate = template;
              
                if (www.defaultselectedcity.toLowerCase() == 'chicago') {
                    listView1.itemDataSource = www.chicagocity.dataSource;
                }
                else if (www.defaultselectedcity.toLowerCase() == 'edmonton') {
                    listView1.itemDataSource = www.edmontoncity.dataSource;
                }
                else if (www.defaultselectedcity.toLowerCase() == 'new york') {
                    listView1.itemDataSource = www.newyorkcity.dataSource;
                }
                listView1.selection.selectAll();
                document.getElementById("searchList").style.width = (window.innerWidth / 2).toString() + "px";
            }
        },
    });

    window.addEventListener("resize", onViewStateChanged);
    function onViewStateChanged(eventArgs) {

    }
    function GetSearchbyCategory(element, args) {
        try {
            var listView1 = document.getElementById("listView").winControl;
            var itemsSelected = listView1.selection.getItems();
            var selectedCategory = itemsSelected._value;
            if (originalResults) {
                var allItems = [originalResults._list._keyMap][0];
                var searchedItems = [originalResults._filteredKeys][0];
                var keys = [];
                for (var i = 0; i < searchedItems.length; i++) {

                    var item = allItems[searchedItems[i]];
                  
                    (selectedCategory).forEach(function (category) {
                        if (category.data.title == item.data.type) {
                            keys.push(item.key);
                        }
                    });
                }
                originalResults._filteredKeys = keys;
              
            }
            var listview = document.getElementById("searchList").winControl;
            var myTemplate = document.getElementById("itemtemplate1");

            // Set the properties on the list view to use the itemDataSource
            listview.itemDataSource = originalResults.dataSource;
            listview.itemTemplate = myTemplate;
        }
        catch (exception)
        { }
    }

    function GetSearch1(element, options) {
        var _searchingText1 = document.getElementById("searchText");
        _searchingText = _searchingText1.value.trim();
        handleQuery(element, _searchingText);
    }

    function GetSearch(element, options) {
        handleQuery(element, _searchingText);
    }

    function handleQuery(element, args) {
        _lastSearch = args;
        WinJS.Namespace.define("searchResults", { markText: WinJS.Binding.converter(markText.bind(args)) });
        originalResults = searchData(args);
        _populateFilterBar(element, originalResults)
    }

    function _populateFilterBar(element, originalResults) {
        GetSearchbyCategory(element, originalResults);

    }
    // This function colors the search term. Referenced in /searchResults.html
    // as part of the ListView item templates.
    function markText(text) {
        return (text || '').replace(this._lastSearch, "<mark>" + this._lastSearch + "</mark>");
    }

    // This function populates a WinJS.Binding.List with search results for the
    // provided query.
    function searchData(queryText) {
        var originalResults;
        var qt = (queryText || '').toLowerCase()
        if (qt != "") {
            if (www.list) {           
                document.getElementById("txtempty").style.visibility = 'hidden';
                originalResults = www.list.createFiltered(function (item) {            
                    return (item.searchText || www.searchText(item)).indexOf(qt) >= 0;
                });             
            } else {
                originalResults = new WinJS.Binding.List();
            }
            if (originalResults._filteredKeys != 0) {
                document.getElementById("txtnoresultfound").style.visibility = 'hidden';
                return originalResults;
            }
            else {
                if (document.getElementById("txtnoresult").style.visibility == 'hidden') {
                    document.getElementById("txtnoresultfound").style.visibility = 'visible';
                }
                return originalResults;
            }
        }
        else {
            var listview = document.getElementById("searchList").winControl;
            if (document.getElementById("txtnoresult").style.visibility == 'hidden') {
                document.getElementById("txtempty").style.visibility = 'visible';
            }
            originalResults = new WinJS.Binding.List();;
            listview.itemDataSource = originalResults.dataSource;
        }
    }


})();
