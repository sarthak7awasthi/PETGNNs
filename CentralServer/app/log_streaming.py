mport logging

def setup_logging():
    logger = logging.getLogger('GNNTraining')
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    return logger

logger = setup_logging()

# Use logger to log messages throughout your training process
logger.info("Training started")