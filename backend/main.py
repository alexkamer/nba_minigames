"""FastAPI backend for Birdle NBA guessing game."""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
from typing import Optional

from . import database
from . import game_logic
from . import models

app = FastAPI(title="Birdle API", version="1.0.0")

# Enable CORS for React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Health check endpoint."""
    return {"message": "Birdle API is running"}


@app.get("/api/daily-player", response_model=models.DailyPlayerResponse)
def get_daily_player(target_date: Optional[str] = None):
    """
    Get the daily mystery player ID.

    Args:
        target_date: Optional date string (YYYY-MM-DD). Defaults to today.

    Returns:
        The mystery player's ID and date (ID only, not full player data).
    """
    if target_date:
        try:
            parsed_date = date.fromisoformat(target_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    else:
        parsed_date = date.today()

    player = database.get_daily_player(parsed_date)

    return models.DailyPlayerResponse(
        player_id=player["espn_player_id"],
        date=parsed_date.isoformat()
    )


@app.get("/api/random-player", response_model=models.DailyPlayerResponse)
def get_random_player():
    """
    Get a random player for practice mode.

    Returns:
        A random player's ID (ID only, not full player data).
    """
    player = database.get_random_player()

    return models.DailyPlayerResponse(
        player_id=player["espn_player_id"],
        date=date.today().isoformat()
    )


@app.get("/api/search", response_model=models.SearchResponse)
def search_players(q: str, limit: int = 10):
    """
    Search for players by name (for autocomplete).

    Args:
        q: Search query string
        limit: Maximum number of results (default 10)

    Returns:
        List of matching players with basic info
    """
    if not q or len(q) < 2:
        return models.SearchResponse(players=[])

    players = database.search_players(q, limit)

    return models.SearchResponse(
        players=[models.PlayerBasic(**player) for player in players]
    )


@app.post("/api/validate-guess", response_model=models.GuessResponse)
def validate_guess(guess_request: models.GuessRequest):
    """
    Validate a player guess and compare with mystery player.

    Args:
        guess_request: Contains the guessed player name and mystery player ID

    Returns:
        Comparison results for all attributes
    """
    # Get the guessed player
    guessed_player = database.get_player_by_name(guess_request.player_name)
    if not guessed_player:
        raise HTTPException(status_code=404, detail="Player not found")

    # Get the mystery player
    mystery_player = database.get_player_by_id(guess_request.mystery_player_id)
    if not mystery_player:
        raise HTTPException(status_code=404, detail="Mystery player not found")

    # Compare the players
    comparison = game_logic.compare_players(guessed_player, mystery_player)

    # Check if the guess is correct
    is_correct = game_logic.check_win(comparison)

    return models.GuessResponse(
        player=models.PlayerFull(**guessed_player),
        comparison={
            key: models.AttributeComparison(**value)
            for key, value in comparison.items()
        },
        is_correct=is_correct
    )


@app.get("/api/player/{player_id}", response_model=models.PlayerFull)
def get_player(player_id: str):
    """
    Get full player information by ID.

    Args:
        player_id: ESPN player ID

    Returns:
        Full player data
    """
    player = database.get_player_by_id(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    return models.PlayerFull(**player)


@app.get("/api/all-players", response_model=list[models.PlayerFull])
def get_all_players():
    """
    Get all active players (use sparingly, for debugging).

    Returns:
        List of all active players
    """
    players = database.get_all_active_players()
    return [models.PlayerFull(**player) for player in players]


@app.post("/api/picture-perfect/get-hint", response_model=models.HintResponse)
def get_picture_perfect_hint(hint_request: models.HintRequest):
    """
    Get a hint for Picture Perfect game.

    Args:
        hint_request: Contains player_id and hint_type

    Returns:
        Hint information based on requested type
    """
    # Get the mystery player
    player = database.get_player_by_id(hint_request.player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # Generate hint based on type
    hint_type = hint_request.hint_type

    if hint_type == "team":
        hint_value = player["team_abbreviation"]
        hint_display = f"Team: {player['team_name']}"
    elif hint_type == "position":
        hint_value = player["position"]
        hint_display = f"Position: {player['position']}"
    elif hint_type == "conference":
        hint_value = player["conference_name"]
        hint_display = f"Conference: {player['conference_name']}"
    elif hint_type == "jersey":
        hint_value = str(player["jersey"])
        hint_display = f"Jersey #: {player['jersey']}"
    else:
        raise HTTPException(status_code=400, detail="Invalid hint type")

    return models.HintResponse(
        hint_type=hint_type,
        hint_value=hint_value,
        hint_display=hint_display
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8050)
