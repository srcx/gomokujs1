var MMService = function(baseURL, mbox) {
	this.baseURL = baseURL;
	this.mboxURL = this.baseURL + "/mbox/";
	this.mbox = (mbox) ? mbox : Math.uuidCompact();
};
var DELIM = "\r\n";
MMService.prototype = {
	send: function(selector, content) {
		$.post(this.mboxURL + this.mbox, selector + DELIM + content);
	},
	receive: function(msgid, selector, callback) {
		$.get(this.mboxURL + this.mbox + "/" + msgid + ((selector != null) ? "/" + selector : ""), function(data) {
			var msgs = new Array();
			var i = data.indexOf(DELIM);
			if (i > -1) {
				var msgCount = parseInt(data.substring(0, i));
				i += DELIM.length;
				for (var j = 0; j < msgCount; j++) {
					var k = data.indexOf(DELIM, i);
					var msgid = data.substring(i, k);
					i = k + DELIM.length;
					k = data.indexOf(DELIM, i);
					var selector = data.substring(i, k);
					i = k + DELIM.length;
					k = data.indexOf(DELIM, i);
					var contentLen = parseInt(data.substring(i, k));
					i = k + DELIM.length;
					/*
					 * FIXME contentLen is binary length, but our text is decoded and may have completely different length
					 * so we just ignore it and search for CRLF which would obviously break for some binary data and even
					 * some text data
					 */
//					k = i + contentLen;
					k = data.indexOf(DELIM, i);
					var content = data.substring(i, k);
					i = k + DELIM.length;
					msgs.push({ msgid: msgid, selector: selector, content: content });
				}
			}
			callback(msgs);
		});
	},
	startProcessing: function(msgid, selector, callback, interval) {
		var mms = this;
		var lastMsg = msgid;
		return setInterval(function() {
			mms.receive(lastMsg, selector, function(msgs) {
				for(var i = 0; i < msgs.length; i++) {
					lastMsg = msgs[i].msgid;
					callback(msgs[i]);
				}
			});
		}, interval);
	},
	stopProcessing: function(handle) {
		clearInterval(handle);
	},
	onSuccess: function(callback) {
		var mms = this;
		$(document).ajaxSuccess(function(e, xhr, settings) {
			if (settings.url.indexOf(mms.mboxURL) == 0) {
				callback();
			}
		});
	},
	onError: function(callback) {
		var mms = this;
		$(document).ajaxError(function(e, xhr, settings, exception) {
			if (settings.url.indexOf(mms.mboxURL) == 0) {
				callback(exception);
			}
		});
	}
};
