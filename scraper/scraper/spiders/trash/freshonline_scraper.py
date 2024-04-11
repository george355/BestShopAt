import scrapy

class FreshOnlineSpider(scrapy.Spider):
    name = "freshonline_products"
    allowed_domains = ["freshonline.ie"]
    # Initial URL to fetch category links
    start_url = "https://freshonline.ie/"

    def start_requests(self):
        # Starting the scraping process from the initial URL
        yield scrapy.Request(url=self.start_url, callback=self.parse_categories)

    def parse_categories(self, response):
        # Extracting category links
        category_links = response.css("ul.nav-dropdown a::attr(href)").getall()

        # For each category link, initiate a scrape process
        for link in category_links:
            category_url = response.urljoin(link)
            yield scrapy.Request(url=category_url, callback=self.parse)

    def parse(self, response):
        product_links = response.css(
            "a.product-item__image-wrapper::attr(href)"
        ).getall()
        for link in product_links:
            yield response.follow(link, callback=self.parse_products)

        # Logic to handle pagination 
        next_page_url = response.css(
            "div.pagination__nav a.pagination__nav-item.link::attr(href)"
        ).get()
        if next_page_url:
            yield response.follow(next_page_url, callback=self.parse)

    def parse_products(self, response):
        xpath_selectors = {
            "name": "h1.product-meta__title::text",
            "price": "div.product-form__info-content div.price-list span.price::text",
            "sale_price": ".price--highlight::text",
            "original_price": ".price--compare::text",
            "promotion": "div.product-meta__label-list .product-label--on-sale span::text",
            "image_url": "div.product-gallery__thumbnail-list a::attr(href)",
        }

        item = {}
        for field, xpath in xpath_selectors.items():
            value = response.css(xpath).get(default="").strip()
            if field == "promotion" and value == "":
                value = "No promotion"
            item[field] = value

        item["store"] = "FreshOnline"
        yield item
