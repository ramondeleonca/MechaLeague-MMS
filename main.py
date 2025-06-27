from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.websockets import WebSocket
import os
import random
import time
from match import Match

# *Global variables
DIST_DIR = os.path.join("./frontend/dist")

#! MATCH MANAGER
match = Match()

#! FastAPI
app = FastAPI(debug=True)

# Mount frontend files
app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")
app.mount("/static", StaticFiles(directory=os.path.join(DIST_DIR, "static")), name="static")

# *Serve the React frontend
@app.get("/{full_path:path}")
async def serve_react_app(request: Request, full_path: str):
    print(full_path)
    return FileResponse("./frontend/dist/index.html")

@app.post("/referee/report")
async def referee_report(request: Request):
    data = await request.json()
    # Simulate some processing
    time.sleep(random.randint(1, 3) * 0.5)
    print(data)
    return {"status": "success"}

@app.websocket("/match")
async def match_ws(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json(match.__repr__())

        