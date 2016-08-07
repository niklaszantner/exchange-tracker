### Changelog

#### 07.08.2016 1.2.0
- refactored and modularized more parts of the program also deleted a lot of stuff
- integrated and fixed all suggestions by [codacy](https://www.codacy.com)

#### 17.07.2016 1.1.0
- refactored and modularized pretty much all of the core functionality
- added a logging function which can be enabled by using the `-l true` flag and generates a `/.ether-tracker.log.csv` file in your home folder. Could be useful for message learning purposes / prediction markets.
- improvements to the handling of the zoom into the data, depending on the past data. From now on, the smallest number in the current data is at least the smallest in the chart - no more negative plotted data.
- the chart is from now on also shown without providing a kraken API key and secret
- you can also reset the local user config via `-r`.
- the user settings and log are from now on stored in your home directory.

#### 28.06.2016 1.0.0
- redid chart plotter (based on [Ansi charts for nodejs](https://github.com/jstrace/chart))
- implemented a zooming function for the graph, which means it automatically shows a smaller ranger of the y-axis, depending on the last exchange fluctuation
- hides cursor now
- better error handling
- shows current status
- update README and cli --help

#### 22.06.2016 0.1.7
- initial release
- Timestamp of last update
- Days until a year is gone since the purchase (can be useful concerning taxes)
- Graph of the last exchange rates
- Current exchange (EUR to ETH)
- Current balance (ETH)
- Current balance (EUR)
