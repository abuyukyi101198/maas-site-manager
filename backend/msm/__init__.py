from pkg_resources import get_distribution

__all__ = [
    "PACKAGE",
    "__version__",
    "DEFAULT_PAGE_SIZE",
    "MAX_PAGE_SIZE",
]


PACKAGE = get_distribution("msm")

__version__ = PACKAGE.version

DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
