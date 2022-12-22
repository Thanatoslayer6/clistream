const axios = require('axios').default;
const CryptoJS = require('crypto-js')
const cheerio = require('cheerio');

class Sflix {
    constructor(host) {
        this.host = host;
        this.client = axios.create({
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0"
            }
        })
        console.log("Initialized Sflix constructor with User-Agent...");
        console.log("Using " + this.host + " as main site...")
    }

    // Search for a Movie or a TV Show, receive an array of results
    async search(query){
        try {
            let url = `${this.host}/search/${query.replace(/\s/g,'-')}`
            let response = (await this.client.get(url)).data;
            let $ = cheerio.load(response);
            return ($('.film-detail').map((i, el) => {
                // let year_or_episode = $(el).find('.fd-infor > .fdi-item').last().text()
                // If movies then year is fine, if TV then shows # of seasons
                if ($(el).find('.film-name a').attr('href').startsWith('/movie/')) {
                    return {
                        title: $(el).find('.film-name a').attr('title'),
                        type: "movie",
                        href: $(el).find('.film-name a').attr('href'),
                        id: $(el).find('.film-name a').attr('href').split('-').pop(),
                        year: $(el).find('.fd-infor > .fdi-item').last().text() || "N/A",
                        quality: $(el).find('.fd-infor > .fdi-item strong').text() || "N/A",
                        rating: $(el).find('.fd-infor > .fdi-item').first().text(),
                    }
                } else {
                    return {
                        title: $(el).find('.film-name a').attr('title'),
                        type: "tv",
                        href: $(el).find('.film-name a').attr('href'),
                        id: $(el).find('.film-name a').attr('href').split('-').pop(),
                        seasons: $(el).find('.fd-infor > .fdi-item').last().text() || "N/A",
                        quality: $(el).find('.fd-infor > .fdi-item strong').text() || "N/A",
                        rating: $(el).find('.fd-infor > .fdi-item').first().text(),
                    }
                }
            })).get()
        } catch(e) {
            console.error(e)
        }
    }

    // Get servers for a movie by passing movieId (e.x '66667')
    async getMovieServers(movieId) {
        let url = `${this.host}/ajax/movie/episodes/${movieId}`;
        let response = (await this.client.get(url)).data;
        let $ = cheerio.load(response);
        return ($('a').map((i, el) => {
            return {
                server: $(el).find('span').text() || null,
                serverId: $(el).attr('data-id') || null,
                slug: $(el).attr('id') || null,
            }
        })).get()
    }

    // Get TV-Show seasons by passing tvId (e.x 39237)
    async getTvSeasons(tvId) {
        let url = `${this.host}/ajax/v2/tv/seasons/${tvId}`
        let response = (await this.client.get(url)).data;
        let $ = cheerio.load(response);
        return ($('a').map((i, el) => {
            return {
                seasonName: $(el).text().trim() || null,
                seasonId: $(el).attr('data-id') || null,
            }
        })).get()
    }

    // Get Tv-Show episodes by passing seasonId (e.x 2602)
    async getTvEpisodes(seasonId) {
        let url = `${this.host}/ajax/v2/season/episodes/${seasonId}`
        let response = (await this.client.get(url)).data;
        let $ = cheerio.load(response);
        return ($('.eps-item').map((i, el) => {
            return {
                episodeName: $(el).find('.film-poster-img').attr('title') || null,
                episodeId: $(el).attr('data-id') || null,
            }
        })).get()
    }

    // Get servers for specific episode by passing episodeId (e.x 619738)
    async getEpisodeServers(episodeId) {
        let url = `${this.host}/ajax/v2/episode/servers/${episodeId}`
        let response = (await this.client.get(url)).data;
        let $ = cheerio.load(response);
        return ($('a').map((i, el) => {
            return {
                server: $(el).find('span').text() || null,
                serverId: $(el).attr('data-id') || null,
                slug: $(el).attr('id') || null,
            }
        })).get()
    }
    
    async getRecaptchaKey() {
        let response = (await this.client.get(this.watchURL)).data
        this.RecaptchaKey = new RegExp(/recaptcha_site_key = '(.*?)'/gm).exec(response)[1]
    }

    async getVToken() {
        let info = (await this.client.get(`https://www.google.com/recaptcha/api.js?render=${this.RecaptchaKey}`, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        })).data
        this.vToken = (new RegExp(/releases\/(.*?)\//gm).exec(info)[1])
    }
    
    async getRecaptchaToken() {
        const reloadLink = `https://www.google.com/recaptcha/api2/reload?k=${this.RecaptchaKey}`
        let domain = btoa(`${this.host}:443`).replace(/\n/g, '').replace(/=/g, '.')
        let properLink = `https://www.google.com/recaptcha/api2/anchor?ar=1&k=${this.RecaptchaKey}&co=${domain}&hl=en&v=${this.vToken}&size=invisible&cb=cs3`
        let tokenRequest = (await this.client.get(properLink)).data
        let longToken = cheerio.load(tokenRequest)('#recaptcha-token').attr('value')
        let finalRequest = await this.client.post(reloadLink, `v=${this.vToken}&k=${this.RecaptchaKey}&c=${longToken}&co=${domain}&sa=&reason=q`, {
            headers: { 
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        })
        this.RecaptchaToken = new RegExp(/rresp\","(.+?)\"/gm).exec(finalRequest.data)[1]
    }

    async iframeInfo() {
        // let info = await this.client.get(`${this.host}/ajax/get_link/${this.serverId}?_token=${this.RecaptchaToken}`, { 
        //     headers: { 
        //         "Referer": this.watchURL
        //     } 
        // })
        let info = await this.client.get(`${this.host}/ajax/sources/${this.serverId}`, { 
            headers: { 
                "Referer": this.watchURL
            } 
        })
        let URL = info.data.link // e.x https://mzzcloud.life/embed-4/25kKV67FpxEH?z=
        // console.log(URL)
        // let resp =  (await this.client.get(URL, { 
        //     headers: { 
        //         "Referer": this.host
        //     } 
        // })).data
        // console.log(resp)
        // Setup needed variables for getting sources
        // this.RecaptchaNumber = new RegExp(/recaptchaNumber = '(.*?)'/gm).exec(resp)[1],
        this.iframeURL = URL.substring(0, URL.lastIndexOf('/'))
        this.iframeId = URL.substring(URL.lastIndexOf('/') + 1, URL.lastIndexOf('?'))
    }

    // Added this method to decrypt sources
    async decryptSource(encryptedSource) {
        // There are 2 keys possible, just try them all
        let result = null;
        const keyUrls = { // Links for getting the key
            Main: 'https://raw.githubusercontent.com/consumet/rapidclown/main/key.txt',
            Dokicloud: 'https://raw.githubusercontent.com/consumet/rapidclown/dokicloud/key.txt',
            Rabbitstream: 'https://raw.githubusercontent.com/consumet/rapidclown/rabbitstream/key.txt'
        }
        for (let [provider, key] of Object.entries(keyUrls)) {
            if (result == null) {
                try { 
                    let decryptionKey = (await axios.get(key)).data
                    let bytes = CryptoJS.AES.decrypt(encryptedSource, decryptionKey);
                    result = (JSON.parse(bytes.toString(CryptoJS.enc.Utf8)));
                } catch(e) {
                    console.log(`${provider} key failed to decrypt source, trying next one(?)`)
                }
            } else {
                break;
            }
        }
        return result;
    }
    // Get Sources from serverId by passing the server id and the href link of the movie/tv
    async getSources(serverId, href) {
        try {
            // First we get recaptchaSiteKey
            this.serverId = serverId;
            this.watchURL = "https://sflix.to" + href.replace('/', "/watch-") + `.${serverId}`
            // await this.getRecaptchaKey()
            // console.log("recaptchaKey: " + this.RecaptchaKey)
            // END
            // Now we get vToken by calling a method
            // await this.getVToken();
            // console.log("vToken after: " + this.vToken)
            // END
            // Then we grab the token
            // await this.getRecaptchaToken()
            // console.log("captchaToken: " + this.RecaptchaToken)
            // END
            // After that, we scrape the iframe url for information like recaptchaNumber
            await this.iframeInfo();
            // console.log(this.RecaptchaNumber)
            // console.log(this.iframeURL)
            // console.log(this.iframeId)
            // END
            // const properURL = (this.iframeURL.replace('/embed', '/ajax/embed')) + `/getSources?id=${this.iframeId}&_token=${this.RecaptchaToken}&_number=${this.RecaptchaNumber}`
            const properURL = (this.iframeURL.replace('/embed', '/ajax/embed')) + `/getSources?id=${this.iframeId}`
            let result = (await this.client.get(properURL, {
                headers: {
                    "Referer": "https://sflix.to/",
                    "X-Requested-With": "XMLHttpRequest",
                    "Accept": "*/*",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Connection": "keep-alive",
                    "TE": "trailers"
                }
            })).data   
            // Assign the decrypted data into the original result
            result.sources = await this.decryptSource(result.sources)
            return result;
        } catch (e) {
            console.error(e)
        }
    }
}

module.exports = Sflix
