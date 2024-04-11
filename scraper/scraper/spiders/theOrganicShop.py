"""
The Organic Shop Scraper:
This is a spider for scraping product information from TheOrganicShop website.
This script collects product details such as names, prices, images, and product links,
from the site's specific structure and it is configured to handle pagination.

Usage:
Run the spider using the following command:
    python -m scrapy crawl theorganicshop -o theorganicshop_output.json
The command above will run the theOrganicShop.py program and will sent the data
to the database while creating a json file to store the output.
"""


import scrapy
from scrapy_splash import SplashRequest
import time
import json
import re

with open("scraper/config/shop_paths.json") as file:
    initial_urls = json.load(file)["theorganicshop"]


class TheOrganicShopSpider(scrapy.Spider):
    """Spider for extracting information from SuperValu

    Args:
        scrapy (scrapy.Spider): Spider base class

    """
    name = "theorganicshop"
    allowed_domains = ["theorganicshop.ie"]

    def start_requests(self):
        """Method to generate initial requests for scraping, using the provided initial URLs.
        It sends SplashRequests to execute Lua scripts for interacting with JavaScript elements on the page.

        Yields:
            SplashRequest: A SplashRequest that parses each category of products.
        """
        
        for url in initial_urls:
            category = url.split("/")[-1].replace("-", " ")
            yield SplashRequest(
                url,
                self.parse,
                args={"wait": 3, "timeout": 90},
                meta={"category": category},
            )

    def parse(self, response):
        """Method to parse the response from initial requests.
        It extracts product links, extracts detailed product information, and handles pagination to navigate through multiple pages of products.


        Args:
            response (SplashJsonResponse): SplashRequest response, containing information about the page of products of a subcategory.

        Yields:
            item (dict): Extracted data about the product.
            SplashRequest: Request to the next page of products.
        """
        # Extracting the category from the metadata passed from the previous request
        category = response.meta.get("category")
        if category == "organic fruit vegetables":
            category = "fruit vegetables"
        
        for product in response.css("li.grid__item"):
            image_url = None
            
            try:
                # Try to extract image if already loaded
                image_url = product.xpath('div//img').attrib['data-srcset'].split(',')[0]
            except:
                # If image is lazyloaded, its attributes change so we look for the url source in a different spot
                image_url = product.xpath('div//img').attrib['data-src'].replace('{width}', str(180))
                
            product_link = product.css("a.grid-view-item__link::attr(href)").get()

            item = {
                "id": response.urljoin(product_link),
                "name": product.css("div.h4.grid-view-item__title.product-card__title::text").get().strip(),
                "monetary_value": product.css("span.price-item--regular::text").get().strip(),
                "image_url": image_url,
                "store": "TheOrganicShop",
                "category": category,
                "product_link": response.urljoin(product_link)
            }
            
            # Extract numerical value out of the price string
            price_match = re.search(r'\d+(?:[.,]\d+)?', item["monetary_value"])
            price = 0
            if price_match:
                matched_string = price_match.group()
                price = float(matched_string.replace(',', '.'))
            item["price"] = price
            
            yield item

            next_page_link = response.css("ul.pagination li a::attr(href)").extract()
            if next_page_link:
                next_page_url = next_page_link[-1]
                
                yield SplashRequest(
                    response.urljoin(next_page_url),
                    self.parse,
                    args={"wait": 3},
                    meta={"category": category},
                )