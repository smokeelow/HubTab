/**
 * Track all tabs updates
 *
 * @param tabID
 * @param tabState
 * @param tab
 */
chrome.tabs.onUpdated.addListener(function(tabID, tabState, tab) {
    var jsonArr = JSON.parse(localStorage['dashSites']),
        domain = '',
        site = {};

    //wait for full load
    if(tab.url !== undefined && tabState.status == 'complete') {

        domain = tab.url.split('/')[2].replace('www.', '');

        if(localStorage['dashSites'].indexOf(domain) > -1) {

            for(var i = 0, size = jsonArr.length; i < size; i++) {
                site = jsonArr[i];

                if(site.url.indexOf(domain) > -1) {
                    if(site.image == '' || site.image == undefined) {
                        chrome.tabs.captureVisibleTab(null, function(dataURI) {
                            site.image = dataURI;
                        });
                    }

                } break;
            }

            localStorage['dashSites'] = JSON.stringify(jsonArr);
        }
    }
});