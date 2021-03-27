$(document).ready(() => {
    $(window).on("resize", () => {
        updatePlayerSize();
    });
});

class VideoTimer {

    constructor(time) {
        const timeParts = time.split(":").map(x => parseInt(x));

        this.totalSeconds = timeParts[0] * 60 + timeParts[1];
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
    }

    stop() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
        }
    }

    renderProgress() {
        this.renderRemainingDuration();
    }

    renderRemainingDuration() {
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

        $("#remaining-text > div").text(text);
    }

    renderProgressBar() {

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
        return this.currentSeconds / this.totalSeconds;
    }
}

function start(form) {
    timer = new VideoTimer(form.time.value);

    renderVideo(form.video.value)
    updatePlayerSize();
    updatePlaybackRate(timer);

    timer.start();
    playVideo();
}

function renderVideo(video) {
    $("#form").remove();

    const videoObj = $("<video/>", {
        id: "video"
    });
    $("<source/>", {
        src: "videos/"+video+".webm",
        type: "video/webm"
    }).appendTo(videoObj);
    videoObj.prependTo($("#player"));
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

function playVideo() {
    $("#video").get(0).play();
}