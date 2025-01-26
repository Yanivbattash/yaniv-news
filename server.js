const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

app.get('/stocks', async (req, res) => {
    try {
        // הפעלת דפדפן Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // ניווט לאתר MSN
        await page.goto('https://www.msn.com/en-us/money', {
            waitUntil: 'networkidle2', // ממתין לטעינת כל המשאבים
        });

        // חיפוש נתוני המניות בדף
        const stockData = await page.evaluate(() => {
            const stocks = [];
            document.querySelectorAll('.activeQuoteButtonV2-DS-EntryPoint1').forEach((el) => {
                stocks.push(el.textContent.trim());
            });
            return stocks;
        });

        // סגירת הדפדפן
        await browser.close();

        // החזרת הנתונים כתשובה ללקוח
        res.json(stockData);
    } catch (error) {
        console.error('Error fetching stock data:', error);
        res.status(500).send('Error fetching stock data');
    }
});

// הפעלת השרת
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
