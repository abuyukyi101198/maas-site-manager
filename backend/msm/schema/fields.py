import pytz
from strenum import StrEnum

# Enum with timezones accepted by pytz.
TimeZone = StrEnum("TimeZone", pytz.all_timezones)
