### Changelog

#### 09.07.2016 1.1.0
- refactored and modularized pretty much all of the core functionality
- added a logging function which can be enabled by using the `-l true` flag and generates a .csv file in `app/logger/`. Could be useful for message learning purposes.

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
