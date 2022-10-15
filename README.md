# <img src="/public/icons/uva128.png" width="40" align="left"> UVAutomate V1

Fully Standalone Client Extension for the Automation of UVA's Netbadge

> # Components
>
> **[Extension](https://github.com/fakeecity/UVAutomate-V1)** _(100%)_
>
> - Responsible for onboarding users, full login flow, and 2fa HOTP generation
> - Never makes any external API calls, all secrets are stored locally and encrypted
> - More Efficient than V0
> - Can be used on multiple devices at once all sharing the same Netbadge account

## Installation Guide

- Download the latest [Release](https://github.com/fakeecity/UVAutomate-V1/releases/tag/Release)

- Unzip it

- Navigate to chrome://extensions/ within the browser

- Enable developer mode

- 'Load unpacked'

- Select the unzipped 'build' folder

## Build it yourself (optional)

- Must have Git, Node.js/NPM, and Yarn installed first

- Clone the git repository

```sh
git clone https://github.com/fakeecity/UVAutomate-V1.git
```

- Run the following to install dependencies and create a production build:

```sh
cd UVAutomate-V1
npm install
yarn build
```

- Your production build will appear in the project folder

## TODO

- Improve Efficiency (Modularize Onboarding)
- Better Error Handling
- Port for Use in Other Duo Applications
