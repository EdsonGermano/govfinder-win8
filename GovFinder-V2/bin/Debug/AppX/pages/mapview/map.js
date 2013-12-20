(function () {
    "use strict";

    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var binding = WinJS.Binding;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;
    var utils = WinJS.Utilities;

    ui.Pages.define("/pages/mapview/map.html", {

   
        _items: null,
        _sorteditems: null,
        _group: null,
        _itemSelectionIndex: -1,

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            www.iscommentscounstloaded = 1;
         
            // Store information about the group and selection that this page will
            // display.
            var cmdDetailView = document.getElementById("cmdDetailView");
            cmdDetailView.addEventListener("click", SwitchToDetailView, false);
            
            this._group = (options && options.groupKey) ? Data.resolveGroupReference(options.groupKey) : Data.groups.getAt(0);
            this._items = Data.getItemsFromGroup(this._group);
       
            this._itemSelectionIndex = (options && "selectedIndex" in options) ? options.selectedIndex : -1;
            try {
                element.querySelector("header[role=banner] .pagetitle").textContent = this._group.title;
            } catch (ex) { }
            var _this = this;
            (function () {
                var m = www.m = www.m || document.querySelector('div#map');
                m.classList.add('shown');
                var ac = document.querySelector('div.article-content');
                ac.appendChild(m);
                if (_this._group) {
                    www.only(_this._group.title) + 'px';
                }
            })();
  
            document.getElementById("appbartop").winControl.hide();
            document.querySelector('div#map').addEventListener("click", AddCommentEvent, true);

            if (this._isSingleColumn()) {
                if (this._itemSelectionIndex >= 0) {
                    // For single-column detail view, load the article.
                    binding.processAll(element.querySelector(".articlesection"), this._items.getAt(this._itemSelectionIndex));
                }
            } else {
                if (nav.canGoBack && nav.history.backStack[nav.history.backStack.length - 1].location === "/pages/mapview/map.html") {
                    // Clean up the backstack to handle a user snapping, navigating
                    // away, unsnapping, and then returning to this page.
                    nav.history.backStack.pop();
                }
              
            }
        },

        unload: function () {
            www.checkmap = 1;
            www.isitemloaded = 1;
            www.iscommentscounstloaded = 0;
            document.querySelector('div#map').classList.remove('shown');
            document.querySelector('div#map_holder').appendChild(www.m);
            this._items.dispose();
        },

        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {

            if (this._isSingleColumn()) {
        
                if (this._itemSelectionIndex >= 0) {
                    // If the app has snapped into a single-column detail view,
                    // add the single-column list view to the backstack.
                    nav.history.current.state = {
                        groupKey: this._group.key,
                        selectedIndex: this._itemSelectionIndex
                    };
                    nav.history.backStack.push({
                        location: "/pages/mapview/map.html",
                        state: { groupKey: this._group.key }
                    });
                   element.querySelector(".articlesection").focus();
                }
            } else {
                // If the app has unsnapped into the two-column view, remove any
                // splitPage instances that got added to the backstack.
                if (nav.canGoBack && nav.history.backStack[nav.history.backStack.length - 1].location === "/pages/mapview/map.html") {
                    nav.history.backStack.pop();
                }
       
            }
        },

        // This function checks if the list and details columns should be displayed
        // on separate pages instead of side-by-side.
        _isSingleColumn: function () {
            var viewState = Windows.UI.ViewManagement.ApplicationView.value;
            return (viewState === appViewState.snapped || viewState === appViewState.fullScreenPortrait);
        },
    });

    function SwitchToDetailView() {
        WinJS.Navigation.back();
    };
    function AddCommentEvent() {
        WinJS.Promise.timeout(1000).then(
          function (complete) {
              var commentLoaded = document.getElementById("cmtPushpin");
              if (commentLoaded != null) {
                  www.commentLoaded = commentLoaded;
                  commentLoaded.removeEventListener("click", commentslist, false);
                  commentLoaded.addEventListener("click", commentslist, false);
               
              }
              else {
                  AddCommentEvent();
              }
          });
    };
    function commentslist(args) {
        var id = args.currentTarget.title;
        WinJS.Navigation.navigate("/pages/comments/Comments.html", id);

    };
})();
