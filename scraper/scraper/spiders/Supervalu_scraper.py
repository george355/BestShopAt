"""
SuperValu Scraper Script:
This is a spider for scraping product information from the SuperValu website.
This script collects product details such as names, prices, images, product links, and promotion
from the site's specific structure and it is configured to handle pagination.

Usage:
Run the spider using the following command:
    python -m scrapy crawl supervalu_spider -o supervalu_output.json
The command above will run the Supervalu_scraper.py program and will sent the data
to the database while creating a json file to store the output.
"""


import scrapy
import json
from scrapy_splash import SplashRequest
import re

with open("scraper/config/shop_paths.json") as file:
    initial_urls = json.load(file)["supervalu"]


class Supervalu_Spider(scrapy.Spider):
    """Spider for extracting information from SuperValu

    Args:
        scrapy (scrapy.Spider): Spider base class

    """

    name = "supervalu_spider"
    allowed_domains = ["shop.supervalu.ie"]

    # Defines a variable which hold the number of products per page
    products_per_page = 30

    def start_requests(self):
        """Method to generate initial requests for scraping, using the provided initial URLs.
        It sends SplashRequests to execute Lua scripts for interacting with JavaScript elements on the page.

        Yields:
            SplashRequest: A SplashRequest that parses each category of products.
        """
        # Starting the Splash Request
        for url in initial_urls:
            yield SplashRequest(
                url,
                self.parse,
                args={"wait": 0.5},
                meta={"page_number": 1, "start_url": url},
            )

    def parse(self, response):
        """Method to parse the response from initial requests.
        It extracts product links, follows each link to scrape detailed product information, and handles pagination to navigate through multiple pages of products.


        Args:
            response (SplashJsonResponse): SplashRequest response, containing information about the page of products of a subcategory.

        Yields:
            SplashRequest: A SplashRequest that parses information about a product.
        """
        
        product_links = response.css("article.ProductCardWrapper--6uxd5a a.ProductCardHiddenLink--v3c62m::attr(href)").getall()

        # Get the category from the start URL
        start_url = response.meta["start_url"]
        category = start_url.split("categories/")[-1].split("/")[0]

        # Follows each product link to scrape detailed product information.
        for link in product_links:
            yield response.follow(link, self.parse_product, meta={"category": category})

        # Handling pagination
        page_number = response.meta["page_number"]
        start_url = response.meta["start_url"]
        next_page_url = f"{start_url}?page={page_number+1}&skip={(page_number) * self.products_per_page}"

        if product_links:
            yield response.follow(
                next_page_url,
                callback=self.parse,
                meta={"page_number": page_number + 1, "start_url": start_url},
            )

    def parse_product(self, response):
        """Method to parse the response from product detail pages.
        It extracts product details such as name, price, image URL, promotion, and category using defined XPaths.

        Args:
            response (SplashJsonResponse): SplashRequest response, containing information about the requested product.

        Yields:
            dict: Extracted data about the product.
        """
        # Defining selectors for data extraction
        config = {
            "monetary_value": "//meta[@itemprop='price']/@content",
            "name": "//h2[@data-testid='pdpInfoTitle-h2-testId']/text()",
            "promotion": "//div[contains(@data-testid, 'promotionBadge')]//div[contains(@class, 'Badge')]/text()",
            "image_url": "//meta[@property='og:image']/@content",
        }

        # Extract data using the defined XPaths and CSS selectors
        extracted_data = {}
        for key, xpaths in config.items():
            if isinstance(xpaths, list):
                extracted_data[key] = [
                    response.xpath(xpath).get().strip()
                    for xpath in xpaths
                    if response.xpath(xpath).get()
                ]
            else:
                extracted_data[key] = (
                    response.xpath(xpaths).get().strip()
                    if response.xpath(xpaths).get()
                    else None
                )

        category = response.meta.get("category")
        category = category.replace("-%26", "").replace("-", " ")
        extracted_data["category"] = category
        
        # Extract numerical value out of the price string
        price_match = re.search(r'\d+(?:[.,]\d+)?', extracted_data["monetary_value"])
        price = 0
        if price_match:
            matched_string = price_match.group()
            price = float(matched_string.replace(',', '.'))
        extracted_data["price"] = price
        
        # Add the product link to the extracted data
        extracted_data["product_link"] = response.url
        extracted_data["id"] = response.url.split('-')[-1]

        extracted_data["store"] = "SuperValu"
        yield extracted_data