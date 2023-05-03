from importlib.metadata import distribution

__all__ = [
    "PACKAGE",
    "__version__",
]


PACKAGE = distribution("msm")

__version__ = PACKAGE.version
