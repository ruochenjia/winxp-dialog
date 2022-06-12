"use strict";


let _root = (() => {
	let src = new URL(document.currentScript.src);
	let path = src.pathname;
	path = path.substring(0, path.lastIndexOf("/") + 1);
	src.pathname = path;
	return src;
})();

class DialogButton {
	constructor(text, onclick, disabled = false) {
		this.text = text;
		this.onclick = onclick;
		this.disabled = disabled;
	}
}

class AlertDialog {
	constructor(prop) {
		this.prop = this._defProp(prop);
	}

	_defProp(prop) {
		if (prop == null) prop = {};
		if (prop.title == null) prop.title = "";
		if (prop.message == null) prop.message = "";
		if (prop.buttons == null) prop.buttons = [];
		if (prop.disableCloseButton == null) prop.disableCloseButton = false;
		if (prop.icon == null) prop.icon = "images/error.png";
		if (prop.sound == null) prop.sound = "sounds/critical-stop.wav";
		if (prop.width == null) prop.width = 256;

		return prop;
	}

	_absUrl(url) {
		if (url == null || url.length == 0)
			return "about:blank";

		return new URL(url, _root).href;
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
		frame.setAttribute("style", "position:absolute;display:block;width:100%;height:100%;top:0px;left:0px;right:0px;bottom:0px;border:none;");
		frame.setAttribute("width", "1024");
		frame.setAttribute("height", "768");
		document.body.appendChild(frame);

		// load required document
		let request = new XMLHttpRequest();
		request.responseType = "text";
		request.open("GET", this._absUrl("alert.html"), true);
		request.onload = () => {
			frame.onload = () => {
				let swin = frame.contentWindow;
				let sdoc = frame.contentDocument;

				sdoc.getElementById("dialog").setAttribute("style", "width:" + this.prop.width + "px;");
				sdoc.getElementById("dialog-title").innerHTML = this.prop.title;
				sdoc.getElementById("dialog-message").innerHTML = this.prop.message;
				sdoc.getElementById("dialog-icon").setAttribute("src", this._absUrl(this.prop.icon));

				let closeButton = sdoc.getElementById("dialog-header-rightbg");
				let buttonBar = sdoc.getElementById("dialog-button-bar");
				if (this.prop.disableCloseButton)
					closeButton.setAttribute("disabled", "true");
				else closeButton.onclick = () => this.dismiss();

				this.prop.buttons.forEach((e) => {
					let button = document.createElement("div");
					let buttonText = document.createElement("div");
					button.setAttribute("class", "dialog-button");
					buttonText.setAttribute("class", "dialog-button-text");
					buttonText.innerHTML = e.text;
					button.appendChild(buttonText);
					if (e.disabled)
						button.setAttribute("disabled", "true");
					else button.onclick = e.onclick;
					buttonBar.appendChild(button);
				});

				this._playSound();
			};
			frame.setAttribute("srcdoc", request.responseText.replace(/\$baseurl/g, _root));
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

function alert(message, title = "Alert", icon = "images/warning.png") {
	let dialog = new AlertDialog({title: title, message: message, icon: icon, buttons: [new DialogButton("Close", ()=>dialog.close())]});
	dialog.show();
}