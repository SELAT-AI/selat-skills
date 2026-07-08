# U.S. FIFA World Cup 26 venues

Use this table as the default loop for "stadiums where FIFA games are being held
in the U.S. this summer." Confirm match dates against FIFA at runtime if the user
needs only remaining matches, because this skill may be used after some matches
have already been played.

Official FIFA naming often avoids commercial stadium names. Search with both the
FIFA label and the common stadium name.

| FIFA venue label | Common stadium name | City/area | State | Latitude | Longitude | Search query |
|---|---|---|---|---:|---:|---|
| Atlanta Stadium | Mercedes-Benz Stadium | Atlanta | GA | 33.7554 | -84.4008 | `hotels near Mercedes-Benz Stadium Atlanta GA` |
| Boston Stadium | Gillette Stadium | Foxborough/Boston area | MA | 42.0909 | -71.2643 | `hotels near Gillette Stadium Foxborough MA` |
| Dallas Stadium | AT&T Stadium | Arlington/Dallas area | TX | 32.7473 | -97.0945 | `hotels near AT&T Stadium Arlington TX` |
| Houston Stadium | NRG Stadium | Houston | TX | 29.6847 | -95.4107 | `hotels near NRG Stadium Houston TX` |
| Kansas City Stadium | GEHA Field at Arrowhead Stadium | Kansas City | MO | 39.0489 | -94.4839 | `hotels near Arrowhead Stadium Kansas City MO` |
| Los Angeles Stadium | SoFi Stadium | Inglewood/Los Angeles area | CA | 33.9535 | -118.3392 | `hotels near SoFi Stadium Inglewood CA` |
| Miami Stadium | Hard Rock Stadium | Miami Gardens/Miami area | FL | 25.9580 | -80.2389 | `hotels near Hard Rock Stadium Miami Gardens FL` |
| New York New Jersey Stadium | MetLife Stadium | East Rutherford/New York area | NJ | 40.8135 | -74.0745 | `hotels near MetLife Stadium East Rutherford NJ` |
| Philadelphia Stadium | Lincoln Financial Field | Philadelphia | PA | 39.9008 | -75.1675 | `hotels near Lincoln Financial Field Philadelphia PA` |
| San Francisco Bay Area Stadium | Levi's Stadium | Santa Clara/San Francisco Bay Area | CA | 37.4030 | -121.9700 | `hotels near Levi's Stadium Santa Clara CA` |
| Seattle Stadium | Lumen Field | Seattle | WA | 47.5952 | -122.3316 | `hotels near Lumen Field Seattle WA` |

## Recommended shortlist fields

Capture at least these columns for each hotel candidate:

```csv
venue_label,common_stadium,city,hotel_name,address,latitude,longitude,rating,review_count,walk_time,drive_time,price_signal,source_url,review_summary,red_flags
```

## Runtime checks

- Verify whether the user wants all U.S. host venues or only venues with future
  matches from the current date.
- When the user asks for a specific match, bind the query to the match date,
  expected kickoff time, and likely surge pricing window.
- For stadiums far from downtown, such as Foxborough, Santa Clara, Inglewood, and
  East Rutherford, score hotels by both stadium access and airport/city access.
- For New York/New Jersey, distinguish Manhattan hotels from Meadowlands/Secaucus
  hotels; the nearest hotel by map distance may not be the best transit choice.

## Source anchors

- FIFA World Cup 26 official tournament hub: `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026`
- FIFA host city pages: `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/host-cities`
- FIFA match schedule: `https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums`
