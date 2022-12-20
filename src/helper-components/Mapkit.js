var LOADING = null;
var INITIALIZING = null;
var INITIALIZED = null;
var CALLBACKS = [];

const Mapkit = () => {
  var fireCallbacks = function () {
    for (var i = 0; i < CALLBACKS.length; i++) {
      CALLBACKS[i]();
    }

    CALLBACKS = [];
  };

  var initMapkit = function () {
    if (INITIALIZING) return;

    INITIALIZING = true;

    mapkit.init({
      // If you plan to use this code please use your own JWT key
      authorizationCallback: function (done) {
        var date = new Date().getTime();
        var callback = "toll" + Math.floor(Math.random() * 1000001);
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://www.tollbrothers.com/api/mapkitToken?cachebuster=" + date + "&callback=" + callback;

        window[callback] = function (data) {
          done(data.token);
        };

        document.getElementsByTagName("head")[0].appendChild(script);
      },
      language: "en",
    });

    mapkit.addEventListener("configuration-change", function (event) {
      switch (event.status) {
        case "Initialized":
          INITIALIZED = true;
          fireCallbacks();
          break;
      }
    });
  };

  var waitForMapkit = function () {
    if (typeof mapkit === "object" && typeof mapkit.init === "function") {
      initMapkit();
    } else {
      setTimeout(function () {
        waitForMapkit();
      }, 200);
    }
  };

  var loadMapkit = function (callback) {
    var url = "https://cdn.apple-mapkit.com/mk/5.44.0/mapkit.js";

    if (callback) CALLBACKS.push(callback);

    if (typeof mapkit === "object") {
      fireCallbacks();
      return;
    }

    if (typeof mapkit !== "object" && !LOADING) {
      LOADING = true;
      var class_name = "js-mapkit-maps-api";
      var prevScript = document.querySelector("." + class_name);

      if (prevScript) {
        prevScript.remove();
      }

      var script = document.createElement("script");
      script.src = url;
      script.type = "text/javascript";
      script.className = class_name;
      document.body.appendChild(script);
    }

    if (!INITIALIZED) {
      waitForMapkit();
    } else {
      fireCallbacks();
    }
  };

  return {
    load: loadMapkit,
  };
};

export default Mapkit;
