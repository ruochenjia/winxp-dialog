class DialogButton {
    constructor(text, onclick, disabled = false) {
        this.text = text;
        this.onclick = onclick;
        this.disabled = disabled;
    }
}

async function loadDoc(url) {
    let r = await fetch(url);
    if (r.ok)
        return await r.text();
    else throw new Error(`An error has occured: ${response.status}`);
}

function randInt(min = 0, max = 100) {
    let val = Math.random() * max;
    while (val < min)
        val = Math.random() * max;
    return Math.round(val);
}

function makeSound(file, rate = 1, detune = 0, loop = false) {
    // set default values to avoid crashing on undefined values
    if (rate == null) rate = 1;
    if (detune == null) detune = 0;
    if (loop == null) loop = false;

    let ctx = new window.AudioContext();
    let src = ctx.createBufferSource();
    let r = new XMLHttpRequest();
    r.open('GET', file, true);
    r.responseType = 'arraybuffer';
    r.onload = () => {
        let data = r.response;
        ctx.decodeAudioData(data, (buffer) => {
            src.buffer = buffer;
            src.playbackRate.value = rate;
            src.detune.value = detune;
            src.loop = loop;
            src.connect(ctx.destination);
        },
        (e) => console.log("Error with decoding audio data" + e.error));
    }
    r.send();
    src.play = src.start;
    src.play();
}

class AlertDialog {
    constructor(prop = {
        title: "",
        message: "",
        buttons: [],
        disableCloseButton: false,
        icon: "error.png",
        sound: "alert.wav"
    }) {
        // set default values to avoid crashing on undefined values
        if (prop == null) prop = {};
        if (prop.title == null) prop.title = "";
        if (prop.message == null) prop.message = "";
        if (prop.buttons == null) prop.buttons = [];
        if (prop.disableCloseButton == null) prop.disableCloseButton = false;
        if (prop.icon == null) prop.icon = "error.png";
        if (prop.sound == null) prop.sound = "alert.wav";

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

    async _createDialogFrame() {
        let frame = document.createElement("iframe");
        frame.src = "https://www.google.com";
        frame.setAttribute("allowFullscreen", "true");
        frame.setAttribute("allowtransparency", "true");
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

        let swin = frame.contentWindow;
        let sdoc = frame.contentDocument;
        sdoc.write(await loadDoc(this._absUrl("alert.html")));

        let slock = sdoc.getElementById("s-lock")
        slock.setAttribute("locked", "true");
        Object.freeze(swin.location);
        Object.freeze(sdoc.slock);

        this.frame = frame;
    }

    _playSound() {
        makeSound(this._absUrl(this.prop.sound));
    }

    async _run() {
        if (this.frame == null)
            await this._createDialogFrame();
        let swin = this.frame.contentWindow;
        let sdoc = this.frame.contentDocument;
        let closeButton = sdoc.getElementById("dialog-header-rightbg");
        let buttonBar = sdoc.getElementById("dialog-button-bar");
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