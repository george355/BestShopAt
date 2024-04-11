"""
Dunnes Store Scraper Script:
This is a specialized spider for scraping product information from the Dunnes Stores website.
This script collects product details such as names, prices, images, product links, and promotion
from the site's specific structure and it is configured to handle pagination.

Usage:
Run the spider using the following command:
    python -m scrapy crawl dunnes_stores -o dunnes_stores_output.json
The command above will run the Dunnesstore_scraper.py program and will sent the data
to the database while creating a json file to store the output.
"""

import scrapy
from scrapy_splash import SplashRequest
import urllib.parse as urlparse
from urllib.parse import parse_qs, urlencode, urlunparse
import json
import re

with open("scraper/config/shop_paths.json") as file:
    initial_urls = json.load(file)["dunnes_stores"]


class DunnesStoresSpider(scrapy.Spider):
    """Spider for extracting information from Dunnes Stores

    Args:
        scrapy (scrapy.Spider): Spider base class

    """

    name = "dunnes_stores"
    allowed_domains = ["www.dunnesstoresgrocery.com"]
    products_per_page = 30

    # Lua script to handle AJAX-based pagination
    script = """
    function main(splash, args)
        assert(splash:go(args.url))
        local next_page_button = splash:select('button[data-testid="nextPage-button-testId"]')
        if next_page_button then
            next_page_button:mouse_click()
        end
        return {
            html = splash:html(),
            url = splash:url(),
        }
    end
    """

    def start_requests(self):
        """Method to generate initial requests for scraping, using the provided initial URLs.
        It sends SplashRequests to execute Lua scripts for interacting with JavaScript elements on the page.

        Yields:
            SplashRequest: A SplashRequest that parses each category of products.
        """
        for url in initial_urls:
            category = url.split("categories/")[-1].split("/")[0]
            yield SplashRequest(
                url,
                self.parse,
                endpoint="execute",
                args={"lua_source": self.script},
                meta={"category": category},
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
        category = response.meta.get("category")

        # Follows each product link to scrape detailed product information.
        for link in product_links:
            yield SplashRequest(
                response.urljoin(link),
                self.parse_product,
                endpoint="execute",
                args={"lua_source": self.script},
                meta={"category": category},
            )

        # Update the URL for pagination
        parsed_url = urlparse.urlparse(response.url)
        query_params = parse_qs(parsed_url.query)

        # Update page and skip parameters
        current_page = int(query_params.get("page", [1])[0])
        next_page = current_page + 1
        query_params["page"] = [str(next_page)]
        query_params["skip"] = [str(self.products_per_page * (next_page - 1))]

        # URL with updated parameters
        updated_query = urlencode(query_params, doseq=True)
        next_page_url = urlunparse(parsed_url._replace(query=updated_query))

        # Handling Pagination
        next_page_disabled = response.css('button[data-testid="nextPage-button-testId"][aria-disabled="false"]::attr(aria-disabled)').get()
        if next_page_disabled == "false":
            yield SplashRequest(
                next_page_url,
                self.parse,
                endpoint="execute",
                args={"lua_source": self.script},
                meta={"category": category},
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
            "name": "//h2[@data-testid='pdpInfoTitle-h2-testId']/text()",
            "monetary_value": "//meta[@itemprop='price']/@content",
            "image_url": "//meta[@property='og:image']/@content",
            "promotion": "//div[contains(@data-testid, 'promotionBadge')]//div[contains(@class, 'Badge')]/text()",
        }

        # Extract data using the defined XPaths
        extracted_data = {}
        for key, xpath in config.items():
            extracted_data[key] = response.xpath(xpath).get(default=None)
            if extracted_data[key] is not None:
                extracted_data[key] = extracted_data[key].strip()

        # Get the category and process it
        category = response.meta.get("category")
        category = category.replace("-", " ")
        category = self.category_standardisation(category)
        
        # Extract numerical value out of the price string
        price_match = re.search(r'\d+(?:[.,]\d+)?', extracted_data["monetary_value"])
        price = 0
        if price_match:
            matched_string = price_match.group()
            price = float(matched_string.replace(',', '.'))

        extracted_data = {
            "id": response.url.split('-')[-1],
            "name": extracted_data["name"],
            "monetary_value": extracted_data["monetary_value"],
            "price": price,
            "image_url": extracted_data["image_url"],
            "promotion": extracted_data["promotion"],
            "store": "DunnesStore",
            "category": category,
            "product_link" : response.url
        }
        
        yield extracted_data

    def category_standardisation(self, category):
        '''Changing the name of some particular categories, aiming to create a standardised way of categorising products across all possible stores.

        Args:
            category (str): The name of the category.

        Returns:
            str: The changed category.
        '''
        if category in ["fresh fruit", "fresh vegetables"]:
            category = "fruit vegetables"
        elif category == "fresh meat poultry":
            category = "meat poultry"
        elif category == "wines beers spirits":
            category = "wine beer spirits"
        elif category == "chilled fish seafood":
            category = "fish seafood"
            
        return category