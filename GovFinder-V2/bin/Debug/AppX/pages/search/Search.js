(function () {
    "use strict";
    var utils = WinJS.Utilities;
    var _lastSearch = "";
    var originalResults;
    var filters = [];
    var filters1 = [];
    var categoryData = new WinJS.Binding.List([

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

    WinJS.UI.Pages.define("/pages/search/Search.html", {
        ready: function (element, options) {
            var listView = element.querySelector(".resultslist").winControl;
            listView.oniteminvoked = this._itemInvoked;
            var template = document.getElementById("regularListIconTextTemplate1");
            var listView1 = document.getElementById("listView1").winControl;      
            listView1.itemTemplate = template;
            listView1.itemDataSource = www.citybindlist.dataSource;
           
            listView1.selection.selectAll();
            WinJS.Utilities.query("#getSearch").listen("click", GetSearch1);
            WinJS.Utilities.query("#searchText").listen("input", GetSearch);

            WinJS.Utilities.query("#listView1").listen("selectionchanged", GetSearch);
            listView.element.focus();
            document.getElementById("searchListCharm1").style.height = "0px";
            document.getElementById("hrline").style.visibility = "collapse";
        },

        _itemInvoked: function (args) {
            args.detail.itemPromise.done(function itemInvoked(item) {
              
                WinJS.Navigation.navigate("/pages/split/split.html", { groupKey: item.data.type}).done(function () {
                    setTimeout(function () {
                        var index = www.listView.indexOfElement(document.querySelector('img[alt="' + item.data.id + '"]'));
                        index = Math.max(index, 0);
                        www.itemid = item.data.index;
                        www.itemtype = item.data.type;
                        www.checksearch = 1;
                        www.listView.ensureVisible(item.data.index - 1);
                        www.listView.selection.set(item.data.index - 1);
                        www.listView.indexOfFirstVisible = item.data.index - 1;

                    }, 1000);
                });
                
            });
        },
    });

    function GetSearch1(element, args) {
        var queryText = document.getElementById("searchText");
        var text = queryText.value.trim();
        WinJS.Navigation.navigate("/pages/fullsearch/fullSearch.html", text);
    }


    function GetSearchbyCategory(element, args) {
        try {
            var listView1 = document.getElementById("listView1").winControl;
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
            if (originalResults.length == 0) {
                document.getElementById("searchListCharm1").style.height = "0px";
                document.getElementById("hrline").style.visibility = "collapse";
            }
            else {
                document.getElementById("searchListCharm1").style.height = "170px";
                document.getElementById("hrline").style.visibility = "visible";
            }
            var listview = document.getElementById("searchListCharm1").winControl;
            var myTemplate = document.getElementById("itemtemplate1");

            // Set the properties on the list view to use the itemDataSource
            listview.itemDataSource = originalResults.dataSource;
            listview.itemTemplate = myTemplate;
        }
        catch (exception)
        { }
    }

    function GetSearch(element, args) {
        var queryText = document.getElementById("searchText");
        handleQuery(element, queryText.value.trim());
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
        if (www.list) {
            var qt = (queryText || '').toLowerCase()
            originalResults = www.list.createFiltered(function (item) {
                return (item.searchText || www.searchText(item)).indexOf(qt) >= 0;               
            });
        } else {
            originalResults = new WinJS.Binding.List();
        }   
        return originalResults;
    }

})();
