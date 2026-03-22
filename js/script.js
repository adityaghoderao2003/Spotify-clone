let currentSong = new Audio();
let songs = [];
let currFolder = "";

// FORMAT TIME
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    seconds = Math.floor(seconds);

    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// GET SONGS (FIXED FOR GITHUB)
async function getSongs(folder) {
    currFolder = folder;

    // fetch songs.json instead of folder
    let response = await fetch(`${folder}/songs.json`);
    songs = await response.json();

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" src="img/music.svg">
            <div class="info">
                <div>${song}</div>
                <div>Song Artist</div>
            </div>
            <div class="playnow">
                <span>Play now</span>
                <img class="invert" src="img/play.svg">
            </div>
        </li>`;
    }

    // CLICK EVENT
    document.querySelectorAll(".songList li").forEach(li => {
        li.addEventListener("click", () => {
            let track = li.querySelector(".info div").innerText.trim();
            playMusic(track);
        });
    });

    return songs;
}

// PLAY MUSIC
function playMusic(track, pause = false) {
    currentSong.src = `${currFolder}/${track}`;

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerText = track;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

// DISPLAY PLAYLIST CARDS
async function displayAlbums() {
    let cardContainer = document.querySelector(".cardContainer");

    // ⚠️ USE CORRECT FOLDER NAMES (NO SPACES)
    let folders = ["ncs", "bright", "sad", "arijit"];

    cardContainer.innerHTML = "";

    for (let folder of folders) {
        try {
            let res = await fetch(`songs/${folder}/info.json`);
            let data = await res.json();

            cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <img src="songs/${folder}/cover.jpg">
                <h2>${data.title}</h2>
                <p>${data.description}</p>
            </div>`;
        } catch (e) {
            console.log("Missing info.json in", folder);
        }
    }

    // CLICK EVENT FOR CARDS
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder;
            let songsList = await getSongs(`songs/${folder}`);
            playMusic(songsList[0]);
        });
    });
}

// MAIN FUNCTION
async function main() {

    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    await displayAlbums();

    // PLAY / PAUSE
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // TIME UPDATE
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;

        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // SEEK BAR
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.clientWidth) * 100;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // NEXT SONG
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // PREVIOUS SONG
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    // VOLUME CONTROL
    document.querySelector(".range input").addEventListener("input", e => {
        currentSong.volume = e.target.value / 100;
    });

    // MUTE / UNMUTE
    document.querySelector(".volume img").addEventListener("click", e => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            e.target.src = "img/mute.svg";
            document.querySelector(".range input").value = 0;
        } else {
            currentSong.volume = 0.1;
            e.target.src = "img/volume.svg";
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
