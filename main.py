from fetch_cards import fetch_cards
from generate_accounts_list import generate_accounts_list
import webbrowser
import os

print("Generating account list to check...")
generate_accounts_list()
print("DONE")

# print("Fetching cards...this may take a couple of minutes)")
# fetch_cards()
# print("Cards fetched")

# print("Opening your cards displayer in browser")
# file_path = os.path.join(f"{os.path.dirname(os.path.abspath(__file__))}/cards_viewer", "index.html")
# webbrowser.open("file://" + os.path.abspath(file_path))
