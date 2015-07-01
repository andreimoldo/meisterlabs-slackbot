#Lunchbot

##Database structure
The database will hold one row per restaurant, per week, per day. This makes querying for the daily menu simpler.

###Sample
```javascript
{
    'menus': [
        {
            'week': 1,
            'day': 0,
            'name': 'Cafe Rathaus',
            'options': 'Berner Würstel mit Pommes G,M	€ 6,50\nPutenfilet in Tomatensauce und Reis G,L	€ 7,80'
        },
        {
            ...
        }
    ]
}
```
