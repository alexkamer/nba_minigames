"""Pydantic models for API requests and responses."""
from pydantic import BaseModel
from typing import List, Dict, Literal


class PlayerBasic(BaseModel):
    """Basic player information for autocomplete."""
    espn_player_id: str
    display_name: str
    full_name: str
    team_abbreviation: str
    position: str


class PlayerFull(BaseModel):
    """Full player information."""
    espn_player_id: str
    first_name: str
    last_name: str
    full_name: str
    display_name: str
    height: int
    display_height: str
    weight: int
    display_weight: str
    age: int
    position: str
    jersey: int
    years_experience: int
    team_id: str
    team_name: str
    team_abbreviation: str
    team_logo: str
    conference_name: str
    conference_abbreviation: str
    division_name: str
    division_abbreviation: str


class GuessRequest(BaseModel):
    """Request to validate a player guess."""
    player_name: str
    mystery_player_id: str


class AttributeComparison(BaseModel):
    """Comparison result for a single attribute."""
    value: str | int
    match: Literal["exact", "higher", "lower", "partial", "close", "wrong"]
    logo: str | None = None


class GuessResponse(BaseModel):
    """Response after validating a guess."""
    player: PlayerFull
    comparison: Dict[str, AttributeComparison]
    is_correct: bool


class DailyPlayerResponse(BaseModel):
    """Response for daily mystery player (ID only)."""
    player_id: str
    date: str


class SearchResponse(BaseModel):
    """Response for player search."""
    players: List[PlayerBasic]


class HintRequest(BaseModel):
    """Request to get a hint for Picture Perfect game."""
    player_id: str
    hint_type: Literal["team", "position", "jersey"]


class HintResponse(BaseModel):
    """Response with a hint about the mystery player."""
    hint_type: str
    hint_value: str
    hint_display: str
