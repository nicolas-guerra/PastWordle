from datetime import date
from datetime import timedelta
import urllib.request, json 
import csv

# Yesterday's date
yesterday = date.today() - timedelta(days = 1)

# Append Yesterday's Answer
with urllib.request.urlopen(f"https://www.nytimes.com/svc/wordle/v2/{yesterday.year}-{yesterday:%m}-{yesterday:%d}.json") as url:
        data = json.load(url)
        with open('wordle_answers.csv','a') as f:
            writer = csv.writer(f)
            writer.writerow([data['days_since_launch'],data['id'],data['solution'],data['print_date']])
