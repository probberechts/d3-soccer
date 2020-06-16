import json

import numpy as np
import pandas as pd
import socceraction.spadl as spadl
import socceraction.spadl.config as spadlcfg
import socceraction.spadl.statsbomb as statsbomb
import tqdm


def enhance_actions(actions, players, teams):
    # data
    actiontypes = pd.DataFrame(
        list(enumerate(spadlcfg.actiontypes)), columns=["type_id", "type_name"]
    )

    bodyparts = pd.DataFrame(
        list(enumerate(spadlcfg.bodyparts)), columns=["bodypart_id", "bodypart_name"]
    )

    results = pd.DataFrame(
        list(enumerate(spadlcfg.results)), columns=["result_id", "result_name"]
    )

    return (
        actions.merge(actiontypes, how="left")
        .merge(results, how="left")
        .merge(bodyparts, how="left")
        .merge(players[["player_id", "player_name"]], how="left")
        .merge(teams[["team_id", "team_name"]], how="left")
    )


def count(x, y, n=50, m=50):
    xmin = 0
    ymin = 0
    xdiff = spadlcfg.field_length
    ydiff = spadlcfg.field_width

    xi = (x - xmin) / xdiff * n
    yj = (y - ymin) / ydiff * m
    xi = xi.astype(int).clip(0, n - 1)
    yj = yj.astype(int).clip(0, m - 1)

    flat_indexes = n * (m - 1 - yj) + xi
    vc = flat_indexes.value_counts(sort=False)
    vector = np.zeros(m * n)
    vector[vc.index] = vc
    return vector.reshape((m, n))


def always_ltr(actions):
    away_idx = ~actions.left_to_right
    actions.loc[away_idx, "start_x"] = spadlcfg.field_length - actions[away_idx].start_x.values
    actions.loc[away_idx, "start_y"] = spadlcfg.field_width - actions[away_idx].start_y.values
    actions.loc[away_idx, "end_x"] = spadlcfg.field_length - actions[away_idx].end_x.values
    actions.loc[away_idx, "end_y"] = spadlcfg.field_width - actions[away_idx].end_y.values
    return actions


if __name__ == "__main__":

    # Set up the statsbombloader
    free_open_data_remote = "https://raw.githubusercontent.com/statsbomb/open-data/master/data/"
    SBL = statsbomb.StatsBombLoader(root=free_open_data_remote,getter="remote")

    # Select competitions to load and convert
    competitions = SBL.competitions()
    selected_competitions = competitions[competitions.competition_name=="FIFA World Cup"]

    # Get matches from all selected competitions
    matches = list(
        SBL.matches(row.competition_id, row.season_id)
        for row in selected_competitions.itertuples()
    )
    matches = pd.concat(matches, sort=True).reset_index(drop=True)
    matches[["home_team_name","away_team_name","match_date","home_score","away_score"]]

    # Load and convert match data
    matches_verbose = tqdm.tqdm(list(matches.itertuples()),desc="Loading match data")
    teams,players,player_games = [],[],[]
    actions = {}
    for match in matches_verbose:
        # load data
        teams.append(SBL.teams(match.match_id))
        players.append(SBL.players(match.match_id))
        events = SBL.events(match.match_id)

        # convert data
        player_games.append(statsbomb.extract_player_games(events))
        actions[match.match_id] = statsbomb.convert_to_actions(events,match.home_team_id)
        actions[match.match_id]["left_to_right"] = actions[match.match_id]["team_id"] == match.home_team_id


    games = matches.rename(columns={"match_id":"game_id"})
    teams = pd.concat(teams).drop_duplicates("team_id").reset_index(drop=True)
    players = pd.concat(players).drop_duplicates("player_id").reset_index(drop=True)
    player_games = pd.concat(player_games).reset_index(drop=True)

    # get all actions from Belgium - Brazil
    enhance_actions(actions[8650], players, teams).to_json('./bel_bra.json', orient='records')

    # get all actions by De Bruyne
    debruyne_actions = []
    for match_id, match_actions in actions.items():
        debruyne_actions.append(match_actions[(match_actions.player_id == 3089)])
    debruyne_actions = always_ltr(enhance_actions(pd.concat(debruyne_actions), players, teams))
    debruyne_actions.to_json('./debruyne_actions.json', orient='records')
    heatmap = count(debruyne_actions.start_x, debruyne_actions.start_y, 10, 5).T
    with open('debruyne_actions_heatmap.json', 'w') as outfile:
        json.dump(heatmap.tolist(), outfile)

