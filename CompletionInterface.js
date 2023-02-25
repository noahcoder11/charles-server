export default class CompletionInterface {
    constructor(openai) {
        this.openai = openai
    }
    generatePrompt(text) {
        /*
        input: text,
        output: text - formatted prompt for GPT-3 completion generation
        */

        // format stuff

        return text
    }

    async getCompletion(prompt) {
        const completion = await this.openai.createCompletion({
            model: "text-davinci-003",
            prompt: this.generatePrompt(prompt),
            temperature: 0.6,
        })

        return completion.data
    }
}
