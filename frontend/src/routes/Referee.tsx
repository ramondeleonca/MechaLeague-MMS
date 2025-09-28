import { statusIconMap } from "@/common/status-icon-map";
import NumberFlip from "@/components/numberflip";
import { MatchStatus } from "@/types";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket"

export type OrbitProps = { 
    color: "red" | "blue", 
    position: "left" | "middle" | "right" | number,
    values: boolean[],
    onChange: (values: boolean[]) => void
};

export function Orbit(props: OrbitProps) {
    const orbitKey = `orbit-${props.color}-${props.position}`;
    
    return (
        <div className="relative w-fit">
            <span className="outline-0 outline-red-600"></span>
            <span className="outline-0 outline-blue-600"></span>
            <img className="pointer-events-none w-36" src="/static/structure/Orbit.png" alt="Orbit" />
            <div className="top-0 left-0 right-0 bottom-0 absolute flex flex-col">
                <label className="cursor-pointer select-none w-full h-1/3">
                    <input 
                        type="checkbox" 
                        name={`${orbitKey}-3`} 
                        className="peer hidden"
                        checked={props.values[2] ?? false}
                        onChange={(e) => props.onChange([props.values[0], props.values[1], e.target.checked])}
                    />
                    <div className={`w-full aspect-square scale-75 absolute checkbox-hitbox outline-2 outline-${props.color}-600`}></div>
                    <img className="pointer-events-none w-full scale-0 peer-checked:scale-75 opacity-0 peer-checked:opacity-100 ease-out-back duration-200 transition-all absolute" src={`/static/gamepiece/Electron_${props.color}.png`}></img>
                </label>
                <label className="cursor-pointer select-none w-full h-1/3">
                    <input 
                        type="checkbox" 
                        name={`${orbitKey}-2`} 
                        className="peer hidden"
                        checked={props.values[1] ?? false}
                        onChange={(e) => props.onChange([props.values[0], e.target.checked, props.values[2]])}
                    />
                    <div className={`w-full aspect-square scale-75 absolute checkbox-hitbox outline-2 outline-${props.color}-600`}></div>
                    <img className="pointer-events-none w-full scale-0 peer-checked:scale-75 opacity-0 peer-checked:opacity-100 ease-out-back duration-200 transition-all absolute" src={`/static/gamepiece/Electron_${props.color}.png`}></img>
                </label>
                <label className="cursor-pointer select-none w-full h-1/3">
                    <input 
                        type="checkbox" 
                        name={`${orbitKey}-1`} 
                        className="peer hidden"
                        checked={props.values[0] ?? false}
                        onChange={(e) => props.onChange([e.target.checked, props.values[1], props.values[2]])}
                    />
                    <div className={`w-full aspect-square scale-75 absolute checkbox-hitbox outline-2 outline-${props.color}-600`}></div>
                    <img className="pointer-events-none w-full scale-0 peer-checked:scale-75 opacity-0 peer-checked:opacity-100 ease-out-back duration-200 transition-all absolute" src={`/static/gamepiece/Electron_${props.color}.png`}></img>
                </label>
            </div>
        </div>
    )
}

export default function Referee() {
    // ! FORM INPUT STATE
    const [formState, setFormState] = useState({
        redLeftOrbit: [false, false, false],
        redMiddleOrbit: [false, false, false],
        redRightOrbit: [false, false, false],
        redProtons: 0,
        redNeutrons: 0,

        blueLeftOrbit: [false, false, false],
        blueMiddleOrbit: [false, false, false],
        blueRightOrbit: [false, false, false],
        blueProtons: 0,
        blueNeutrons: 0
    });

    // ! SEND MATCH UPDATE
    const [refereeStatus, setRefereeStatus] = useState<"idle" | "loading" | "error" | "queue" | "success">("idle");
    const abortController = useRef<AbortController>(new AbortController());
    useEffect(() => {
        (async () => {
            // Update status
            setRefereeStatus("loading");

            // Abort previous request if it exists
            if (abortController) {
                abortController.current.abort();
                abortController.current = new AbortController();
            }

            try {
                const res = await fetch("/referee/report", {
                    body: JSON.stringify(formState),
                    method: "POST",
                    cache: "no-cache",
                    mode: "same-origin",
                    referrerPolicy: "same-origin",
                    signal: abortController.current.signal,
                    headers: {}
                });

                if (res.ok) setRefereeStatus("success");
                else setRefereeStatus("error");

            } catch (e) {
                if (e instanceof DOMException && e.name === "AbortError") setRefereeStatus("queue");
                else setRefereeStatus("error");
            }
        })();
    }, [formState]);

    // ! UPDATE MATCH FROM SERVER
    const { lastJsonMessage: lastMatchUpdate } = useWebSocket<{[key: string]: never}>(`ws://${window.location.host}/match`);
    const matchStatus: MatchStatus = "disabled";

    useEffect(() => {
        console.log(lastMatchUpdate)
    }, [lastMatchUpdate])

    const time = "00:00";

    return (
        <div className="w-full h-full">
            {/* STATUS BAR */}
            <div className="w-full h-12 bg-foreground text-background flex items-center justify-between px-4">
                <span className="basis-0 grow">
                    <h1>{"Referee name"}</h1>
                </span>
                <h1 className="basis-0 grow font-bold text-xl text-center leading-none">Qualification Match 268</h1>
                <div className="basis-0 grow flex gap-1 h-full relative justify-end items-center">
                    <p className="font-[Qualy] font-bold leading-0">MechaLeague MMS</p>
                    {/* <img className="h-full object-contain" src="/static/MMS_Icon.svg" alt="" /> */}
                </div>
            </div>

            {/* MATCH BAR */}
            <div className="w-full h-12 flex border-t border-b border-gray-500">
                <div className="h-full w-2/5 flex basis-0 grow">
                    <div className="teams-mp h-full grow bg-[#1e40af] relative">
                        {/* Shadow */}
                        <div className="absolute w-8 h-full right-0 bg-gradient-to-l from-black to-transparent opacity-30"></div>

                        {/* Teams */}
                        <div className="bg-primary flex items-center justify-evenly font-bold text-lg h-5">
                            <div className="basis-0 grow flex justify-center"><h1 className="team-number text-black leading-none">{lastMatchUpdate && lastMatchUpdate["blue_alliance_team_1"]}</h1></div>
                            <div className="basis-0 grow flex justify-center border-r-[1px] border-l-[1px] border-[#00000050]"><h1 className="team-number text-black leading-none">{lastMatchUpdate && lastMatchUpdate["blue_alliance_team_2"]}</h1></div>
                            <div className="basis-0 grow flex justify-center"><h1 className="team-number text-black leading-none">{lastMatchUpdate && lastMatchUpdate["blue_alliance_team_3"]}</h1></div>
                        </div>
                    </div>

                    <div className="score bg-[#155dfc] text-white h-full flex items-center justify-center flex-col gap-4 px-2">
                        <h2 className="text-center font-bold font-[Roboto Variable] leading-none -mb-4">{"Blue Alliance"}</h2>
                        <NumberFlip className="text-center flex justify-center font-[Roboto Variable] font-bold text-2xl leading-none" number={999}></NumberFlip>
                    </div>
                </div>

                {/* TIMER */}
                <div className="h-full w-28 flex justify-center flex-col items-center bg-white">
                    <div className="info h-1/4 flex justify-center items-center">
                        <motion.img src={statusIconMap[matchStatus]} key={matchStatus} className="w-6 -mb-3 aspect-square" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, ease: "backOut" }}></motion.img>
                    </div>

                    <div className="font-[Roboto Variable] font-bold text-4xl text-black flex justify-center items-center relative">
                        <NumberFlip number={Number(time.split(":")[0])} padstart={2}></NumberFlip>
                        <h1 className="">:</h1>
                        <NumberFlip number={Number(time.split(":")[1])} padstart={2}></NumberFlip>
                    </div>
                </div>


                <div className="h-full w-2/5 flex basis-0 grow">
                    <div className="score bg-[#dc2626] text-white h-full flex items-center justify-center flex-col gap-4 px-2">
                        <h2 className="text-center font-bold font-[Roboto Variable] leading-none -mb-4">{"Red Alliance"}</h2>
                        <NumberFlip className="text-center flex justify-center font-[Roboto Variable] font-bold text-2xl leading-none" number={999}></NumberFlip>
                    </div>

                    <div className="teams-mp h-full grow bg-[#991b1b] relative">
                        {/* Shadow */}
                        <div className="absolute w-8 h-full left-0 bg-gradient-to-r from-black to-transparent opacity-30"></div>

                        {/* Teams */}
                        <div className="bg-primary flex items-center justify-evenly font-bold text-lg h-5">
                            <div className="basis-0 grow flex justify-center"><h1 className="team-number text-black leading-none">{lastMatchUpdate && lastMatchUpdate["blue_alliance_team_1"]}</h1></div>
                            <div className="basis-0 grow flex justify-center border-r-[1px] border-l-[1px] border-[#00000050]"><h1 className="team-number text-black leading-none">{lastMatchUpdate && lastMatchUpdate["blue_alliance_team_2"]}</h1></div>
                            <div className="basis-0 grow flex justify-center"><h1 className="team-number text-black leading-none">{lastMatchUpdate && lastMatchUpdate["blue_alliance_team_3"]}</h1></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* INPUTS */}
            <div className="flex flex-wrap gap-4 justify-between max-lg:justify-center p-4 w-full">
                {/* BLUE */}
                <div className="flex">
                    <Orbit color="blue" position="left" values={formState.blueLeftOrbit} onChange={val => setFormState(curr => ({...curr, blueLeftOrbit: val}))}></Orbit>
                    <Orbit color="blue" position="middle" values={formState.blueMiddleOrbit} onChange={val => setFormState(curr => ({...curr, blueMiddleOrbit: val}))}></Orbit>
                    <Orbit color="blue" position="right" values={formState.blueRightOrbit} onChange={val => setFormState(curr => ({...curr, blueRightOrbit: val}))}></Orbit>
                </div>

                {/* RED */}
                <div className="flex">
                    <Orbit color="red" position="left" values={formState.redLeftOrbit} onChange={val => setFormState(curr => ({...curr, redLeftOrbit: val}))}></Orbit>
                    <Orbit color="red" position="middle" values={formState.redMiddleOrbit} onChange={val => setFormState(curr => ({...curr, redMiddleOrbit: val}))}></Orbit>
                    <Orbit color="red" position="right" values={formState.redRightOrbit} onChange={val => setFormState(curr => ({...curr, redRightOrbit: val}))}></Orbit>
                </div>
            </div>

            <p>{JSON.stringify(lastMatchUpdate)}</p>

            <h1>{refereeStatus}</h1>
        </div>
    )
}