/**
 * Track all tabs updates
 *
 * @param tabID
 * @param tabState
 * @param tab
 */

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

/**
 * File System
 * @type object
 */
var fs = null;

function errorHandler(e) {
    console.log('Error: ' + e.name);
}

function fsInit() {
    window.requestFileSystem(window.TEMPORARY, 10 * 1024 * 1024, function(filesystem) {
        fs = filesystem;

        fs.root.getFile('vk_com.jpeg', {}, function(filentry){
            filentry.getMetadata(function(meta){

            })
        });
    }, errorHandler);
}

fsInit();

chrome.tabs.onUpdated.addListener(function(tabID, tabState, tab) {

    //wait for full load
    if(tab.url !== undefined && tabState.status == 'complete') {

        if(localStorage['dashSites'].indexOf(tab.url.split('/')[2].replace('www.', '')) > -1) {
            chrome.tabs.captureVisibleTab(null, function(dataURI) {

                var data = atob(dataURI.substring('data:image/jpeg;base64,'.length)),
                    uArr = new Uint8Array(data.length),
                    imgName = tab.url.split('/')[2].replace('www.', '').replace('.', '_') + '.jpeg';

                for(var i = 0, size = data.length; i < size; ++i)
                    uArr[i] = data.charCodeAt(i);

                fs.root.getFile(imgName, {create: true}, function(fileEntry) {

                    fileEntry.createWriter(function(fileWriter) {

                        fileWriter.onwriteend = function(e) {

                            var jsonArr = JSON.parse(localStorage['dashSites']);

                            for(var i = 0, size = jsonArr.length; i < size; i++) {
                                if(jsonArr[i].url.indexOf(tab.url.split('/')[2].replace('www.', '')) > -1)
                                    jsonArr[i].image = fileEntry.toURL();
                            }

                            localStorage['dashSites'] = JSON.stringify(jsonArr);
                        };

                        fileWriter.onerror = function(e) {
                            console.log('Write failed: ' + e.toString());
                        };

                        fileWriter.write(new Blob([ uArr.buffer ], {type: 'image/jpeg'}));

                    }, errorHandler);
                });
            });
        }
    }
});