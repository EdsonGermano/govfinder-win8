(function () {

    var utils = WinJS.Utilities;
    var month;
    var monthname;
    var compositeKey;
    var commentList;
    var commentdiv;
    WinJS.UI.Pages.define("/pages/comments/Comments.html", {
        ready: function (element, options) {
            compositeKey = options;
            document.getElementById("newcommentadd").addEventListener("click", newcomment, false);
            document.getElementById("addnewcomment").addEventListener("click", addnewcomment, false);
            www.isdataloaded.classList.add('shown');
            monthname = new Date();
            month = new Array();
            month[0] = "January";
            month[1] = "February";
            month[2] = "March";
            month[3] = "April";
            month[4] = "May";
            month[5] = "June";
            month[6] = "July";
            month[7] = "August";
            month[8] = "September";
            month[9] = "October";
            month[10] = "November";
            month[11] = "December";
           
            try {
                var commenturl = www.commenturl + options + '&cityName=' + www.maincity + '&reportName=' + www.reportName;
                var isNetAvailable = www.checknetwork();
                if (isNetAvailable) {
                    WinJS.xhr({ url: commenturl }).then(function (commentresult) {
                        if (commentresult.status === 200) {

                            var comment;
                            if (commentresult.responseText != '[]') {
                                comment = JSON.parse(commentresult.responseText);
                                if (comment != 0) {
                                    window.addEventListener("resize", onViewStateChanged);
                                    commentList = new WinJS.Binding.List(comment);
                                    commentList.forEach(function (item) {
                                        var fulldate = new Date(item.CommentPublishAt);
                                        var date = month[fulldate.getMonth()] + " " + fulldate.getDate() + " " + fulldate.getFullYear();
                                        item.CommentPublishAt = date;
                                    });
                                    commentdiv = document.getElementById("itemcommentlist").winControl;
                                    var template = document.getElementById("itemtemplatecomments");
                                    commentdiv.itemTemplate = template;
                                    commentdiv.itemDataSource = commentList.dataSource;
                                    www.isdataloaded.classList.remove('shown');
                                }
                            }
                            else {
                                commentdiv = document.getElementById("itemcommentlist").winControl;
                                var template = document.getElementById("itemtemplatecomments");
                                commentdiv.itemTemplate = template;
                                document.getElementById("txtnoresult").style.visibility = 'visible';
                                www.isdataloaded.classList.remove('shown');
                            }

                        }
                    }, function () {
                        www.isdataloaded.classList.remove('shown');
                    });
                }
                else {
                    www.isdataloaded.classList.remove('shown');
                    Windows.UI.Popups.MessageDialog("No internet connection available. Please check your internet connection and try again.").showAsync();
                }
            }
            catch (ex)
            { www.isdataloaded.classList.remove('shown'); }
        },
        unload: function () {
            www.checkmap = 1;
            www.isitemloaded = 1;
            www.isdataloaded.classList.remove('shown');
        },

    });
    //window.addEventListener("resize", onViewStateChanged);
    function onViewStateChanged(eventArgs) {
        var newViewState = Windows.UI.ViewManagement.ApplicationView.value;
        var viewStates = Windows.UI.ViewManagement.ApplicationViewState, msg;
        if (document.getElementById("itemcommentlist") != null) {
            var commentdiv = document.getElementById("itemcommentlist").winControl;
            if (newViewState === viewStates.snapped) {

                commentdiv.layout = new WinJS.UI.ListLayout();

            } else if (newViewState === viewStates.filled) {
                commentdiv.layout = new WinJS.UI.GridLayout();
            } else if (newViewState === viewStates.fullScreenLandscape) {

                commentdiv.layout = new WinJS.UI.GridLayout();

            } else if (newViewState === viewStates.fullScreenPortrait) {

                commentdiv.layout = new WinJS.UI.GridLayout();

            }
        }
    }
    //event for open popup for add new comment
    function addnewcomment() {

        document.getElementById("commenttitle").value = "";
        document.getElementById("commenttext").value = "";
        // Show the flyout
        var addNewCommentButton = document.getElementById("addnewcomment");
        document.getElementById("newcomment").winControl.show(addNewCommentButton);

    };
    //method for post new comment 
    function newcomment() {
        var commenttitle = document.getElementById("commenttitle").value;
        var commenttext = document.getElementById("commenttext").value;
        if (commenttitle != "" && commenttext != "") {
            var login;
            var title = '';
            var id;
            var today;
            var todaydisplay;
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
                todaydisplay = month[today.getMonth()] + " " + today.getDate() + " " + today.getFullYear();
              
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
                                try {
                                    commentList = [];
                                    var commenturl = www.commenturl + compositeKey + '&cityName=' + www.maincity + '&reportName=' + www.reportName;
                                    WinJS.xhr({ url: commenturl }).then(function (commentresult) {
                                        if (commentresult.status === 200) {
                                          
                                            var comment = JSON.parse(commentresult.responseText);
                                            if (comment != null) {
                                                commentList = new WinJS.Binding.List(comment);
                                                commentList.forEach(function (item) {
                                                    var fulldate = new Date(item.CommentPublishAt);
                                                    var date = month[fulldate.getMonth()] + " " + fulldate.getDate() + " " + fulldate.getFullYear();
                                                    item.CommentPublishAt = date;
                                                });                                          
                                              commentdiv.itemDataSource = commentList.dataSource;                                             
                                              www.isdataloaded.classList.remove('shown');
                                              Windows.UI.Popups.MessageDialog("Comment saved successfully.").showAsync();
                                            }
                                        }
                                    }, function () {
                                        www.isdataloaded.classList.remove('shown');
                                    });
                                }
                                catch (ex)
                                {
                                    www.isdataloaded.classList.remove('shown');
                                }
                             
                            }
                            catch (ex)
                            {
                                www.isdataloaded.classList.remove('shown');
                            }
                        }, function (e) {
                            www.isdataloaded.classList.remove('shown');
                           
                        });
                    }
                    catch (ex) {
                        www.isdataloaded.classList.remove('shown');
                    }
                })();

            });
        }
        else {
            Windows.UI.Popups.MessageDialog("Comment title or text cannot be empty.").showAsync();
               
        }
    };
})();