$(document).ready(() => {
    $(window).on("resize", () => {
        updatePlayerSize();
    });
});

class VideoTimer {

    constructor(minutes) {
        this.totalSeconds = minutes * 60;
        this.currentSeconds = 0;
    }

    start() {
        this.stop();
        this.intervalHandle = setInterval(() => {
            this.currentSeconds++;

            if (this.currentSeconds >= this.totalSeconds) {
                this.stop();
            }

            this.renderProgress();
        }, 1000);
        $("#remaining-progressbar").show();
    }

    stop() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
        }
    }

    renderProgress() {
        const remainingMinutes = this.getRemainingMinutes();

        let text = "";
        if (remainingMinutes > 0) {
            text += remainingMinutes + " Minute" + (remainingMinutes !== 1 ? "n" : "");
        } else {
            const remainingSeconds = this.getRemainingSeconds();

            if (remainingSeconds > 0) {
                text += remainingSeconds + " Sekunde" + (remainingSeconds !== 1 ? "n" : "");
            } else {
                text += "Zeit abgelaufen";
            }
        }

        $("#progress").width(this.getPercent() + "%");
        $("#progress-text").text(text);
    }

    getRemainingMinutes() {
        return Math.floor(this.getRemainingSeconds() / 60);
    }

    getRemainingSeconds() {
        return this.totalSeconds - this.currentSeconds;
    }

    getTotalSeconds() {
        return this.totalSeconds;
    }

    getPercent() {
        return Math.ceil(this.currentSeconds * 100 / this.totalSeconds);
    }
}

function start(form) {
    $("#form").remove();

    const video = form.video.value;
    timer = new VideoTimer(form.minutes.value);

    renderVideo(video);
    renderAudio(video);
    renderCredits(video);
    updatePlayerSize();
    updatePlaybackRate(timer);
    updateAudioVolume();

    timer.start();
    playVideo();
    playAudio();
}

function renderVideo(video) {
    const videoObj = $("<video/>", {
        id: "video"
    });
    $("<source/>", {
        src: "videos/"+video+".webm",
        type: "video/webm"
    }).appendTo(videoObj);
    videoObj.prependTo($("#player"));
}

function renderAudio(video) {
    const audioObj = $("<audio/>", {
        id: "audio"
    });
    $("<source/>", {
        src: "audio/"+video+".mp3",
        type: "audio/mpeg"
    }).appendTo(audioObj);
    audioObj.prependTo($("#player"));
}

function renderCredits(video) {
    renderVideoCredits(video);
    renderAudioCredits(video);
}

function renderVideoCredits(video) {
    const req = new XMLHttpRequest();
    req.open("GET", "video_sources/"+video+".txt", false);
    req.send();

    const videoCredits = req.responseText;
    $("#video-credits").html(videoCredits);
    $("#video-credits-container").show();
}

function renderAudioCredits(video) {
    const req = new XMLHttpRequest();
    req.open("GET", "audio_sources/"+video+".txt", false);
    req.send();

    const audioCredits = req.responseText;
    $("#audio-credits").html(audioCredits);
    $("#audio-credits-container").show();
}

function updatePlayerSize() {
    const videoObj = $("#video");
    if (videoObj.length) {
        videoObj.width($(window).width());
        videoObj.height($(window).height());
    }
}

function updatePlaybackRate(timer) {
    $("#video").on("durationchange", () => {
        const videoDOM = $("#video").get(0);
        const videoDuration = videoDOM.duration;
        const timerDuration = timer.getTotalSeconds();

        videoDOM.playbackRate = videoDuration / timerDuration;
    });
}

function updateAudioVolume() {
    $("#audio").get(0).volume = 0.1;
}

function playVideo() {
    $("#video").get(0).play();
}

function playAudio() {
    $("#audio").get(0).play();
}