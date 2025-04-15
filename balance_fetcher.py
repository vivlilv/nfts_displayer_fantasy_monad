from web3 import Web3
import requests


def connect_rpc():
    w3 = Web3(Web3.HTTPProvider("https://testnet-rpc.monad.xyz/"))
    print("Connection status to Monad:", w3.is_connected())
    return w3


w3 = connect_rpc()

accounts = []
with open("accs.txt", "r") as f:
    lines = f.readlines()
for line in lines:
    accounts.append(line.split(":")[1][:-1])
print(accounts)

res = {}
for address in accounts:
    url = f"https://secret-api.fantasy.top/player/bank/{address}"

    headers = {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "authorization": "Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjdQNzVsMHZVbEkwemJBU1RPbnpfTDhPcXhIN0VQYUlsUWNHalNyMGxqM3cifQ.eyJjciI6IjE3NDE1MTg3MDQiLCJsaW5rZWRfYWNjb3VudHMiOiJbe1widHlwZVwiOlwidHdpdHRlcl9vYXV0aFwiLFwic3ViamVjdFwiOlwiMjU4MjU5MzA0MVwiLFwidXNlcm5hbWVcIjpcInRpdGl4T19cIixcIm5hbWVcIjpcIlZpcmdpbiBNZXRhbFwiLFwicGZwXCI6XCJodHRwczovL3Bicy50d2ltZy5jb20vcHJvZmlsZV9pbWFnZXMvMTgxMjE3MzAzMzM4MzA4ODEyOC9XUDhDbzgzTl9ub3JtYWwuanBnXCIsXCJsdlwiOjE3NDI5MzY1Mzh9LHtcInR5cGVcIjpcIndhbGxldFwiLFwiYWRkcmVzc1wiOlwiMHhGMDJjNEY4ZTg2Mjg1MDY4ZDU1ODE2ODYyZjRhYjk5NUJjMjFBMzg2XCIsXCJjaGFpbl90eXBlXCI6XCJldGhlcmV1bVwiLFwid2FsbGV0X2NsaWVudF90eXBlXCI6XCJwcml2eVwiLFwibHZcIjoxNzQxNTE4NzA3fSx7XCJ0eXBlXCI6XCJ3YWxsZXRcIixcImFkZHJlc3NcIjpcIjB4RjAyYzRGOGU4NjI4NTA2OGQ1NTgxNjg2MmY0YWI5OTVCYzIxQTM4NlwiLFwiY2hhaW5fdHlwZVwiOlwiZXRoZXJldW1cIixcIndhbGxldF9jbGllbnRfdHlwZVwiOlwibWV0YW1hc2tcIixcImx2XCI6MTc0MzM3ODg2M31dIiwiaXNzIjoicHJpdnkuaW8iLCJpYXQiOjE3NDMzOTc3ODYsImF1ZCI6ImNtNmV6enk2NjAyOTd6Z2RrN3QzZ2xjejUiLCJzdWIiOiJkaWQ6cHJpdnk6Y204MWo5c2d2MDJtZDEwaXBxM3J3dW5hNyIsImV4cCI6MTc0MzQwMTM4Nn0.1lx-yZQnEBrWAUxNndfiH5OPMIyCwZeDgQ6n3emapTURDgYMEB_sN7PSgp0X73fASWIbjFTABKHnv1r_yYvVug",
        "if-none-match": 'W/"3e25-CJXiHV4PnmDohb31Fx300S9+oLg"',
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
    balance_wei = w3.eth.get_balance(address)

    # Convert from wei to ether (or native token)
    balance_eth = w3.from_wei(balance_wei, "ether")
    response = requests.get(url, headers=headers)

    bank = response.json().get("playerPortfolioValue")
    res[f"{address}"] = [bank, balance_eth]
    print(f"{address} - {bank} - {balance_eth}")

for i in res:
    print(i)
