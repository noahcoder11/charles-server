/*

device registrar

GPT-3

JSON Interpreter

*/


/*

read temp. and tell me what it is

- read temp. from thermometer- params
->
- speak the something - parameter

*/

const GPTInterface = require('./replyInterface')

// JSON Interpreter
class Interpreter {
    constructor(){
        // Queue to place the actions contained within the JSON
        this.actionQueue = []
        // Handler object that contains the JSON reply and error reply
        this.handlerObject = {
            "reply": null,
            "onFailure": null
        }
        // What action are we currently on in the queue?
        this.actionIndex = 0
    }

    clearCache(){
        // Reset the cache variables
        this.actionQueue = []
        this.handlerObject = {
            "reply": null,
            "onFailure": null
        }
        this.actionIndex = 0
    }
    // Process the JSON reply and store it in the cache variables to be ready for running
    process(jsonReply) {
        /*

            JSON Reply:
            - action array
            - reply
            - onFailure
            - followUp

        */

        this.clearCache()

        const actionList = jsonReply['actions']

        if(!jsonReply['followUp']) {
            this.handlerObject = jsonReply['reply']
        }

        this.handlerObject.onFailure = jsonReply['onFailure']

        for(var action of actionList) {
            this.actionQueue.push(action)
        }
    }
    
    getDestination(action) {
        //make request to device registrar and return device information if it exists
    }

    run(){
        while(this.actionIndex < this.actionQueue.length) {


            this.actionIndex ++
        }
    }
}

