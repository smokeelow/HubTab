//Most usable elements
var Bookmarks, AddNewSite, Tabs, ModalWindow, ModalWindowClose, ModalContent, ModalBackground, Wrapper, HideElements;

/**
 * Main object
 *
 * @type object
 */
var Core = {};

/**
 * Ajax wrapper
 *
 * @param url
 * @param callback
 */
Core.ajax = function(url, callback) {
    var ajax = new XMLHttpRequest();

    ajax.open('GET', url, true);
    ajax.send();

    ajax.onreadystatechange = function() {
        if(ajax.readyState == 4) {
            if(ajax.status == 200 || ajax.status == 304) {
                if(callback && typeof callback === 'function')
                    callback(ajax.responseText);
            }
        }
    }
};

/**
 * Favicon url
 *
 * @param url
 * @returns {string}
 */
Core.getFaviconUrl = function(url) {
    return 'chrome://favicon/' + url;
};

/**
 * Cache most usable elements
 */
Core.getElements = function() {
    Bookmarks = document.getElementById('bookmarks');
    AddNewSite = document.getElementById('add-new-site');
    Tabs = document.getElementById('tabs');
    ModalWindow = document.getElementById('modal-window');
    ModalWindowClose = document.getElementById('modal-close');
    ModalContent = document.getElementById('modal-content');
    ModalBackground = document.getElementById('modal-background');
    Wrapper = document.getElementById('wrapper');
    HideElements = document.getElementById('hide-elements');
};

/**
 * Render user bookmarks
 */
Core.loadBookmarks = function() {
    chrome.bookmarks.getTree(function(treeNodes) {
        var nodes = treeNodes[0].children[0].children;

        for(var f in nodes) {
            var firstLevel = nodes[f];

            renderSubLevels(firstLevel);
        }
    });

    function renderSubLevels(firstLevel) {
        if(firstLevel.hasOwnProperty('children')) {
            var firstLevelElement = document.createElement('li');

            for(var s in firstLevel.children) {
                var secondLevel = firstLevel.children[s];

            }
        } else {
            Bookmarks.innerHTML += '<li><a href="' + firstLevel.url + '"><img src="' + Core.getFaviconUrl(firstLevel.url) + '" alt="' + firstLevel.title + '"/>' + firstLevel.title + '</a></li>';
        }
    }
};

/**
 * Most used web sites
 */
Core.tabs = function() {
    if(localStorage['dashSites']) {

    } else {
        Tabs.innerHTML += '<div class="empty-text">Please add some web site :(</div>';
    }
};

/**
 * Add new site action
 */
Core.addNewSite = function() {
    AddNewSite.addEventListener('click', function() {
        Core.showModal('add_form');
    });
};

/**
 * Shows modal window
 *
 * @param template
 * @param callback
 */
Core.showModal = function(template, callback) {
    Core.ajax('/templates/' + template + '.html', function(res) {
        ModalContent.innerHTML = res;
        ModalBackground.className = 'show-display';

        setTimeout(function() {
            ModalBackground.className += ' show-opacity';
        }, 50);

        ModalWindow.style.marginLeft = '-' + (ModalWindow.clientWidth / 2) + 'px';
        ModalWindow.style.width = ModalWindow.clientWidth + 'px';

        setTimeout(function() {
            ModalWindow.className = 'anim300 scale-normal top-modal';
            ModalContent.querySelector('input').focus();
            Core.formBehavior(template);
        }, 100);

        if(callback && typeof callback === 'function')
            callback();
    });
};

/**
 * Close modal window
 */
Core.closeModal = function() {
    ModalBackground.className = '';
    ModalWindow.className = 'anim300';

    setTimeout(function() {
        Core.clearElement(ModalContent);
        ModalWindow.removeAttribute('style');
    }, 100);
};

/**
 * Modal window close button action
 */
Core.modalCloseButton = function() {
    ModalWindowClose.addEventListener('click', function() {
        Core.closeModal();
    });
};

/**
 * Check for saved sites
 *
 * @returns {boolean}
 */
Core.isDashSitesEmpty = function() {
    if(localStorage['dashSites'] != '' && typeof localStorage['dashSites'] !== 'undefined')
        return true;
    else
        return false;
};

/**
 * Remove all context menus
 */
Core.removeExistingMenu = function() {
    var check = document.getElementById('context-menu') || undefined;

    if(typeof check !== 'undefined') {
        document.body.removeChild(check);
    }
};

/**
 * Init buttons actions
 */
Core.buttonsActions = function() {
    Core.modalCloseButton();
};

/**
 * Set image path
 *
 * @param obj
 * @returns string
 */
Core.setImagePath = function(obj) {
    var retina = window.devicePixelRatio > 1;

    var imagePath = '';

    if(retina)
        imagePath = obj.retina;
    else
        imagePath = obj.normal;

    return imagePath;
};

/**
 * Form listeners
 *
 * @param type
 */
Core.formBehavior = function(type) {
    switch(type) {
        case 'add_form' :
            Core.addFormBehavior();
            break;
        case 'edit_form' :
            Core.editFormBehavior();
            break;
    }
};

/**
 * Remove selection from dash sites
 */
Core.removeSelectionFromDashSites = function() {
    var item = document.querySelector('.dash-site-link.selected-item') || undefined;

    if(item)
        item.className = 'dash-site-link';
};

/**
 * Add site form
 */
Core.addFormBehavior = function() {
    document.getElementById('add-form').addEventListener('submit', function(e) {
        e.preventDefault();

        Core.saveSiteToDash({
            url: document.getElementById('site-url').value,
            title: document.getElementById('site-title').value,
            image: ''
        });
    });
};

/**
 * Edit site form
 */
Core.editFormBehavior = function() {
    document.getElementById('edit-form').addEventListener('submit', function(e) {
        e.preventDefault();

        Core.updateSiteInDash({
            url: document.getElementById('site-url').value,
            title: document.getElementById('site-title').value,
            image: document.getElementById('site-image').value,
            index: document.getElementById('site-index').value
        });
    });
};

/**
 * Update site in dash
 *
 * @param obj
 */
Core.updateSiteInDash = function(obj) {
    var jsonArr = JSON.parse(localStorage['dashSites']);

    jsonArr.splice(obj.index, 1, {url: obj.url, title: obj.title, image: obj.image});

    localStorage['dashSites'] = JSON.stringify(jsonArr);

    Core.closeModal();
    Core.updateSitesDash();
};

/**
 * Save changed positions of dash sites
 */
Core.saveChangedPositions = function() {
    var jsonArr = [],
        sites = Tabs.getElementsByClassName('dash-site-link');

    for(var i = 0, size = sites.length; i < size; i++) {
        if(sites[i].hasAttribute('data-object'))
            jsonArr[i] = JSON.parse(sites[i].getAttribute('data-object'));
    }

    localStorage['dashSites'] = JSON.stringify(jsonArr);
};

/**
 * Save site to the dashboard
 *
 * @param obj [url|title]
 */
Core.saveSiteToDash = function(obj) {
    var jsonArr = [];

    if(Core.isDashSitesEmpty())
        jsonArr = JSON.parse(localStorage['dashSites']);

    jsonArr.push(obj);
    localStorage['dashSites'] = JSON.stringify(jsonArr);

    Core.closeModal();
    Core.updateSitesDash();
};

/**
 * Delete dash site
 *
 * @param index
 */
Core.removeDashSiteByIndex = function(index) {
    var jsonArr = JSON.parse(localStorage['dashSites']);

    jsonArr.splice(index, 1);

    localStorage['dashSites'] = JSON.stringify(jsonArr);
    Core.updateSitesDash();
};


/**
 * Reindex dash sites
 */
Core.reIndexSitesDash = function(cells) {
    var sites = Tabs.getElementsByClassName('dash-site-link'),
        cell = 0;

    for(var i = 0, size = sites.length; i < size; i++) {
        var site = sites[i];
        site.classList.remove('first-cell-elem');
        site.classList.remove('last-cell-elem');

        if(i != 0 && cell < cells)
            cell++;
        else if(cell == cells)
            cell = 0;

        if(cell == 0)
            site.classList.toggle('first-cell-elem');
        else if(cell == cells)
            site.classList.toggle('last-cell-elem');

        sites[i].setAttribute('data-index', i);
    }
};

/**
 * Get dash site
 *
 * @param index
 * @returns object
 */
Core.getDashSite = function(index) {
    return JSON.parse(localStorage['dashSites'])[index];
};

/**
 * Remove all elements from tabs container
 */
Core.clearElement = function(element) {
    var i = element.childElementCount;

    while(--i >= 0)
        element.removeChild(element.firstChild);
};

/**
 * Update sites bookmarks
 */
Core.updateSitesDash = function() {
    if(Core.isDashSitesEmpty()) {

        Core.clearElement(Tabs);

        var jsonArr = JSON.parse(localStorage['dashSites']);

        for(var i = 0, size = jsonArr.length; i < size; i++) {
            var site = jsonArr[i],
                siteWrapper = document.createElement('div'),
                image = document.createElement('img'),
                imageWrapper = document.createElement('div'),
                title = document.createElement('div'),
                imgTitleWrapper = document.createElement('div');

            imageWrapper.className = 'image-wrapper';
            imageWrapper.appendChild(image);

            siteWrapper.className = 'dash-site-link';
            siteWrapper.setAttribute('data-object', JSON.stringify(site));
            siteWrapper.setAttribute('data-url', site.url);
            siteWrapper.setAttribute('data-index', i);
            siteWrapper.setAttribute('draggable', 'true');

            title.className = 'title';
            title.textContent = site.title;

            if(site.image == '') {
                image.src = 'data:image/png;base64,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';
                image.className = 'no-image';
                image.setAttribute('draggable', 'false');
            } else {
                imageWrapper.style.cssText = 'background-image:url(' + site.image + ')';
                imageWrapper.className += ' has-background-image';
            }

            imgTitleWrapper.className = 'content-wrapper';

            imgTitleWrapper.appendChild(imageWrapper);
            imgTitleWrapper.appendChild(title);

            siteWrapper.appendChild(imgTitleWrapper);

            siteWrapper.addEventListener('click', function(e) {
                if(e.which == 2) {
                    window.open(this.getAttribute('data-url'), '_blank');
                } else
                    window.location = this.getAttribute('data-url');
            });

            //context menu for dash site
            Core.contextMenu(siteWrapper, function(context, e) {
                var dashSiteLink = e.target.classList.contains('dash-site-link') ? e.target : e.target.parentNode.classList.contains('dash-site-link') ? e.target.parentNode : e.target.parentNode.parentNode;
                dashSiteLink.className += ' selected-item';

                var siteIndex = dashSiteLink.getAttribute('data-index');

                /**
                 * Edit button
                 * @type {HTMLElement}
                 */
                var edit = document.createElement('div');
                edit.textContent = 'Edit';
                edit.addEventListener('click', function() {
                    Core.showModal('edit_form', function() {
                        site = Core.getDashSite(siteIndex);
                        ModalContent.getElementsByClassName('form-title')[0].textContent = 'Edit ' + site.title;

                        //fill form
                        document.getElementById('site-url').value = site.url;
                        document.getElementById('site-title').value = site.title;
                        document.getElementById('site-index').value = siteIndex;
                        document.getElementById('site-image').value = site.image;
                    });
                });

                var del = document.createElement('div');
                del.textContent = 'Delete';
                del.addEventListener('click', function() {
                    Core.removeDashSiteByIndex(siteIndex);
                });

                context.appendChild(edit);
                context.appendChild(del);
            });

            Tabs.appendChild(siteWrapper);
        }
    }

    Core.dragEvents();
};

/**
 * Custom context menu
 *
 * @param element
 * @param callback
 */
Core.contextMenu = function(element, callback) {

    var context = document.createElement('div');

    element.addEventListener('contextmenu', function(e) {
        e.stopPropagation();
        e.preventDefault();

        Core.removeExistingMenu();
        Core.removeSelectionFromDashSites();
        Core.clearElement(context);
        
        context.style.opacity = 1;
        context.setAttribute('id', 'context-menu');
        context.style.top = e.pageY + 'px';
        context.style.left = e.pageX + 'px';

        if(callback && typeof callback === 'function')
            callback(context, e);

        document.body.appendChild(context);
    });

    document.addEventListener('click', function() {
        context.style.opacity = 0;

        setTimeout(function() {
            Core.removeExistingMenu();
        }, 100);

        Core.removeSelectionFromDashSites();
    });
};

/**
 * Global context menu items
 */
Core.globalContextMenu = function() {
    Core.contextMenu(document.firstElementChild, function(context) {

        /**
         * Add site
         * @type {HTMLElement}
         */
        var addSite = document.createElement('div');
        addSite.textContent = 'Add site';
        addSite.addEventListener('click', function() {
            Core.showModal('add_form');
        });

        var addSiteImage = document.createElement('img');

        addSiteImage.src = Core.setImagePath({
            retina: 'data:image/png;base64,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',
            normal: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABR0lEQVQ4T62TzUqCQRSGs7+N2TZoGW3CFAn6uYHc2UUkRFEURN5FWC0KgvImdJF5ARUF/ZjuXAZt+9uYYc8Lc2JQgwn64GFmzjfnPWdmzon0dX/TmLKwCGPu9zNjBU6g7rtEvMUw8zyswkAPYZm+4BB24FMGE5BzyUVtMhbgFBpOaNJltcw4BGVYgqYJHLNYgSfIwO0vGcxgL8I4HMG6BBJwJzWYhwfPue3m/lFT2C5hEJL6cQCbsAfbHZF7CWjLPmzJRwK61SmYhZtAAWWqLB4l8AoxxzujRe3Q+lnKZxRe5KuFnKIwAh+BAgqowG/+EeYwXAceYYF9F1DzL1EFshEooCdcs0uMM7mHFiiLkGe8Yl8/JOx97Vn+Uki7CORMQOWpUk6DX8pVd6QkoxrMSvmMuSq29W/N5N+dtbOymXA/1FTn0NXO3/DCTwl5AcApAAAAAElFTkSuQmCC'
        });

        addSite.appendChild(addSiteImage);

        context.appendChild(addSite);
    });
};

/**
 * Custom hotkeys
 */
Core.hotKeys = function() {
    var keys = [];

    document.body.addEventListener('keydown', function(e) {
        keys[e.keyCode] = true;
    });

    document.body.addEventListener('keyup', function(e) {

        //add site
        if(keys[16] && keys[65])
            Core.showModal('add_form');

        keys[e.keyCode] = false;
    });
};

/**
 * All drag events
 */
Core.dragEvents = function() {
    //cache
    var dashSites = Tabs.getElementsByClassName('dash-site-link'),
        dashSitesSize = dashSites.length,
        headStyles = document.createElement('style'),
        cells = 3,
        DragElement;

    /**
     * Handle 'dragstart' event
     *
     * @param e
     */
    function dragStart(e) {
        DragElement = this;
        this.className += ' hide-opacity';

        e.dataTransfer.setDragImage(this, 0, 0);
        e.dataTransfer.effectAllowed = 'move';
    }

    /**
     * Handle 'dragover' event
     *
     * @param e
     * @returns {boolean}
     */
    function dragOver(e) {
        e.preventDefault();

        e.dataTransfer.dropEffect = 'move';

        return false;
    }

    function insertAfter(referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    /**
     * Handle 'dragenter' event
     *
     * @param e
     */
    function dragEnter(e) {
        if(DragElement != this) {
            this.className += ' over';

            if(this.classList.contains('last-cell-elem'))
                Tabs.insertBefore(DragElement, this.nextSibling);
            else if(this.classList.contains('first-cell-elem'))
                Tabs.insertBefore(DragElement, this);
            else
                Tabs.insertBefore(DragElement, this.nextSibling);

            Core.saveChangedPositions();
            Core.reIndexSitesDash(cells);
        }
    }

    /**
     * Handle 'dragleave' envent
     *
     * @param e
     */
    function dragLeave(e) {
        this.classList.remove('over');  // this / e.target is previous target element.
    }

    /**
     * Handle 'dragdrop' event
     *
     * @param e
     * @returns {boolean}
     */
    function dragDrop(e) {
        if(e.stopPropagation)
            e.stopPropagation();

        if(DragElement != this) {

        }

        return false;
    }

    /**
     * Handle 'dragend' event
     *
     * @param e
     */
    function dragEnd(e) {
        this.classList.remove('hide-opacity');

        for(var i = 0; i < dashSitesSize; i++)
            dashSites[i].classList.remove('over');
    }

    for(var i = 0, left = 0, top = 0, raw = 0, cell = 0; i < dashSitesSize; i++) {
        var site = dashSites[i];

        site.addEventListener('dragstart', dragStart);
        site.addEventListener('dragenter', dragEnter)
        site.addEventListener('dragover', dragOver);
        site.addEventListener('dragleave', dragLeave);
        site.addEventListener('dragdrop', dragDrop);
        site.addEventListener('dragend', dragEnd);

        if(i != 0 && cell < cells)
            cell++;
        else if(cell == cells)
            cell = 0;

        if(cell == 0)
            left = 0;
        else
            left = cell + '00%';

        if(i != 0 && i % (cells + 1) == 0) {
            left = 0;
            raw++;

            top = raw + '00%';
        }

        if(cell == 0)
            site.className += ' first-cell-elem';
        else if(cell == cells)
            site.className += ' last-cell-elem';

        headStyles.textContent += '.dash-site-link:nth-child(' + (i + 1) + '){-webkit-transform: translate3d(' + left + ', ' + top + ', 0)}';
    }

    document.head.appendChild(headStyles);
};

/**
 * Init all functionality
 */
Core.init = function() {
    Core.globalContextMenu();
//    Core.hotKeys();
//    Core.loadBookmarks();
    Core.getElements();
    Core.tabs();
    Core.buttonsActions();
    Core.updateSitesDash();
};

//run app
window.addEventListener('DOMContentLoaded', function() {
    Core.init();
});