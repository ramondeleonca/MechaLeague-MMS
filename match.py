from dataclasses import dataclass
import json
from enum import Enum
from events import Events

class Alliance(Enum):
    QUALIFICATION = "QUAL"
    PLAYOFF = "PLAY"


@dataclass
class Match(Events):
    # Blue alliance teams
    blue_alliance_team_1: int = 9999
    blue_alliance_team_2: int = 9999
    blue_alliance_team_3: int = 9999

    # Red alliance teams
    red_alliance_team_1: int = 9999
    red_alliance_team_2: int = 9999
    red_alliance_team_3: int = 9999

    # Match info
    match_number: int = 0
    match_type: Alliance = Alliance.QUALIFICATION

    # TODO
    match_active: bool = False
    locked: bool = True

    def to_dict(self):
        return {
            "blue_teams": [self.blue_alliance_team_1, self.blue_alliance_team_2, self.blue_alliance_team_3],
            "red_teams": [self.red_alliance_team_1, self.red_alliance_team_2, self.red_alliance_team_3]
        }

if __name__ == "__main__":
    # Example usage
    match = Match(
        blue_alliance_team_1=1234,
        blue_alliance_team_2=5678,
        blue_alliance_team_3=9101,
        red_alliance_team_1=1121,
        red_alliance_team_2=3141,
        red_alliance_team_3=5161
    )
    
    print(json.dumps(match.__dict__, indent=4))