import logging
import sys
from typing import Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ]
)

logger = logging.getLogger("scout-backend")


def log_info(message: str, **kwargs: Any) -> None:
    """Log info message with optional context"""
    if kwargs:
        logger.info(f"{message} - Context: {kwargs}")
    else:
        logger.info(message)


def log_error(message: str, error: Exception = None, **kwargs: Any) -> None:
    """Log error message with optional exception and context"""
    context = f" - Context: {kwargs}" if kwargs else ""
    if error:
        logger.error(f"{message} - Error: {str(error)}{context}")
    else:
        logger.error(f"{message}{context}")


def log_warning(message: str, **kwargs: Any) -> None:
    """Log warning message with optional context"""
    if kwargs:
        logger.warning(f"{message} - Context: {kwargs}")
    else:
        logger.warning(message)