import pandas as pd
import httpx
import sqlite3
from concurrent.futures import ThreadPoolExecutor, as_completed


def get_teams(client):
    """Fetch and process team data."""
    response = client.get("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams")
    response.raise_for_status()
    data = response.json()
    
    teams = []
    for team in data['sports'][0]['leagues'][0]['teams']:
        team_info = team.get('team', {})
        teams.append({
            'team_id': team_info.get('id'),
            'team_name': team_info.get('displayName'),
            'team_abbreviation': team_info.get('abbreviation'),
            'team_color': team_info.get('color'),
            'team_alternate_color': team_info.get('alternateColor'),
            'team_logo': team_info.get('logos', [{}])[0].get('href'),
        })
    
    return pd.DataFrame(teams)


def fetch_conference_data(conference_url, season, client):
    """Fetch conference and division data for a single conference."""
    response = client.get(conference_url)
    response.raise_for_status()
    conference_data = response.json()
    
    conference_id = conference_data.get('id')
    conference_name = conference_data.get('name')
    conference_abbreviation = conference_data.get('abbreviation')
    
    # Get divisions for this conference
    division_url = f"https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/{season}/types/2/groups/{conference_id}/children?lang=en&region=us"
    division_response = client.get(division_url)
    division_response.raise_for_status()
    division_data = division_response.json()
    
    standings = []
    for base_division in division_data.get('items', []):
        division_ref = base_division.get('$ref')
        division_id = division_ref.split('groups/')[-1].split('?')[0]
        
        # Get division info
        division_info_url = f"https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/{season}/types/2/groups/{division_id}?lang=en&region=us"
        division_info_response = client.get(division_info_url)
        division_info_response.raise_for_status()
        division_info_data = division_info_response.json()
        
        division_name = division_info_data.get('name')
        division_abbreviation = division_info_data.get('abbreviation')
        
        # Get teams in division
        division_teams_url = f"https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/{season}/types/2/groups/{division_id}/teams?lang=en&region=us"
        division_teams_response = client.get(division_teams_url)
        division_teams_response.raise_for_status()
        division_teams_data = division_teams_response.json()
        
        for division_team in division_teams_data.get('items', []):
            team_id = division_team.get('$ref').split('teams/')[-1].split('?')[0]
            standings.append({
                'team_id': team_id,
                'conference_id': conference_id,
                'division_id': division_id,
                'conference_name': conference_name,
                'conference_abbreviation': conference_abbreviation,
                'division_name': division_name,
                'division_abbreviation': division_abbreviation,
            })
    
    return standings


def get_standings(client):
    """Fetch and process conference/division/standings data."""
    response = client.get("https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/")
    response.raise_for_status()
    data = response.json()
    
    conference_base_url = data.get('groups', {}).get('$ref')
    if not conference_base_url:
        return pd.DataFrame()
    
    season = conference_base_url.split('seasons/')[-1].split('/')[0]
    
    # Get conference URLs
    conference_response = client.get(conference_base_url)
    conference_response.raise_for_status()
    conference_data = conference_response.json()
    conference_urls = [item.get('$ref') for item in conference_data.get('items', [])]
    
    # Fetch all conferences in parallel
    all_standings = []
    with ThreadPoolExecutor(max_workers=5) as executor:
        future_to_conf = {executor.submit(fetch_conference_data, url, season, client): url for url in conference_urls}
        for future in as_completed(future_to_conf):
            try:
                standings = future.result()
                all_standings.extend(standings)
            except Exception as exc:
                print(f'Conference fetch generated an exception: {exc}')
    
    return pd.DataFrame(all_standings)


def fetch_team_roster(team_id, client):
    """Fetch and process roster data for a single team."""
    response = client.get(f"https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/{team_id}/roster")
    response.raise_for_status()
    roster_data = response.json()
    
    roster_list = []
    for player in roster_data.get('athletes', []):
        position = player.get('position', {}).get('abbreviation')
        if position in ('PG', 'SG'):
            position = 'G'
        elif position in ('PF', 'SF'):
            position = 'F'
        
        roster_list.append({
            'espn_player_id': player.get('id'),
            'first_name': player.get('firstName'),
            'last_name': player.get('lastName'),
            'team_id': team_id,
            'full_name': player.get('fullName'),
            'display_name': player.get('displayName'),
            'short_name': player.get('shortName'),
            'weight': player.get('weight'),
            'display_weight': player.get('displayWeight'),
            'height': player.get('height'),
            'display_height': player.get('displayHeight'),
            'age': player.get('age'),
            'position': position,
            'jersey': player.get('jersey'),
            'years_experience': player.get('experience', {}).get('years'),
            'athlete_status': player.get('status', {}).get('type')
        })
    
    return pd.DataFrame(roster_list)


def get_rosters(team_ids, client):
    """Fetch all team rosters in parallel."""
    all_roster_dfs = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_team = {executor.submit(fetch_team_roster, team_id, client): team_id for team_id in team_ids}
        for future in as_completed(future_to_team):
            team_id = future_to_team[future]
            try:
                roster_df = future.result()
                if not roster_df.empty:
                    all_roster_dfs.append(roster_df)
            except Exception as exc:
                print(f'Team {team_id} generated an exception: {exc}')
    
    return pd.concat(all_roster_dfs, ignore_index=True) if all_roster_dfs else pd.DataFrame()


def main():
    """Main execution function."""
    # Use a single HTTP client with connection pooling for better performance
    with httpx.Client(timeout=30.0) as client:
        # Get teams
        teams_df = get_teams(client)
        
        # Get standings
        standings_df = get_standings(client)
        
        # Get rosters
        team_ids = standings_df['team_id'].unique()
        rosters_df = get_rosters(team_ids, client)
    
    # Write to database
    conn = sqlite3.connect('birdle/nba_wordle.db')
    try:
        conn.execute("DELETE FROM active_rosters")
        conn.commit()

        if not rosters_df.empty:
            rosters_df.to_sql('active_rosters', conn, if_exists='append', index=False)

        teams_df.to_sql('active_teams', conn, if_exists='replace', index=False)
        standings_df.to_sql('standings', conn, if_exists='replace', index=False)

        # Create indexes for faster search queries
        conn.execute("CREATE INDEX IF NOT EXISTS idx_display_name ON active_rosters(display_name)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_last_name ON active_rosters(last_name)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_athlete_status ON active_rosters(athlete_status)")
        conn.commit()
    finally:
        conn.close()


if __name__ == '__main__':
    main()
