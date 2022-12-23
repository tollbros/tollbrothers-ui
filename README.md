## Tollbrothers UI
React library for Tollbrothers.

## Installation
```bash
npm i next react react-dom sass blaze-slider
```

## Local development
```bash
npx create-next-app@latest && npm i sass blaze-slider
npm install <path to tollbrothers-ui>
```

## Required CSS

```javascript
// ./pages/_app.js
import '@tollbrothers/tollbrothers-ui/dist/index.modern.css'
import 'blaze-slider/dist/blaze.css'
```

## Publish changes
Publishing has been automated by the Semantic Release Workflow.

### Semantic Release Workflow
Basically, follow the commit message format below. Then when the commit is posted on the `master` branch semantic-release will do its thing and publish a new version on `merge to master` or a direct commit to `master`.
* [Commit message format](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#type)
* [How does it work?](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#type)

## Things to consider
- You can publish code without commiting it. Not sure why you would but there are no guards to prevent you from doing so.
- On github, the org is `tollbros`
- On npm, the org is `tollbrothers`
