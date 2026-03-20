let currentSong = new Audio();
let songs;
let currFolder;

// format time
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    seconds = Math.floor(seconds);

    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;

    if (minutes < 10) minutes = "0" + minutes;
    if (remainingSeconds < 10) remainingSeconds = "0" + remainingSeconds;

    return minutes + ":" + remainingSeconds;
}


// GET SONGS
async function getSongs(folder) {
    currFolder = folder;

    let a = await fetch(`${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");

    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" src="img/music.svg">
            <div class="info">
                <div>${song.replaceAll("%20"," ")}</div>
                <div>Song Artist</div>
            </div>
            <div class="playnow">
                <span>Play now</span>
                <img class="invert" src="img/play.svg">
            </div>
        </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li"))
        .forEach(e => {
            e.addEventListener("click", () => {
                playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            })
        });

    return songs;
}


// PLAY MUSIC
const playMusic = (track, pause = false) => {

    currentSong.src = `${currFolder}/` + track;

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}


// DISPLAY PLAYLIST CARDS
async function displayAlbums() {

    let cardContainer = document.querySelector(".cardContainer");

    // manual folders for GitHub
    let folders = ["ncs","Bright","sad playlist","arjit singh","Mohit chauhan","cs","chill","karan aujla"];

    for (let folder of folders) {

        try {

            let a = await fetch(`songs/${folder}/info.json`);
            let response = await a.json();

            cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <img src="songs/${folder}/cover.jpg">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`;

        }
        catch(error){
            console.log("info.json missing in", folder);
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {

            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);

        });
    });
}



// MAIN FUNCTION
async function main() {

    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    await displayAlbums();

    play.addEventListener("click", () => {

        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        }

        else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });


    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".songtime").innerHTML =
        `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;

        document.querySelector(".circle").style.left =
        (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });


    document.querySelector(".seekbar").addEventListener("click", e => {

        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

        document.querySelector(".circle").style.left = percent + "%";

        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });


    previous.addEventListener("click", () => {

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });


    next.addEventListener("click", () => {

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });


    document.querySelector(".range input").addEventListener("change", (e) => {

        currentSong.volume = parseInt(e.target.value) / 100;
    });


    document.querySelector(".volume>img").addEventListener("click", e => {

        if (e.target.src.includes("volume.svg")) {

            e.target.src = e.target.src.replace("volume.svg","mute.svg");

            currentSong.volume = 0;

            document.querySelector(".range input").value = 0;
        }

        else {

            e.target.src = e.target.src.replace("mute.svg","volume.svg");

            currentSong.volume = .10;

            document.querySelector(".range input").value = 10;
        }
    });
}

main();