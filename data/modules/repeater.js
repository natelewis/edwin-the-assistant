module.exports = {run: function(state, config) {
  return new Promise(function(resolve, reject) {
    // given a conversation that I will have a field populated as "payload"
    state.setFinal(state.getField('payload'));

    // I'm done, finish my promise by passing my state back
    return resolve(state);

    /*
    This could also be done without a module in the topic JSON.  This is here
    as an example of the simplest module.
    {
      "id": "repeater",
      "annotation": [
          {
              "field": "payload",
              "type": "everythingAfterWord",
              "startWord": "[intent]"
          }
      ],
      "steps": [
          {
              "query": "final"
              "reply": "[payload]"
          }
      ]
    }
    */
  });
}};
