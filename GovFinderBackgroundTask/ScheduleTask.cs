using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Windows.ApplicationModel.Background;
using Windows.Data.Xml.Dom;
using Windows.UI.Notifications;

namespace GovFinderBackgroundTask
{
    public sealed class ScheduleTask : IBackgroundTask
    {
        private BackgroundTaskDeferral _deferral = null;
        private const string NOTIFICATIONMESSAGE = "item updated";
        private string productiongetNotificationUrl = "http://poshsocratacommentservice.cloudapp.net/api/comment/GetNotifications?key=POSHSocrataComments";
       // private string testinggetNotificationUrl = "http://socratacommentcloudservice.cloudapp.net/api/comment/GetNotifications?key=POSHSocrataComments";
        public void Run(IBackgroundTaskInstance taskInstance)
        {
            System.Uri targetUri = new System.Uri(productiongetNotificationUrl);
            HttpWebRequest request = (HttpWebRequest)HttpWebRequest.Create(targetUri);
            request.BeginGetResponse(new AsyncCallback(ReadWebRequestCallback), request);
            _deferral.Complete();
        }

        private void ReadWebRequestCallback(IAsyncResult callbackResult)
        {
            try
            {
                var id = "";
                int count = 0;
                var localSettings = Windows.Storage.ApplicationData.Current.LocalSettings;
                GovFinderBackgroundTask.NotificationItemClass.NotificationUpdateList socrataUpdate = null;
                HttpWebRequest myRequest = (HttpWebRequest)callbackResult.AsyncState;
                HttpWebResponse myResponse = (HttpWebResponse)myRequest.EndGetResponse(callbackResult);
                string results = string.Empty;
                using (StreamReader httpwebStreamReader = new StreamReader(myResponse.GetResponseStream()))
                {
                    results = httpwebStreamReader.ReadToEnd();
                    socrataUpdate = JsonHelper.Deserialize<GovFinderBackgroundTask.NotificationItemClass.NotificationUpdateList>(results);
                }
                myResponse.Dispose();
                count = socrataUpdate.UpdatedList.Count;
                if (localSettings.Values["uniqueId"] == null)
                {
                    localSettings.Values["uniqueId"] = socrataUpdate.uniqueId;
                }
                else
                {
                    id = localSettings.Values["uniqueId"].ToString();
                }
                if (id != socrataUpdate.uniqueId)
                {
                    if (id != "")
                    {
                        int oldcount =Convert.ToInt32(localSettings.Values["TotalUpdatedItems"]);
                        for (var i = 0; i < oldcount; i++)
                        {
                            if (localSettings.Values["DatasetName" + i] != null)
                            {
                                localSettings.Values.Remove("DatasetName" + i);
                                localSettings.Values.Remove("City" + i);
                            }
                        }
                    }

                    for (var i = 0; i < count; i++)
                    {
                        localSettings.Values["DatasetName" + i] = socrataUpdate.UpdatedList[i].DatasetName;
                        localSettings.Values["City" + i] = socrataUpdate.UpdatedList[i].city;
                    }
                    localSettings.Values["UpdatedItems"] = count;
                    localSettings.Values["TotalUpdatedItems"] = count;
                    localSettings.Values["uniqueId"] = socrataUpdate.uniqueId;
                }
                else
                {
                    count = Convert.ToInt32(localSettings.Values["UpdatedItems"]);
                }
                if (count == 0)
                {
                    var updater = TileUpdateManager.CreateTileUpdaterForApplication();
                    updater.EnableNotificationQueue(true);
                    updater.Clear();
                }
                else
                {
                    UpdateTile(count);
                }
            }
            catch (Exception ex)
            {
               
            }
        }

        private void UpdateTile(int content)
        {
            // Create a tile update manager for the specified syndication feed.
            var updater = TileUpdateManager.CreateTileUpdaterForApplication();
            updater.EnableNotificationQueue(true);
            updater.Clear();

            XmlDocument tileXml = TileUpdateManager.GetTemplateContent(TileTemplateType.TileWideImageAndText01);
            tileXml.GetElementsByTagName("text")[0].InnerText = "" + content.ToString() + NOTIFICATIONMESSAGE;
            var tileimage = tileXml.GetElementsByTagName("image");
            ((XmlElement)tileimage[0]).SetAttribute("src", "/images/w310.png");
            // Create a new tile notification. 
            updater.Update(new TileNotification(tileXml));
        }
    }
}
