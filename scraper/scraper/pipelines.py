# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html

# useful for handling different item types with a single interface

import pymongo


class MongoPipeline:
    """
    Scrapy item pipeline for storing scraped items in a MongoDB database.

    Attributes:
        mongo_uri (str): The URI for connecting to the MongoDB database.
        mongo_db (str): The name of the MongoDB database.
        mongo_collection (str): The name of the collection in the MongoDB database to store the items.
    """

    def __init__(self, mongo_uri, mongo_db, mongo_collection):
        """
        Initialize the MongoDB connection details.

        Args:
            mongo_uri (str): The URI for connecting to the MongoDB database.
            mongo_db (str): The name of the MongoDB database.
            mongo_collection (str): The name of the collection in the MongoDB database to store the items.
        """
        self.mongo_uri = mongo_uri
        self.mongo_db = mongo_db
        self.mongo_collection = mongo_collection

    @classmethod
    def from_crawler(cls, crawler):
        """
        Create an instance of the pipeline from the Scrapy crawler settings.

        Args:
            crawler (scrapy.crawler.Crawler): The Scrapy crawler object.

        Returns:
            MongoPipeline: An instance of the pipeline.
        """
        return cls(
            mongo_uri=crawler.settings.get("MONGO_URI"),
            mongo_db=crawler.settings.get("MONGO_DATABASE"),
            mongo_collection=crawler.settings.get("MONGO_COLLECTION"),
        )

    def open_spider(self, spider):
        """
        Initialize the MongoDB connection when the spider is opened.

        Args:
            spider (scrapy.Spider): The Scrapy spider object.
        """
        self.client = pymongo.MongoClient(self.mongo_uri)
        self.db = self.client[self.mongo_db]
        self.collection = self.db[self.mongo_collection]
        self.collection.create_index(
            [("id", 1), ("name", 1)], unique=True
        )
    
    def close_spider(self, spider):
        """
        Close the MongoDB connection when the spider is closed.

        Args:
            spider (scrapy.Spider): The Scrapy spider object.
        """
        self.client.close()

    def process_item(self, item, spider):
        """
        Process and store scraped items in the MongoDB database.

        Args:
            item (scrapy.Item): The scraped item.
            spider (scrapy.Spider): The Scrapy spider object.

        Returns:
            scrapy.Item: The processed item.
        """
        if not item.get("image_url") or item.get("image_url").lower() == "none":
            spider.logger.info(f"Skipping product due to missing image: {item['name']}")
            return item

        try:
            self.collection.update_one(
                {
                    "id": item["id"],
                    "name": item["name"]
                },
                {"$set": dict(item)},
                upsert=True,
            )
        except pymongo.errors.DuplicateKeyError:
            spider.logger.debug(f"Duplicate item found: {item['id']} {item['name']}.")
            
        return item