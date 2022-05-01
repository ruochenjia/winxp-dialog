class DialogButton {
    constructor(text, onclick, disabled = false) {
        this.text = text;
        this.onclick = onclick;
        this.disabled = disabled;
    }
}

class AlertDialog {
    constructor(prop = {
        title: "",
        message: "",
        buttons: [],
        disableCloseButton: false,
        icon: "error.png",
        sound: "alert.wav",
        width: 256
    }) {
        // set default values to avoid crashing on undefined values
        if (prop == null) prop = {};
        if (prop.title == null) prop.title = "";
        if (prop.message == null) prop.message = "";
        if (prop.buttons == null) prop.buttons = [];
        if (prop.disableCloseButton == null) prop.disableCloseButton = false;
        if (prop.icon == null) prop.icon = "error.png";
        if (prop.sound == null) prop.sound = "alert.wav";
        if (prop.width == null) prop.width = 256;

        this.prop = prop;
    }

    _absUrl(target = "") {
        if (target.startsWith("https://") || target.startsWith("http://"))
            return target; // already a absolute url
        
        if (target == "" || target == null)
            return "about:blank";
        
        let src = new Error().stack.match(/([^ \n])*([a-z]*:\/\/\/?)*?[a-z0-9\/\\]*\.js/ig)[0].substring(1);
        let base = new URL(src + "/..").href;
        if (!base.endsWith("/"))
            base += "/";
        return new URL(base + target).href;
    }

    _playSound() {
        let audio = new Audio(this._absUrl(this.prop.sound));
        audio.loop = false;
        audio.playbackRate = 1;
        audio.play();
    }

    _run() {
        // create frame
        let frame = document.createElement("iframe");
        frame.setAttribute("allowFullscreen", "true");
        frame.setAttribute("allowtransparency", "true");
        frame.setAttribute("scrolling", "no");
        frame.setAttribute("loading", "lazy");
        frame.style.position = "absolute";
        frame.style.display = "block";
        frame.style.width = "100%";
        frame.style.height = "100%";
        frame.style.top = "0px";
        frame.style.left = "0px";
        frame.style.right = "0px";
        frame.style.bottom = "0px";
        frame.style.border = "none";
        document.body.appendChild(frame);

        // load required document
        let request = new XMLHttpRequest();
        request.responseType = "text";
        request.open("GET", this._absUrl("alert.html"), true);
        request.onload = (e) => {
            let swin = frame.contentWindow;
            let sdoc = frame.contentDocument;
            swin.stop();
            sdoc.write(request.responseText);

            let slock = sdoc.getElementById("s-lock")
            slock.setAttribute("locked", "true");
            Object.freeze(swin.location);
            Object.freeze(sdoc.slock);

            let closeButton = sdoc.getElementById("dialog-header-rightbg");
            let buttonBar = sdoc.getElementById("dialog-button-bar");
            sdoc.getElementById("dialog").style.width = this.prop.width + "px";
            sdoc.getElementById("dialog-title").innerHTML = this.prop.title;
            sdoc.getElementById("dialog-message").innerHTML = this.prop.message;
            sdoc.getElementById("dialog-icon").src = this._absUrl(this.prop.icon);
            if (this.prop.disableCloseButton)
                closeButton.setAttribute("disabled", "true");
            else closeButton.onclick = (e) => this.dismiss();

            this.prop.buttons.forEach((e, i) => {
                let button = document.createElement("div");
                let buttonText = document.createElement("div");
                button.className = "dialog-button";
                buttonText.className = "dialog-button-text";
                buttonText.innerHTML = e.text;
                button.appendChild(buttonText);
                if (e.disabled)
                    button.setAttribute("disabled", "true");
                else button.onclick = e.onclick;
                buttonBar.appendChild(button);
            });

            this._playSound();
        };
        request.send();
        this.frame = frame;
    }

    _close() {
        if (this.frame != null)
            this.frame.remove();
    }

    show() {
        this._run();
    }

    alert() {
        this._run();
    }

    close() {
        this._close();
    }

    dismiss() {
        this._close();
    }
}

function alert(message, title = "Alert", icon = "warning.png") {
    let dialog = new AlertDialog({title: title, message: message, icon: icon, buttons: [new DialogButton("Close", ()=>dialog.close())]});
    dialog.show();
}