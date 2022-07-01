const fs = require('fs');
const Select = require('./select');
const Media = require('./media')
const { prompt } = require('enquirer');

class Session extends Media {
    constructor(sessionPath, siteInstance) {
        super();
        this.path = sessionPath;
        this.Instance = siteInstance;
        this.current = null;
    }
    
    async Generate() {
        let query = (await prompt({
            type: "text",
            message: "Search a Movie/Tv-Show",
            name: "value"
        })).value;
        let queryItems = await this.Instance.search(query);
        let SelectedItem = await Select.SearchItems(queryItems)
        if (SelectedItem.type == "MOVIE") {
            this.current = {
                SelectedItem: SelectedItem,
                currentTime: null,
                Info: null
            }
        } else if (SelectedItem.type == "TV") {
            this.current = {
                SelectedItem: SelectedItem, 
                SelectedEpisode: null,
                SelectedSeason: null,
                Seasons: null,
                Episodes: null,
                currentTime: null,
                Info: null
            }
        }
    }

    modifyCurrentSelected(PrevOrNext, currentIndex) {
        this.current.SelectedEpisode = {};
        this.current.SelectedEpisode.name = PrevOrNext?.episodeName;
        this.current.SelectedEpisode.id = PrevOrNext?.episodeId;
        this.current.SelectedEpisode.index = currentIndex;
    }

    getOld() {
        try {
            // First check if config directory exists
            if (!fs.existsSync(this.path)) {
                fs.mkdirSync(this.path, { recursive: true })
                console.log(`Config directory doesn't exist, created at: ${this.path}`)
            }
            // Now we check if theres a stored session
            if (fs.existsSync(`${this.path}/session.json`)) {
                return JSON.parse(fs.readFileSync(`${this.path}/session.json`, 'utf-8'))
            } else {
                console.log("No session file found, will create one if user saves...")
                return null;
            }
        } catch (err) {
            console.error(err)
        }
    }

    Save() {
        try {
            fs.writeFileSync(`${this.path}/session.json`, JSON.stringify(this.current))
            console.log("Session saved successfully");
        } catch(err) {
            console.error(err);
        }
    }
}

module.exports = Session;
