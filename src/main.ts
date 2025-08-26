//@ts-ignore
import "./style.css"

import { Window } from "./guiCore.ts";
import { Notification } from "./notification.ts";
import * as PIXI from "pixi.js"
import { TaskBar } from "./taskBar.ts";
import { Shortcut } from "./desktopShortcut.ts";
import { backgroundColor } from "./constants.ts";
import { HackOSDirectory, HackOSFile, Terminal } from "./terminal.ts";
import { ImageViewer, MusicPlayer } from "./mediaviewer.ts";

PIXI.TextureStyle.defaultOptions.scaleMode = "nearest";


export const app = new PIXI.Application();

(async () => {
  await app.init({
    antialias: false,
    width: window.innerWidth,
    height: window.innerHeight,
    roundPixels: true,
    backgroundColor: backgroundColor,
  });
})().then(allTheStuff);

function showLoadingScreen() {

}

async function allTheStuff() {
  await showLoadingScreen();

  document.body.appendChild(app.canvas);

  app.ticker.maxFPS = 60;

  app.renderer.resize(window.innerWidth, window.innerHeight);
  window.addEventListener("resize", function() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
  });

  await PIXI.Assets.load(["stop.webp", "doggydog.png"]);

  var taskBar = new TaskBar();
  taskBar.y = window.innerHeight - taskBar.innerHeight;
  app.stage.addChild(taskBar);

  function spawnNotification() {
    let notif_content =
      new Notification("You have one new message!\nMessage content saved to E-Mail directory");

    let notifWin = new Window(notif_content, "E-Mail Notification", taskBar);
    app.stage.addChild(notifWin);

    notif_content.button.onclick = function() {notifWin.closeWindow()};
  }

  function spawnMusicPlayer(audioResource: string) {
    let audioContent =
      new MusicPlayer(audioResource);

    let audioWin = new Window(audioContent, "MediaViewer: " + audioResource, taskBar);
    audioWin.onWindowClose = audioContent.onDestroyed;
    app.stage.addChild(audioWin);
    audioWin.onWindowClose = function() {
      audioContent.destroy();
      audioContent.sound.stop();
    }
  }

  function spawnImageViewer(imgResource: string) {
    let imgContent =
      new ImageViewer(imgResource);

    let imgWin = new Window(imgContent, "MediaViewer: " + imgResource, taskBar);
    app.stage.addChild(imgWin);
  }

  function spawnTerminal() {
    let terminalContent = new Terminal(fs, ["home", "S1m0ne"]);
    terminalContent.shell.imageViewer = spawnImageViewer;
    terminalContent.shell.musicPlayer = spawnMusicPlayer;

    let win = new Window(terminalContent, "HackOS Terminal", taskBar);
    win.onMinimize = function() {
      terminalContent.focus = false;
    }
    win.onMaximize = function() {
      terminalContent.focus = true;
    }
    app.stage.addChild(win);
  }


  let notificationShortcut = new Shortcut("stop.webp");
  app.stage.addChild(notificationShortcut);
  notificationShortcut.x = 50;
  notificationShortcut.y = 50;
  notificationShortcut.onclick = spawnNotification;

  let linuxRootLevelDirs = [
    "bin",
    "mnt",
    "sys",
    "boot",
    "opt",
    "tmp",
    "dev",
    "proc",
    "usr",
    "etc",
    "root",
    "var",
    "run",
    "lib",
    "lib64",
    "sbin",
    "srv",
  ];

  var fs = new HackOSDirectory("");
  let home = new HackOSDirectory("home");
  fs.contents.push(home);

  for (let i=0; i<linuxRootLevelDirs.length; i++) {
    fs.contents.push(new HackOSDirectory(linuxRootLevelDirs[i]));
  }

  let simoneDir = new HackOSDirectory("S1m0ne");
  home.contents.push(simoneDir);

  let downloads = new HackOSDirectory("Downloads");
  simoneDir.contents.push(downloads);

  let documents = new HackOSDirectory("Documents");
  simoneDir.contents.push(documents);

  let pictures = new HackOSDirectory("Pictures");
  simoneDir.contents.push(pictures);

    let dogPhoto = new HackOSFile("doggydog.png");
    pictures.contents.push(dogPhoto);

  let music = new HackOSDirectory("Music");
  simoneDir.contents.push(music);

    let carelessWhisper = new HackOSFile("careless_whisper.mp3");
    carelessWhisper.contents = "<insert the jams>";
    music.contents.push(carelessWhisper);

  let video = new HackOSDirectory("Videos");
  simoneDir.contents.push(video);

    let rat = new HackOSFile("rat.mp4");
    video.contents.push(rat);

    let tutorial = new HackOSFile("tutorial.mp4");
    video.contents.push(tutorial);

  let emails = new HackOSDirectory("emails");
  simoneDir.contents.push(emails);

  let emailsWork = new HackOSDirectory("work");
  emails.contents.push(emailsWork);
  let emailsLucy = new HackOSDirectory("lucy");
  emails.contents.push(emailsLucy);

  let loveLetter = new HackOSFile("loveletter.txt");
  loveLetter.contents = "my dearest simone";
  emailsLucy.contents.push(loveLetter);

  let file = new HackOSFile("test.txt");
  file.contents = "you have read the file\n second line yeha\n";

  let terminalShortcut = new Shortcut("stop.webp");
  app.stage.addChild(terminalShortcut);
  terminalShortcut.x = 50;
  terminalShortcut.y = 150;
  terminalShortcut.onclick = spawnTerminal;
}
