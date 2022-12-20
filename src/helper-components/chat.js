//src/main/resources/js/modules/chat.js

const Chat = () => {
  let chatID;
  let chatJDE;
  var DATA_INTERVAL = null;
  var status = "offline";

  let init = function (id, jde) {
    chatID = id;
    chatJDE = jde;

    waitForChatScript();
  };

  /* var toggleTrackEvents = function () {

        window.setTimeout(function () {
            toll.chatTrackEvents = !toll.chatTrackEvents;
        }, 2000);

    }; */

  var sendPageName = function () {
    embedded_svc.liveAgentAPI.sendCustomEvent("page_name", getPageName());
  };

  var sendPageUrl = function () {
    embedded_svc.liveAgentAPI.sendCustomEvent("page_url", window.location.href);
  };

  var waitForChatScript = function () {
    //console.log('wait for chat script');

    if (window.embedded_svc) {
      console.log("chat script loaded - do the things");
      initChatConfiguration();
    } else {
      setTimeout(function () {
        waitForChatScript();
      }, 500);
    }
  };

  var clearDataInterval = function () {
    if (DATA_INTERVAL) {
      clearInterval(DATA_INTERVAL);
      DATA_INTERVAL = null;
    }
  };

  var sendPageDataOnPageLoad = function () {
    if (DATA_INTERVAL) return;

    DATA_INTERVAL = setInterval(function () {
      if (embedded_svc && embedded_svc.liveAgentAPI) {
        sendPageName();
        sendPageUrl();
        clearDataInterval();
      }
    }, 5000);
  };

  var getVisitorName = function () {
    var first = "";
    var last = "";

    /* if (toll.chatUser && toll.chatUser.name) {
            var split = toll.chatUser.name.split(' ');

            if (split && split.length > 1) {
                first = split[0];
                last = split[split.length - 1];
            } else {
                first = toll.chatUser.name;

            }

        } */

    return {
      first: first,
      last: last,
    };
  };

  var setChatConfiguration = function () {
    var visitorName = getVisitorName();
    var visitorEmail = "";

    /* if (toll.chatUser && toll.chatUser.email) {
            visitorEmail = toll.chatUser.email;
        } */

    // GA data for salesforce integration
    var gaClientId = "";
    var gaUserId = "";
    var gaTrackId = "";

    if (typeof ga !== "undefined" && typeof ga.getAll === "function") {
      var gaTracker = ga.getAll()[0];

      var temp_gaClientId = gaTracker.get("clientId");
      if (typeof temp_gaClientId !== "undefined") {
        gaClientId = temp_gaClientId;
      }

      var temp_gaUserId = gaTracker.get("userId");
      if (typeof temp_gaUserId !== "undefined") {
        gaUserId = temp_gaUserId;
      }

      var temp_gaTrackId = gaTracker.get("trackingId");
      if (typeof temp_gaTrackId !== "undefined") {
        gaTrackId = temp_gaTrackId;
      }
    }

    embedded_svc.settings.displayHelpButton = false; //Or false
    //embedded_svc.settings.language = ''; //For example, enter 'en' or 'en-US'

    embedded_svc.settings.defaultMinimizedText = "Online Sales Team"; //(Defaults to Chat with an Expert)
    embedded_svc.settings.disabledMinimizedText = "Online Sales Team"; //(Defaults to Agent Offline)
    embedded_svc.settings.loadingText = "Online Sales Team"; //(Defaults to Loading)

    // Settings for Chat
    embedded_svc.settings.directToButtonRouting = function (prechatFormData) {
      // Dynamically changes the button ID based on what the visitor enters in the pre-chat form.
      // Returns a valid button ID.
      //console.log(prechatFormData)
    };

    embedded_svc.settings.prepopulatedPrechatFields = {
      FirstName: visitorName.first,
      LastName: visitorName.last,
      Email: visitorEmail,
      Company: "n/a",
    }; //Sets the auto-population of pre-chat form fields

    embedded_svc.settings.extraPrechatFormDetails = [
      {
        label: "JDE",
        value: chatJDE, //getUserStartJDE(toll.chatJde),
        displayToAgent: true,
        transcriptFields: ["jde_number__c"],
      },
      {
        label: "First Name",
        displayToAgent: true,
        transcriptFields: ["First_Name__c"],
      },
      {
        label: "Last Name",
        displayToAgent: true,
        transcriptFields: ["Last_Name__c"],
      },
      {
        label: "Email",
        displayToAgent: true,
        transcriptFields: ["Email__c"],
      },
      {
        label: "GACLIENTID__c",
        value: gaClientId,
        displayToAgent: false,
        transcriptFields: ["GACLIENTID__c"],
      },
      {
        label: "GATRACKID__c",
        value: gaTrackId,
        displayToAgent: false,
        transcriptFields: ["GATRACKID__c"],
      },
      {
        label: "GAUSERID__c",
        value: gaUserId,
        displayToAgent: false,
        transcriptFields: ["GAUSERID__c"],
      },
    ];

    // https://help.salesforce.com/articleView?id=000319423&type=1&mode=1
    embedded_svc.settings.extraPrechatInfo = [
      {
        entityFieldMaps: [
          {
            doCreate: false,
            doFind: false,
            fieldName: "LastName",
            isExactMatch: false,
            label: "Last Name",
          },
          {
            doCreate: false,
            doFind: false,
            fieldName: "FirstName",
            isExactMatch: false,
            label: "First Name",
          },
          {
            doCreate: false,
            doFind: true,
            fieldName: "Email",
            isExactMatch: true,
            label: "Email",
          },
        ],
        entityName: "Contact",
      },
      {
        entityFieldMaps: [
          {
            doCreate: true,
            doFind: false,
            fieldName: "LastName",
            isExactMatch: false,
            label: "Last Name",
          },
          {
            doCreate: true,
            doFind: false,
            fieldName: "FirstName",
            isExactMatch: false,
            label: "First Name",
          },
          {
            doCreate: true,
            doFind: true,
            fieldName: "Email",
            isExactMatch: true,
            label: "Email",
          },
        ],
        entityName: "Lead",
      },
    ];

    //embedded_svc.settings.fallbackRouting = []; //An array of button IDs, user IDs, or userId_buttonId
    //embedded_svc.settings.offlineSupportMinimizedText = '...'; //(Defaults to Contact Us)

    embedded_svc.settings.enabledFeatures = ["LiveAgent"];
    embedded_svc.settings.entryFeature = "LiveAgent";

    embedded_svc.init(
      "https://tollbros.my.salesforce.com",
      "https://tollbrothers.force.com/campaignmarketplace",
      "https://service.force.com",
      "00D36000001HM6g",
      "OSC_Pennsylvania_Midwest",
      {
        baseLiveAgentContentURL: "https://c.la1-c1-ia4.salesforceliveagent.com/content",
        deploymentId: "5723q000000NXMb",
        buttonId: chatID,
        baseLiveAgentURL: "https://d.la1-c1-ia4.salesforceliveagent.com/chat",
        eswLiveAgentDevName: "OSC_Pennsylvania_Midwest",
        isOfflineSupportEnabled: false,
      }
    );
  };

  var handleAgentStatus = function (data, minimzie) {
    var agent = {};
    var status = data.status;

    console.log(data);
    console.log(status);

    if (status === "online") {
      status = "online";
      console.log("---- SET OSC ONLINE");
      document.body.classList.add("osc-is-online");
      /* $('body').addClass('osc-is-online');
            agent = cleanAgentData(data);
            toll.onlineAgent = agent; */
    } else {
      /* $('body').removeClass('osc-is-online').addClass('osc-is-offline');
            toll.onlineAgent = null; */
      document.body.classList.remove("osc-is-online");
      document.body.classList.add("osc-is-offline");
      console.log("---- SET OSC OFFLINE");
    }

    /* toll.caoStatus = status;

        if (callback) {

            callback({
                status: status,
                agent: agent
            });

        } */
  };

  var addChatEventListeners = function () {
    embedded_svc.addEventHandler("afterMaximize", function (data) {
      $(document).trigger("chatOpened");
    });

    embedded_svc.addEventHandler("afterMinimize", function (data) {
      $(document).trigger("chatOpened");
    });

    embedded_svc.addEventHandler("afterDestroy", function () {
      $(document).trigger("chatClosed");
      localStorage.removeItem("activeChatOnSF");
      clearDataInterval();
    });

    embedded_svc.addEventHandler("onChatEndedByChasitor", function () {
      localStorage.removeItem("activeChatOnSF");
      clearDataInterval();
    });

    embedded_svc.addEventHandler("onChatEndedByAgent", function () {
      localStorage.removeItem("activeChatOnSF");
      clearDataInterval();
    });

    embedded_svc.addEventHandler("onIdleTimeoutOccurred", function () {
      localStorage.removeItem("activeChatOnSF");
      clearDataInterval();
    });

    embedded_svc.addEventHandler("onAgentMessage", function (data) {
      /* if (toll.chatTrackEvents) {
                dataLayer.push({'event': 'chatStarted'});
                toggleTrackEvents();
            } */

      if (chatJDE && !getCookie("chatJde")) {
        document.cookie = "chatJde=" + chatJDE + "; path=/";
      }

      localStorage.setItem("activeChatOnSF", 1);

      sendPageName();
      sendPageUrl();
    });

    if (localStorage.getItem("activeChatOnSF")) {
      sendPageDataOnPageLoad();
    }
  };

  var initChatConfiguration = function () {
    console.log("INIT CHAT CONFIG");
    console.log(chatID);

    if (chatID && chatID !== "" && chatJDE && chatJDE !== "") {
      //database will store SF queue button ids
      //toll.chatId = '5733q000000WBig';  //turn this on for testing
      //console.log('SF chat');
      //console.log(toll.chatId);
      //console.log(toll.chatJde);
      //console.log(toll.chatPhone);

      fetch("https://6kodci7q0f.execute-api.us-east-1.amazonaws.com/Prod/chatstatus?chatId=" + [chatID], {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
        .then(function (response) {
          console.log("chat script success... now do soemtyhing with the data.");
          return response.json(); //maybe shouldn't be JSOND
        })
        .then(function (myJson) {
          console.log("SUCCESS");
          console.log(myJson);

          addChatEventListeners();
          setChatConfiguration();
          handleAgentStatus(myJson);
        })
        .catch((error) => {
          console.log("chat script loading error: ");
          console.log(error);
        });
    } else {
      /* if (callback) {
                toll.caoStatus = status;
                callback({status: status});
            } */
      console.log("no ids");

      //addChatEventListeners();
      //setChatConfiguration();
      //$('body').addClass('osc-is-offline');
    }
  };

  return {
    init: init,
  };
};

export default Chat;
