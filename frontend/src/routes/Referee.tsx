import { useEffect, useRef, useState } from "react";

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
            <img className="pointer-events-none h-96" src="/static/structure/Orbit.png" alt="Orbit" />
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

    const [status, setStatus] = useState<"idle" | "loading" | "error" | "aborted" | "success">("idle");
    const abortController = useRef<AbortController>(new AbortController());
    useEffect(() => {
        (async () => {
            // Update status
            setStatus("loading");

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

                if (res.ok) setStatus("success");
                else setStatus("error");

            } catch (e) {
                if (e instanceof DOMException && e.name === "AbortError") setStatus("aborted");
                else setStatus("error");
            }
        })();
    }, [formState])

    return (
        <div className="flex flex-wrap gap-4 justify-between p-4">
            {/* RED */}
            <div className="flex">
                <Orbit color="red" position="left" values={formState.redLeftOrbit} onChange={val => setFormState(curr => ({...curr, redLeftOrbit: val}))}></Orbit>
                <Orbit color="red" position="middle" values={formState.redMiddleOrbit} onChange={val => setFormState(curr => ({...curr, redMiddleOrbit: val}))}></Orbit>
                <Orbit color="red" position="right" values={formState.redRightOrbit} onChange={val => setFormState(curr => ({...curr, redRightOrbit: val}))}></Orbit>
            </div>

            {/* BLUE */}
            <div className="flex">
                <Orbit color="blue" position="left" values={formState.blueLeftOrbit} onChange={val => setFormState(curr => ({...curr, blueLeftOrbit: val}))}></Orbit>
                <Orbit color="blue" position="middle" values={formState.blueMiddleOrbit} onChange={val => setFormState(curr => ({...curr, blueMiddleOrbit: val}))}></Orbit>
                <Orbit color="blue" position="right" values={formState.blueRightOrbit} onChange={val => setFormState(curr => ({...curr, blueRightOrbit: val}))}></Orbit>
            </div>
        </div>
    )
}