(function () {
    "use strict";

 
    var citygrouplist = new WinJS.Binding.List();
    www.citygrouplist = citygrouplist;
  
    var citygroupedItems = citygrouplist.createGrouped(
        function groupKeySelector(item) { return item.citygroup.key; },
        function groupDataSelector(item) { return item.citygroup; }
    );

   
    WinJS.Namespace.define("Data", {      
        datasets: citygroupedItems,
        datasetgroups: citygroupedItems.groups,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference
    });

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(datasets) {
        return [datasets.group.key, datasets.title];
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(group) {
        return citygrouplist.createFiltered(function (datasets) { return datasets.citygroup.key === group.key; });
    }

    // Get the unique group corresponding to the provided group key.
    function resolveGroupReference(key) {
        for (var i = 0; i < citygroupedItems._list.length; i++) {
            if (citygroupedItems._list.getAt(i).key === key) {
                return citygroupedItems._list.getAt(i);
            }
        }
    }

    // Get a unique item from the provided string array, which should contain a
    // group key and an item title.
    function resolveItemReference(reference) {
        for (var i = 0; i < citygroupedItems.length; i++) {
            var datasets = citygroupedItems.getAt(i);
            if (datasets.group.key === reference[0] && datasets.title === reference[1]) {
                return datasets;
            }
        }
    }

})();
