BOT_NAME = "supervalu_spider"
SPIDER_MODULES = ["scraper.spiders"]
NEWSPIDER_MODULE = "scraper.spiders"

SPLASH_URL = "http://localhost:8050"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

# Item pipeline to send the data to the mongodb collection
ITEM_PIPELINES = {
    "scraper.pipelines.MongoPipeline": 300,
}
# Mongodb connection information
MONGO_URI = "mongodb+srv://george355:george355@freshonline.mgeqh1m.mongodb.net/?retryWrites=true&w=majority&appName=FreshOnline"
MONGO_DATABASE = "FreshOnline"
MONGO_COLLECTION = "FirstCollection"

# Disable cookies
COOKIES_ENABLED = True
# Obey robots.txt rules
ROBOTSTXT_OBEY = False

LOG_LEVEL = 'DEBUG'

# Configure maximum concurrent requests performed by Scrapy (default: 16)
CONCURRENT_REQUESTS = 32

# Configure a delay for requests for the same website (default: 0)
DOWNLOAD_DELAY = 1

# The download delay setting will honor only one of:
CONCURRENT_REQUESTS_PER_DOMAIN = 16
CONCURRENT_REQUESTS_PER_IP = 16

# Disable Telnet Console (enabled by default)
TELNETCONSOLE_ENABLED = False

# Override the default request headers:
DEFAULT_REQUEST_HEADERS = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en",
}

# Enable or disable spider middlewares
SPIDER_MIDDLEWARES = {
    # 'scraper.middlewares.ScraperSpiderMiddleware': 543,
    "scrapy_splash.SplashDeduplicateArgsMiddleware": 100,
}

# Enable or disable downloader middlewares
DOWNLOADER_MIDDLEWARES = {
    "scrapy_splash.SplashCookiesMiddleware": 723,
    "scrapy_splash.SplashMiddleware": 725,
    "scrapy.downloadermiddlewares.httpcompression.HttpCompressionMiddleware": 810,
}
DUPEFILTER_CLASS = "scrapy_splash.SplashAwareDupeFilter"
HTTPCACHE_STORAGE = "scrapy_splash.SplashAwareFSCacheStorage"
# Enable or disable extensions
EXTENSIONS = {
    "scrapy.extensions.logstats.LogStats": None,
}

# Enable and configure the AutoThrottle extension (disabled by default)
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 5
AUTOTHROTTLE_MAX_DELAY = 60
AUTOTHROTTLE_TARGET_CONCURRENCY = 1.0
AUTOTHROTTLE_DEBUG = False

# Enable and configure HTTP caching (disabled by default)
HTTPCACHE_ENABLED = False
HTTPCACHE_EXPIRATION_SECS = 0
HTTPCACHE_DIR = "httpcache"
HTTPCACHE_IGNORE_HTTP_CODES = []
# HTTPCACHE_STORAGE = 'scrapy.extensions.httpcache.FilesystemCacheStorage'

# Setting to store the euro sign instead of /20uf
FEED_EXPORT_ENCODING = "utf-8"
