const { prompt } = require('enquirer');

const SearchItems = async (items) => {
    let polished = items.map(item => {
        return {
            title: item.title,
            type: item.type.toUpperCase(),
            hint: item.type.toUpperCase(),
            href: item.href,
            id: item.id
        }
    })
    let response = await prompt({
        type: 'select',
        name: 'value',
        message: "Select from search",
        choices: polished,
        result() { // Return the object itself
            let i = this.state.index;
            return this.state.choices[i];
        }
    });
    return {
        title: response.value.title,
        href: response.value.href,
        type: response.value.type,
        id: response.value.id
    }
}

const Servers = async (items) => {
    let polished = items.map(i => {
        return {
            name: i.server,
            id: i.serverId
        }
    })
    let response = await prompt({
        type: 'select',
        name: 'value',
        message: "Select a server",
        choices: polished,
        result() {
            let i = this.state.index;
            return this.state.choices[i];
        }
    });
    return {
        server: response.value.name,
        id: response.value.id
    }
}

const Subtitles = async (items) => {
    let polished = items.tracks.map(i => {
        return {
            name: i.label,
            file: i.file
        }
    })
    return (await prompt({
        type: 'multiselect',
        name: 'value',
        message: "Select multiple subtitles",
        choices: polished,
        result(i) {
            return i.map(o => this.find(o).file)
            // let i = this.state.index;
            // return this.state.choices[i];
        }
    })).value
}

const SeasonOrEpisode = async (items) => {
    let polished = items.map(i => {
        return {
            name: i.seasonName || i.episodeName,
            id: i.seasonId || i.episodeId
        }
    })
    let resp = (await prompt({
        type: 'select',
        name: 'value',
        message: "Select",
        choices: polished,
        result() {
            let i = this.state.index;
            return this.state.choices[i];
        }
    })).value
    return resp;
}
module.exports = { SeasonOrEpisode, Subtitles, SearchItems, Servers }
