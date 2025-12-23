import { EventSystem } from "../base/event-system";
import { FinishEvent } from "../base/events";
import type { Context } from "../base/context";
import type { SnakeGame } from "./snakeGame";

export class UI {
    // public readonly snakeSpeed: HTMLInputElement;
    // public readonly boardWidth: HTMLInputElement;
    // public readonly boardHeight: HTMLInputElement;

    // private readonly parameters: HTMLDivElement;

    // private readonly winMessage: HTMLParagraphElement;
    // private readonly loseMessage: HTMLParagraphElement;
    // private readonly pausedMessage: HTMLParagraphElement;
    
    // private readonly startButton: HTMLButtonElement;
    // private readonly restartButton: HTMLButtonElement;
    // private readonly resumeButton: HTMLButtonElement;
    // private readonly quitButton: HTMLButtonElement;

    private session: Context;

    public constructor(session: Context) {
        this.session = session;

        // this.winMessage = document.getElementById("winMessage") as HTMLParagraphElement;
        // this.loseMessage = document.getElementById("loseMessage") as HTMLParagraphElement;
        // this.pausedMessage = document.getElementById("pausedMessage") as HTMLParagraphElement;

        // this.snakeSpeed = document.getElementById("snakeSpeed") as HTMLInputElement;
        // this.boardWidth = document.getElementById("boardWidth") as HTMLInputElement;
        // this.boardHeight = document.getElementById("boardHeight") as HTMLInputElement;

        // this.parameters = document.getElementById("parameters") as HTMLInputElement;
        
        // this.startButton = document.getElementById("start") as HTMLButtonElement;
        // this.restartButton = document.getElementById("restart") as HTMLButtonElement;
        // this.resumeButton = document.getElementById("resume") as HTMLButtonElement;
        // this.quitButton = document.getElementById("quit") as HTMLButtonElement;

        // this.setMenuState();

        // this.startButton.onclick = () =>
        //     session.gameEvents.notify(GameEvent.START);

        // this.restartButton.onclick = () =>
        //     session.gameEvents.notify(GameEvent.RESTART);

        // this.resumeButton.onclick = () =>
        //     session.gameEvents.notify(GameEvent.RESUME);

        // this.quitButton.onclick = () =>
        //     session.gameEvents.notify(GameEvent.QUIT);

        // session.gameEvents.subscribe((event: GameEvent) => {
        //     switch (event) {
        //         case GameEvent.START:
        //             this.showStartButton(false);
        //             this.showParameters(false);
        //             break;
        //         case GameEvent.RESTART:
        //             this.showWinMessage(false);
        //             this.showLoseMessage(false);
        //             this.showPausedMessage(false);
        //             this.showRestartButton(false);
        //             this.showResumeButton(false);
        //             this.showQuitButton(false);
        //             break;
        //         case GameEvent.RESUME:
        //             this.showPausedMessage(false);
        //             this.showRestartButton(false);
        //             this.showResumeButton(false);
        //             this.showQuitButton(false);
        //             break;
        //         case GameEvent.PAUSE:
        //             this.showPausedMessage(true);
        //             this.showRestartButton(true);
        //             this.showQuitButton(true);
        //             break;
        //         case GameEvent.LOSE:
        //             this.showLoseMessage(true);
        //             this.showRestartButton(true);
        //             this.showQuitButton(true);
        //              break;
        //         case GameEvent.WIN:
        //             this.showWinMessage(true);
        //             this.showRestartButton(true);
        //             this.showQuitButton(true);
        //             break;
        //         case GameEvent.QUIT:
        //             this.setMenuState();
        //             break;
        //         default:
        //             break;
        //     }
        // })
    }

    // public showStartButton(value: boolean): void {
    //     value ? this.startButton.classList.remove("hidden") : this.startButton.classList.add("hidden");
    // }

    // public showParameters(value: boolean): void {
    //     value ? this.parameters.classList.remove("hidden") : this.parameters.classList.add("hidden");
    // }

    // public showRestartButton(value: boolean): void {
    //     value ? this.restartButton.classList.remove("hidden") : this.restartButton.classList.add("hidden");
    // }

    // public showResumeButton(value: boolean): void {
    //     value ? this.resumeButton.classList.remove("hidden") : this.resumeButton.classList.add("hidden");
    // }
    
    // public showQuitButton(value: boolean): void {
    //     value ? this.quitButton.classList.remove("hidden") : this.quitButton.classList.add("hidden");
    // }

    // public showWinMessage(value: boolean): void {
    //     value ? this.winMessage.classList.remove("hidden") : this.winMessage.classList.add("hidden");
    // }

    // public showLoseMessage(value: boolean): void {
    //     value ? this.loseMessage.classList.remove("hidden") : this.loseMessage.classList.add("hidden");
    // }

    // public showPausedMessage(value: boolean): void {
    //     value ? this.pausedMessage.classList.remove("hidden") : this.pausedMessage.classList.add("hidden");
    // }

    // public setMenuState(): void {
    //     this.showStartButton(true);
    //     this.showParameters(true);
        
    //     this.showWinMessage(false);
    //     this.showLoseMessage(false);
    //     this.showPausedMessage(false);
        
    //     this.showRestartButton(false);
    //     this.showResumeButton(false);
    //     this.showQuitButton(false);
    // }
}