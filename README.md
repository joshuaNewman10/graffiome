# Graffio.me

A lighthearted chrome extensions to personalize the web.

## Team

  - __Product Owner__: koziscool
  - __Scrum Master__: wettowelreactor
  - __Project Manager__: mrblueblue
  - __Technical Lead__: rmagee88
  - __Development Team Members__: koziscool, mrblueblue, rmagee88, wettowelreactor

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)
1. [Contributing](#contributing)

## Usage

Install, sign up, deface the web with your friends.

## Requirements

- Google Chrome

## Development

### Dependencies

From within the root directory:

```sh
sudo npm install -g bower
npm install
bower install
```
### Installing Dev Chrome Extensions

Check this [StackOverflow](http://stackoverflow.com/questions/24577024/install-chrome-extension-not-in-the-store) for more details, basic steps below:

Extensions can be loaded in unpacked mode by following the following steps:

1. Visit chrome://extensions (via omnibox or menu -> Tools -> Extensions).
2. Enable Developer mode by ticking the checkbox in the upper-right corner.
3. Click on the "Load unpacked extension..." button.
4. Select the directory containing your unpacked extension.

### How Chrome Extensions Work
Chrome Extensions are essentially web pages built with HTML, JavaScript, CSS and have access to the APIs chrome provides to web pages generally.
Extensions interact with web pages and servers via content scripts or cross-origin requests.
Extensions can also interact with other features like tabs and bookmarks.

#### Architecture Overview
Chrome Extensions are broken down into various layers that interact via Chrome's API.
  Background Page-provides main app logic
  UI Pages-Ordinary HTML/JavaScript/CSS pages that display the extensions UI
  Content Scripts-mechanism for the extension to interact with the web page. Can read details and make changes to pages. Are part of the loaded page, not part of the packaged extension. 
                 -Can only communicate to parent extension via chrome's message system

#### Interfaces
  Provide ways to modify/display content. Interfaces used and respective permissions are stated in manifest.json
  Possible interfaces:
     -Content Scripts-css or js injected into a page. When tab url matches specified pattern in manifest.json it will execute the content script directives
     -Background Scripts-controllers of the application, exist throughout life of the application. Can be consumed by any tag as long as background page registered event listener
                        -provide common gateway between multiple tabs and/or communication between page action and content scripts
     -Page Actions-icons in url bar, tell user 'something is happening'
     -Browser pages-little chrome extenson icons. have access to tab's content and and can display interface by themselves

#### Passing Information Between Interfaces (Message Passing)
  This is all about passing information from one interface to another.

    --Usual Interface Access--
    Content Script: Access to actual page user is browsing
    Page Action: Access to interface for a specific (or multiple) tabs
    Browse Action: Access to an interface via a click
    Background Pages: Access to all of the interfaces

    --Interface Relationship--
    Page Action and Browse Action have access to Background pages via chrome.extension.getBackgroundPage() (returns window obj)
    Content Script communicates to background page via async request via chrome.extension.sendMessage
    Background page has access to its own markup via native JS
    Background pages and content Scripts can receive messages at any time using onMessage (onMessage.addListener)

#### Good Pattern to Follow
  1) Background page checks if tab been updated
  2) When complete, start app logic
  3) If need something from content page send request and wait for response
  4) Perform action based on response (like storing data in server which cant due in content script due to cross origin policy)
  5) Register callbacks in background page to wait for actions from a Page Action popup, Browse Action popup, or Content Page


  https://coderwall.com/p/hkmedw/understanding-chrome-extensions

### How Graffiome Works
Graffiome has the following components
  1)Background Script-background.js 
  2)Content Script-canvas.js
  3)Browser Page-main.html and main.js, signup.html and signup.js, login.html and login.js
  4)Backend-Firebase

  #### Authorization


### Roadmap

View the project roadmap [here](https://github.com/graffiome/graffiome/issues)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
