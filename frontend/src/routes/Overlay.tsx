import gsap from "gsap"
import { useEffect, useState } from "react";
import locales from "./../locales.json";
import NumberFlip from "@/components/numberflip";
import { Helmet } from "react-helmet";
import { motion } from "motion/react"
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

type MatchStatus = "waiting" | "auto" | "tele" | "disabled";
export default function Overlay() {
    const [params] = useSearchParams();
    const locale = locales[params.get("locale")?.split("-")[0] as keyof typeof locales ?? "es"];

    const position = params.get("position") ?? "bottom"; // Default to bottom if not specified

    const time = "00:00";
    const [bluePoints, setBluePoints] = useState<number>(45);
    const [redPoints, setRedPoints] = useState<number>(45);

    const [status, setStatus] = useState<MatchStatus>("waiting");

    const statusMap = {
        "waiting": "/static/icons/wait.svg",
        "auto": "/static/icons/mechaleague_car.svg",
        "tele": "/static/icons/controller.svg",
        "disabled": "/static/icons/stop.svg"
    } satisfies {[key in MatchStatus]: string};

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            tl.fromTo(".bottom-bar", { y: `${position == "top" ? "-" : ""}100%` }, {
                y: 0,
                duration: 0.75,
                delay: 0.25,
                ease: "power3.out",
            });

            tl.fromTo(".team-number", { scale: 3, opacity: 0 }, {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                delay: -0.25,
                ease: "back.out",
                stagger: {
                    each: 0.075,
                    from: "edges"
                },
            });
        });

        return () => ctx.revert();
    }, [position]);

    return (
        <>
            <Helmet>
                {Object.values(statusMap).map((icon, index) => <link rel="preload" as="image" type="image/svg+xml" href={icon} key={index}></link>)}
            </Helmet>
            <div className="w-screen h-screen bg-[#00ff00] overflow-hidden">
                <div className={`bottom-bar w-full h-32 absolute ${position == "top" ? "top-0 -translate-y-full" : "bottom-0 translate-y-full"} flex`}>
                    {/* BLUE */}
                    <div className="h-full w-2/5 flex basis-0 grow">
                        <div className="teams-mp h-full grow bg-[#1e40af] relative">
                            {/* Shadow */}
                            <div className="absolute w-8 h-full right-0 bg-gradient-to-l from-black to-transparent opacity-30"></div>

                            {/* Teams */}
                            <div className="bg-white flex items-center justify-evenly font-bold text-2xl">
                                <div className="basis-0 grow flex justify-center"><h1 className="team-number text-black">2222</h1></div>
                                <div className="basis-0 grow flex justify-center border-r-[1px] border-l-[1px] border-[#00000050]"><h1 className="team-number text-black">2222</h1></div>
                                <div className="basis-0 grow flex justify-center"><h1 className="team-number text-black">2222</h1></div>
                            </div>
                        </div>

                        <div className="score bg-[#155dfc] text-white h-full aspect-square flex justify-center flex-col gap-2">
                            <h2 className="text-center font-normal font-[Roboto Variable]">{locale.blueAlliance}</h2>
                            <NumberFlip className="text-center flex justify-center font-[Roboto Variable] font-bold text-6xl" number={bluePoints ?? 0}></NumberFlip>
                        </div>
                    </div>

                    {/* TIMER */}
                    <div className="h-full w-44 flex justify-center flex-col items-center bg-white">
                        <div className="info h-1/4 flex justify-center items-center">
                            <motion.img src={statusMap[status]} key={status} className="w-12 aspect-square" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, ease: "backOut" }}></motion.img>
                        </div>

                        <div className="font-[Roboto Variable] font-bold text-6xl text-black flex justify-center items-center relative">
                            <NumberFlip number={Number(time.split(":")[0])} padstart={2}></NumberFlip>
                            <h1 className="">:</h1>
                            <NumberFlip number={Number(time.split(":")[1])} padstart={2}></NumberFlip>
                        </div>
                    </div>

                    {/* RED */}
                    <div className="h-full w-2/5 flex basis-0 grow">
                        <div className="score bg-[#dc2626] text-white h-full aspect-square flex justify-center flex-col gap-2">
                            <h2 className="text-center font-normal font-[Roboto Variable]">{locale.redAlliance}</h2>
                            <NumberFlip className="text-center flex justify-center font-[Roboto Variable] font-bold text-6xl" number={redPoints ?? 0}></NumberFlip>
                        </div>

                        <div className="teams-mp h-full grow bg-[#991b1b] relative">
                            {/* Shadow */}
                            <div className="absolute w-5 h-full left-0 bg-gradient-to-r from-black to-transparent opacity-25"></div>

                            {/* Teams */}
                            <div className="bg-white flex items-center justify-evenly font-bold text-2xl">
                                <div className="basis-0 grow flex justify-center"><h1 className="team-number text-black">2222</h1></div>
                                <div className="basis-0 grow flex justify-center border-r-[1px] border-l-[1px] border-[#00000050]"><h1 className="team-number text-black">2222</h1></div>
                                <div className="basis-0 grow flex justify-center"><h1 className="team-number text-black">2222</h1></div>
                            </div>

                            {/* Match status buttons */}
                            <Button onClick={() => setStatus("waiting")}>{locale.waiting}</Button>
                            <Button onClick={() => setStatus("auto")}>{locale.auto}</Button>
                            <Button onClick={() => setStatus("tele")}>{locale.tele}</Button>
                            <Button onClick={() => setStatus("disabled")}>{locale.disabled}</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}