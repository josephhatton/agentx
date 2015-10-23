//we use timeout here because we need to wait until angular has rendered the template.
//inelegant, yes, but angular doesnt really provide an event trigger for this.
//our modal plugin doesnt work with ajax so the controller should be caching the full imgs first.


var t_id = setTimeout(
    function () {
        var $modal_imgs = $("[data-modal='lightbox']");
        //now init the modals
        $modal_imgs.each(function (i, v) {
            $($modal_imgs[i]).on('click', function (e) {
                e.preventDefault();
                var url = this.href;
                //the api is picky about trailing slashes
                if(!url.match(/\/$/)){
                    url += '/';
                }
                picoModal({
                    content: "<img src=" + url + " />",
                    modalStyles: {
                        position: "absolute", top: ($(document).scrollTop() + 200) + "px",
                        backgroundColor: "#fff",
                        padding: "24px 24px 24px 24px",
                        borderRadius: "3px",
                        maxWidth: "800px"
                    }
                });
            });
        });

    }, 2000);