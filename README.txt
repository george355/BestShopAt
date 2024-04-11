# BestShopAt
BestShopAt is a web application designed to help users compare grocery product prices from different retailers in Ireland. 

## Features
- **Price Comparison**: Compare prices across different retailers.
- **Filter Options**: Filter products by store promotion, category, or retailer.
- **Shopping Lists**: Users can create, save, and manage their shopping lists online.

## Technology Stack
- **Frontend**: React, JavaScript, React-Bootstrap, CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Data Scraping**: Scrapy with Splash for JavaScript rendering
- **Hosting**: Docker Desktop to host a container to run Splash.

## Setup
To get a local copy up and running follow these simple steps:

1. **Clone the repo**
	git clone https://github.com/george355/BestShopAt
2. Run splash container on docker desktop
	docker run -p 8050:8050 scrapinghub/splash
3. Run any spiders
    python -m scrapy crawl dunnes_stores -o dunnes_stores_output.json
    python -m scrapy crawl supervalu_spider -o supervalu_output.json
    python -m scrapy crawl theorganicshop -o theorganicshop_output.json
4. Enter node and react folder
	run npm install on both
	npm start inside the react folder
	node server.js to start the server
	
