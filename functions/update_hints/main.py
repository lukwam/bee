"""Update Spelling Bee Hints Cloud Function."""
import datetime
import json
import requests
import time
from bs4 import BeautifulSoup
from google.cloud import storage


def get_date_string(date=None):
    """Return the date string for the url."""
    if not date:
        date = datetime.date.today()
    return date.strftime('%Y/%m/%d')


def get_html(date=None):
    """Return the html for the given date."""
    date_string = get_date_string(date)
    headers = {
        "user-agent": "curl/7.74.0",
    }
    url = f"https://www.nytimes.com/{date_string}/crosswords/spelling-bee-forum.html"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.text


def parse_html(html):
    """Parse an HTML string."""
    soup = BeautifulSoup(html, 'html.parser')
    title = soup.title.string 
    print(f"Title: {title}")

    table = soup.find_all("table", {"class": "table"})[0]
    table_data = parse_table(soup, table)

    p_contents = soup.find_all("p", {"class": "content"})

    letters = parse_letters(p_contents[1])
    info = parse_info(p_contents[2])
    pairs = parse_pairs(p_contents[4])

    data = {
        "letters": letters,
        "counts": table_data,
        "pairs": pairs,
    }
    for key in info:
        data[key] = info[key]
    
    return data


def parse_info(html):
    """Parse the info in the header."""
    info = {}
    for item in html.string.strip().split(", "):
        if ":" in item:
            key, value = item.split(": ")
            if "Perfect" in value:
                pangram, perfect, _ = value.replace("(", "").replace(")", "").split(" ")
                info[key.lower()] = int(pangram)
                info["perfect"] = int(perfect)
            else:
                info[key.lower()] = int(value)
        else:
            info[item.lower()] = True
    return info


def parse_letters(html):
    """Parse the Letters from the html."""
    letters = []
    for span in html.find_all("span"):
        text = span.string.strip()
        letters.extend(text.split(" "))
    return letters


def parse_pairs(html):
    """Parse two-letter counts."""
    pairs = {}
    for span in html.find_all("span"):
        for item in span.text.strip().split(" "):
            pair, count = item.split("-")
            pairs[pair] = int(count)
    return pairs


def parse_table(soup, table):
    """Parse the table data."""
    trs = table.find_all("tr", {"class": "row"})
    header = trs[0]
    rows = trs[1:]

    info = {
        "lengths": [],
        "letters": {},
        "totals": [],
    }

    # get header row
    for cell in header.find_all("td"):
        num = cell.string.strip()
        if num.isnumeric():
            num = int(num)
            info["lengths"].append(num)

    # get the letter rows
    for row in rows:
        cells = row.find_all("td")

        # get the letter
        cell1 = cells[0]
        if cell1.span:
            letter = cell1.span.string
        else:
            # letter = cell1.string
            letter = None

        counts = []

        # get the counts
        for cell in cells[1:]:
            count = int(cell.string.replace("-", "0"))
            counts.append(count)
        
        if letter:
            info["letters"][letter] = counts
        else:
            info["totals"] = counts
    
    return info


def save_hints(date, hints):
    """Save the Hints in CLoud Storage."""
    filename = f"{str(date.date())}.json"
    client = storage.Client()
    bucket_name = "lukwam-bee-hints"
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(filename)
    blob_string = json.dumps(hints, sort_keys=True)
    blob.upload_from_string(blob_string, content_type='application/json')


def update_date(date):
    """Update the stats for a specific date."""
    html = get_html(date)
    data = parse_html(html)
    data["date"] = str(date.date())
    print(json.dumps(data, sort_keys=True))
    save_hints(date, data)


def update_hints(request):
    """Update Hints entrypoint."""
    # start_date = datetime.datetime.strptime("2022-10-22", "%Y-%m-%d")
    # end_date = datetime.datetime.strptime("2022-01-01", "%Y-%m-%d")
    # date = start_date
    # while date > end_date:
    #     print(f"\n{date}")
    #     update_date(date)
    #     date -= datetime.timedelta(days=1)
    #     time.sleep(1)
    date = datetime.datetime.today()
    update_date(date)


if __name__ == "__main__":
    update_hints(None)
