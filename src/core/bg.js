/**
 * Track all tabs updates
 *
 * @param tabID
 * @param tabState
 * @param tab
 */


chrome.tabs.onUpdated.addListener(function(tabID, tabState, tab) {

    //wait for full load
    if(tab.url !== undefined && tabState.status == 'complete') {

        var domain = tab.url.split('/')[2].replace('www.', '');

        if(localStorage['dashSites'].indexOf(domain) > -1) {
            chrome.tabs.captureVisibleTab(null, function(dataURI) {

                var jsonArr = JSON.parse(localStorage['dashSites']);

                for(var i = 0, size = jsonArr.length; i < size; i++) {
                    var site = jsonArr[i];

                    if(site.url.indexOf(domain) > -1)
                        site.image = dataURI;
                }

                localStorage['dashSites'] = JSON.stringify(jsonArr);
            });
        }
    }
});