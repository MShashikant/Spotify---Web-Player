console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";

    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = " "
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="music.svg" alt="">
                               <div class="info">
                                   <div> ${song.replaceAll("%20", " ")}</div>
                                   <div> Song Artist</div>
                               </div>
                               <div class="playnow">
                                   <span>Play Now</span>
                                   <img class="invert" src="play.svg" alt="">
                               </div> </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })

    return songs;

}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "pause.svg"
    }

    document.querySelector("#songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        let folder = e.href.split("/").slice(-2)[0]
        // Get the metadata of the folder
        let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
        let response = await a.json();
        console.log(response)
        cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div  class="play">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            xmlns="http://www.w3.org/2000/svg"    
                            
                                <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                    stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </div>

                        <img src="/songs/${folder}cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
    }


}



async function main() {
    // Get the list of all the songs
    await getSongs("songs/ncs");
    playMusic(songs[0], true)

    // Display all the albums on the page
    displayAlbums()



    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    // listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds
            (currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Listen for the click event on the seekbar to update the song position
    document.querySelector(".seekbar").addEventListener("click", e => {
        // Get the total width of the seekbar
        const seekbarWidth = e.target.getBoundingClientRect().width;

        // Calculate the click position relative to the seekbar width
        const clickPosition = e.offsetX;

        // Calculate the percentage of the click relative to the seekbar width
        const percentage = (clickPosition / seekbarWidth) * 100;

        // Set the .circle's left position based on the percentage of the seekbar
        document.querySelector(".circle").style.left = `${percentage}%`;

        // Set the audio's currentTime based on the percentage of the total duration
        currentSong.currentTime = (currentSong.duration * percentage) / 100;
    });


    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume").src = document.querySelector(".volume").src.replace("mute.svg", "volume.svg")
        }
    })



    // Listen for when the current song ends and automatically play the next song
    currentSong.addEventListener("ended", () => {
        console.log("Song ended, playing next song");
        let currentIndex = songs.indexOf(currentSong.src.split("/").pop().split('?')[0]);
        let nextIndex = currentIndex + 1;
        if (nextIndex < songs.length) {
            playMusic(songs[nextIndex]);
        } else {
            // If it's the last song, restart the playlist or stop
            console.log("End of playlist reached");
            playMusic(songs[0]);  // Optionally restart the playlist from the first song
        }
    });


    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })



}

main();