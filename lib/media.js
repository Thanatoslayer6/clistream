const MPV = require('node-mpv')
const Select = require('./select');
const Actions = require('./actions');
const { prompt } = require('enquirer')

class Media extends Actions {
    constructor() {
        super()
        console.log("Initialized Media player")
        this.Player = new MPV();
        this.currentIndex, this.nextEp, this.prevEp;

        // Event handlers
        this.Player.on("timeposition", time => {
            this.current.currentTime = time;
        })

        this.Player.on("stopped", () => {
            if (this.current.SelectedItem.type == "MOVIE") {
                prompt({
                    type: "select",
                    name: "value",
                    message: "Select an action",
                    choices: [{
                        message: "Exit",
                        name: "EXIT"
                    }, {
                        message: "Search for a Movie/TV-Show",
                        name: "SEARCH"
                    }]
                }).then(async(actionCode) => await this.ActionHandler(actionCode.value))
            } else if (this.current.SelectedItem.type == "TV") {
                this.currentIndex = this.current.SelectedEpisode?.index;
                this.prevEp = this.current.Episodes[this.currentIndex - 1];
                this.nextEp = this.current.Episodes[this.currentIndex + 1];
                prompt({
                    type: "select",
                    name: "value",
                    message: "Select an action",
                    choices: [{
                        message: "Exit",
                        name: "EXIT"
                    }, {
                        message: this.prevEp?.episodeName,
                        hint: "Previous Episode",
                        name: "PREV"
                    }, {
                        message: this.nextEp?.episodeName,
                        hint: "Next Episode",
                        name: "NEXT"
                    }, {
                        message: "Search for a Movie/TV-Show",
                        name: "SEARCH"
                    }].filter(el => el.message != undefined)
                }).then(async(actionCode) =>  await this.ActionHandler(actionCode.value));
            }
        })

        this.Player.on("quit", () => {
            prompt({
                type: 'confirm',
                name: 'value',
                message: "Save progress?",
                hint: `${this.current.SelectedEpisode?.name || this.current.SelectedItem?.title} at ${this.current.currentTime}`,
                format: function (value)  {
                  if (this.state.submitted) {
                    return value ? 'yes' : 'no'
                  }
                  return '';
                }
            }).then(async action => {
                action.value ? await this.ActionHandler("SAVE") : console.log("Goodbye!");
            })
        })
    }

    async GetLinkAndSubs(serverId) {
        // Get episode links and subs from server
        let Link = await this.Instance.getSources(serverId, this.current.SelectedItem.href);
        let Subs = await Select.Subtitles(Link)
        this.current.Info = {
            Link,
            Subs
        }
    }

    async PlayVideo(time) {
        if (!this.Player.isRunning()) { 
            await this.Player.start();
        }
        await this.Player.load(
            this.current.Info.Link.sources[0].file, 
            "replace", 
            [`force-media-title=${this.current.SelectedEpisode?.name || this.current.SelectedItem?.title}`]
        ); // Replace title
        for (let i = 0; i < this.current.Info.Subs.length; i++) {
            await this.Player.addSubtitles(this.current.Info.Subs[i])
        }
        if (time) {
            console.log(`Skipped at ${time}`)
            await this.Player.goToPosition(time)
        }
        
    } 
}

module.exports = Media
