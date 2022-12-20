const FetchJSONP = (url, callback) => {
  let callbackFunc = "toll" + Math.floor(Math.random() * 1000001);

  window[callbackFunc] = (jsonp) => {
    let data = JSON.parse(JSON.stringify(jsonp));
    callback(data);

    setTimeout(() => {
      var prevScript = document.querySelector("." + callbackFunc);
      if (prevScript) {
        prevScript.remove();
      }
    }, 300);
  };

  url = url + "&callback=" + callbackFunc;
  let script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  script.className = callbackFunc;
  document.getElementsByTagName("head")[0].appendChild(script);

  script.onerror = function () {
    callback(null);
  };
};

export default FetchJSONP;
