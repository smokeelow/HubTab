/*===================== GLOBAL BLOCK > =====================*/

var regexp = /^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i,
    baseRegExp = /http:\/\/|http:\/\/www.|https:\/\/www.|https:\/\//g,
    json = {};

/**
 * Calculate how many days passed
 *
 * @param firstDate timestamp
 * @param secondDate timestamp
 * @returns {number}
 */
Date.daysPassed = function(firstDate, secondDate) {
    var day = 1000 * 60 * 60 * 24,
        diff = secondDate - firstDate;

    return Math.round(diff / day);
};

/*===================== GLOBAL BLOCK > =====================*/


/*===================== CHROME BLOCK > =====================*/

/**
 * Track all tabs updates
 *
 * @param tabID
 * @param tabState
 * @param tab
 */
chrome.tabs.onUpdated.addListener(function(tabID, tabState, tab) {
    if(tab.url !== undefined && tabState.status == 'complete') {

        var cacheTabId = tab.id,
            domain = tab.url.match(regexp);

        //if url is ok
        if(domain)
            domain = domain[1].replace('www.', '');

        if(localStorage['dashSites'].indexOf(domain) > -1) {

            //make screenshot of visible area
            chrome.tabs.captureVisibleTab(null, {quality: 10}, function(dataURI) {

                //get current active tab
                chrome.tabs.getSelected(function(tab) {

                    //compare with opened/updated tab
                    if(cacheTabId == tab.id) {

                        var jsonArr = JSON.parse(localStorage['dashSites']),
                            url = tab.url.replace(baseRegExp, '');

                        for(var i = 0, size = jsonArr.length; i < size; i++) {
                            var siteUrl = jsonArr[i].url.replace(baseRegExp, '')

                            if(jsonArr[i].imageDate !== undefined && jsonArr[i] != '') {
                                if(Date.daysPassed(new Date(jsonArr[i].imageDate).getTime(), new Date().getTime()) >= 1) {
                                    if(url.indexOf(siteUrl) > -1) {
                                        jsonArr[i].image = dataURI;
                                        jsonArr[i].imageDate = new Date().getTime();
                                    } else if(siteUrl == url) {
                                        jsonArr[i].image = dataURI;
                                        jsonArr[i].imageDate = new Date().getTime();
                                    }
                                }
                            } else {
                                if(url.indexOf(siteUrl) > -1) {
                                    jsonArr[i].image = dataURI;
                                    jsonArr[i].imageDate = new Date().getTime();
                                } else if(siteUrl == url) {
                                    jsonArr[i].image = dataURI;
                                    jsonArr[i].imageDate = new Date().getTime();
                                }
                            }
                        }

                        localStorage['dashSites'] = JSON.stringify(jsonArr);
                    }
                });
            });
        }
    }
});

/*===================== CHROME BLOCK < =====================*/
