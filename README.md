![screenshot](screenshot.png)

`ether-tracker` is a small nodejs based application to track Ethereum related information by utilising the APIs provided by kraken.com.

### Features
- Timestamp of last update
- Days until a year is gone since the purchase (can be useful concenring taxes)
- Graph of the last exchange rates
- Current exchange (EUR to ETH)
- Current balance (ETH)
- Current balance (EUR)

### Installation
Simply via npm `npm install -g ether-tracker`

And start the program by typing `ether-tracker` into your command line.

### CLI
The CLI provides some options to be set by user on starting the tracker.  

This is how one could start the tracker:
```
node . -k KEY -s SECRET  -c EUR -d 2016-01-13
```
All the configurations get saved in 'config/user.config.json'. Evertime you update a config parameter, the old one gets overridden.

All options can be found by using the help command:
```
$ ether-tracker --help

Usage: ether-tracker [options]

Options:

   -h, --help                           output usage information
   -V, --version                        output the version number
   -i, --intervall [time of intervall]  update intervall
   -d, --day [day bought]               day bought
   -k, --key [kraken key]               your kraken key
   -s, --secret [kraken secret]         your kraken secret
   -c, --currency [exchange currency]   currency to exchange, options in the README
   -w, --chartWidth [width of chart]    width of the chart in chars
   -h, --chartHeight [height of chart]  height of the chart in chars
```

Format for day: `YYYY-MM-DD`

Possible options for `exchangeKey`
- `CAD`
- `EUR`
- `GBP`
- `JPY`
- `USD`
- `CAD`
- `EUR`
- `USD`
- `XBT`
- `LTC`
- `NMC`
- `XDG`
- `XLM`
- `XRP`

### Copyright/Licensing
MIT

### Donate
You can send me some ether of course: `0xb2d99852734c18c3c7036bf1a1b1992ab4bfc679`
