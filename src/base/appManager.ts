// import type { EnvironmentManager, ViewParameters } from "./environment";
// import { EventSystem } from "./event-system";
// import { InputHandler } from "../input-handler";
// import { Loop } from "./loop";
// import { SnakeGame } from "../snakeGame";
// import { UI } from "../ui";
// import { EventType, type BoardParameters, type SnakeGameParameters, type SnakeParameters } from "../utils";

// export class AppManager {
//     private app: EnvironmentManager | null = null;
//     private readonly loop = Loop.getInstance();

//     private readonly viewParams: ViewParameters;
//     private input!: InputHandler;

//     public constructor(viewParams: ViewParameters) {
//         this.viewParams = viewParams;

//         EventSystem.subscribe((event: EventType) => {
//             switch (event) {
//                 case EventType.START: this.start(); break;
//                 case EventType.RESTART: this.restart(); break;
//                 case EventType.RESUME: this.loop.resume(); break;
//                 case EventType.PAUSE: this.loop.pause(); break;
//                 case EventType.QUIT: this.quit(); break;
//                 case EventType.LOSE: this.loop.pause(); break;
//                 case EventType.WIN: this.loop.pause(); break;
//                 default: break;
//             }
//         })
//     }

//     private start() {
//         this.quit();

//         const ui = UI.getInstance();
//         const snakeParams: SnakeParameters = { speed: Number(ui.snakeSpeed.value) };
//         const gridParams: BoardParameters = { width: Number(ui.boardWidth.value), height: Number(ui.boardHeight.value) };
//         const snakeGameParams: SnakeGameParameters = { snake: snakeParams, board: gridParams };
        
//         this.input = new InputHandler();
//         this.app = new SnakeGame(this.viewParams, snakeGameParams, this.input);
//         this.loop.add(this.app);
//         this.loop.resume();
//     }

//     private quit() {
//         if (!this.app) return;
//         this.loop.remove(this.app);
//         this.app.destroy();
//         this.input.destroy();
//         this.app = null;
//     }

//     private restart() {
//         this.start();
//     }
// }
