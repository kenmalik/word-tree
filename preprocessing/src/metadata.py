"""
Metadata definitions for presidential speeches including historical eras and party affiliations.
"""

from datetime import datetime
from typing import Dict, Tuple


# Historical era definitions with date ranges (year boundaries)
HISTORICAL_ERAS = [
    ("Founding Era", 1789, 1828),
    ("Jacksonian Era", 1829, 1860),
    ("Civil War & Reconstruction", 1861, 1877),
    ("Gilded Age", 1878, 1900),
    ("Progressive Era", 1901, 1920),
    ("Roaring 20s & Depression", 1921, 1945),
    ("Cold War", 1946, 1991),
    ("Post-Cold War", 1992, 2001),
    ("Modern Era", 2001, 2100),  # Upper bound for current era
]


# President to political party mapping
PRESIDENT_PARTY = {
    # Founding Era
    "George Washington": "None",
    "John Adams": "Federalist",
    "Thomas Jefferson": "Democratic-Republican",
    "James Madison": "Democratic-Republican",
    "James Monroe": "Democratic-Republican",
    "John Quincy Adams": "Democratic-Republican",

    # Jacksonian Era
    "Andrew Jackson": "Democratic",
    "Martin Van Buren": "Democratic",
    "William Harrison": "Whig",
    "John Tyler": "Whig",
    "James K. Polk": "Democratic",
    "Zachary Taylor": "Whig",
    "Millard Fillmore": "Whig",
    "Franklin Pierce": "Democratic",
    "James Buchanan": "Democratic",

    # Civil War & Reconstruction
    "Abraham Lincoln": "Republican",
    "Andrew Johnson": "Democratic",
    "Ulysses S. Grant": "Republican",
    "Rutherford B. Hayes": "Republican",

    # Gilded Age
    "James A. Garfield": "Republican",
    "Chester A. Arthur": "Republican",
    "Grover Cleveland": "Democratic",
    "Benjamin Harrison": "Republican",
    "William McKinley": "Republican",

    # Progressive Era
    "Theodore Roosevelt": "Republican",
    "William Taft": "Republican",
    "Woodrow Wilson": "Democratic",
    "Warren G. Harding": "Republican",

    # Roaring 20s & Depression
    "Calvin Coolidge": "Republican",
    "Herbert Hoover": "Republican",
    "Franklin D. Roosevelt": "Democratic",
    "Harry S. Truman": "Democratic",

    # Cold War
    "Dwight D. Eisenhower": "Republican",
    "John F. Kennedy": "Democratic",
    "Lyndon B. Johnson": "Democratic",
    "Richard M. Nixon": "Republican",
    "Gerald Ford": "Republican",
    "Jimmy Carter": "Democratic",
    "Ronald Reagan": "Republican",
    "George H. W. Bush": "Republican",

    # Post-Cold War
    "Bill Clinton": "Democratic",

    # Modern Era
    "George W. Bush": "Republican",
    "Barack Obama": "Democratic",
    "Donald Trump": "Republican",
    "Joe Biden": "Democratic",
}


def parse_date(date_str: str) -> datetime:
    """
    Parse ISO 8601 date string from speech JSON.

    Args:
        date_str: ISO 8601 formatted date (e.g., "1993-01-20T13:00:00-05:00")

    Returns:
        datetime object
    """
    return datetime.fromisoformat(date_str)


def assign_era(date: datetime) -> str:
    """
    Map a date to its corresponding historical period.

    Args:
        date: datetime object from speech

    Returns:
        Era name as string
    """
    year = date.year

    for era_name, start_year, end_year in HISTORICAL_ERAS:
        if start_year <= year <= end_year:
            return era_name

    # Fallback (shouldn't happen with proper data)
    return "Unknown Era"


def get_president_party(president: str) -> str:
    """
    Get political party affiliation for a president.

    Args:
        president: President's name

    Returns:
        Party name as string
    """
    return PRESIDENT_PARTY.get(president, "Unknown")


def get_all_eras() -> list[str]:
    """
    Get list of all historical era names.

    Returns:
        List of era names in chronological order
    """
    return [era[0] for era in HISTORICAL_ERAS[:-1]]  # Exclude the upper bound of Modern Era


def get_era_date_range(era_name: str) -> Tuple[int, int]:
    """
    Get the year range for a specific era.

    Args:
        era_name: Name of the historical era

    Returns:
        Tuple of (start_year, end_year)
    """
    for era, start_year, end_year in HISTORICAL_ERAS:
        if era == era_name:
            return (start_year, end_year)

    return (0, 0)
