import { MatchStatus } from "../types";

export const statusIconMap = {
    "waiting": "/static/icons/wait.svg",
    "auto": "/static/icons/mechaleague_car.svg",
    "tele": "/static/icons/controller.svg",
    "disabled": "/static/icons/stop.svg"
} satisfies {[key in MatchStatus]: string};