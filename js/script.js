class VideoTimer {

    constructor(startUnixSeconds, endingUnixSeconds, text, scene, music) {
        this.startUnixSeconds = startUnixSeconds;
        this.currentUnixSeconds = Math.round(Date.now() / 1000);
        this.endingUnixSeconds = endingUnixSeconds;
        this.text = text;
        this.scene = scene;
        this.music = music;

        if (this.currentUnixSeconds > this.endingUnixSeconds) {
            this.currentUnixSeconds = this.endingUnixSeconds;
        }
    }

    start() {
        $("#form").hide();
        $("#autoplay").hide();

        this.activateShareButton();
        this.renderText();
        this.renderVideo();
        if (this.music) {
            this.renderBackgroundMusic();
        }

        $("body").css("overflow", "hidden");
        $("#player").show();
        this.beginTicking();
    }

    activateShareButton() {
        const shareContainer = $("#share-container");
        shareContainer.popover({
            content: "In die Zwischenablage kopiert!",
            title: "Link"
        });
        shareContainer.on("click", () => {
            const textarea = $("<textarea/>").text(this.getShareableLink());
            textarea.appendTo(document.body);
            textarea.get(0).select();
            textarea.get(0).setSelectionRange(0, 99999);
            document.execCommand("copy");
            textarea.remove();
            setTimeout(() => {
                shareContainer.popover("hide");
            }, 2000);
        });
    }

    getShareableLink() {
        return window.location.href.split("?")[0] +
            "?startUnixSeconds=" + encodeURIComponent(this.startUnixSeconds) +
            "&endingUnixSeconds=" + encodeURIComponent(this.endingUnixSeconds) + 
            "&text=" + encodeURIComponent(this.text) +
            "&scene=" + encodeURIComponent(this.scene) +
            "&music=" + encodeURIComponent(this.music);
    }

    renderText() {
        if (this.text) {
            $("#text").text(this.text);
            $("#text-container").show();
        }
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
            const timerDuration = this.endingUnixSeconds - this.startUnixSeconds;
    
            videoDOM.playbackRate = videoDuration / timerDuration;
            videoDOM.currentTime = 
                (this.currentUnixSeconds - this.startUnixSeconds) /
                (this.endingUnixSeconds - this.startUnixSeconds) *
                videoDuration; 
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
        audioObj.get(0).currentTime = this.currentUnixSeconds - this.startUnixSeconds;
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
            this.currentUnixSeconds++;

            if (this.currentUnixSeconds == Math.floor(this.endingUnixSeconds / 2)) {
                this.renderHalfTimeSound();
            } else if (this.currentUnixSeconds >= this.endingUnixSeconds) {
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
        const remainingSeconds = this.endingUnixSeconds - this.currentUnixSeconds;
        const remainingMinutes = Math.floor(remainingSeconds / 60);

        let text = "";
        if (remainingMinutes > 0) {
            text += remainingMinutes + " Minute" + (remainingMinutes !== 1 ? "n" : "");
        } else if (remainingSeconds > 0) {
            text += remainingSeconds + " Sekunde" + (remainingSeconds !== 1 ? "n" : "");
        } else {
            text += "Zeit abgelaufen";
        }

        let progress = Math.ceil(
            (this.currentUnixSeconds - this.startUnixSeconds) * 100 / 
            (this.endingUnixSeconds - this.startUnixSeconds)
        );
        if (progress > 100) {
            progress = 100;
        }
        $("#progressbar-progress").width(progress + "%");
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

}

$(document).ready(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get("startUnixSeconds")) {
        return;
    }

    autoplay();
});

function manualStart(form) {
    const currentUnixSeconds = Math.round(Date.now() / 1000);
    timer = new VideoTimer(
        currentUnixSeconds,
        currentUnixSeconds + form.minutes.value * 60,
        form.text.value,
        form.scene.value,
        form.music.checked
    );
    timer.start();
}

function autoplay() {
    $("#form").hide();
    $("#autoplay").show();
}

function automaticStart() {
    const urlParams = new URLSearchParams(window.location.search);
    timer = new VideoTimer(
        urlParams.get("startUnixSeconds"),
        urlParams.get("endingUnixSeconds"),
        urlParams.get("text"),
        urlParams.get("scene"),
        urlParams.get("music") === "true"
    );
    timer.start();
}