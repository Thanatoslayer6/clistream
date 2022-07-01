const mpv = require('node-mpv');
const Player = new mpv();
const fs = require('fs')
const { prompt } = require('enquirer');
let currentTime = null;

const saveProgress = async(data) => {
    fs.writeFile('example.json', JSON.stringify(data), (error) => {
        if (error) {
            throw error
        } else {
            console.log("GOODS CHECK FILE BRO")
        }
    })
}

Player.on("stopped", async () => {
    console.log("It is stopped");
})

Player.on("quit", async () => {
    console.log("QUITTED");
    // console.log(currentTime);
    console.log(Player.isRunning())
    await prompt({
        type: 'confirm',
        message: "Save the progress?",
        name: 'value',
        hint: `at ${currentTime}`,
        format: function (value)  {
          if (this.state.submitted) {
            return value ? 'yes' : 'no'
          }
          return '';
        }
    }).then((ans) => {
        if (ans.value) {
            saveProgress({
                currentTime: currentTime,
                href: "/tso/sfd/sdfs-asd",
                serverId: "4125465"
            })
        }
    })
})

Player.on("timeposition", async (st) => {
    currentTime = st;
})



// Player.on("paused", async () => {
//     // console.log("Paused... Time is: " + currentTime);
//     try {
//         let temp = await prompt({
//             type: 'select',
//             name: 'value',
//             message: "Select an action",
//             choices: [{
//                 message: "Exit",
//                 name: "EXIT"
//             }, {
//                 message: "Save progress?",
//                 hint: `at ${Math.round(currentTime)}`,
//                 name: "SAVE"
//             }, {
//                 message: "Resume?",
//                 name: "RESUME"
//             }]
//         })
//         if (temp.value == "RESUME") {
//             console.log("Inside here resumed")
//             await Player.resume();
//         } else if (temp.value == "EXIT") {
//             await Player.quit();
//         } else {
//             console.log("SAVED SOMETHING")
//         }
//     } catch (e) {
//         throw new Error(e)
//     }
// })


let Episodes = [
    {
        name: "Test",
        file: "https://some"
    }, {
        name: "some",
        file: "https://alksdjlkas"
    }, {
        name: "data",
        file: "https://salkdjsl"
    }
]


;(async() => {
    try {
        // let oldSession;
        // if (fs.existsSync('example.json')) {
        //     console.log("Session exists!")
        //     oldSession = JSON.parse(fs.readFileSync('example.json'))
        //     console.log(oldSession);
        //     await prompt({
        //         type: 'confirm',
        //         name: 'value',
        //         message: "Restore session?",
        //         format: function (value)  {
        //           if (this.state.submitted) {
        //             return value ? 'yes' : 'no'
        //           }
        //           return '';
        //         }
        //     }).then(async (ans) => {
        //         if (ans.value) {
        //             const link = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        //             await Player.start()
        //             await Player.load(link, "replace", ["force-media-title=helloworld.mp4"])                   
        //             await Player.goToPosition(oldSession.currentTime);
        //         }             
        //     })
        // } else {
        //     const link = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        //     await Player.start()
        //     await Player.load(link, "replace", ["force-media-title=helloworld.mp4"]) 
        // }


        // const link = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        // await Player.start()
        // await Player.load(link, "replace", ["force-media-title=helloworld.mp4"]) 
        // let resp = (await prompt({
        //     type: "select",
        //     name: "value",
        //     message: "Select an action",
        //     choices: [{
        //         message: "Exit",
        //         hint: "wtf",
        //         name: 10,
        //     }, {
        //         message: "Searck",
        //         name: 20,
        //     }]
        // })).value
        // console.log(resp)
        // console.log(Episodes[4]?.name)
        // await prompt({
        //     type: "multiselect",
        //     name: "value",
        //     message: "Select eps",
        //     choices: Episodes,
        //     result(names) {
        //         return names.map(name => this.find(name).file);
        //     }
        // }).then(i => {
        //     console.log(i)
        // })
        
        // prompt({
        // type: 'confirm',
        // name: 'value',
        // message: "Save progress?",
        // // hint: `${Session.current.SelectedEpisode?.name || Session.current.SelectedItem?.title} at ${Session.current.currentTime}`,
        // format: function (value)  {
        //   if (this.state.submitted) {
        //     return value ? 'yes' : 'no'
        //   }
        //   return '';
        // }
    // }).then(async action => {
        // // console.log(action)
        // // if (action.value) 
        // //     await ActionHandler() 
        // // else 
        // //     console.log("Goodbye!");
    // })
    
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
        }).then(actionCode => console.log(actionCode))
    } catch (e) {
        console.error(e)
    }
})();
