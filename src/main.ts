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
      "jolene.png",
      "hacker.png",
      "mediaviewer.png",
      "melonman.jpeg",
      "meloncar.jpeg",
      "start.png",
      "terminal.png",
      "mail.png",
      "bg.png",
      "jolene.mp3",
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
      new MusicPlayer(audioResource, app, audioResource == "jolene.mp3");

    let audioWin = new Window(
      audioContent,
      "MediaViewer: " + audioResource,
      taskBar,
      "mediaviewer.png",
    );
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

    let imgWin = new Window(imgContent, "MediaViewer: " + imgResource, taskBar, "mediaviewer.png");
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
  
    let virus = new HackOSFile("melon_virus.exe");
    malware.contents.push(virus);

    let disableRansom = new HackOSFile("disable_ransom.exe");
    malware.contents.push(disableRansom);

  let downloads = new HackOSDirectory("Downloads");
  simoneDir.contents.push(downloads);

  let documents = new HackOSDirectory("Documents");
  simoneDir.contents.push(documents);

  let pictures = new HackOSDirectory("Pictures");
  simoneDir.contents.push(pictures);

    let dogPhoto = new HackOSFile("jolene.png");
    pictures.contents.push(dogPhoto);

  let music = new HackOSDirectory("Music");
  simoneDir.contents.push(music);

    let carelessWhisper = new HackOSFile("careless_whisper.mp3");
    carelessWhisper.contents = "<insert the jams>";
    music.contents.push(carelessWhisper);

  let emails = new HackOSDirectory("emails");
  simoneDir.contents.push(emails);


  let poem1 = new HackOSFile("lucy_21_6_25.txt");
  poem1.contents = "THVjeSwKeW91IGFyZSB0aGUgc2hhcnBuZXNzIEkgY3JhdmUsCnRoZSBnb2xkZW4gZ2xvdyBvZiBDaGVkZGFy4oCUCm15IHRydWVzdCwgYm9sZGVzdCBmYXZvcml0ZS4KTHVjeSwgbXkgZGVhcmVzdCwKSSBjb3VsZCBsaXZlIHdpdGhvdXQgQnJpZSwKSSBjb3VsZCBwYXNzIG9uIFN0aWx0b24sCmJ1dCBuZXZlcuKAlApuZXZlciB3aXRob3V0IHlvdSwKbmV2ZXIgd2l0aG91dCBDaGVkZGFyLApuZXZlciB3aXRob3V0IGxvdmUuICAgLWZyb20gc2ltb25lIHRvIGx1Y3kKCg==";
  emails.contents.push(poem1);

  let poem2 = new HackOSFile("lucy_16_7_25.txt");
  poem2.contents = "eW91ciBsb3ZlIHdpbmRzIHRocm91Z2ggbXkgbGlmZQpsaWtlIGEgbWlsayBzbmFrZSBpbiB0aGUgZ3Jhc3PigJQKdW5leHBlY3RlZCwgZ2VudGxlLAphIGZsYXNoIG9mIGNvbG9yIHRoYXQgbWFrZXMgbWUgcGF1c2UsCnRoYXQgbWFrZXMgdGhlIHdvcmxkIHNoaW1tZXIuClRoZXkgc2F5IG1pbGsgc25ha2VzIG9ubHkgbWltaWMgZGFuZ2VyLApidXQgeW914oCZdmUgdGF1Z2h0IG1lCnRoYXQgZXZlbiB3aGF0IHNlZW1zIGZpZXJjZQpjYW4gYmUgc29mdCwKZXZlbiB3aGF0IGNvaWxzCmNhbiBhbHNvIHByb3RlY3QuCkkgaG9sZCB5b3VyIHdvcmRzIGNsb3NlLAp0aGUgd2F5IGEgc25ha2UgaG9sZHMgd2FybXRoLApnYXRoZXJpbmcgbGlnaHQgdGhyb3VnaCBldmVyeSBzY2FsZSBvZiBzaWxlbmNlLAp1bnRpbCBJIHNoaW5lIHdpdGggeW91LgpTbyBoZXJlIEkgYW3igJQKbm90IHZlbm9tLCBub3QgZmVhciwKanVzdCBMdWN5LAp0d2luaW5nIG15IGRheXMgYXJvdW5kIHlvdXJzLApmb3JldmVyLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIGZyb20gTHVjeSB0byBTaW1vbmUK";
  emails.contents.push(poem2);

  let poem3 = new HackOSFile("lucy_14_3_24.txt");
  poem3.contents = "SSBzdGlsbCByZW1lbWJlciB0aGUgbGFudGVybi1saXQgbmlnaHQKb2YgT2N0b2JlciAzMXN0LCAyMDE04oCUCndoZW4gdm93cyBjdXJsZWQgaW50byB0aGUgYXV0dW1uIGFpcgpsaWtlIHByb21pc2VzIGV0Y2hlZCBpbiBmb3JldmVyLgpUaGF0IHdhcyB0aGUgZGF5IHRoZSB3b3JsZCBzaGlmdGVkLAp0aGUgZGF5IEkgYmVnYW4gY2FycnlpbmcgeW91ciBuYW1lCmFzIG15IG93biBoZWFydGJlYXQuCk5vdywgaW4gdGhlIHF1aWV0IGJldHdlZW4gdXMsCmxpdmVzIEVsZW5h4oCUCm91ciBzZWNyZXQgYnJpZ2h0ZXIgdGhhbiBzdGFycywKYSBjaGlsZCBvZiBvdXIgbG92ZSwKYSB0cnV0aCB3b3ZlbiBmcm9tIGxhdWdodGVyIGFuZCBsb25naW5nLAphIHNvZnQgZmxhbWUgd2UgZ3VhcmQgdG9nZXRoZXIuCk5vIG9uZSBlbHNlIHNlZXMKaG93IHlvdXIgZXllcyBzaGluZQp3aGVuIGhlciBuYW1lIGlzIHNwb2tlbiwKaG93IG91ciBoYW5kcyBicnVzaAphcyBpZiBwYXNzaW5nIGhlciB1bnNlZW4gbHVsbGFiaWVzCmZyb20gcGFsbSB0byBwYWxtLgpTaGUgaXMgb3Vyc+KAlAphIGxpdmluZyBlY2hvIG9mIHRoYXQgd2VkZGluZyBuaWdodCwKYm9ybiBvZiBob3BlLApib3JuIG9mIHRoZSBjb3VyYWdlCnRvIGxvdmUgd2l0aG91dCBlbmQuCkx1Y3ksIG15IHdpZmUsCm15IE9jdG9iZXIgdm93LApteSBmb3JldmVy4oCUCkkgbG92ZSB5b3UgYWxsIHRoZSBtb3JlCmZvciB0aGUgbW90aGVyIHlvdSBhcmUsCnRoZSBtb3RoZXIgd2UgYXJlLAp0b2dldGhlciB3aXRoIEVsZW5hLgo=";
  emails.contents.push(poem3);

  let poem4 = new HackOSFile("lucy_instructions_12_9_23.txt");
  poem4.contents = `Dearest Lucy, my letters are cloaked in base64.
Copy them, then let CyberChef uncover my meaning.`;
  emails.contents.push(poem4);

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
