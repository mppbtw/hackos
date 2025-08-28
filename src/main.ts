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
import { showLoadingScreen } from "./startup.ts";

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


async function allTheStuff() {
  await document.fonts.ready;

  await PIXI.Assets.load(
    [
      "stop.webp",
      "doggydog.png",
      "hacker.png",
      "melonman.jpeg",
      "meloncar.jpeg",
      "start.png",
      "terminal.png",
      "mail.png",
      "bg.png",
    ]);

  let bg = new PIXI.Sprite(PIXI.textureFrom("bg.png"));
  bg.width = window.innerWidth;
  bg.height = window.innerHeight-60;
  app.stage.addChild(bg);

  document.body.appendChild(app.canvas);

  app.ticker.maxFPS = 60;

  app.renderer.resize(window.innerWidth, window.innerHeight);
  window.addEventListener("resize", function() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
  });

  await showLoadingScreen(app);

  var taskBar = new TaskBar();
  taskBar.y = window.innerHeight - taskBar.innerHeight;
  app.stage.addChild(taskBar);

  function spawnNotification() {
    new Howl({src: "notify.mp3", autoplay: true, volume: 1});
    let notif_content =
      new Notification(
        `You have one new message from: lucy@hackmail.co
Message content saved to E-Mail directory.`
    );

    let notifWin = new Window(notif_content, "E-Mail Notification", taskBar, "mail.png");
    app.stage.addChild(notifWin);

    notif_content.button.onclick = function() {notifWin.closeWindow()};
  }

  function spawnMusicPlayer(audioResource: string) {
    new Howl({src: "chimes-backward.mp3", autoplay: true});
    let audioContent =
      new MusicPlayer(audioResource, app);

    let audioWin = new Window(audioContent, "MediaViewer: " + audioResource, taskBar, "terminal.png");
    audioWin.onWindowClose = audioContent.onDestroyed;
    app.stage.addChild(audioWin);
    audioWin.onWindowClose = function() {
      audioContent.destroy();
      audioContent.sound.stop();
    }
  }

  function spawnImageViewer(imgResource: string) {
    new Howl({src: "chimes-backward.mp3", autoplay: true});
    let imgContent =
      new ImageViewer(imgResource);

    let imgWin = new Window(imgContent, "MediaViewer: " + imgResource, taskBar, "terminal.png");
    app.stage.addChild(imgWin);
  }

  function spawnTerminal() {
    new Howl({src: "chimes-backward.mp3", autoplay: true});
    let terminalContent = new Terminal(fs, ["home", "S1m0ne"], app, taskBar);
    terminalContent.shell.imageViewer = spawnImageViewer;
    terminalContent.shell.musicPlayer = spawnMusicPlayer;

    let win = new Window(terminalContent, "HackOS Terminal", taskBar, "terminal.png");
    win.onMinimize = function() {
      terminalContent.focus = false;
    }
    win.onMaximize = function() {
      terminalContent.focus = true;
    }
    app.stage.addChild(win);
  }


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

  let malware = new HackOSDirectory("Malware");
  simoneDir.contents.push(malware);
  
    let virus = new HackOSFile("virus.exe");
    malware.contents.push(virus);

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

  let terminalShortcut = new Shortcut("terminal.png");
  terminalShortcut.x = 70;
  terminalShortcut.y = 200;
  terminalShortcut.onclick = spawnTerminal;
  let terminalText = new PIXI.Text({
    text: "HackOS\nTerminal", 
    style: {
      align: "center",
      fontFamily: "Press Start 2P",
      fontSize: 12,
      fontWeight: "lighter",
      fill: "white",
  }});
  terminalText.x = terminalShortcut.x + (terminalShortcut.width*0.5 - terminalText.width*0.5);
  terminalText.y = terminalShortcut.y + terminalShortcut.height + terminalText.height*0.5;
  app.stage.addChild(terminalText);
  app.stage.addChild(terminalShortcut);


  let notificationShortcut = new Shortcut("mail.png");
  notificationShortcut.x = 70;
  notificationShortcut.y = 50;
  notificationShortcut.onclick = spawnNotification;

  let notificationText = new PIXI.Text({
    text: "View\nNotifications", 
    style: {
      align: "center",
      fontFamily: "Press Start 2P",
      fontSize: 12,
      fontWeight: "lighter",
      fill: "white",
    }});
  notificationText.x =
    notificationShortcut.x +
    (notificationShortcut.width*0.5 - notificationText.width*0.5);

  notificationText.y =
    notificationShortcut.y +
    notificationShortcut.height + notificationText.height*0.5;

  app.stage.addChild(notificationText);
  app.stage.addChild(notificationShortcut);

  setTimeout(spawnNotification, 3000);
}
