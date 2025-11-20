"""Database utilities for querying NBA player data."""
import sqlite3
from pathlib import Path
from typing import List, Dict, Optional
import random
from datetime import date

DB_PATH = Path(__file__).parent.parent / "birdle" / "nba_wordle.db"


def get_connection():
    """Get database connection."""
    return sqlite3.connect(DB_PATH)


def dict_factory(cursor, row):
    """Convert database row to dictionary."""
    fields = [column[0] for column in cursor.description]
    return {key: value for key, value in zip(fields, row)}


def get_all_active_players() -> List[Dict]:
    """Get all active NBA players with their team and conference/division info."""
    conn = get_connection()
    conn.row_factory = dict_factory
    cursor = conn.cursor()

    query = """
    SELECT
        ar.espn_player_id,
        ar.first_name,
        ar.last_name,
        ar.full_name,
        ar.display_name,
        ar.height,
        ar.display_height,
        ar.weight,
        ar.display_weight,
        ar.age,
        ar.position,
        ar.jersey,
        ar.years_experience,
        at.team_id,
        at.team_name,
        at.team_abbreviation,
        at.team_logo,
        s.conference_name,
        s.conference_abbreviation,
        s.division_name,
        s.division_abbreviation
    FROM active_rosters ar
    JOIN active_teams at ON ar.team_id = at.team_id
    JOIN standings s ON ar.team_id = s.team_id
    WHERE ar.athlete_status = 'active'
    ORDER BY ar.last_name, ar.first_name
    """

    cursor.execute(query)
    players = cursor.fetchall()
    conn.close()

    return players


def get_player_by_id(player_id: str) -> Optional[Dict]:
    """Get a specific player by ESPN player ID."""
    conn = get_connection()
    conn.row_factory = dict_factory
    cursor = conn.cursor()

    query = """
    SELECT
        ar.espn_player_id,
        ar.first_name,
        ar.last_name,
        ar.full_name,
        ar.display_name,
        ar.height,
        ar.display_height,
        ar.weight,
        ar.display_weight,
        ar.age,
        ar.position,
        ar.jersey,
        ar.years_experience,
        at.team_id,
        at.team_name,
        at.team_abbreviation,
        at.team_logo,
        s.conference_name,
        s.conference_abbreviation,
        s.division_name,
        s.division_abbreviation
    FROM active_rosters ar
    JOIN active_teams at ON ar.team_id = at.team_id
    JOIN standings s ON ar.team_id = s.team_id
    WHERE ar.espn_player_id = ? AND ar.athlete_status = 'active'
    """

    cursor.execute(query, (player_id,))
    player = cursor.fetchone()
    conn.close()

    return player


def get_player_by_name(name: str) -> Optional[Dict]:
    """Get a player by their display name or full name."""
    conn = get_connection()
    conn.row_factory = dict_factory
    cursor = conn.cursor()

    query = """
    SELECT
        ar.espn_player_id,
        ar.first_name,
        ar.last_name,
        ar.full_name,
        ar.display_name,
        ar.height,
        ar.display_height,
        ar.weight,
        ar.display_weight,
        ar.age,
        ar.position,
        ar.jersey,
        ar.years_experience,
        at.team_id,
        at.team_name,
        at.team_abbreviation,
        at.team_logo,
        s.conference_name,
        s.conference_abbreviation,
        s.division_name,
        s.division_abbreviation
    FROM active_rosters ar
    JOIN active_teams at ON ar.team_id = at.team_id
    JOIN standings s ON ar.team_id = s.team_id
    WHERE (ar.display_name = ? OR ar.full_name = ?) AND ar.athlete_status = 'active'
    """

    cursor.execute(query, (name, name))
    player = cursor.fetchone()
    conn.close()

    return player


def search_players(query: str, limit: int = 10) -> List[Dict]:
    """Search for players by name (for autocomplete)."""
    conn = get_connection()
    conn.row_factory = dict_factory
    cursor = conn.cursor()

    search_query = f"%{query}%"

    sql = """
    SELECT
        ar.espn_player_id,
        ar.display_name,
        ar.full_name,
        at.team_abbreviation,
        ar.position
    FROM active_rosters ar
    JOIN active_teams at ON ar.team_id = at.team_id
    WHERE (ar.display_name LIKE ? OR ar.full_name LIKE ?)
    AND ar.athlete_status = 'active'
    ORDER BY ar.last_name, ar.first_name
    LIMIT ?
    """

    cursor.execute(sql, (search_query, search_query, limit))
    players = cursor.fetchall()
    conn.close()

    return players


def get_daily_player(target_date: date) -> Dict:
    """Get the daily mystery player based on the date (deterministic)."""
    players = get_all_active_players()

    # Use date as seed for deterministic random selection
    seed = int(target_date.strftime("%Y%m%d"))
    random.seed(seed)

    return random.choice(players)


def get_random_player() -> Dict:
    """Get a random player for practice mode."""
    players = get_all_active_players()
    return random.choice(players)
