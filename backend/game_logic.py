"""Game logic for comparing player guesses with the mystery player."""
from typing import Dict, Literal

MatchType = Literal["exact", "higher", "lower", "partial", "close", "wrong"]


def compare_players(guess: Dict, mystery: Dict) -> Dict[str, Dict[str, any]]:
    """
    Compare a guessed player with the mystery player.

    Returns a dictionary with comparison results for each attribute.
    Each attribute includes:
    - value: The guessed player's value
    - match: The match type (exact, higher, lower, partial, wrong)
    - mystery_value: (optional) For debugging, not sent to client in production
    """

    result = {
        "team": compare_team(guess, mystery),
        "position": compare_position(guess, mystery),
        "height": compare_numeric_with_close(int(guess["height"]), int(mystery["height"]), guess["display_height"]),
        "age": compare_numeric_with_close(int(guess["age"]), int(mystery["age"]), str(guess["age"])),
        "jersey": compare_numeric_with_close(int(guess["jersey"]), int(mystery["jersey"]), str(guess["jersey"])),
        "division": compare_division(guess, mystery),
        "experience": compare_numeric_with_close(
            int(guess["years_experience"]), int(mystery["years_experience"]), str(guess["years_experience"])
        ),
    }

    return result


def compare_team(guess: Dict, mystery: Dict) -> Dict[str, any]:
    """
    Compare team (exact match only).

    Returns:
    - exact: Same team
    - wrong: Different team
    """
    guess_team = guess["team_id"]
    mystery_team = mystery["team_id"]

    if guess_team == mystery_team:
        return {
            "value": guess["team_abbreviation"],
            "logo": guess.get("team_logo", ""),
            "match": "exact",
        }

    return {
        "value": guess["team_abbreviation"],
        "logo": guess.get("team_logo", ""),
        "match": "wrong",
    }


def compare_position(guess: Dict, mystery: Dict) -> Dict[str, any]:
    """Compare player positions (exact match only)."""
    guess_pos = guess["position"]
    mystery_pos = mystery["position"]

    return {
        "value": guess_pos,
        "match": "exact" if guess_pos == mystery_pos else "wrong",
    }


def compare_numeric_with_close(guess_value: int, mystery_value: int, display_value: str) -> Dict[str, any]:
    """
    Compare numeric values with "close" match for within 2.

    Returns:
    - exact: Same value (green)
    - close: Within 2 of the correct value (yellow)
    - higher: Guess is higher than mystery (gray with ↓)
    - lower: Guess is lower than mystery (gray with ↑)
    """
    diff = guess_value - mystery_value

    if diff == 0:
        return {
            "value": display_value,
            "match": "exact",
        }
    elif abs(diff) <= 2:
        return {
            "value": display_value,
            "match": "close",
        }
    elif diff > 0:
        return {
            "value": display_value,
            "match": "higher",
        }
    else:
        return {
            "value": display_value,
            "match": "lower",
        }


def compare_division(guess: Dict, mystery: Dict) -> Dict[str, any]:
    """
    Compare division with conference partial matching.

    Returns:
    - exact: Same division
    - partial: Different division but same conference
    - wrong: Different conference
    """
    same_division = guess["division_abbreviation"] == mystery["division_abbreviation"]
    same_conference = guess["conference_abbreviation"] == mystery["conference_abbreviation"]

    if same_division:
        return {
            "value": guess["division_abbreviation"],
            "match": "exact",
        }
    elif same_conference:
        return {
            "value": guess["division_abbreviation"],
            "match": "partial",
        }
    else:
        return {
            "value": guess["division_abbreviation"],
            "match": "wrong",
        }


def compare_exact(guess_value: str, mystery_value: str) -> Dict[str, any]:
    """Compare string values for exact match."""
    return {
        "value": guess_value,
        "match": "exact" if guess_value == mystery_value else "wrong",
    }


def check_win(comparison: Dict[str, Dict[str, any]]) -> bool:
    """Check if the guess is correct (all attributes match)."""
    return all(attr["match"] == "exact" for attr in comparison.values())
