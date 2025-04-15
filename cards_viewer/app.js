// DOM elements
const nftContainer = document.getElementById('nftContainer');
const accountSelect = document.getElementById('accountSelect');
const showAllButton = document.getElementById('showAll');
const totalCount = document.getElementById('totalCount');
const accountCount = document.getElementById('accountCount');
// Add these variables at the top
const modal = document.getElementById('accountModal');
const modalTitle = document.getElementById('modalTitle');
const accountList = document.getElementById('accountList');
const closeModal = document.querySelector('.close');

function findAccountsWithCard(card) {
    const accounts = {};
    allNFTs.forEach(nft => {
        if (nft.name === card.name &&
            nft.rarity === card.rarity &&
            nft.stars === card.stars) {
            accounts[nft.account] = (accounts[nft.account] || 0) + 1;
        }
    });
    return Object.entries(accounts)
        .sort((a, b) => b[1] - a[1])
        .map(([account, count]) => ({ account, count }));
}

function showAccountsModal(card) {
    const accounts = findAccountsWithCard(card);
    modalTitle.textContent = `Accounts with ${card.name} (${getRarityName(card.rarity)}, ★${card.stars})`;

    accountList.innerHTML = '';

    if (accounts.length === 0) {
        accountList.innerHTML = '<p>No account information available</p>';
    } else {
        accounts.forEach(({ account, count }) => {
            const accountItem = document.createElement('div');
            accountItem.className = 'account-item';
            accountItem.innerHTML = `
                <span>${account}</span>
                <span class="badge">×${count}</span>
            `;
            accountList.appendChild(accountItem);
        });
    }

    modal.style.display = 'block';
}

// Add event listeners for the modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});



// Add these variables at the top
let currentFilters = {
    starsMin: null,
    starsMax: null,
    rarity: null,
    handleSearch: null
};
let sortByCopies = false;

document.getElementById('applyFilters').addEventListener('click', applyFilters);
document.getElementById('clearFilters').addEventListener('click', clearFilters);
document.getElementById('searchHandle').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') applyFilters();
});
document.getElementById('toggleSort').addEventListener('click', toggleSortByCopies);

// Add these new functions
function applyFilters() {
    currentFilters = {
        starsMin: document.getElementById('starsMin').value || null,
        starsMax: document.getElementById('starsMax').value || null,
        rarity: document.getElementById('raritySelect').value || null,
        handleSearch: document.getElementById('searchHandle').value.trim() || null
    };

    const selectedAccount = document.getElementById('accountSelect').value;
    const nftsToFilter = selectedAccount ? (allAccounts[selectedAccount] || []) : allNFTs;

    const filteredNFTs = filterNFTs(nftsToFilter);
    displayNFTs(filteredNFTs);

    // Update filtered count
    document.getElementById('filteredCount').textContent = filteredNFTs.length;
}


function clearFilters() {
    // Clear input fields
    document.getElementById('starsMin').value = '';
    document.getElementById('starsMax').value = '';
    document.getElementById('raritySelect').value = '';
    document.getElementById('searchHandle').value = '';

    // Reset filters
    currentFilters = {
        starsMin: null,
        starsMax: null,
        rarity: null,
        handleSearch: null
    };

    // Re-display current selection
    const selectedAccount = document.getElementById('accountSelect').value;
    if (selectedAccount) {
        displayNFTs(allAccounts[selectedAccount] || []);
    } else {
        displayNFTs(allNFTs);
    }

    document.getElementById('filteredCount').textContent =
        selectedAccount ? (allAccounts[selectedAccount]?.length || 0) : allNFTs.length;
}

function filterNFTs(nfts) {
    return nfts.filter(nft => {
        // Filter by stars range
        if (currentFilters.starsMin && nft.stars < currentFilters.starsMin) return false;
        if (currentFilters.starsMax && nft.stars > currentFilters.starsMax) return false;

        // Filter by rarity
        if (currentFilters.rarity && nft.rarity != currentFilters.rarity) return false;

        // Filter by handle search
        if (currentFilters.handleSearch) {
            const searchTerm = currentFilters.handleSearch.toLowerCase();
            const handleMatch = nft.handle?.toLowerCase().includes(searchTerm) || false;
            const nameMatch = nft.name?.toLowerCase().includes(searchTerm) || false;
            if (!handleMatch && !nameMatch) return false;
        }

        return true;
    });
}

// Update your existing handleAccountSelect function
function handleAccountSelect(e) {
    const selectedAccount = e.target.value;
    if (!selectedAccount) {
        displayNFTs(allNFTs);
        document.getElementById('filteredCount').textContent = allNFTs.length;
        return;
    }

    const accountNFTs = allAccounts[selectedAccount] || [];
    displayNFTs(accountNFTs);
    document.getElementById('filteredCount').textContent = accountNFTs.length;
}


function toggleSortByCopies() {
    sortByCopies = !sortByCopies;
    const button = document.getElementById('toggleSort');

    if (sortByCopies) {
        button.textContent = 'Sort by Copies: On';
        button.classList.add('active');
    } else {
        button.textContent = 'Sort by Copies: Off';
        button.classList.remove('active');
    }

    // Re-apply current view with new sorting
    applyFilters();
}



let allAccounts = {}; // Object to store accounts with their NFTs
let allNFTs = []; // Flat array of all NFTs

// Initialize the app
async function init() {
    try {
        // Load all account files
        await loadAllAccounts();

        // Populate account dropdown
        populateAccountSelect();

        // Update stats
        updateStats();

        // Show all NFTs by default
        displayNFTs(allNFTs);

        // Event listeners
        accountSelect.addEventListener('change', handleAccountSelect);
        showAllButton.addEventListener('click', () => displayNFTs(allNFTs));
    } catch (error) {
        console.error("Error initializing app:", error);
        nftContainer.innerHTML = `<p class="error">Failed to load NFT data. Please check console for details.</p>`;
    }
}

async function loadAllAccounts() {
    allAccounts = {};
    allNFTs = [];

    try {
        const response = await fetch('account_list.txt');
        const fileListText = await response.text();
        const accountFiles = fileListText.trim().split('\n')
            .map(file => file.trim())
            .filter(file => file.endsWith('.json'));

        for (const file of accountFiles) {
            try {
                const fileResponse = await fetch(`../${file}`);
                if (!fileResponse.ok) throw new Error(`Failed to load ${file}`);

                const data = await fileResponse.json();
                const accountName = extractAccountName(file, data);

                // Add account info to each NFT
                const nftsWithAccount = data.map(nft => ({
                    ...nft,
                    account: accountName  // This is the critical addition
                }));

                allAccounts[accountName] = nftsWithAccount;
                allNFTs = allNFTs.concat(nftsWithAccount);
            } catch (error) {
                console.error(`Error loading ${file}:`, error);
            }
        }
    } catch (error) {
        console.error('Error in loadAllAccounts:', error);
    }
}


function extractAccountName(file, data) {

    // Option 2: Extract from filename
    const match = file.match(/cards_data_(.*?)\.json/);
    if (match && match[1]) {
        return match[1]; // Returns the address part
    }

}

// Populate account dropdown with account names
function populateAccountSelect() {
    accountSelect.innerHTML = '<option value="">Select an account...</option>';

    // Get sorted account names
    const accountNames = Object.keys(allAccounts).sort();

    accountNames.forEach(account => {
        const option = document.createElement('option');
        option.value = account;
        option.textContent = account;
        accountSelect.appendChild(option);
    });
}

// Handle account selection - show all NFTs for that account
function handleAccountSelect(e) {
    const selectedAccount = e.target.value;
    if (!selectedAccount) return;

    const accountNFTs = allAccounts[selectedAccount] || [];
    displayNFTs(accountNFTs);
}

function displayNFTs(nfts) {
    // First group duplicates and count them
    const nftGroups = {};
    nfts.forEach(nft => {
        const key = `${nft.name}_${nft.rarity}_${nft.stars}`;
        if (!nftGroups[key]) {
            nftGroups[key] = {
                ...nft,
                count: 1
            };
        } else {
            nftGroups[key].count++;
        }
    });

    // Convert to array and sort
    const groupedNFTs = Object.values(nftGroups).sort((a, b) => {
        if (sortByCopies && a.count !== b.count) return b.count - a.count;
        if (b.rarity !== a.rarity) return b.rarity - a.rarity;
        return b.stars - a.stars;
    });

    nftContainer.innerHTML = '';

    if (groupedNFTs.length === 0) {
        nftContainer.innerHTML = '<p class="no-results">No NFTs found</p>';
        document.getElementById('filteredCount').textContent = '0';
        return;
    }

    groupedNFTs.forEach(nftGroup => {
        const nftCard = document.createElement('div');
        nftCard.className = 'nft-card';
        nftCard.classList.add(`rarity-${nftGroup.rarity}`);

        const rarityDict = {
            1: 'legendary',
            2: 'epic',
            3: 'rare',
            4: 'common'
        };

        const imageUrl = `https://monad.fantasy.top/_next/image?url=https%3A%2F%2Ffantasy-top-cards.s3.eu-north-1.amazonaws.com%2Fmonad%2F${rarityDict[nftGroup.rarity]}%2F${nftGroup.id}_${nftGroup.stars}.png&w=1200&q=75`;

        // Only show count badge if more than 1
        const countBadge = nftGroup.count > 1 ? `<div class="count-badge">×${nftGroup.count}</div>` : '';

        nftCard.innerHTML = `
            <div class="nft-image-container">
                <img src="${imageUrl}" alt="${nftGroup.name}" class="nft-image" onerror="this.src='https://via.placeholder.com/200?text=Image+Not+Found'">
                ${countBadge}
            </div>
            <div class="nft-info">
                <div class="nft-meta">
                    <span class="stars">★ ${nftGroup.stars}</span>
                    <span class="rarity">${getRarityName(nftGroup.rarity)}</span>
                </div>
                <p class="nft-name"><strong>${nftGroup.name}</strong></p>
                <p class="nft-handle">${nftGroup.handle || 'Unknown'}</p>
            </div>
        `;

        // Add click event to show accounts with this card
        nftCard.addEventListener('click', () => {
            showAccountsModal(nftGroup);
        });

        nftContainer.appendChild(nftCard);
    });

    document.getElementById('filteredCount').textContent = nfts.length;
}

function getRarityName(rarity) {
    const rarityNames = {
        1: 'Legendary',
        2: 'Epic',
        3: 'Rare',
        4: 'Common'
    };
    return rarityNames[rarity];
}

function updateStats() {
    totalCount.textContent = allNFTs.length;
    accountCount.textContent = Object.keys(allAccounts).length;
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);