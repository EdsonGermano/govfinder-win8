using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GovFinderBackgroundTask
{
    class NotificationItemClass
    {
        public class UpdatedList
        {
            public string city { get; set; }
            public string DatasetName { get; set; }
        }

        public class NotificationUpdateList
        {
            public string uniqueId { get; set; }
            public List<UpdatedList> UpdatedList { get; set; }
        }
    }
}
