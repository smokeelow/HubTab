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

//Check For File System Object
window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

/**
 * File System
 * @type object
 */
var fs = null;

/**
 * File System Errors
 *
 * @param e
 */
function errorHandler(e) {
    console.log('Error: ' + e.name);
}

/**
 * Set File System Var
 */
function fsInit() {
    window.requestFileSystem(window.TEMPORARY, 10 * 1024 * 1024, function(filesystem) {
        fs = filesystem;
    }, errorHandler);
}

//Load File system
fsInit();

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
            domain = tab.url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);

        //if url is ok
        if(domain)
            domain = domain[1].replace('www.', '');

        if(localStorage['dashSites'].indexOf(domain) > -1) {

            var imgName = domain.replace('.', '_') + '.jpeg';

            //check if file exists
            fs.root.getFile(imgName, {create: false}, function(filentry) {

                filentry.getMetadata(function(meta) {

                    //check if file older than one day
                    if(Date.daysPassed(new Date(meta.modificationTime).getTime(), new Date().getTime()) >= 1) {
                        takeScreenshot();
                    }
                });
            }, function(e) {
                takeScreenshot();
            });
        }
    }

    function takeScreenshot() {
        //capture screenshot of current page
        chrome.tabs.captureVisibleTab(null, function(dataURI) {

            //get current active tab
            chrome.tabs.getSelected(function(tab) {

                //compare with opened/updated tab
                if(cacheTabId == tab.id) {
                    //convert to bytes
                    var data = atob(dataURI.substring('data:image/jpeg;base64,'.length)),
                        uArr = new Uint8Array(data.length);

                    for(var i = 0, size = data.length; i < size; ++i)
                        uArr[i] = data.charCodeAt(i);

                    //save file to File System and LocalStorage
                    fs.root.getFile(imgName, {create: true}, function(fileEntry) {

                        fileEntry.createWriter(function(fileWriter) {

                            fileWriter.onwriteend = function(e) {

                                var jsonArr = JSON.parse(localStorage['dashSites']);

                                for(var i = 0, size = jsonArr.length; i < size; i++) {

                                    if(tab.url == jsonArr[i].url)
                                        jsonArr[i].image = fileEntry.toURL();
                                    else if(jsonArr[i].url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)[1].replace('www.', '') == domain)
                                        jsonArr[i].image = fileEntry.toURL();
                                }

                                localStorage['dashSites'] = JSON.stringify(jsonArr);

                                console.log(fileEntry.toURL());
                            };

                            fileWriter.onerror = function(e) {
                                console.log('Write failed: ' + e.toString());
                            };

                            fileWriter.write(new Blob([ uArr.buffer ], {type: 'image/jpeg'}));

                        }, errorHandler);
                    }, errorHandler);
                }
            });
        });
    }
});