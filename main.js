/*

Action
- processID
- deviceID
- attribute
- value
- execute -> lookup device hostID

Interpreter
-> interpret
- actionQueue

*/

//import CompletionInterface from './CompletionInterface'
//import { Configuration, OpenAIApi } from 'openai'
import deviceLookup from "./deviceLookup.json" assert { type: "json" }
import { HarmonyDevice, HarmonyAttribute, HarmonyListener } from './harmony/index.js'

/*const openAIConfig = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})*/

class Server {
    constructor() {
        this.device = new HarmonyDevice("server-main", false, '0.0.0.0', 5000, (params) => { return this.handleCommand(params) })
        this.body = new HarmonyDevice("body-main", true, 'charles-body', 8000)
        //this.generationInterface = new CompletionInterface(openAIConfig)

    }

    start() {
        this.device.runServer()
    }

    handleCommand(params) {
        console.log(params)

        this.interpret({
            'reply': 'hi there',
            'actions': []
        })

        return {
            'success': true,
        }
    }

    async interpret(json) {
        const actions = json["actions"]
        let reply = json["reply"]

        for(const action of actions) {
            await this.execute(action)
            .catch(() => {
                this.body.command({
                    "reply": json["onErrorReply"]
                })
            })
        }

        if(!json["followUp"]) {
            this.body.command({
                "reply": reply
            })
        }
    }

    async execute(action) {
        const deviceInfo = deviceLookup[action.deviceID]
        const reqType = action.requestType
        const device = new HarmonyDevice(action.deviceID, true, deviceInfo["hostAddress"], deviceInfo["port"])

        if(reqType == "get") {
            return device.get(action.attribute, action.params)
        }else if(reqType == "set") {
            return device.set(action.attribute, action.value, action.params)
        }else if(reqType == "command") {
            return device.command(action.params)
        }
    }
}

const server = new Server()

server.start()