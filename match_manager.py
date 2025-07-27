from dataclasses import dataclass, field
import json
from enum import Enum
from typing import TypedDict
from pymitter import EventEmitter

class MatchType(str, Enum):
    QUALIFICATION = "qual"
    PLAYOFF = "playoff"

class MatchScores(TypedDict):
    redLeftOrbit: tuple[bool, bool, bool]
    redMiddleOrbit: tuple[bool, bool, bool]
    redRightOrbit: tuple[bool, bool, bool]
    redProtons: int
    redNeutrons: int

    blueLeftOrbit: tuple[bool, bool, bool]
    blueMiddleOrbit: tuple[bool, bool, bool]
    blueRightOrbit: tuple[bool, bool, bool]
    blueProtons: int
    blueNeutrons: int

@dataclass
class Match():
    # Event emitter
    events = EventEmitter()

    # Blue alliance teams
    blue_alliance_team_1: int = 9999
    blue_alliance_team_2: int = 9999
    blue_alliance_team_3: int = 9999

    # Red alliance teams
    red_alliance_team_1: int = 9999
    red_alliance_team_2: int = 9999
    red_alliance_team_3: int = 9999

    # Scores
    scores: MatchScores = field(default_factory=lambda: MatchScores())

    # Match info
    match_number: int = 0
    match_type: MatchType = MatchType.QUALIFICATION

    # TODO
    match_active: bool = False
    locked: bool = True

    def __setattr__(self, name, value):
        old = getattr(self, name, None)
        super().__setattr__(name, value)
        self.events.emit("update", name, old, value)

if __name__ == "__main__":
    # Example usage
    match = Match(
        blue_alliance_team_1=1234,
        blue_alliance_team_2=5678,
        blue_alliance_team_3=9101,
        red_alliance_team_1=1121,
        red_alliance_team_2=3141,
        red_alliance_team_3=5161,
        match_type=MatchType.PLAYOFF
    )

    match.events.on("update", lambda name, old, new: print(f"Updated {name}: {old} -> {new}"))

    match.match_number = 42

    # print(match.__dict__)
    print(json.dumps(match.__dict__, indent=4))