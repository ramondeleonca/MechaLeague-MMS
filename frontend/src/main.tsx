// Import react
import React from 'react'
import ReactDOM from 'react-dom/client'

// Import React Router
import { BrowserRouter, Route, Routes } from 'react-router-dom'

// Import routes
import Home from './routes/Home'
import Overlay from './routes/Overlay'

// Import styles
import './global.css'
import './easings.css'

// Import fonts
import './fonts/Qualy.css'
import "@fontsource-variable/roboto"

// shadcn/ui theme provider
import { ThemeProvider } from './components/theme-provider'
import Referee from './routes/Referee'

function withThemeProvider(component: React.ReactNode) {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='mms-theme'>
      {component}
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <BrowserRouter>
        <Routes>
          {/* CONTROLS */}
          {/* INDEX */}
          <Route index element={withThemeProvider(<Home></Home>)}></Route>

          {/* REFEREE CONTROLS */}
          <Route path="/referee" element={withThemeProvider(<Referee></Referee>)}></Route>

          {/* DISPLAYS */}
          {/* AUDIENCE DISPLAY OVERLAY */}
          <Route path="/overlay" element={<Overlay></Overlay>}></Route>
        </Routes>
      </BrowserRouter>
  </React.StrictMode>
)
