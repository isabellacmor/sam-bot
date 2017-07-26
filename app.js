var restify = require('restify');
var builder = require('botbuilder');
var secret = require('./secret.json');

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
var getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: secret.bot.app_id,
    appPassword: secret.bot.app_password
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

// Local storage
var HelpMessage = '\n * Play music\n * Play video\n * Start meditation\n * Text a friend';
var username_key = 'UserName';
var userWelcomed_key = 'UserWelcomed';
var currentFeeling_key = "CurrentFeeling";
var currentActivity_key = "CurrentActivity";
var address_key = "AddressKey";
var savedAddress;
session.userData[username_key] = null;

// Feelings definitions
var feelingsArray = ["Sad", 'Lonely', 'Anxious'];
var feelingMessage = new builder.Message()
  .text("How are you feeling?")
  .addAttachment({
      text: '',
      thumbnailUrl: 'https://github.com/isabellacmor/sam-bot/blob/master/images/sad.png?raw=true',
      actions: [ { title: 'Sad', message: 'Sad' }]
   })
  .addAttachment({
      text: '',
      thumbnailUrl: 'https://github.com/isabellacmor/sam-bot/blob/master/images/ok.png?raw=true',
      actions: [ { title: 'Lonely', message: 'Lonely' }]
   })
  .addAttachment({
      text: '',
      thumbnailUrl: 'https://github.com/isabellacmor/sam-bot/blob/master/images/depressed.png?raw=true',
      actions: [ { title: 'Anxious', message: 'Anxious' }]
  });

// Phrases
var greeting = "It's great to meet you ";
var aboutSam = "Hi, I'm Sam! I'm the buddy in your browser, looking out for you and making sure you're happy as a clam!";
var tipSam = "If you're not feeling your best, you can always come here to chat with me.\n\nI'll also keep an eye on your mood throughout the day and let you know if I think you need a little emotional break.";
var samActions = "You can ask me to 'play music', 'play video', and 'start meditation' at any time if you're not feeling your best.";

var phrases = {
  validating: [
    "Of course you\'re feeling this way. It must be a difficult situation.",
    "It\'s okay to feel this way and it means you\'re human.",
    "I can see how difficult this is for you. No one should have to go through that.",
    "You\'re not wrong for feeling the way you do and no one blames you for it."
  ],
  prompt: [
    "Do you want to talk about it more?",
    "Would you like to talk about it more?",
    "Do you want to tell me more about what you're feeling?",
    "Would you like to tell me more?"
  ],
  terminating: [
    "That\'s okay. I\'ll be here if you change your mind.",
    "I know this can be difficult to talk about. If you decide to share more with me, I\'ll be here.",
    "I understand. I\'ll be here for you when you\'re ready.",
    "You\'re not alone in this. I\'m here if you need me.",
    "Take your time. No one is rushing you to feel better. I\'ll be where when you need me."
  ],
  action: [
    "Would you like to watch a cute video to take your mind off things?",
    "Would you like me to play an upbeat song?",
    "Would you like to start a short meditation session?",
    "Going for a walk outside might help you clear your mind for a bit.",
    "Eating a sweet snack will give your brain a good-feeling boost."
  ]
};

// Main bot flow
var bot = new builder.UniversalBot(connector
  , [
  function(session) {
    savedAddress = session.message.address;
    //session.userData[username_key] = null;
    if(session.userData[username_key]) {
      session.beginDialog("askForFeeling");
    } else {
      session.beginDialog("OOBE");
    }
  },  // Initial validation + prompt response
      function (session, results) {
          session.userData[currentFeeling_key] = results.response.entity.toLowerCase();
          session.send(phrases.validating[getRandomInt(0, phrases.validating.length-1)]);
          session.beginDialog('promptDiscussion');
      },
      function (session, results) {
          // Process request and do action request by user.
          session.beginDialog('promptActivity');
      }, function (session, results) {
        session.send(phrases.terminating[getRandomInt(0, phrases.terminating.length-1)]);
        session.endDialog();
      }
]);
//   , [
//     // Ask for feeling
//     function (session) {
//         // is user's name set?
//         var userName = session.userData[username_key];
//         if (!userName) {
//             return session.beginDialog('greet');
//         }
//
//         // has the user been welcomed to the conversation?
//         if (!session.privateConversationData[userWelcomed_key]) {
//             session.privateConversationData[userWelcomed_key] = true;
//             session.send('Welcome back %s! Remember you can ask me to do the following at any time: %s', userName, HelpMessage);
//         }
//
//         session.beginDialog('askForFeeling');
//     },  // Initial validation + prompt response
//     function (session, results) {
//         session.userData[currentFeeling_key] = results.response.entity.toLowerCase();
//         session.send(phrases.validating[getRandomInt(0, phrases.validating.length-1)]);
//         session.beginDialog('promptDiscussion');
//     },
//     function (session, results) {
//         // Process request and do action request by user.
//         session.beginDialog('promptActivity');
//     }, function (session, results) {
//       session.send(phrases.terminating[getRandomInt(0, phrases.terminating.length-1)]);
//       session.endDialog();
//     }
// ]);

// OOBE dialog
bot.dialog('OOBE', [
    function (session) {
      var card = new builder.HeroCard(session)
        .title(aboutSam)
        //.subtitle('Your bots — wherever your users are talking')
        .text(tipSam)
        .images([
            builder.CardImage.create(session, 'http://i.imgur.com/2k16h0I.png')
        ])
        // .buttons([
        //     builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework/', 'Get Started')
        // ])
        ;
        // attach the card to the reply message
        var welcomeMessage = new builder.Message(session).addAttachment(card);

        session.send(welcomeMessage);

        setTimeout(function(){
          builder.Prompts.text(session, "What's your name?");
        }, 3000);
    },
    function (session, results) {
        session.send("Nice to meet you, %s!", results.response);
        session.userData[username_key] = results.response;
        var reply = createEvent("updateName", session.userData[username_key], session.message.address);
        session.send(reply);
        session.beginDialog('askForFeeling');
    }
    //, function (session, results) {
    //     session.beginDialog('askForFeeling');
    // }
])
.triggerAction({
    matches: /^test oobe$/i,
});

// Dialog to ask user how they are feeling
bot.dialog('askForFeeling', [
    function (session) {
        builder.Prompts.choice(session, feelingMessage, feelingsArray, {listStyle: builder.ListStyle.button});
        //builder.Prompts.choice(session, 'How are you feeling right now?', feelingsArray, {listStyle: builder.ListStyle.button});
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

// Dialog to ask the user if they want to talk about their feeling
bot.dialog('promptDiscussion', [
    function (session) {
      // Timeout to make this a little more human-like
      setTimeout(function(){
        var prompt = phrases.prompt[getRandomInt(0, phrases.prompt.length-1)];
        builder.Prompts.choice(session, prompt, "yes|no", {listStyle: builder.ListStyle.button});
      }, 3000);
    },
    function (session, results) {
        switch (results.response.entity) {
          case 'yes':
            session.beginDialog('doDiscussion');
            break;
          case 'no':
            // Continue to prompt for suggested activity
            session.endDialogWithResult(results);
            //session.beginDialog('promptActivity');
            break;
        }
    }
]);

// Dialog to ask user how they are feeling
bot.dialog('promptActivity', [
    function (session) {
        var chosenActivity = getRandomInt(0, phrases.action.length-1);
        session.userData[currentActivity_key] = chosenActivity;
        // First 3 prompts require a response.
        if(chosenActivity < 3) {
          builder.Prompts.choice(session, phrases.action[chosenActivity], "yes|no", {listStyle: builder.ListStyle.button});
        } else {
          session.endDialog(phrases.action[chosenActivity]);
        }
    },
    function (session, results) {
      if(results.response.entity === 'yes') {
          // Video
          if(session.userData[currentActivity_key] == 0) {
            session.beginDialog('playVideo');
          } else if(session.userData[currentActivity_key] == 1) {
            session.beginDialog('playMusic');
          } else if(session.userData[currentActivity_key] == 2) {
            session.beginDialog('startMeditation');
          }
      } else {
        //session.send(phrases.terminating[getRandomInt(0, phrases.terminating.length-1)]);
        session.endDialogWithResult(results);
      }
    }
]);

// Dialog to ask the user to talk more about their feelings
bot.dialog('doDiscussion', [
    function (session) {
        builder.Prompts.text(session, "I'm listening. Go ahead.");
    },
    function (session, results) {
        session.send(phrases.validating[getRandomInt(0, phrases.validating.length-1)]);
        session.beginDialog('promptDiscussion');
    }
]);

bot.set('persistConversationData', true);

// The dialog stack is cleared and this dialog is invoked when the user enters 'help'.
bot.dialog('playMusic', function (session, args, next) {
    var reply = createEvent("playMusic", "", session.message.address);
    session.endDialog(reply);
    //session.endDialog("This would start playing music right away.<br/>For now, say 'next' to continue.");
})
.triggerAction({
    matches: /^play music$/i,
});

// The dialog stack is cleared and this dialog is invoked when the user enters 'help'.
bot.dialog('playVideo', function (session, args, next) {
    var reply = createEvent("playVideo", "", session.message.address);
    session.endDialog(reply);
})
.triggerAction({
    matches: /^play video$/i,
});

// The dialog stack is cleared and this dialog is invoked when the user enters 'help'.
bot.dialog('startMeditation', function (session, args, next) {
    var reply = createEvent("startMeditation", "", session.message.address);
    session.endDialog(reply);
    //session.endDialog("This would start meditation right away.<br/>For now, say 'next' to continue.");
})
.triggerAction({
    matches: /^start meditation$/i,
});

// The dialog stack is cleared and this dialog is invoked when the user enters 'help'.
bot.dialog('help', function (session, args, next) {
    session.endDialog(samActions);
    //session.endDialog("This would start meditation right away.<br/>For now, say 'next' to continue.");
})
.triggerAction({
    matches: /^help$/i,
});

//Bot listening for inbound backchannel events
bot.on("event", function (event) {
    var handledEvent = false;
    savedAddress = event.address;
    var msg = new builder.Message().address(event.address);
    msg.textLocale("en-us");
    if (event.name === "buttonClicked") {
      msg.text("I see that you just pushed that button");
      handledEvent = true;
    }
    else if (event.name === "webSentiment") {
      msg.text("Sam is feeling sad 🙁  Want to look at some happier sites?");
      handledEvent = true;
    } else if(event.name === "startState") {
      if(event.value) {
        bot.beginDialog("askForFeeling");
      } else {
        bot.beginDialog("OOBE");
      }
      handledEvent = false;
    }

    if (handledEvent) {
        bot.send(msg);
    }
});

// Example for communicating from bot to extension
// session.message.text.split(" ")[1] -> access arguments typed after the triggerAction word
// "changeBackground" -> event name matches the event name in the extensions code
bot.dialog('changeBackground', function (session, args, next) {
  var reply = createEvent("changeBackground", session.message.text.split(" ")[1], session.message.address);
  session.endDialog(reply);
})
.triggerAction({
    matches: /^changebg\s[a-zA-Z]*$/i,
});

// Generic method for creating a backchannel event
const createEvent = (eventName, value, address) => {
    var msg = new builder.Message().address(address);
    msg.data.type = "event";
    msg.data.name = eventName;
    msg.data.value = value;
    return msg;
}
