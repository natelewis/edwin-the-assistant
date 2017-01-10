# Edwin The Assistant v0.0.1 Alpha
[![Build Status](https://travis-ci.org/natelewis/edwin-the-assistant.svg?branch=master)](https://travis-ci.org/natelewis/edwin-the-assistant)

Edwin is an Artificial Intelligence robot designed to be flexible, and extensible platform to create unique, interesting and useful experiences to interact with.  Edwin can be used as a generic all purpose assistant bot, or for a specific single use action. The projectss current state is under alpha development while experimenting with AI core concpets and module organizational patterns.

##### Conversation Handlers:
 * Google Assistant ( Google Home )
 * Slack Bot
 * Google Hangouts Bot

##### 3rd Party Integrations 
 * Sonos ( Volume, pause, resume type functionality )
 * Twilio ( Texting with predefined contact list )

##### Core Intelligence
 * Greetings
 * Describe ( sentences )

## Setup Instructions
After cloning this repo, run Edwin the first time:

``` sh
npm install
npm start
```

If all went well, your app will stop and list the handlers and how to configure them.  Each integration will have an entry in the newly created config.js located in the root of this repo.  Just replace the undefined values with your settings and restart your server.

## Slack Setup
From your Slack account get a token for your bot named edwin here: [https://my.slack.com/services/new/bot](https://my.slack.com/services/new/bot)

Update your config.js in and update the token to your bot, and update the name with 'edwin'.

``` javascript
    slack: {
        token: 'long-tokeny-thing',
        name: 'edwin'
    }
```

## Google Hangouts
Create a new GMail account that will serve as your Edwin.  Update your config file in your root directory with your GMail credentials:

``` javascript
    hangouts: {
        username: 'someedwinname@gmail.com',
        password: 'yourpassword'
    }  
```

Each person you want to talk to Edwin has to respond to him from within your browser.  For example, send edwin's GMail an instant message from your gmail account, then from your Edwin browser respond to yourself.   This will enable the conversation between you and Edwin.  Edwin will not respond to your IM's until you respond by hand first.

## Google Assistant with Google Home
Google Assistant is a much larger task than Slack or Hangouts.  I suggest setting up Slack, or Google Hangouts first before attempting this integration.  When talking to Edwin with your Google Home, you can invoke him like, "Ok Google, talk to Edwin".  You can also give him your intent in the invocation such as, "Ok Google, tell Edwin to pause the music".   Before attempting this, you should have successfully followed the Actions API tutorials and have been able to deploy a custom action you have tested with the simulator.  See the developer guide and release notes at [https://developers.google.com/actions/](https://developers.google.com/actions/) for more details.

#### Install to Google Assistant
 1. Deploy this app to somewhere and run it ( Anything that can host a node.js server )
 1. Update the config file and set the googleAssistant port to whatever it should be ( 8080 usually ).
 1. Update the edwin.json with your URL your hosting your app at
 1. Preview the action using the gactions CLI: ./gactions preview --action_package edwin.json --invocation_name "edwin" --preview_mins 1234
 1. Use the gactions simulator to test the action: ./gactions simulate

### Single Use Action With Google Assistant
If you only want to use Edwin for a specific function on your Google Home, you can do this with a simple change.  An example of this would be to have him control a Sonos device with an invocation name of 'Sonos'.   In this case you can change the invocation_name while generating a preview to 'Sonos'.  Then address your Google Home in the context of "Ok Google, tell Sonos to turn down the music".   He is full featured Edwin, but it will feel like he is designed just for your Sonos.

### Building Custom Actions
TODO

### Extending Intent And Context Discovery Logic
TODO
