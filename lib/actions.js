const Select = require('./select');
const { prompt } = require('enquirer');

class Actions {
    constructor() {
        console.log("Initialized Actions...");
    }

    async mainHandler() {
        try {
            if (this.current.SelectedItem.type == "MOVIE") {
                let MovieServers = await this.Instance.getMovieServers(this.current.SelectedItem.id);
                let SelectedMovieServer = await Select.Servers(MovieServers) 
                await this.GetLinkAndSubs(SelectedMovieServer.id);
                return await this.PlayVideo()
            } else {
                // Select season
                this.current.Seasons = await this.Instance.getTvSeasons(this.current.SelectedItem.id);
                this.current.SelectedSeason = await Select.SeasonOrEpisode(this.current.Seasons);
                // Select episode
                this.current.Episodes = await this.Instance.getTvEpisodes(this.current.SelectedSeason.id);
                this.current.SelectedEpisode = await Select.SeasonOrEpisode(this.current.Episodes);
                // Grab server for episode
                let EpisodeServers = await this.Instance.getEpisodeServers(this.current.SelectedEpisode.id)
                let SelectedEpisodeServer = await Select.Servers(EpisodeServers);
                await this.GetLinkAndSubs(SelectedEpisodeServer.id);
                return await this.PlayVideo()
            }
        } catch (reason) {
            throw new Error(reason)
        }
    }

    async ActionHandler(actionCode) {
        try {
            let EpisodeServers, SelectedEpisodeServer;
            if (actionCode == "EXIT") {
                if (this.Player.isRunning()) {
                    await this.Player.quit()
                }
                console.log("EXITED! Thanks for watching");
            } else if (actionCode == "PREV") {
                this.modifyCurrentSelected(this.prevEp, this.currentIndex - 1);
                EpisodeServers = await this.Instance.getEpisodeServers(this.prevEp?.episodeId);
                SelectedEpisodeServer = await Select.Servers(EpisodeServers);
                await this.GetLinkAndSubs(SelectedEpisodeServer.id);
                return await this.PlayVideo();
            } else if (actionCode == "NEXT") {
                this.modifyCurrentSelected(this.nextEp, this.currentIndex + 1);
                EpisodeServers = await this.Instance.getEpisodeServers(this.nextEp?.episodeId)
                SelectedEpisodeServer = await Select.Servers(EpisodeServers);
                await this.GetLinkAndSubs(SelectedEpisodeServer.id);
                return await this.PlayVideo();
            } else if (actionCode == "SEARCH") {
                // Generate new session or replace contents of this
                await this.Generate();
                // Fills up or replaces currentthis object
                await this.mainHandler();
            } else if (actionCode == "SAVE") {
                this.Save(); // Saves current session into a file
            } else if (actionCode == "RESTORE") {
                console.log("Restoring session...")
                return this.PlayVideo(this.current.currentTime);
            }
        } catch (error) {
            console.error(error)
        }
    }

    async StartMenu() {
        try {
            let action = (await prompt({
                type: 'select',
                name: 'value',
                message: `Main Menu`,
                choices: [{
                    message: `Search for a Movie/TV-Show`,
                    name: "SEARCH",
                    value: true,
                }, {
                    message: `Restore session - ${this.current?.SelectedEpisode?.name || this.current?.SelectedItem?.title}`,
                    hint: `at ${this.current?.currentTime}`,
                    name: "RESTORE",
                    value: this.current ? true : false // Return true if session exists
                }, {
                    message: "Exit Program",
                    name: "EXIT",
                    value: true,
                }].filter(item => item.value == true)
            })).value
            await this.ActionHandler(action);
        } catch (error) {
            console.error(error)
        }
    }
} 

module.exports = Actions
