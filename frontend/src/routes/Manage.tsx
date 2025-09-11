import usePywebview from "@/hooks/usePywebview"
import { useEffect } from "react";

export default function Manage() {
    const pyw = usePywebview();

    useEffect(() => {
        console.log(pyw);
    }, [pyw]);

    return (
        <div>
        
        </div>
    )
}