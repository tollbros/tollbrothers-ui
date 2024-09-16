## Tollbrothers UI
React library for Tollbrothers.

## Workflow
1. From `tollbrothers-ui-library` point package.json to local e.g. `npm i ../tollbrothers-ui`
2. Make sure your library file is exporting e.g. export const
3. Run `tollbrothers-ui` repo with `npm run start` this will listen to changes and be reflected in `tollbrothers-ui-library`

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

## Node version
Take a look at the `.nvmrc` file.

## Publish changes
Publishing has been automated by the Semantic Release Workflow.

### Semantic Release Workflow
Basically, follow the commit message format below. Then when the commit is posted on the `master` branch semantic-release will do its thing and publish a new version on `merge to master` or a direct commit to `master`.
* [Commit message format](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#type)
* [How does it work?](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#type)

For instance:
In while in the root level of `tollbrothers-ui` do the following:
1. Create a new branch with your changes `Make sure you have a commit prefixed with either 'fix:' or 'feat:'`
2. Create a PR to from your branch to master
3. On merge a github action called release will kick off
4. A new release will be published on npm
5. Confirm the release number and bump the necessary package.json files

## Things to consider
- You can publish code without commiting it. Not sure why you would but there are no guards to prevent you from doing so.
- On github, the org is `tollbros`
- On npm, the org is `tollbrothers`





keep in mind we use the semantic release package
---------

so if you want to bump it a specific way you need to prefix your commit
e.g. fix:*
e.g feat:*

if not, i think it defaults to a minor release
