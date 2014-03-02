/**
 * Update sites bookmarks
 */

Core.updateSitesDash = function() {
    if(Core.isDashSitesEmpty()) {

        Core.clearElement(Tabs);

        var jsonArr = JSON.parse(localStorage['dashSites']),
            templEl = document.createElement('div');

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
//            siteWrapper.setAttribute('data-object', JSON.stringify(site));
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
                imageWrapper.style.backgroundImage= 'url(' + site.image + ')';
                imageWrapper.className += ' has-background-image';
            }

            imgTitleWrapper.className = 'content-wrapper';

            imgTitleWrapper.appendChild(imageWrapper);
            imgTitleWrapper.appendChild(title);

            siteWrapper.appendChild(imgTitleWrapper);

            siteWrapper.addEventListener('click', function(e) {
                if(e.which == 2)
                    window.open(this.getAttribute('data-url'), '_blank');
                else
                    window.location = this.getAttribute('data-url');
            });

            //context menu for dash site
            Core.contextMenu(siteWrapper, function(context, e) {
                var dashSiteLink;

                if(e.target.classList.contains('dash-site-link'))
                    dashSiteLink = e.target;
                else if(e.target.parentNode.classList.contains('dash-site-link'))
                    dashSiteLink = e.target.parentNode;
                else if(e.target.parentNode.parentNode.parentNode.classList.contains('dash-site-link'))
                    dashSiteLink = e.target.parentNode.parentNode.parentNode;
                else
                    dashSiteLink = e.target.parentNode.parentNode;

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

            templEl.appendChild(siteWrapper);
        }

        Tabs.appendChild(templEl);
    }

    Core.dragEvents();
};