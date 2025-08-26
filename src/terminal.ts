import * as PIXI from "pixi.js"
import { top_bar_height } from "./constants";

const terminalWidth = 1250;
const terminalHeight = 600;
const terminalMaxLines = 18;

class CmdHistory {
    cmds: string[] = ["first", "second", "third"];
    index: number = 0;

    reset() {
        this.index = 0;
    }

    previous(): string | undefined {
        if (this.index == this.cmds.length) {
            return undefined
        }

        this.index++;
        let cmd = this.cmds[this.cmds.length - this.index];
        console.log("index:", this.index);
        return cmd
    }

    next(): string | undefined {
        if (this.index == 1) {
            return undefined;
        }
        this.index--;
        let cmd = this.cmds[this.cmds.length-this.index];
        console.log("index:", this.index);
        return cmd;
    }
}


export class Terminal extends PIXI.Container {
    background: PIXI.Graphics;
    text: PIXI.Text;
    focus: boolean = true;
    currentCommandStartIndex: number;

    cmdBuffer: string = "mediaviewer Music/careless_whisper.mp3";
    cmdHistory: CmdHistory = new CmdHistory();

    shell: Shell;

    constructor(fs: HackOSDirectory, workingDir: string[]) {
        super();
        this.shell = new Shell(fs, workingDir);
        this.background = new PIXI.Graphics();
        this.addChild(this.background);
        this.background.rect(0, 0, terminalWidth, terminalHeight).fill(0);

        this.text = new PIXI.Text({});
        this.text.x = 25;
        this.text.style.fill = new PIXI.Color("white");
        this.text.text =
            `Welcome to the HackOS Terminal
Logged in as S1m0ne
Type 'help' for a list of common commands

`
        this.text.text += this.shell.getPrompt();
        this.text.style.fontFamily = "monospace";
        this.currentCommandStartIndex = this.text.text.length;
        this.addChild(this.text);

        let t = this;
        document.addEventListener("mousedown", function(event) {
            t.handleMouseDown(event)
        });
        document.addEventListener("keydown", function(event) {
            t.handleKeyDown(event)
        })
    }

    displayCmdBuffer() {
        this.text.text = this.text.text.substring(0, this.currentCommandStartIndex);
        if (this.cmdBuffer.length > 60) {
            this.text.text +=
                this.cmdBuffer.substring(0, 60)
                + "\n"
                + this.cmdBuffer.substring(60, this.cmdBuffer.length);
            this.handleScroll();
        } else {
            this.text.text += this.cmdBuffer
        }
        this.text.text += "_";
    }

    handleScroll() {
        while (this.text.text.split("\n").length > terminalMaxLines) {
            // Find index of the first \n
            for (let i=0; i<this.text.text.length; i++) {
                if (this.text.text[i] == "\n") {
                    this.text.text = this.text.text.substring(i+1, this.text.text.length)
                    this.currentCommandStartIndex = this.text.text.length;
                    break
                }
            }
        }
    }

    handleKeyDown(event: KeyboardEvent) {
        if (!this.focus) return;
        if (event.key.length === 1) {
            this.cmdBuffer += event.key;
        } else if (event.key == "Backspace") {
            if (this.cmdBuffer.length >= 1) {
                this.cmdBuffer = this.cmdBuffer.substring(0, this.cmdBuffer.length-1);
            }
        } else if (event.key == "Enter") {
            this.handleCommand();
            return;
        } else if (event.key == "ArrowUp") {
            let previous = this.cmdHistory.previous();
            console.log("previous: ", previous);
            if (previous != undefined) {
                this.cmdBuffer = previous;
            }
        } else if (event.key == "ArrowDown") {
            let next = this.cmdHistory.next();
            console.log("next: ", next);
            if (next != undefined) {
                this.cmdBuffer = next;
            } else {
                this.cmdBuffer = "";
                this.cmdHistory.reset();
            }
        }

        this.displayCmdBuffer();
    }

    handleCommand() {
        this.text.text = this.text.text.substring(0, this.text.text.length-1);
        this.text.text += "\n";
        if (this.cmdBuffer == "clear") {
            this.text.text = "";
        } else {
            this.text.text += this.shell.runCommand(this.cmdBuffer.split(" "));
            this.text.text += "\n";
        }
        this.text.text += this.shell.getPrompt();
        this.currentCommandStartIndex = this.text.text.length;

        this.handleScroll();
        this.cmdBuffer = "";
    }

    handleMouseDown(event: MouseEvent) {
        let pos = this.getGlobalPosition();
        let d_x = event.x - pos.x;
        let d_y = event.y - pos.y;
        if ((d_x <= this.width && d_x >= 0)
            && (d_y <= this.height && d_y >= -top_bar_height))
        {
            this.focus = true;
        } else {
            this.focus = false;
        }
    }
}

export interface FilesystemComponent {
    name: string;
    asHackOSFile(): HackOSFile | undefined;
    asHackOSDirectory(): HackOSDirectory | undefined;
}

export class HackOSFile implements FilesystemComponent {
    name: string;
    contents: string = "";
    constructor(name: string) {
        this.name = name;
    }

    asHackOSFile(): HackOSFile | undefined {
        return this;
    }

    asHackOSDirectory(): HackOSDirectory | undefined {
        return;
    }
}

export class HackOSDirectory implements FilesystemComponent {
    contents: FilesystemComponent[] = [];
    name: string;
    constructor(name: string) {
        this.name = name;
    }

    asHackOSFile(): HackOSFile | undefined {
        return;
    }

    asHackOSDirectory(): HackOSDirectory | undefined {
        return this;
    }
}

class Shell {
    fs: HackOSDirectory;
    workingDir: string[] = [];

    getPrompt(): string {
        let dir = ("/" + this.workingDir.join("/")).replace("/home/S1m0ne", "~");
        return "S1m0ne@work-pc " + dir + " $ ";
    }

    evaluatePath(path: string): string[] | undefined {
        if (path == "/") {
            return []
        }

        let mustBeDir = path.endsWith("/");
        if (mustBeDir) {
            path = path.substring(0, path.length-1);
        }
        if (path.startsWith("/")) {
            path = path.substring(1, path.length);
            let pathSegments = path.split("/")
            return pathSegments;
        } else {
            if (path.startsWith("./")) {
                path = path.substring(2, path.length);
            }
            let pathSegments = [];
            for (let i=0; i<this.workingDir.length; i++) {
                pathSegments.push(this.workingDir[i]);
            }

            for (let i=0; i<path.split("/").length; i++) {
                pathSegments.push(path.split("/")[i]);
            }
            return pathSegments;
        }
    }

    searchAbsolutePath(path: string[]): FileSystemComponent | undefined {
        if (path.length == 1 && path[0] == "/") {
            return this.fs;
        }
        let currentItem = this.fs as FilesystemComponent;
        for (let i=0; i<path.length; i++) {

            let asDir = currentItem.asHackOSDirectory();
            if (asDir != undefined) {
                let itemIndex = asDir.contents
                    .map((item) => item.name)
                    .findIndex((name) => name==path[i]);
                if (itemIndex == -1) {
                    return undefined;
                }
                currentItem = asDir.contents[itemIndex as number];
                if (currentItem == undefined) {
                    return undefined;
                }
            } else {
                let asFile = currentItem.asHackOSFile() as HackOSFile;
                return asFile;
            }
        }
        return currentItem;
    }

    constructor(fileSystem: HackOSDirectory, workingDir: string[]) {
        this.fs = fileSystem;
        this.workingDir = workingDir;
    }

    runCommand(cmd: string[]): string {
        if (cmd[0] == "help") {
            return `HackOS Terminal Version 5.7
Type "help" to read this message again

Common Commands:

pwd                Print the current directory
ls                 List files in the current directory
cd <DirectoryName> Move into another directory
cd ..              Move back out of a directory
cat <FileName>     Read the contents of a file
clear              Clears the screen
mediaviewer        Plays image/audio/video files`
        } else if (cmd[0] == "ls") {
            let workingDir: undefined | FilesystemComponent
                = this.searchAbsolutePath(this.workingDir);
            if (workingDir == undefined) {
                return "Error: could not complete action";
            }
            let asDir = workingDir.asHackOSDirectory();
            if (asDir == undefined) {
                return "error: ls only works with directories, not files"
            }
            let resultString = "";
            let currentLineLength = 0;
            for (let i=0; i<asDir.contents.length; i++) {
                let item = asDir.contents[i];
                if (item.asHackOSDirectory() != undefined) {
                    resultString += item.name + "/ ";
                } else {
                    resultString += item.name + "  ";
                }
                currentLineLength += item.name.length + 2;
                if (currentLineLength > 40) {
                    resultString += "\n";
                    currentLineLength = 0;
                }
            }
            return resultString;
        } else if (cmd[0] == "echo") {
            return cmd.slice(1, cmd.length).join(" ")
        } else if (cmd[0] == "pwd") {
            return "/" + this.workingDir.join("/");
        } else if (cmd[0] == "") {
            return "";
        } else if (cmd[0] == "cd") {
            if (cmd.length < 2) {
                this.workingDir = ["home", "S1m0ne"];
                return "";
            }

            let targetDir: string[] | undefined
                = this.evaluatePath(cmd[1]);

            if (targetDir == undefined) {
                return "error: no such path: " + cmd[1];
            }
            let targetDirItem: FilesystemComponent | undefined
                = this.searchAbsolutePath(targetDir);
            if (targetDirItem == undefined) {
                return "error: no such directory: " + cmd[1];
            }
            if (targetDirItem.asHackOSDirectory() == undefined) {
                return "error: no such directory: " + cmd[1];
            }

            this.workingDir = targetDir;

            return "";
        } else if (cmd[0] == "cat") {
            if (cmd.length < 2) {
                return "usage: cat <FILENAME>";
            }
            let targetFilePath = this.evaluatePath(cmd[1]);
            if (targetFilePath == undefined) {
                return "error: no such file: " + cmd[1];
            }

            let targetFile: FilesystemComponent | undefined
                = this.searchAbsolutePath(targetFilePath);
            if (targetFile == undefined) {
                return "error: no such file: " + cmd[1];
            }

            let asFile = targetFile.asHackOSFile();
            if (asFile == undefined) {
                return "error: no such file: " + cmd[1];
            }
            if (asFile.name.split(".")[-1] != ".txt") {
                return "error: cat cannot read this type of file";
            }
            return asFile.contents;
        } else if (cmd[0] == "mediaviewer") {
            if (cmd.length < 2) {
                return "usage: mediaviewer <FILENAME>";
            }
            let targetFilePath = this.evaluatePath(cmd[1]);
            if (targetFilePath == undefined) {
                return "error: no such file: " + cmd[1];
            }

            let targetFile: FilesystemComponent | undefined
                = this.searchAbsolutePath(targetFilePath);
            if (targetFile == undefined) {
                return "error: no such file: " + cmd[1];
            }

            let asFile = targetFile.asHackOSFile();
            if (asFile == undefined) {
                return "error: no such file: " + cmd[1];
            }
            let extension = asFile.name.split(".")[asFile.name.split(".").length-1];
            console.log("extension:", extension);
            if (extension == "jpeg") {
                this.imageViewer("coolcrate.png");
            } else if (extension == "mp3") {
                this.musicPlayer(cmd[1]);
            } else {
                return "error: mediaviewer cannot read this type of file";
            }
            return "";
        } else {
            return "error: Command not recognized";
        }
    }

    imageViewer(_imgResource: string) {}
    musicPlayer(_audioResource: string) {}
}
