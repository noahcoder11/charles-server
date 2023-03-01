import algoliasearch from 'algoliasearch'

export default class KnowledgeBase {
    constructor() {
        this.algolia = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_SEARCH_KEY);
        this.index = this.algolia.initIndex('charles_device_registry');
    }

    async search(query) {
        let results = await this.index.search(query)
        return results.hits
    }
}