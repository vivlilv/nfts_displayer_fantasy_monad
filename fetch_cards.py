import requests
import json
from config import PRIVY_ID_TOKEN as privy_token_id


def fetch_cards():

    accounts = []
    with open("accs.txt", "r") as f:
        lines = f.readlines()
    for line in lines:
        accounts.append(line.split(":")[1][:-1])

    for address in accounts:
        url = f"https://secret-api.fantasy.top/card/player/{address}"

        params = {
            "pagination.page": "1",
            "pagination.limit": "19",
            "where.heroes.name.contains": "",
            "where.heroes.handle.contains": "",
            "where.rarity.in": ["1", "2", "3", "4"],
            "orderBy": "cards_score_desc",
            "groupCard": "true",
            "isGalleryView": "false",
        }

        headers = {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            "authorization": f"Bearer {privy_token_id}",
            "origin": "https://monad.fantasy.top",
            "priority": "u=1, i",
            "referer": "https://monad.fantasy.top/",
            "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Linux"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
        }

        response = requests.get(url, params=params, headers=headers)

        print(response.status_code)
        print(response.json())
        data = response.json().get("data")
        cards_info = []
        for card in data:
            card_info = {}
            card_info["id"] = card["heroes"]["id"]
            card_info["handle"] = card["heroes"]["handle"]
            card_info["name"] = card["heroes"]["name"]
            card_info["stars"] = card["heroes"]["stars"]
            card_info["rarity"] = card["rarity"]  # 4 common, 1 legend
            card_info["token_id"] = card["id"].split("_")[0]
            cards_info.append(card_info)

        with open(f"cards_data_{address}.json", "w") as f:
            json.dump(cards_info, f, indent=4)
