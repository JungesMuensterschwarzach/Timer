class VideoTimer {

    constructor(seconds, scene, playBackgroundMusic) {
        this.currentSeconds = 0;
        this.totalSeconds = seconds;
        this.scene = scene;
        this.playBackgroundMusic = playBackgroundMusic;
    }

    start() {
        $("#form").hide();

        this.renderVideo();
        if (this.playBackgroundMusic) {
            this.renderBackgroundMusic();
        }

        $("#player").show();
        this.beginTicking();
    }

    renderVideo() {
        this.renderVideoObject();
        this.renderVideoCredits();        
    }

    renderVideoObject() {
        const videoObj = $("<video/>", {
            id: "video"
        });
        $("<source/>", {
            src: "videos/"+this.scene+".webm",
            type: "video/webm"
        }).appendTo(videoObj);
        videoObj.appendTo($("#video-container"));
        this.updatePlayerSize();
        $("#video").on("durationchange", () => {
            // = onload
            const videoDOM = $("#video").get(0);
            const videoDuration = videoDOM.duration;
            const timerDuration = this.totalSeconds;
    
            videoDOM.playbackRate = videoDuration / timerDuration;
            videoDOM.play();
        });
    }

    renderVideoCredits() {
        const req = new XMLHttpRequest();
        req.open("GET", "video_sources/"+this.scene+".txt", false);
        req.send();

        const videoCredits = req.responseText;
        $("#video-credits").html(videoCredits);
    }

    renderBackgroundMusic() {
        this.renderBackgroundMusicObject();
        this.renderBackgroundMusicCredits();
    }

    renderBackgroundMusicObject() {
        const audioObj = $("<audio/>", {
            id: "audio-background"
        });
        $("<source/>", {
            src: "audio/"+this.scene+".mp3",
            type: "audio/mpeg"
        }).appendTo(audioObj);
        audioObj.prependTo($("#audio-container"));
        audioObj.get(0).volume = 0.5;
        audioObj.get(0).play();
    }

    renderBackgroundMusicCredits() {
        const req = new XMLHttpRequest();
        req.open("GET", "audio_sources/"+this.scene+".txt", false);
        req.send();

        const audioCredits = req.responseText;
        $("#audio-background-music-credits").html(audioCredits);
    }

    renderHalfTimeSound() {
        const audioObj = $("<audio/>", {
            id: "audio-half-time"
        });
        $("<source/>", {
            src: "audio/notification_sound_half.mp3",
            type: "audio/mpeg"
        }).appendTo(audioObj);
        audioObj.prependTo($("#audio-container"));
        audioObj.get(0).play();
    }

    renderEndingTimeSound() {
        const audioObj = $("<audio/>", {
            id: "audio-ending-time"
        });
        $("<source/>", {
            src: "audio/notification_sound_ending.mp3",
            type: "audio/mpeg"
        }).appendTo(audioObj);
        audioObj.prependTo($("#audio-container"));
        audioObj.get(0).play();
    }

    beginTicking() {
        this.intervalHandle = setInterval(() => {
            this.currentSeconds++;

            if (this.currentSeconds == Math.floor(this.totalSeconds / 2)) {
                this.renderHalfTimeSound();
            } else if (this.currentSeconds >= this.totalSeconds) {
                this.renderEndingTimeSound();
                this.stop();
            }

            this.renderProgress();
        }, 1000);

        $(window).on("resize", () => {
            this.updatePlayerSize();
        });
    }

    renderProgress() {
        const remainingMinutes = Math.floor(this.getRemainingSeconds() / 60);

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

        $("#progressbar-progress").width(Math.ceil(this.currentSeconds * 100 / this.totalSeconds) + "%");
        $("#progressbar-text").text(text);
    }

    updatePlayerSize() {
        $("#video").width($(window).width());
        $("#video").height($(window).height());
    }

    stop() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
        }
        $("#progressbar-progress").addClass("finished");
    }

    getRemainingSeconds() {
        return this.totalSeconds - this.currentSeconds;
    }
}

function start(form) {
    timer = new VideoTimer(
        form.minutes.value * 60,
        form.scene.value,
        form.music.checked
    );
    timer.start();
}