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
import webbrowser
from dataclasses import asdict
import uvicorn.config
import platformdirs
from match_manager import Match, MatchType, MatchScores

banner_str = r"""
                                                                                                                                                                              :~77777777777!~:         
:^^^^^^. .^^^^^^:                               :^^^:                        :::::.                                                                                   ^?J?.  !JYJ??7?JJ?777?J?!.       
?YYYYYY~ ^YYYYYYJ                              .JJJJJ.                      :JJJJJ:                                                                                 ^?YYY?. ~YJJ:   ~JJ7   .7??~       
?YYYYYY7 !YJJJJJ?    :~!77!!^.     .^~!7!!~:   .?JJJ?^~!!!^     :~!!!!~^.   :?????:      :^~!!~~:.     :^~!!~~^:    .^~~~^:~~^~:  :~^^~: ^^^^^.   .:^~~~~^.        ^YY??YJ7~JJJ^    ~J?!    .7??^      
?YJJJJJJ.?JJJJJJ?   !JJJJ7JJJJ!   ~?JJJ7?JJJ!  .?JJ??7?JJJJ!  .7?JJ77????~  :?????:    .!???7!???7^   !???7!????~  .7?777!!777?~  ~7777^ !7777:  ^7777!!777~.       ..  ^?JJJJ!.... ~??!.... ^777.     
7JJJ??JJ!JJ??JJJ?  :JJJJ7 !JJJJ^ .?JJJ?.^JJJJ^ .?????.:????7  !J???..????7  .?????:    ~????^ 7?7?7. ^????^ !7777. :7777! ^7777~  ~7777^ !7777: .!777! :7!!7^          :~?JJJJ??????????7777777777!^:  
7JJJ?!JJJJJ!7JJJ?  ^JJJJ?7?JJJJ~ .?????..^^^^: .?????.:????7  :~~~!^~????7. .?????:    ~?7777!7?77?: .^^^~^^77777: :7777! ^7777~  ~7777^ !7!!7: .!!!!!~!!!!7~        .!JJ?!~~~~~~~~~~~~~~~^^^^^^^~!77~.
7JJJ7^JJJJJ^7JJJ?  ^J????!~!~~!: .?????.       .?????.:????7   ^~!7?77???7. .77777:    ~7777!~~~~~~.  :~!!7!77777: :7777! ^7777~  ~7!!7^ !!!!!: .!!!!!^^^^^^:        !JJ7.                         ^!!~
7JJJ7.?J?J?.7J??7  ^J???! :7777^ .?????..!777^ .?????.:????7  ~????^.77777. .77777.    ~7777^ ^!!!!. :7777~ !7777: .77!7! ^7!!7~  ~!!!!: ~!!!!. .!!!!! .~~~~^        !J?! :~!77!^.         :~~!~~: ^!!!
7J?J7 !J??7 7???7  :????7 ^????^  7????..????^ .7???7.:?7777  ~?777..77777. .77777~^^: ^7777^ ~7777. ^7777^ !7!!!:  ~!!!!!!!!!!~  ~!!!!^ ~!!!!. .!!!!~ .!!!!^        .7??7??7!!??7::::::::~77!~~!!!!!~:
7J?J7 ^J?J~ 7???7   ^7???7???7~   :7???77??7~  .7???7.:?77?7  ^77777!77777. .77777777^  ~!777!777!:  .!777!~!!!!7:  .:^~^.:!!!!^  :!!!!!~!!!!!.  :~!!!~~!!~^          .^7??7.  !77777777777!!.  ~!!~:. 
:^^^^  ^^^. :^^^^    .:^~~~^:.      :^^~~^:.    ^^^^^ .^^^^:   .^^^^.:^:::  .::::::::.   .:^^^^^:     .:^^:.:::::. .~!!!~^~!!!!:   .:^^:.:::::.    .::^^::.              !??!~!77!::::::::~!!~^~!!~.   
                                                                                                                    .:^^~~~^^:.                                           :~!!!~:.         :^~~~^:     
""".removeprefix("\n")

# * App constants
APP_NAME = "Match Management System"
APP_AUTHOR = "MechaLeague"
APP_DIR = platformdirs.user_data_dir(APP_NAME, APP_AUTHOR)
os.makedirs(APP_DIR, exist_ok=True)
print(f"App data directory: {APP_DIR}")

# * Global constants
FROZEN = getattr(sys, "frozen", False)
DIRNAME = os.path.dirname(os.path.abspath(__file__)) if not FROZEN else sys._MEIPASS
DIST_DIR = os.path.join(DIRNAME, "./frontend/dist")

# * Network constants
HOST = "0.0.0.0"
PORT = 5252
DEFAULT_ROUTE = "referee"

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

    match.scores = MatchScores(**data)
    
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


def run_app():
    webbrowser.open(f"http://127.0.0.1:{PORT}/{DEFAULT_ROUTE}", 2)
    uvicorn.config.LOGGING_CONFIG["handlers"]["default"]["stream"] = "ext://sys.stdout"
    uvicorn.run(
        app=app,
        host=HOST,
        port=PORT,
        log_config=uvicorn.config.LOGGING_CONFIG
    )

if __name__ == '__main__':
    run_app()