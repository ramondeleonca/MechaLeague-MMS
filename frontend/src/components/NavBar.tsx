import { useTheme } from "./theme-provider"

export default function NavBar() {
    const { theme } = useTheme();

    return (
        <nav className="bg-gradient-to-r from-[#40B3F3] to-[#203C86]">
            {
                theme === "dark" ? 
                    <img className="" src="/static/mms/MMS-LOGO-WHITE-NOBG.svg" alt="" /> : 
                    <img className="" src="/static/mms/MMS-LOGO-BLACK-NOBG.svg" alt="" />
            }
        </nav>
    )
}