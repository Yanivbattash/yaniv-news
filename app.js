document.addEventListener('DOMContentLoaded', () => {
    const ticker = document.getElementById('ticker-content');
    const additionalTicker = document.getElementById('additional-ticker-content');
    const updateColumns = document.querySelectorAll('.update-column');
    const apiKey = '0LVAWCC28TONCYV5';
    const stockSymbols = ['AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NVDA', 'NFLX'];
    const currencyPairs = ['USDILS', 'EURUSD', 'GBPUSD'];
    const newsSources = [
        { url: 'https://www.ynet.co.il/Integration/StoryRss2.xml', name: 'Ynet' },
        { url: 'https://www.themarker.com/cmlink/1.145', name: 'TheMarker' }
    ];
    let columnIndex = 0;

    // Fetch news updates
    async function fetchNews() {
        for (const source of newsSources) {
            try {
                const response = await fetch(
                    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`
                );
                if (response.ok) {
                    const data = await response.json();
                    data.items.forEach((item) => {
                        const update = document.createElement('div');
                        update.className = 'update-item';
                        update.innerHTML = `
                            <strong>${item.title}</strong><br>
                            <a href="${item.link}" target="_blank">Read more</a><br>
                            <small>Source: ${source.name}</small>
                        `;
                        const column = updateColumns[columnIndex];
                        column.appendChild(update);
                        columnIndex = (columnIndex + 1) % updateColumns.length;
                    });
                }
            } catch (error) {
                console.error(`Error fetching news from ${source.name}:`, error);
            }
        }
    }

    // Fetch stock and currency data
    async function fetchFinancialData() {
        ticker.innerHTML = '🔄 Loading financial data...';
        try {
            const stockData = await Promise.all(
                stockSymbols.map(async (symbol) => {
                    const response = await fetch(
                        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
                    );
                    const data = await response.json();
                    const stockInfo = data['Global Quote'];
                    return stockInfo ? `${symbol}: $${parseFloat(stockInfo['05. price']).toFixed(2)}` : null;
                })
            );

            const currencyData = await Promise.all(
                currencyPairs.map(async (pair) => {
                    const response = await fetch(
                        `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${pair.slice(
                            0,
                            3
                        )}&to_currency=${pair.slice(3)}&apikey=${apiKey}`
                    );
                    const data = await response.json();
                    const exchangeRate = data['Realtime Currency Exchange Rate'];
                    return exchangeRate
                        ? `${pair.slice(0, 3)}/${pair.slice(3)}: ${parseFloat(exchangeRate['5. Exchange Rate']).toFixed(
                              3
                          )}`
                        : null;
                })
            );

            const combinedData = [...stockData, ...currencyData].filter(Boolean);
            ticker.innerHTML = combinedData.length ? combinedData.join(' | ') : 'No data available.';
        } catch (error) {
            console.error('Error fetching financial data:', error);
            ticker.innerHTML = '❌ Error loading financial data.';
        }
    }

    // Fetch additional economic data from local server
    async function fetchAdditionalEconomicData() {
        additionalTicker.innerHTML = '🔄 Loading additional data...';
        try {
            const response = await fetch('http://localhost:3000/stocks');
            if (response.ok) {
                const data = await response.json();
                additionalTicker.innerHTML = data.join(' | ');
            } else {
                throw new Error('Failed to fetch additional data');
            }
        } catch (error) {
            console.error('Error fetching additional economic data:', error);
            additionalTicker.innerHTML = '❌ Error loading additional data.';
        }
    }

    // Toggle subgroup visibility
    window.toggleSubGroup = (groupId) => {
        const group = document.getElementById(groupId);
        group.style.display = group.style.display === 'block' ? 'none' : 'block';
    };

    // Pause animation on hover
    updateColumns.forEach((column) => {
        column.addEventListener('mouseover', () => {
            column.querySelectorAll('.update-item').forEach((item) => (item.style.animationPlayState = 'paused'));
        });
        column.addEventListener('mouseout', () => {
            column.querySelectorAll('.update-item').forEach((item) => (item.style.animationPlayState = 'running'));
        });
    });

    // Initialize
    fetchNews();
    fetchFinancialData();
    fetchAdditionalEconomicData();

    // Refresh intervals
    setInterval(fetchFinancialData, 60000);
    setInterval(fetchAdditionalEconomicData, 60000);
});function toggleSubGroup(groupId) {
    const group = document.getElementById(groupId);
    if (group.style.display === 'block') {
        group.style.display = 'none';
    } else {
        group.style.display = 'block';
    }
}document.addEventListener('DOMContentLoaded', () => {
    const updatesMapping = {
        economy: document.getElementById('economy-updates'),
        politics: document.getElementById('politics-updates'),
        general: document.getElementById('general-updates'),
        sports: document.getElementById('sports-updates'),
    };

    const updatesData = {
        economy: [],
        politics: [],
        general: [],
        sports: [],
    };

    const newsSources = [
        { url: 'https://www.ynet.co.il/Integration/StoryRss2.xml', name: 'Ynet', group: 'general' },
        { url: 'https://www.themarker.com/cmlink/1.145', name: 'TheMarker', group: 'economy' },
    ];

    // Fetch news updates
    async function fetchNews() {
        for (const source of newsSources) {
            try {
                const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`);
                if (response.ok) {
                    const data = await response.json();
                    updatesData[source.group] = data.items.map((item) => ({
                        title: item.title,
                        link: item.link,
                        source: source.name,
                    }));
                }
            } catch (error) {
                console.error(`Error fetching news from ${source.name}:`, error);
            }
        }
    }
    // Rotate updates in columns
    function rotateUpdates(group) {
        const column = updatesMapping[group];
        const updates = updatesData[group];
        if (!updates.length) return;

        let currentIndex = 0;

        setInterval(() => {
            column.innerHTML = ''; // Clear the column

            for (let i = 0; i < 3; i++) {
                const update = updates[(currentIndex + i) % updates.length];
                const updateDiv = document.createElement('div');
                updateDiv.className = 'update-item';
                updateDiv.style.marginBottom = '15px'; // Spacing between updates
                updateDiv.innerHTML = `
                    <strong>${update.title}</strong><br>
                    <a href="${update.link}" target="_blank">Read more</a><br>
                    <small>Source: ${update.source}</small>
                `;
                column.appendChild(updateDiv);
            }

            currentIndex = (currentIndex + 3) % updates.length;
        }, 15000); // Rotate every 15 seconds
    }

    // Initialize updates
    async function initializeUpdates() {
        await fetchNews();
        Object.keys(updatesMapping).forEach((group) => {
            rotateUpdates(group);
        });
    }

    initializeUpdates();
});const newsSources = [
    { url: 'https://www.kan.org.il/RSS/NewsFeed.aspx', name: 'כאן 11', group: 'tv-news' },
    { url: 'https://www.mako.co.il/rss/news', name: 'ערוץ 12', group: 'tv-news' },
    { url: 'https://13news.co.il/Rss/', name: 'ערוץ 13', group: 'tv-news' },
    { url: 'https://rss.14tv.co.il/', name: 'ערוץ 14', group: 'tv-news' },
    { url: 'https://news24.co.il/rss', name: 'ניוז 24', group: 'tv-news' },
    { url: 'https://glz.co.il/feed/', name: 'גלי צה"ל', group: 'politics' },
];

// פונקציה לשאיבת חדשות
async function fetchTVNews() {
    for (const source of newsSources) {
        try {
            const response = await fetch(
                `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`
            );
            if (response.ok) {
                const data = await response.json();
                const updatesMapping = document.getElementById(`${source.group}`);
                data.items.forEach((item) => {
                    const update = document.createElement('div');
                    update.className = 'update-item';
                    update.innerHTML = `
                        <strong>${item.title}</strong><br>
                        <a href="${item.link}" target="_blank">Read more</a><br>
                        <small>Source: ${source.name}</small>
                    `;
                    updatesMapping.appendChild(update);
                });
            }
        } catch (error) {
            console.error(`Error fetching news from ${source.name}:`, error);
        }
    }
}

// קריאה לפונקציה
fetchTVNews();
function toggleSubGroup(groupId) {
    const group = document.getElementById(groupId);
    group.style.display = group.style.display === 'block' ? 'none' : 'block';
}
document.querySelectorAll('.group-button').forEach((button) => {
    button.addEventListener('click', (event) => {
        const targetId = event.target.getAttribute('onclick').match(/'([^']+)'/)[1];
        const targetElement = document.getElementById(targetId);

        if (targetElement.classList.contains('active')) {
            targetElement.classList.remove('active'); // הסתרה
        } else {
            document.querySelectorAll('.sub-group.active').forEach((group) => group.classList.remove('active')); // הסתרת אחרות
            targetElement.classList.add('active'); // הצגת היעד
        }
    });
});
document.getElementById('search-button').addEventListener('click', () => {
    const query = document.getElementById('search-input').value.toLowerCase();
    const updates = document.querySelectorAll('.update-item');

    updates.forEach((update) => {
        const text = update.innerText.toLowerCase();
        if (text.includes(query)) {
            update.style.display = 'block'; // הצג עדכונים שמתאימים לחיפוש
        } else {
            update.style.display = 'none'; // הסתר עדכונים שלא מתאימים
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const tickerContent = document.getElementById('ticker-content');
    async function fetchBreakingNews() {
        const newsSources = [
            { url: 'https://www.ynet.co.il/Integration/StoryRss2.xml', name: 'Ynet' },
            { url: 'https://www.themarker.com/cmlink/1.145', name: 'TheMarker' },
            { url: 'https://www.msn.com/he-il/money"', name:  'msn' }
        ];

        let newsItems = [];

        for (const source of newsSources) {
            try {
                const response = await fetch(
                    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`
                );
                if (response.ok) {
                    const data = await response.json();
                    newsItems.push(...data.items.map(item => `${item.title} (Source: ${source.name})`));
                }
            } catch (error) {
                console.error(`Error fetching news from ${source.name}:`, error);
            }
        }

        if (newsItems.length > 0) {
            tickerContent.innerHTML = newsItems.map(item => `<span>🔴 ${item}</span>`).join('');
        }
    }

    fetchBreakingNews();
});
document.addEventListener('DOMContentLoaded', () => {
    const backToTopButton = document.getElementById('back-to-top');

    // הצגת הכפתור לאחר גלילה
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { // אם גללת יותר מ-300px
            backToTopButton.style.display = 'flex';
        } else {
            backToTopButton.style.display = 'none';
        }
    });

    // גלילה חלקה למעלה בלחיצה
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // גלישה חלקה
        });
    });
});
