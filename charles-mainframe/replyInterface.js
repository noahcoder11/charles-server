const { Configuration, OpenAIApi } = require("openai")
require('dotenv').config()

class GPTInterface {
    constructor() {
        this.config = new Configuration({
            apiKey: process.env.GPT_SECRET_KEY
        })
        this.openai = new OpenAIApi(this.config)
        this.params = {
            'prompt': '',
            'max_tokens': 160,
            'temperature': 0.7,
            'model': "text-davinci-003",
            'frequency_penalty': 0.5
        }
    }

    setParam(param, value) {
        this.params[param] = value
    }

    async requestResponse(){
        const response = await this.openai.createCompletion(this.params)

        return response
    }
}

var g = new GPTInterface()
g.setParam("prompt", "Write a story: ")
g.requestResponse().then(console.log)