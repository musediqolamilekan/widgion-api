const WidgionAPI = (() => {
    let chatIframe = null;
    let widgetKey = null;
    let widgetSettings = {};
    let chatOpened = false;
    let isLoaded = false;

    /**
     * Loads the widget script dynamically
     */
    function loadScript(widgetKey, callback) {
        if (isLoaded) return;

        const script = document.createElement("script");
        script.src = `https://5077-197-211-63-171.ngrok-free.app/chat/widget/${widgetKey}.js`; // Fetches settings
        script.async = true;
        script.charset = "UTF-8";
        script.setAttribute("crossorigin", "*");

        script.onload = () => {
            isLoaded = true;
            if (callback) callback();
        };

        document.head.appendChild(script);
    }

    /**
     * Fetch widget settings from the API
     */
    function fetchWidgetSettings(widgetKey, callback) {
        fetch(`https://5077-197-211-63-171.ngrok-free.app/chat/widget/${widgetKey}`)
            .then(response => response.json())
            .then(data => {
                widgetSettings = data;
                callback();
            })
            .catch(error => console.error("Failed to fetch widget settings:", error));
    }

    /**
     * Opens the widget chat based on `displayType`
     */
    function openChat() {
        if (!chatIframe) createChatIframe();
        if (chatOpened) return;

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const displayType = widgetSettings.displayType ?? 0;

        if (isMobile) {
            // Mobile: Fullscreen mode
            Object.assign(chatIframe.style, {
                width: "100%",
                height: "100vh",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                borderRadius: "0px",
                zIndex: "1000003",
            });
        } else if (displayType === 1) {
            // Drawer mode
            chatIframe.style.transform = widgetSettings.position === 1 ? "translateX(400px)" : "translateX(-400px)";
            chatIframe.style.display = "block";
        } else {
            // Bottom corner mode
            Object.assign(chatIframe.style, {
                width: "400px",
                height: "650px",
                bottom: "20px",
                right: "20px",
                opacity: "1",
                pointerEvents: "auto",
            });
        }

        chatOpened = true;
    }

    /**
     * Closes the chat widget
     */
    function closeChat() {
        if (!chatOpened || !chatIframe) return;

        if (widgetSettings.displayType === 1) {
            // Close drawer
            chatIframe.style.transform = widgetSettings.position === 1 ? "translateX(-400px)" : "translateX(400px)";
        } else {
            // Minimize widget
            Object.assign(chatIframe.style, {
                width: "0px",
                height: "0px",
                opacity: "0",
                pointerEvents: "none",
            });
        }

        chatOpened = false;
    }

    /**
     * Creates the chat iframe dynamically
     */
    function createChatIframe() {
        if (chatIframe) return;

        chatIframe = document.createElement("iframe");
        chatIframe.src = `https://5077-197-211-63-171.ngrok-free.app/load/chat/${widgetKey}`;
        chatIframe.style.position = "fixed";
        chatIframe.style.zIndex = "1000002";
        chatIframe.style.border = "none";
        chatIframe.style.boxShadow = "rgba(0, 0, 0, 0.16) 0px 5px 40px";
        chatIframe.style.overflow = "hidden";
        chatIframe.style.backgroundColor = "transparent";
        chatIframe.allowTransparency = true;
        chatIframe.style.padding = "0";
        chatIframe.style.margin = "0";

        document.body.appendChild(chatIframe);
    }

    return {
        /**
         * Initializes the WidgionAPI
         */
        init: ({ key, triggerOpen, triggerClose }) => {
            widgetKey = key;

            fetchWidgetSettings(widgetKey, () => {
                loadScript(widgetKey, () => {
                    createChatIframe();
                });
            });

            if (triggerOpen) {
                document.querySelector(triggerOpen).addEventListener("click", WidgionAPI.open);
            }

            if (triggerClose) {
                document.querySelector(triggerClose).addEventListener("click", WidgionAPI.close);
            }
        },

        open: openChat,
        close: closeChat,
        destroy: () => {
            if (chatIframe) {
                document.body.removeChild(chatIframe);
                chatIframe = null;
            }
        }
    };
})();

// Export for NPM
if (typeof module !== "undefined" && module.exports) {
    module.exports = WidgionAPI;
}
