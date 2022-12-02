# tollbrothers-ui package

## How was this package created?
1. Created the `tollbrothers-ui` project on Github as an empty repo for the `tollbros` Github org.
2. Locally created a `packages` directory.
3. Checked out the `tollbrothers-ui` repo in the `packages` directory.
4. Within the `packages/tollbrothers-ui` directory, run `npm init --scope=tollbrothers` and chose all the defaults.
5. Created the `index.js` file in `packages/tollbrothers-ui`, this matches the default `package.json` (see `main` key).

## How was this package tested locally?
1. Within the `packages/tollbrothers-ui` directory, run `npm link`. This created the `package-lock.json` file.
2. Went back to the `packages` directory and created a `tollbrothers-ui-TEST` directory.
3. Created the `script.js` file in `packages/tollbrothers-ui-TEST`.
4. Within the `packages/tollbrothers-ui-TEST` directory, run `npm link @tollbrothers/tollbrothers-ui`. This linked the `tollbrothers-ui` package to the test script.
5. Run the script via `node script.js`

## How do we publish changes?
1. Publishing has been automated by the Semantic Release Workflow

## Semantic Release Workflow
Basically, follow the commit message format below. Then when the commit is posted on the `main` branch semantic-release will do its thing and publish a new version on `merge to main` or a direct commit to `main`.
* [Commit message format](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#type)
* [How does it work?](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#type)

## Things to consider
- You can publish code without commiting it. Not sure why you would but there are no guards to prevent you from doing so.
- On github, the org is `tollbros`
- On npm, the org is `tollbrothers`