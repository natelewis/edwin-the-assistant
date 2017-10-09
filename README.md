# Edwin The Assistant v0.1.0 Alpha
[![Build Status](https://travis-ci.org/natelewis/edwin-the-assistant.svg?branch=master)](https://travis-ci.org/natelewis/edwin-the-assistant)

Edwin is an Artificial Intelligence robot designed to be flexible, and extensible platform to create unique, interesting and useful AI experiences.  Edwin can be used as a generic all purpose assistant bot, or for a specific single use action. The projects current state is under alpha development while experimenting with AI core concepts and module organizational patterns.

##### Conversation Handlers:
 * Google Assistant ( Google Home )
 * Slack Bot
 * Google Hangouts Bot

##### 3rd Party Integrations
 * Sonos ( Volume, pause, resume type functionality )
 * Twilio ( Texting with predefined contact list )

## Setup Instructions
The quick start guide and configuration tool is located here:

http://www.edwintheassistant.com/

You will be able to talk to your Edwin quickly with zero configuration.  Then once you feel out what is going on, how you want to interact with him, you can set up a client.  If you want to skip the tool completely and work with the modules and json structures manually you can do this basic install:

``` sh
git clone https://github.com/natelewis/edwin-the-assistant.git
cd edwin-the-assistant
npm install
npm start
```

After that update the config file for what client you want to use and restart Edwin.

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
 When talking to Edwin with your Google Home, you can invoke him like, "Ok Google, talk to Edwin".  You can also give him your intent in the invocation such as, "Ok Google, tell Edwin to pause the music".   Before attempting this, you should have successfully followed the Actions API tutorials and have been able to deploy a custom action you have tested with the simulator.  See the developer guide and release notes at [https://developers.google.com/actions/](https://developers.google.com/actions/) for more details.

#### Install to Google Assistant
 1. Deploy this app to somewhere and run it ( Anything that can host a node.js server ) or use localtunnel.me or ngrok.  For simplicity I use localtunnel because it lets you set a subdomain ( ex. lt --port 8080 --subdomain edwin )
 1. Update the config file and set the googleAssistant port to whatever it should be ( 8080 usually ).
 1. Update the edwin.json with your URL your hosting your app at
 1. Preview the action using the gactions CLI: ./gactions test --action_package edwin.json --project <your project id>
 1. Use the gactions simulator to test: ./gactions simulate

### Single Use Action With Google Assistant
If you only want to use Edwin for a specific function on your Google Home, you can do this with a simple change.  An example of this would be to have him control a Sonos device with an invocation name of 'Sonos'.   In this case you can change the invocation_name while generating a preview to 'Sonos'.  Then address your Google Home in the context of "Ok Google, tell Sonos to turn down the music".   He is full featured Edwin, but it will feel like he is designed just for your Sonos.

### Extending Intent And Context Discovery Logic
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
    ],
    "intent": "what"
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


### Extending Topic And ConverstaionLogic
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

  The field name this step is querying.  If a the field has a value, this step will be skipped. If a field name is "final" then if it responds for this query it will be the final result of the topic converstation.

* steps.groom:

  If a query has been responded to with a value, reframe with the value with a grooming method. (See Grooming Methods below)

* steps.reply:

  An array of replies that will be randomly chosen to prompt a response for the query value.

* steps.module:

  To have a step process a module, this will be a map to the name of the module in the modules directory.   If there is no query present it will run every the topic is processed if that step is reached.  If you do have a query populated, it will not run the module if that query has been satisified.

##### Grooming Methods

Rules that groom responses can have the following grooming methods:

* messagePayload: Take a way repeated context.  If payload was "tell him to bring home milk" the groom payload would be "bring home milk"

* confirm: Take anything that was given and convert it into true, or false based on the sentiment.  If queried response was "sure" the result would be "true"

### Custom Modules

Custom modules are a module that exports a "run" function.   The run function is passed the dialog object that contains everything it needs to update or change the state of the conversation.

The core concept of the functions is to get data from the state, and change the state based on what the module is trying to accomplish.   A normal work flow is as follows:

1. Module starts
1. Gets statement and query info
1. Does stuff with that info
1. Either setReply() setFinal() is set
1. Calls finish()

###### state functions

* state.setReply(string)

Set the response to a conversation, but continue the conversation.  After a reply is set no other steps will be ran.

* state.setFinal(string)

Set the final response to a conversation.  After a reply is set no other steps will be ran, and no other responses will be expected.  You have finished the conversation.

* state.finish()

Execute the reply and send the client a the set reply or final response.

* state.getField(fieldName)

Return the value of a queried field.

* state.setField(fieldName, newValue)

Set the value of field, that normaly is set from a query.

* state.statement()

Return the current statement that is being processed.

* state.query()

Return the current query that was asked.

* state.notResponded()

Returns true if final or reply have not been set yet

* state.isNewConversation()

Returns true if this is the initial processing of a new conversation



## License

Apache 2.0 - See [LICENSE][license] for more information.

[license]: LICENSE
