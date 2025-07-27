from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.websockets import WebSocket, WebSocketState, WebSocketDisconnect
import os
import random
import time
import sys
import uvicorn
import asyncio
import webview
from dataclasses import asdict
import uvicorn.config
from match_manager import Match, MatchType, MatchScores

# * Global variables
FROZEN = getattr(sys, "frozen", False)
DIRNAME = os.path.dirname(os.path.abspath(__file__)) if not FROZEN else sys._MEIPASS
DIST_DIR = os.path.join(DIRNAME, "./frontend/dist")
PORT = 5252

#! MATCH MANAGER
match = Match()

#! FastAPI
app = FastAPI(debug=True)

# Mount frontend files
app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")
app.mount("/static", StaticFiles(directory=os.path.join(DIST_DIR, "static")), name="static")

# * Serve the React frontend
@app.get("/{full_path:path}")
async def serve_react_app(request: Request, full_path: str):
    print(full_path)
    return FileResponse(os.path.join(DIST_DIR, "index.html"))

@app.post("/referee/report")
async def referee_report(request: Request):
    data = await request.json()
    # Simulate some processing
    # time.sleep(random.randint(1, 3) * 0.5)
    # print(data)

    match.scores = MatchScores(**data)

    # match.red_left_orbit = data["redLeftOrbit"]
    # match.red_middle_orbit = data["redMiddleOrbit"]
    # match.red_right_orbit = data["redRightOrbit"]
    # match.red_protons = data["redProtons"]
    # match.red_neutrons = data["redNeutrons"]

    # match.blue_left_orbit = data["blueLeftOrbit"]
    # match.blue_middle_orbit = data["blueMiddleOrbit"]
    # match.blue_right_orbit = data["blueRightOrbit"]
    # match.blue_protons = data["blueProtons"]
    # match.blue_neutrons = data["blueNeutrons"]
    
    # match.events.emit("update", None, None, None)
    
    return {"status": "success"}

# * Live data endpoints
match_ws_clients: list[WebSocket] = []
@app.websocket("/match")
async def match_ws(ws: WebSocket):
    # Open the websocket
    await ws.accept()

    # Add it to the connected clients
    match_ws_clients.append(ws)

    # Send initial match data
    await ws.send_json(match.__dict__)

    # Keep connection alive and manage disconnections
    try:
        while True:
            await ws.receive() # Keep the connection open
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        match_ws_clients.remove(ws)

# ! Match logic
async def _broadcast_update():
    print("UPDATE EVENT !")
    for client in match_ws_clients:
        if client.client_state == WebSocketState.CONNECTED:
            try:
                await client.send_json(asdict(match))
            except WebSocketDisconnect:
                print("Client disconnected")
            except Exception as e:
                print(f"Error sending update: {e}")

@match.events.on("update")
def match_update_broadcast_ws(name, old, new):
    asyncio.create_task(_broadcast_update())

# ! Webview
window = webview.create_window(
    title="MechaLeague Match Management System",
    url=f"http://127.0.0.1:{PORT}",
    confirm_close=True,
    
)

def run_app():
    uvicorn.config.LOGGING_CONFIG["handlers"]["default"]["stream"] = "ext://sys.stdout"
    uvicorn.run(
        app=app,
        host="0.0.0.0",
        port=PORT,
        log_config=uvicorn.config.LOGGING_CONFIG
    )

if __name__ == '__main__':
    webview.start(func=run_app)