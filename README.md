# Edwin The Assistant v0.1.0 Alpha
[![Build Status](https://travis-ci.org/natelewis/edwin-the-assistant.svg?branch=master)](https://travis-ci.org/natelewis/edwin-the-assistant)

Edwin is an Artificial Intelligence robot designed to be flexible, and extensible platform to create unique, interesting and useful AI experiences.  Edwin can be used as a generic all purpose assistant bot, or for a specific single use action. The projects current state is under alpha development while experimenting with AI core concepts and module organizational patterns.

##### Conversation Handlers:
 * Google Assistant ( Google Home )
 * Slack Bot
 * Google Hangouts Bot

##### 3rd Party Integrations
 * Sonos ( Simple volume, pause, resume type functionality )
 * Twilio ( Texting with predefined contact list ) -- EXPEREMENTAL

## Setup Instructions
The quick start guide and configuration tool is located here:

http://www.edwintheassistant.com/

You will be able to talk to your Edwin quickly with zero configuration.  Then once you feel for what is going on, you can set up a client for long term use.  If you want to skip the tool completely and work with the modules and json structures manually you can do this basic install:

``` sh
git clone https://github.com/natelewis/edwin-the-assistant.git
cd edwin-the-assistant
npm install
npm start
```

After that, update the config file for what client you want to use and restart Edwin.

## The Config File

Upon running Edwin the first time a default config file will be placed in the root directory of the application.  You then can change the config json and restart your server at any point.  To use a different config file you can specify EDWIN_CONFIG environment variable to point at the new config file.

## Standalone Mic And Speaker

Talk to Edwin like a Google Home or Amazon Alexa.

#### Requirements

- GCP account with Google Speech API turned on
- Mac or Raspberry Pi compatible
- A speaker plugged into the Pi.

#### Environment setup for Mac

1. Have homebrew installed: https://brew.sh/
2. Audio recorder: `brew install sox`

#### Environment setup for Linux/Raspberry Pi

`sudo apt-get install sox libsox-fmt-all festival festvox-kallpc16k`

Headphone jack audio:

`amixer cset numid=3 1`

or HDMI audio:

`amixer cset numid=3 2`

You also need to upgrade to the latest version of Node.js.  First remove the current version:

`sudo apt-get remove nodered -y`
`sudo apt-get remove nodejs nodejs-legacy npm -y`

Now install the latest version via Node.js Version Manager:
`curl -L https://git.io/n-install | bash`

#### Environment setup for Google Speech API

1. Enable Google Speech API here: https://console.cloud.google.com/apis/library/speech.googleapis.com/
2. Your service account key can be created from your GCP project here:
https://console.cloud.google.com/apis/credentials ( Create a new one with "Project -> Owner" )
2. Export your service account key as a JSON file

```sh
export GOOGLE_APPLICATION_CREDENTIALS=[Service account key json file with full path]
```

#### Finish
1. Update the config.json and set "standalone": { "enabled": true }
2. Restart Edwin.

#### Notes

* This is the fun way to talk to to Edwin, but is dependant on hardware being in setup.  If you have a pretty standard system, it should "just work".

* Google Home and Alexa use array microphones to know your voice over background noise. If your serious about using Edwin for more than just tinkering, I would recommend the investment.

* Google Speech API has a free tier of 60 minutes a month billed in 15 second increments.  Thats quite a bit, but still possible to exceede.  Even after, it's really inexpensive if you go over:
https://cloud.google.com/speech/pricing

## Slack Setup
From your Slack account get a token for your bot named Edwin here: [https://my.slack.com/services/new/bot](https://my.slack.com/services/new/bot)

Update your config.js in and update the token to your bot.

``` javascript
    slack: {
        "enabled": true,
        "token": "long-tokeny-thing",
        "name": "Edwin"
    }
```

## Google Hangouts
Create a new Gmail account that will serve as your Edwin.  Update your config file in your root directory with your Gmail credentials:

``` javascript
    hangouts: {
        "enabled": true,
        "username": "someedwinname@gmail.com",
        "password": "yourpassword"
    }
```

Each person you want to talk to Edwin has to respond to him first within your browser.  For example, send Edwin's Gmail an instant message from your Gmail account, then from a browser logged in as Edwin, respond to yourself.   This will authorize conversation between you and Edwin.  Edwin will not respond to your IM's until you respond by hand first.

## Sonos Implementation
 If you have Sonos on the same local network as your Edwin it will just discover it.  There is bit more to do to expand it to be a bit smarter, but if you want basic stuff like next, pause, resume, volume up/down functionality, it should be plug and play.

 For multipule zones just say the zone name with the command it will will target that zone.

## Google Assistant with Google Home
 When talking to Edwin with your Google Home, you can invoke him like, "Ok Google, talk to Edwin".  You can also give him your annotation in the invocation such as, "Ok Google, tell Edwin to pause the music".

#### Create Action project
 From the Google Actions console create a new project [https://console.actions.google.com](https://console.actions.google.com).

#### Turn On Google Assistant Support and Add Your Project ID

 In the config.json set enabled to true and insert the project ID.  The project ID can be found url after you created the project, or under the project settings.
``` javascript
    googleAssistant: {
        "enabled": true
        "project": "edwin-123456"
    }
```

#### Turn On Ngrok Support

 Ngrok will create a tunnel for the Google fulfillment to work against your local version of Edwin
``` javascript
    ngrok: {
        "enabled": true
    }
```

#### Download the gactions CLI

Download the gactions binary and save it in the root directory of your project: [https://developers.google.com/actions/tools/gactions-cli](https://developers.google.com/actions/tools/gactions-cli)

Then make it executable:
`chmod +x ./gactions`

#### Test It Out

If everything is working, you will see that Edwin is connected and your configuration is pushed in the console.  Now you can go to the simulator page in the Google Actions console, your Google Home, or your Google Assistant and say "Talk to My Test App".  This will respond, and start the conversation.   If you want it to say "Talk to Edwin", then you have to update your App Information under the Google Actions console for your project.

## Extending Intent and Context Discovery Logic
You can use the tool under http://www.edwintheassistant.com or manually update the files under the data directory.  Here is an example of each type of file.

##### JSON Intent Example 'data/intents/what.json'
````json
{
    "id": "what",
    "failReply": "Not sure about that one yet.",
    "contextModifiers": [
        {
            "context": "going on",
            "type": "phrase",
            "target": "edwins-inquery-response"
        },
        {
            "context": "happening",
            "type": "phrase",
            "target": "edwins-inquery-response"
        },
        {
            "context": "up",
            "type": "phrase",
            "target": "edwins-inquery-response"
        },
        {
            "context": "your name",
            "type": "phrase",
            "target": "edwins-name"
        }
    ]
}
````
* id:

    The same as the filename

* failReply:

    If Edwin is unable to figure out the proper context to target topic this is the final response.

* contextModifiers:

    List of mapping from context to target topic.

* contextModifiers.context:

    Implied context from the the initial statement to map from. You can use * as a wildcard to match any context.

* contextModifiers.type:

    Type of context to topic mapping

    map: Directly map a context to a topic
    phrase: Scan the statement for an exact match of the words

* contextModifiers.target

    Topic to process the statement


### Extending Topic And Converstaion Logic
You can use the tool under http://www.edwintheassistant.com or manually update the files under the data directory.  Here is an example of each type of file.


##### JSON Intent Example 'data/topics/edwins-mood.json'
````json
{
    "id": "describe-sentence",
    "annotation": [
        {
            "field": "payload",
            "type": "everythingAfterWord",
            "startWord": "[initialContext]",
            "wordType": "",
            "groom": "messagePayload",
        }
    ],
    "steps": [
        {
            "query": "payload",
            "groom": "messagePayload",
            "reply": [
                "What sentence do you want me to describe?"
            ]
        },
        {
            "module": "describe-sentence",
            "groom": "messagePayload",
            "query": "final"
        }
    ]
}
````
* id:

    The same as the filename

* annotation:

  An array of rules to discover field values from the initial statement

* annotation.field:

  The field that will populated

* annotation.type:

  The type of discovery that needs to match.

  everythingAfterWord: Match everything after the "startWord" value
  nextWordOfType: The next word after a given type will be the fields value.

* annotation.startWord:

  Used with type ( everythingAfterWord )

* annotation.wordType:

  Used with type ( nextWordOfType )

* annotation.groom:

  Groom the resulting response to clean up or reframe the value.  (See Grooming Methods below)

* steps:

  The list of steps in a topic to satisfy the a conversation

* steps.query:

  The field name this step is querying.  If a the field has a value, this step will be skipped. If a field name is "final" then if it responds for this query it will be the final result of the topic conversation.

* steps.groom:

  If a query has been responded to with a value, reframe with the value with a grooming method. (See Grooming Methods below)

* steps.reply:

  An array of replies that will be randomly chosen to prompt a response for the query value.

* steps.module:

  To have a step process a module, this will be a map to the name of the module in the modules directory.   If there is no query present it will run every the topic is processed if that step is reached.  If you do have a query populated, it will not run the module if that query has been satisified.

##### Grooming Methods

Rules that groom responses can have the following grooming methods:

* messagePayload: Take a way repeated context.  If payload was "tell him to bring home milk" the groom payload would be "bring home milk"

* confirm: Take anything that was given and convert it into the string "true", or "false" based on the sentiment.  If queried response was "sure" the result would be "true"

### Custom Modules

Custom modules are a module that exports a "run" function.   The run function is passed to the dialog object that contains everything it needs to update or change the state of the conversation.

The core concept of the promise based functions is to get data from the state, and change the state based on what the module is trying to accomplish.   A normal work flow is as follows:

1. Module starts
1. Gets statement and query info
1. Does stuff with that info
1. Either setReply() setFinal()
1. The callback will fire and respond

###### state functions

* state.setReply(string)

Set the response to a conversation, but continue the conversation.  After a reply is set no other steps will be ran.

* state.setFinal(string)

Set the final response to a conversation.  After a reply is set no other steps will be ran, and no other responses will be expected.  You have finished the conversation.

* state.getField(fieldName)

Return the value of a queried field.

* state.setField(fieldName, newValue)

Set the value of field, that normaly is set from a query.

* state.getStatement()

Return the current statement that is being processed.

* state.getQuery()

Return the current query that was asked.

* state.notResponded()

Returns true if final or reply have not been set yet

* state.isNewConversation()

Returns true if this is the initial processing of a new conversation



## License

Apache 2.0 - See [LICENSE][license] for more information.

[license]: LICENSE
