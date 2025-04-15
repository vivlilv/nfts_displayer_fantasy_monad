import os
from config import FOLDER_PATH as folder_path


def generate_accounts_list():
    output_file = os.path.join(folder_path, "cards_viewer", "account_list.txt")
    with open(output_file, 'w') as f:
        for filename in os.listdir(folder_path):
            if filename.startswith('cards_data_0x') and filename.endswith('.json'):
                f.write(filename + "\n")

    print(f"Saved filenames to {output_file}")

