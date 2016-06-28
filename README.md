![screenshot](screenshot.png)

`ether-tracker` is a small nodejs based application to track Ethereum related information by utilising the APIs provided by kraken.com.

### Features
- Timestamp of last update
- Days until a year is gone since the purchase (can be useful concerning taxes)
- Graph of the last exchange rates
- Current exchange (EUR to ETH)
- Current balance (ETH)
- Current balance (EUR)

### Changelog
Have a look at the [CHANGELOG.md](CHANGELOG.md).

### Installation
Simply via npm `npm install -g ether-tracker`

And start the program by typing `ether-tracker` into your command line.

### CLI
The CLI provides some options to be set by user on starting the tracker.  

This is how one could start the tracker:
```
ether-tracker -k KEY -s SECRET  -c EUR -d 2016-01-13 -i 120
```
All the configurations get saved in 'config/user.config.json'. Everytime you update a config parameter, the old one gets overridden.

All options can be found by using the help command:
```
$ ether-tracker --help

Usage: ether-tracker [options]

  -h, --help                           output usage information
  -V, --version                        output the version number
  -p, --print                          print the current configuration
  -i, --intervall [time of intervall]  update intervall in seconds
  -d, --day [day bought]               day bought
  -k, --key [kraken key]               your kraken key
  -s, --secret [kraken secret]         your kraken secret
  -c, --currency [exchange currency]   currency to exchange, options in the README
  -w, --chartWidth [width of chart]    width of the chart in chars
  -h, --chartHeight [height of chart]  height of the chart in chars

```

Format for day: `YYYY-MM-DD`

Possible options for `exchangeKey`:  
`CAD` `EUR` `GBP` `JPY` `USD` `CAD` `EUR` `USD` `XBT` `LTC` `NMC` `XDG` `XLM` `XRP`

### Known Problems

Sometimes it seems like the kraken API is a bit overwhelmed by all our love, so the programm is not shutting down anymore, when an API call failed. But informs the user and tries it again at the next interval.

### Copyright/Licensing
ISC

### Donate
You can send me some ether of course: `0xb2d99852734c18c3c7036bf1a1b1992ab4bfc679`
